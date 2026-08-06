/**
 * DATA — Aggregate Quality Gate runner (DATA-I9).
 * Runs G1–G9 then boundary-unit. Does not change domain behavior.
 */
import { spawnSync } from "node:child_process";
import { DATA_QUALITY_GATES } from "../src/data/internal/quality-gates";

const STEPS = [
  ...DATA_QUALITY_GATES.map((g) => g.npmScript),
  "validate:data-boundary-unit",
  "validate:data-hardening-unit",
] as const;

function runNpm(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });
  if (result.error) {
    console.error(result.error);
    return 1;
  }
  return result.status ?? 1;
}

function main(): void {
  console.log("DATA aggregate validate:data — G1–G9 + unit suites\n");
  for (const step of STEPS) {
    console.log(`\n—— ${step} ——`);
    const code = runNpm(step);
    if (code !== 0) {
      console.error(`\nFAIL — validate:data stopped at ${step}`);
      process.exit(code);
    }
  }
  console.log("\nPASS — validate:data (all DATA Quality Gates)");
  process.exit(0);
}

main();
