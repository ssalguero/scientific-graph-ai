import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const FIXTURES_DIR = path.join(REPO_ROOT, "scripts", "fixtures");

const governanceChecks = [
  {
    id: "governance.masterRoadmap.data3b",
    pass:
      fs.existsSync(path.join(REPO_ROOT, "MASTER_ROADMAP_V1.md")) &&
      fs.readFileSync(path.join(REPO_ROOT, "MASTER_ROADMAP_V1.md"), "utf8").includes("DATA-3B"),
  },
  {
    id: "governance.projectPlanProd2e",
    pass: fs.existsSync(path.join(REPO_ROOT, "PROJECT_PLAN_PROD_2E.md")),
  },
  {
    id: "governance.projectStatusProd2e",
    pass:
      fs.existsSync(path.join(REPO_ROOT, "PROJECT_STATUS_PROD_2E.md")) &&
      fs
        .readFileSync(path.join(REPO_ROOT, "PROJECT_STATUS_PROD_2E.md"), "utf8")
        .includes("D27 CLOSED"),
  },
  {
    id: "governance.apiFreezeD25",
    pass:
      fs.existsSync(path.join(REPO_ROOT, "PROJECT_DISCOVERY_PROD_2E.md")) &&
      fs
        .readFileSync(path.join(REPO_ROOT, "PROJECT_DISCOVERY_PROD_2E.md"), "utf8")
        .includes("pcaVariables"),
  },
  {
    id: "governance.goldenFixture.heatmap",
    pass: fs.existsSync(
      path.join(FIXTURES_DIR, "project-v2-dataset5-with-heatmap.sgproj")
    ),
  },
  {
    id: "governance.goldenFixture.bubble",
    pass: fs.existsSync(
      path.join(FIXTURES_DIR, "project-v2-dataset5-with-bubble.sgproj")
    ),
  },
  {
    id: "governance.goldenFixture.pca",
    pass: fs.existsSync(path.join(FIXTURES_DIR, "project-v2-dataset5-with-pca.sgproj")),
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
    "validate.prod2e-d26-heatmap-unit",
    "npm run validate:prod2e-d26-heatmap-unit"
  ),
  runStep(
    "validate.prod2e-d27-bubble-unit",
    "npm run validate:prod2e-d27-bubble-unit"
  ),
  runStep("validate.prod2e-d28-pca-unit", "npm run validate:prod2e-d28-pca-unit"),
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
  phase: "prod2e-data3b-gate",
  pass: gateSteps.every((step) => step.pass),
  caseCount: gateSteps.length,
  cases: gateSteps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
