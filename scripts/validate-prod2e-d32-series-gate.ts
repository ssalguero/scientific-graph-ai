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

const seriesRoot = path.join(REPO_ROOT, "src/lib/graph/series");
const statusPath = path.join(REPO_ROOT, "PROJECT_STATUS_PROD_2E.md");
const pagePath = path.join(REPO_ROOT, "src/app/page.tsx");
const statusSource = fs.existsSync(statusPath)
  ? fs.readFileSync(statusPath, "utf8")
  : "";
const pageSource = fs.existsSync(pagePath)
  ? fs.readFileSync(pagePath, "utf8")
  : "";

const gateSteps: StepResult[] = [
  {
    id: "governance.seriesDomain",
    pass:
      fs.existsSync(seriesRoot) &&
      fs.existsSync(path.join(seriesRoot, "index.ts")) &&
      fs.existsSync(path.join(seriesRoot, "builders.ts")) &&
      fs.existsSync(path.join(seriesRoot, "transforms.ts")) &&
      fs.existsSync(path.join(seriesRoot, "validation.ts")),
  },
  {
    id: "governance.projectStatusD31Closed",
    pass:
      statusSource.includes("D31 CLOSED") &&
      statusSource.includes("GRAPH-2a CLOSED"),
  },
  runStep("typescript", "npx tsc --noEmit"),
  runStep("validate.graph-series-unit", "npm run validate:graph-series-unit"),
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
  runStep(
    "validate.prod2e-d31-curves-gate",
    "npm run validate:prod2e-d31-curves-gate"
  ),
  runStep(
    "validate.worksheet-import-unit",
    "npm run validate:worksheet-import-unit"
  ),
  runStep(
    "validate.worksheet-transforms-unit",
    "npm run validate:worksheet-transforms-unit"
  ),
  {
    id: "governance.projectStatusD32Ready",
    pass:
      fs.existsSync(
        path.join(REPO_ROOT, "scripts/validate-graph-series-unit.ts")
      ) &&
      fs.existsSync(
        path.join(REPO_ROOT, "scripts/validate-prod2e-d32-series-gate.ts")
      ) &&
      pageSource.includes('from "@/lib/graph/series"') &&
      !pageSource.includes("const calculateExperimentalStatistics") &&
      !pageSource.includes("const buildErrorBarSeries"),
  },
];

const passedCount = gateSteps.filter((step) => step.pass).length;
const summary = {
  phase: "prod2e-d32-series-gate",
  pass: gateSteps.every((step) => step.pass) && passedCount === gateSteps.length,
  caseCount: gateSteps.length,
  passLabel: `${passedCount}/${gateSteps.length}`,
  cases: gateSteps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
