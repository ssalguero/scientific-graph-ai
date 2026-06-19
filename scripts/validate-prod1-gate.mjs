/**
 * PROD-1 regression gate: structured import validation + real workbook suite.
 */
import path from "path";
import { fileURLToPath } from "url";

import { createGateRunner } from "./lib/gate-runner.mjs";

const __filename = fileURLToPath(import.meta.url);

export const runProd1Gate = () => {
  const runner = createGateRunner();

  runner.run("prod1b-unit", "npx", ["tsx", "scripts/validate-prod1-unit.ts"]);
  runner.run("rw-suite", "node", ["scripts/validate-prod1-rw-suite.mjs"]);

  return runner.finish({
    initiative: "PROD-1B",
    phase: "advanced-import-validation",
  });
};

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  const summary = runProd1Gate();
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.pass ? 0 : 1);
}
