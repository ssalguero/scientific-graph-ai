/**
 * Unified regression gate — Phase A (standard / full profile).
 */
import path from "path";
import { fileURLToPath } from "url";

import { createGateRunner } from "./lib/gate-runner.mjs";

const __filename = fileURLToPath(import.meta.url);

const E2E_ENV = { SKIP_EMBEDDED_RW: "1" };

/**
 * @param {{ profile?: "full" | "prod2a"; initiative?: string; phase?: string }} [options]
 */
export const runValidationGate = (options = {}) => {
  const profile = options.profile ?? "full";
  const runner = createGateRunner();

  if (profile === "full") {
    runner.run("t-quantile", "node", ["scripts/validate-t-quantile.mjs"]);
    runner.run("chart-viewport-unit", "npx", [
      "tsx",
      "scripts/validate-chart-viewport.ts",
    ]);
    runner.run("comparison-unit", "npx", [
      "tsx",
      "scripts/validate-comparison-unit.ts",
    ]);
  }

  runner.run("f0", "npm", ["run", "validate:prod2a-f0"]);
  runner.run("unit", "npm", ["run", "validate:prod2a-unit"]);
  runner.run("f6", "npx", ["tsx", "scripts/validate-prod2a-f6.ts"]);
  runner.run("typescript", "npx", ["tsc", "--noEmit"]);
  runner.run("build", "npm", ["run", "build"]);
  runner.run("baseline", "node", ["scripts/.score-check-sci60.mjs"]);
  runner.run("prod1-gate", "npm", ["run", "validate-prod1-gate"]);
  runner.run("e2e", "npm", ["run", "validate:prod2a"], { env: E2E_ENV });

  if (profile === "full") {
    return runner.finish({
      gate: "validate-full",
      profile: "full",
      phase: "A",
    });
  }

  return runner.finish({
    initiative: options.initiative ?? "PROD-2A",
    phase: options.phase ?? "F6-final-gate",
  });
};

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  const summary = runValidationGate({ profile: "full" });
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.pass ? 0 : 1);
}
