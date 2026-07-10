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

const chartViewportShimSource = fs.existsSync(
  path.join(REPO_ROOT, "src/app/chartViewport.ts")
)
  ? fs.readFileSync(path.join(REPO_ROOT, "src/app/chartViewport.ts"), "utf8")
  : "";

const governanceChecks: StepResult[] = [
  {
    id: "governance.projectStatusD28",
    pass:
      fs.existsSync(path.join(REPO_ROOT, "PROJECT_STATUS_PROD_2E.md")) &&
      fs
        .readFileSync(path.join(REPO_ROOT, "PROJECT_STATUS_PROD_2E.md"), "utf8")
        .includes("D28 CLOSED"),
  },
  {
    id: "governance.viewportDomain",
    pass: fs.existsSync(path.join(REPO_ROOT, "src/lib/graph/viewport.ts")),
  },
  {
    id: "governance.chartViewportShim",
    pass:
      chartViewportShimSource.includes("@/lib/graph/viewport") ||
      chartViewportShimSource.includes("../lib/graph/viewport"),
  },
];

const gateSteps: StepResult[] = [
  ...governanceChecks,
  runStep("validate.chart-viewport", "npm run validate:chart-viewport"),
  runStep("validate.chart-viewport-y", "npm run validate:chart-viewport-y"),
  runStep(
    "validate.prod2e-data3b-gate",
    "npm run validate:prod2e-data3b-gate"
  ),
  runStep(
    "validate.visual-graph-builder-unit",
    "npm run validate:visual-graph-builder-unit"
  ),
  runStep("typescript", "npx tsc --noEmit"),
];

const summary = {
  phase: "prod2e-d29-viewport-gate",
  pass: gateSteps.every((step) => step.pass),
  caseCount: gateSteps.length,
  cases: gateSteps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
