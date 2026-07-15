/**
 * PROD-2E D34.4 — interaction umbrella governance gate.
 *
 * Nested regression umbrellas run as sibling steps from package.json
 * (`&&` chain with `npx tsx scripts/...`) to avoid Windows process-tree
 * faults when umbrellas are execSync-nested under this orchestrator.
 */
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();

type StepResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const interactionRoot = path.join(
  REPO_ROOT,
  "src/components/graph/chart-interaction"
);
const axesRoot = path.join(REPO_ROOT, "src/lib/graph/axes");
const pagePath = path.join(REPO_ROOT, "src/app/page.tsx");
const pageSource = fs.existsSync(pagePath)
  ? fs.readFileSync(pagePath, "utf8")
  : "";

const frozenAxesBarrelSource = [
  'export * from "../viewport";',
  'export * from "./types";',
  'export * from "./scales";',
  'export * from "./ranges";',
  'export * from "./grid";',
  'export * from "./synchronization";',
].join("\n");

const gateSteps: StepResult[] = [
  {
    id: "governance.interactionDomain",
    pass:
      fs.existsSync(interactionRoot) &&
      fs.existsSync(path.join(interactionRoot, "index.ts")) &&
      fs.existsSync(
        path.join(interactionRoot, "useChartViewportInteraction.ts")
      ) &&
      fs.existsSync(path.join(interactionRoot, "ChartInteractionSurface.tsx")),
  },
  {
    id: "governance.axesBarrelFrozen",
    pass:
      fs
        .readFileSync(path.join(axesRoot, "index.ts"), "utf8")
        .replace(/\r\n/g, "\n")
        .trim() === frozenAxesBarrelSource,
  },
  {
    id: "governance.interaction.noInlineInPage",
    pass:
      !pageSource.includes("chartInteractionRef") &&
      !pageSource.includes("visibleRangeRef") &&
      !pageSource.includes("panStateRef") &&
      !pageSource.includes("handleChartMouseDown") &&
      !pageSource.includes("handleChartMouseMove") &&
      !pageSource.includes("handleChartMouseUp") &&
      !pageSource.includes('addEventListener("wheel"'),
  },
  {
    id: "governance.interaction.importsBarrelOnly",
    pass:
      pageSource.includes('from "@/components/graph/chart-interaction"') &&
      !/@\/components\/graph\/chart-interaction\//.test(pageSource),
  },
];

const passedCount = gateSteps.filter((step) => step.pass).length;
const summary = {
  phase: "prod2e-d34-interaction-gate",
  pass: gateSteps.every((step) => step.pass) && passedCount === gateSteps.length,
  caseCount: gateSteps.length,
  passLabel: `${passedCount}/${gateSteps.length}`,
  cases: gateSteps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
