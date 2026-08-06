/**
 * AI Domain umbrella validator (AI-I0…AI-I10).
 */
import { spawnSync } from "node:child_process";

const STEPS = [
  "validate:ai-foundation",
  "validate:ai-infrastructure",
  "validate:ai-core",
  "validate:ai-contextual",
  "validate:ai-i4",
  "validate:ai-supporting",
  "validate:ai-governance",
  "validate:ai-integration",
  "validate:ai-extension",
  "validate:ai-boundaries",
  "validate:ai-hardening",
  "validate:ai-certification",
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
  console.log("AI aggregate validate:ai — AI-I0…AI-I10 gates\n");
  for (const step of STEPS) {
    console.log(`\n—— ${step} ——`);
    const code = runNpm(step);
    if (code !== 0) {
      console.error(`\nFAIL — validate:ai stopped at ${step}`);
      process.exit(code);
    }
  }
  console.log("\nPASS — validate:ai (AI-I0…AI-I10 gates)");
  process.exit(0);
}

main();
