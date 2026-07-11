import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();

type StepResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const runStep = (id: string, command: string): StepResult => {
  try {
    execSync(command, { cwd: REPO_ROOT, stdio: "pipe" });
    return { id, pass: true };
  } catch (error) {
    const detail =
      error instanceof Error && "stdout" in error
        ? String((error as { stdout?: Buffer }).stdout ?? error.message)
        : String(error);
    return { id, pass: false, detail };
  }
};

const curvesRoot = path.join(REPO_ROOT, "src/lib/graph/curves");

const gateSteps: StepResult[] = [
  {
    id: "governance.curvesDomain",
    pass:
      fs.existsSync(curvesRoot) &&
      fs.existsSync(path.join(curvesRoot, "index.ts")) &&
      fs.existsSync(path.join(curvesRoot, "expression.ts")) &&
      fs.existsSync(path.join(curvesRoot, "sampling.ts")),
  },
  {
    id: "governance.projectStatusD30Closed",
    pass:
      fs.existsSync(path.join(REPO_ROOT, "PROJECT_STATUS_PROD_2E.md")) &&
      fs
        .readFileSync(path.join(REPO_ROOT, "PROJECT_STATUS_PROD_2E.md"), "utf8")
        .includes("D30 CLOSED"),
  },
  runStep("typescript", "npx tsc --noEmit"),
  runStep("validate.graph-curves-unit", "npm run validate:graph-curves-unit"),
  runStep(
    "validate.visual-graph-builder-unit",
    "npm run validate:visual-graph-builder-unit"
  ),
  runStep("validate.prod2e-data3b-gate", "npm run validate:prod2e-data3b-gate"),
  runStep(
    "validate.prod2c-c8-regression-gate",
    "npm run validate:prod2c-c8-regression-gate"
  ),
  runStep("validate.chart-viewport", "npm run validate:chart-viewport"),
  runStep("validate.chart-viewport-y", "npm run validate:chart-viewport-y"),
  runStep(
    "validate.prod2e-d29-viewport-gate",
    "npm run validate:prod2e-d29-viewport-gate"
  ),
  runStep(
    "validate.prod2e-d30-publication-presets-gate",
    "npm run validate:prod2e-d30-publication-presets-gate"
  ),
];

const passedCount = gateSteps.filter((step) => step.pass).length;
const summary = {
  phase: "prod2e-d31-curves-gate",
  pass: gateSteps.every((step) => step.pass) && passedCount === gateSteps.length,
  caseCount: gateSteps.length,
  passLabel: `${passedCount}/${gateSteps.length}`,
  cases: gateSteps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
