/**
 * SPE-1.V Validation Umbrella — composed SPE-critical + Pack Lite gates.
 * Validation tooling only — no product feature surface.
 */
import path from "path";
import { fileURLToPath } from "url";

import { createGateRunner } from "./lib/gate-runner.mjs";

const __filename = fileURLToPath(import.meta.url);

export const runSpe1vUmbrella = () => {
  const runner = createGateRunner();

  runner.run("workflow-unit", "npm", ["run", "validate:workflow-unit"]);
  runner.run("methodology-unit", "npm", ["run", "validate:methodology-unit"]);
  runner.run("comparison-unit", "npm", ["run", "validate:comparison-unit"]);
  runner.run("visibility-unit", "npm", ["run", "validate:visibility-unit"]);
  runner.run("export1-chart-export-unit", "npm", [
    "run",
    "validate:export1-chart-export-unit",
  ]);
  runner.run("export1-d42-2-testing", "npm", [
    "run",
    "validate:export1-d42-2-testing",
  ]);
  runner.run("export2-pdf-toggle-unit", "npm", [
    "run",
    "validate:export2-pdf-toggle-unit",
  ]);
  runner.run("export2-d44-3-testing", "npm", [
    "run",
    "validate:export2-d44-3-testing",
  ]);
  runner.run("spe-12-pack-lite-unit", "npm", [
    "run",
    "validate:spe-12-pack-lite-unit",
  ]);
  runner.run("smart-start-unit", "npm", ["run", "validate:smart-start-unit"]);
  runner.run("prod1-gate", "npm", ["run", "validate-prod1-gate"]);
  runner.run("engine-import-export-unit", "npm", [
    "run",
    "validate:engine-import-export-unit",
  ]);
  runner.run("tsc-noEmit", "npx", ["tsc", "--noEmit"]);

  return runner.finish({
    initiative: "SPE-1",
    phase: "spe-1v-validation-umbrella",
  });
};

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  const summary = runSpe1vUmbrella();
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.pass ? 0 : 1);
}
