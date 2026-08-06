/**
 * ENGINE — Aggregate validator convenience script (ENGINE-10).
 * Runs all ENGINE boundary + unit validators sequentially.
 * Not a product feature — developer / CI convenience only.
 */
import { spawnSync } from "node:child_process";

const STEPS = [
  "validate:engine-boundaries",
  "validate:engine-boundary-unit",
  "validate:engine-workflow-unit",
  "validate:engine-command-unit",
  "validate:engine-project-flows-unit",
  "validate:engine-session-unit",
  "validate:engine-import-export-unit",
  "validate:engine-lifecycle-unit",
  "validate:engine-diagnostics-unit",
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
  console.log("ENGINE aggregate validate:engine — starting\n");
  for (const step of STEPS) {
    console.log(`\n—— ${step} ——`);
    const code = runNpm(step);
    if (code !== 0) {
      console.error(`\nFAIL — validate:engine stopped at ${step}`);
      process.exit(code);
    }
  }
  console.log("\nPASS — validate:engine (all ENGINE validators)");
  process.exit(0);
}

main();
