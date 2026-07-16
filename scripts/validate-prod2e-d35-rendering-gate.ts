/**
 * PROD-2E D35.4 — rendering umbrella governance gate.
 *
 * Nested regression umbrellas run as sibling steps from package.json
 * (`&&` chain with `npx tsx scripts/...`) to avoid Windows process-tree
 * faults when umbrellas are execSync-nested under this orchestrator.
 *
 * Full chain (package.json) — paridad sibling del script D34 (anti-nest):
 *   governor D35 → governor D34 (light) → tsc → interaction/axes units →
 *   viewport X/Y → D29–D32 → C8 → tsc → graph-rendering-unit
 *
 * Equivalente 1:1 a `validate:prod2e-d34-interaction-gate` expandido en
 * siblings, omitiendo `validate-prod2e-d33-axes-gate.ts` (orquestador
 * execSync anidado) por fallos intermitentes de process-tree en Windows.
 * Freeze axes D33 cubierto por este governor + validate:graph-axes-unit.
 */
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();

type StepResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const renderingRoot = path.join(
  REPO_ROOT,
  "src/components/graph/chart-rendering"
);
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

const frozenInteractionBarrelSource = [
  'export { useChartViewportInteraction } from "./useChartViewportInteraction";',
  'export { ChartInteractionSurface } from "./ChartInteractionSurface";',
].join("\n");

const frozenRenderingBarrelSource = [
  "export {",
  "  curveLegendKey,",
  "  derivativeLegendKey,",
  "  integralLegendKey,",
  "  experimentalLegendKey,",
  "  regressionLegendKey,",
  '} from "./legendKeys";',
  'export { MainChartLegend } from "./MainChartLegend";',
  'export { MainComposedChart } from "./MainComposedChart";',
].join("\n");

const requiredRenderingFiles = [
  "types.ts",
  "legendKeys.ts",
  "scatterAdapters.ts",
  "markers.tsx",
  "tokens.ts",
  "MainChartLegend.tsx",
  "MainComposedChart.tsx",
  "index.ts",
];

const gateSteps: StepResult[] = [
  {
    id: "governance.renderingDomain",
    pass:
      fs.existsSync(renderingRoot) &&
      requiredRenderingFiles.every((name) =>
        fs.existsSync(path.join(renderingRoot, name))
      ),
  },
  {
    id: "governance.renderingBarrelFrozen",
    pass:
      fs
        .readFileSync(path.join(renderingRoot, "index.ts"), "utf8")
        .replace(/\r\n/g, "\n")
        .trim() === frozenRenderingBarrelSource,
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
    id: "governance.interactionBarrelFrozen",
    pass:
      fs.existsSync(interactionRoot) &&
      fs
        .readFileSync(path.join(interactionRoot, "index.ts"), "utf8")
        .replace(/\r\n/g, "\n")
        .trim() === frozenInteractionBarrelSource,
  },
  {
    id: "governance.rendering.pageUsesMainComposedChart",
    pass: pageSource.includes("<MainComposedChart"),
  },
  {
    id: "governance.rendering.pageUsesMainChartLegend",
    pass: pageSource.includes("<MainChartLegend"),
  },
  {
    id: "governance.rendering.noComposedChartJsx",
    pass: !/<ComposedChart\b/.test(pageSource),
  },
  {
    id: "governance.rendering.importsBarrelOnly",
    pass:
      pageSource.includes('from "@/components/graph/chart-rendering"') &&
      !/@\/components\/graph\/chart-rendering\//.test(pageSource),
  },
  {
    id: "governance.rendering.noInlineMoveHelpers",
    pass:
      !/\bconst\s+renderMaximumMarker\b/.test(pageSource) &&
      !/\bconst\s+renderMinimumMarker\b/.test(pageSource) &&
      !/\bconst\s+curveLegendKey\s*=/.test(pageSource) &&
      !/\bconst\s+derivativeLegendKey\s*=/.test(pageSource) &&
      !/\bconst\s+integralLegendKey\s*=/.test(pageSource) &&
      !/\bconst\s+experimentalLegendKey\s*=/.test(pageSource) &&
      !/\bconst\s+regressionLegendKey\s*=/.test(pageSource) &&
      !/\bconst\s+getExperimentalPointReactKey\b/.test(pageSource) &&
      !/\bconst\s+mapExperimentalScatterData\b/.test(pageSource) &&
      !/\bconst\s+DERIVATIVE_STROKE_OPACITY\b/.test(pageSource) &&
      !/\bconst\s+INTEGRAL_STROKE_OPACITY\b/.test(pageSource),
  },
];

const passedCount = gateSteps.filter((step) => step.pass).length;
const summary = {
  phase: "prod2e-d35-rendering-gate",
  pass: gateSteps.every((step) => step.pass) && passedCount === gateSteps.length,
  caseCount: gateSteps.length,
  passLabel: `${passedCount}/${gateSteps.length}`,
  cases: gateSteps,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
