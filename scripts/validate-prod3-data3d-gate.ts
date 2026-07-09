import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();

const governanceChecks = [
  {
    id: "governance.masterRoadmap.data3d",
    pass:
      fs.existsSync(path.join(REPO_ROOT, "MASTER_ROADMAP_V1.md")) &&
      fs.readFileSync(path.join(REPO_ROOT, "MASTER_ROADMAP_V1.md"), "utf8").includes("DATA-3D"),
  },
  {
    id: "governance.projectPlanProd3",
    pass: fs.existsSync(path.join(REPO_ROOT, "PROJECT_PLAN_PROD_3.md")),
  },
  {
    id: "governance.projectStatusProd3",
    pass: fs.existsSync(path.join(REPO_ROOT, "PROJECT_STATUS_PROD_3.md")),
  },
  {
    id: "governance.apiFreezeAmendJ",
    pass:
      fs.existsSync(path.join(REPO_ROOT, "PROJECT_DISCOVERY_PROD_3.md")) &&
      fs
        .readFileSync(path.join(REPO_ROOT, "PROJECT_DISCOVERY_PROD_3.md"), "utf8")
        .includes("Decisión J"),
  },
];

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

const gateSteps: StepResult[] = [
  ...governanceChecks,
  runStep(
    "validate.prod3-d39-scatter-unit",
    "npm run validate:prod3-d39-scatter-unit"
  ),
  runStep(
    "validate.visual-graph-builder-unit",
    "npm run validate:visual-graph-builder-unit"
  ),
  runStep(
    "validate.prod2c-c8-regression-gate",
    "npm run validate:prod2c-c8-regression-gate"
  ),
  runStep("typescript", "npx tsc --noEmit"),
];

const summary = {
  phase: "prod3-data3d-gate",
  pass: gateSteps.every((step) => step.pass),
  caseCount: gateSteps.length,
  cases: gateSteps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
