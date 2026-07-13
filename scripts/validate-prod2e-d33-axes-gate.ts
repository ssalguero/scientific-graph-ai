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

const axesRoot = path.join(REPO_ROOT, "src/lib/graph/axes");
const pagePath = path.join(REPO_ROOT, "src/app/page.tsx");
const viewportPath = path.join(REPO_ROOT, "src/lib/graph/viewport.ts");
const pageSource = fs.existsSync(pagePath)
  ? fs.readFileSync(pagePath, "utf8")
  : "";
const viewportSource = fs.existsSync(viewportPath)
  ? fs.readFileSync(viewportPath, "utf8")
  : "";

const frozenBarrelSource = [
  'export * from "../viewport";',
  'export * from "./types";',
  'export * from "./scales";',
  'export * from "./ranges";',
  'export * from "./grid";',
  'export * from "./synchronization";',
].join("\n");

const gateSteps: StepResult[] = [
  {
    id: "governance.axesDomain",
    pass:
      fs.existsSync(axesRoot) &&
      fs.existsSync(path.join(axesRoot, "index.ts")) &&
      fs.existsSync(path.join(axesRoot, "ranges.ts")) &&
      fs.existsSync(path.join(axesRoot, "scales.ts")) &&
      !fs.existsSync(path.join(axesRoot, "viewport.ts")),
  },
  {
    id: "governance.viewportSsotIntact",
    pass:
      viewportSource.includes("export const computeXViewportWithPadding") &&
      !viewportSource.includes("clampVisibleXRange"),
  },
  {
    id: "governance.axesBarrelFrozen",
    pass:
      fs
        .readFileSync(path.join(axesRoot, "index.ts"), "utf8")
        .replace(/\r\n/g, "\n")
        .trim() === frozenBarrelSource,
  },
  runStep("typescript", "npx tsc --noEmit"),
  runStep("validate.graph-axes-unit", "npm run validate:graph-axes-unit"),
  runStep("validate.graph-series-unit", "npm run validate:graph-series-unit"),
  runStep("validate.graph-curves-unit", "npm run validate:graph-curves-unit"),
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
    "validate.prod2e-d32-series-gate",
    "npm run validate:prod2e-d32-series-gate"
  ),
  runStep(
    "validate.prod2c-c8-regression-gate",
    "npm run validate:prod2c-c8-regression-gate"
  ),
  {
    id: "governance.pageAxesWiring",
    pass:
      pageSource.includes('from "@/lib/graph/axes"') &&
      !pageSource.includes('from "./chartViewport"') &&
      !pageSource.includes('from "@/lib/graph/viewport"') &&
      !pageSource.includes("const clampVisibleXRange") &&
      !pageSource.includes("const getChartTheme"),
  },
];

const passedCount = gateSteps.filter((step) => step.pass).length;
const summary = {
  phase: "prod2e-d33-axes-gate",
  pass: gateSteps.every((step) => step.pass) && passedCount === gateSteps.length,
  caseCount: gateSteps.length,
  passLabel: `${passedCount}/${gateSteps.length}`,
  cases: gateSteps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
