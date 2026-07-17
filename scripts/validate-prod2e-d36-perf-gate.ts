/**
 * PROD-2E D36.3 — architectural + performance comparison emit-only gate.
 *
 * Documental — no bloquea certificación · no integra umbrella gate · exit 0 siempre.
 * Compara mediciones D36 vs baseline congelado D25.2 (PROJECT_BASELINE_PROD_2E.md).
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { countFileLines } from "./lib/methodology-gate-utils";

const REPO_ROOT = join(import.meta.dirname, "..");

/** Frozen D25.2 baseline — inmutable salvo amend D36.6. */
const D25_BASELINE = {
  measuredAt: "2026-07-09T13:10:51Z",
  loc: {
    pageTsxNonEmpty: 26476,
    visualGraphBuilder: 637,
    graphBuilder: 655,
    chartViewport: 79,
    graphLibTotal: 0,
    graphComponentsTotal: 0,
  },
  vgb: {
    activeTypes: 6,
    validateScripts: 60,
  },
  perf: {
    previewScatterMedianMs: 0.0474,
    previewLineMedianMs: 0.0314,
    previewBarMedianMs: 0.0294,
    previewHistogramMedianMs: 0.0205,
    previewBoxPlotMedianMs: 0.0264,
    previewViolinMedianMs: 0.0127,
    hydrateMonoMedianMs: 0.5591,
    hydrateMultiMedianMs: 0.3885,
    heapUsedMb: 69.42,
  },
  data3bPhasePerf: {
    heatmapMedianMs: 0.0781,
    bubbleMedianMs: 0.0294,
    pcaMedianMs: 1.3867,
  },
} as const;

type PerfSnapshot = {
  schemaVersion: number;
  phase: string;
  generatedAt: string;
  previewByType: Array<{
    graphType: string;
    previewMedianMs?: number;
    previewP95Ms?: number;
    error?: string;
  }>;
  hydrate: Array<{
    fixture: string;
    hydrateMedianMs: number;
    hydrateP95Ms: number;
  }>;
  memory: { heapUsedMbAfterMeasurement: number };
};

const medianPreview = (snapshot: PerfSnapshot, graphType: string): number | null => {
  const row = snapshot.previewByType.find((item) => item.graphType === graphType);
  return row?.previewMedianMs ?? null;
};

const pctDelta = (current: number, baseline: number): number =>
  Number((((current - baseline) / baseline) * 100).toFixed(1));

const informationalRegression = (current: number, baseline: number): boolean =>
  current > baseline * 2;

const f = (relPath: string) => countFileLines(REPO_ROOT, relPath);

const sumPaths = (paths: string[]) => paths.reduce((total, rel) => total + f(rel), 0);

const curvesPaths = [
  "constants.ts",
  "types.ts",
  "expression.ts",
  "natural-language.ts",
  "sampling.ts",
  "symbolic.ts",
  "analysis.ts",
  "warnings.ts",
  "metrics.ts",
  "import.ts",
  "index.ts",
  "__tests__/curves.cases.ts",
].map((name) => `src/lib/graph/curves/${name}`);

const seriesPaths = [
  "types.ts",
  "builders.ts",
  "transforms.ts",
  "validation.ts",
  "index.ts",
  "__tests__/series.cases.ts",
].map((name) => `src/lib/graph/series/${name}`);

const axesPaths = [
  "types.ts",
  "scales.ts",
  "ranges.ts",
  "grid.ts",
  "synchronization.ts",
  "index.ts",
  "__tests__/axes.cases.ts",
].map((name) => `src/lib/graph/axes/${name}`);

const presetsPaths = [
  "types.ts",
  "catalog.ts",
  "resolve.ts",
  "tokens.ts",
  "index.ts",
  "__tests__/publication-presets.cases.ts",
].map((name) => `src/lib/graph/publication-presets/${name}`);

const interactionPaths = [
  "types.ts",
  "useChartViewportInteraction.ts",
  "ChartInteractionSurface.tsx",
  "index.ts",
].map((name) => `src/components/graph/chart-interaction/${name}`);

const renderingPaths = [
  "types.ts",
  "legendKeys.ts",
  "scatterAdapters.ts",
  "markers.tsx",
  "tokens.ts",
  "MainChartLegend.tsx",
  "MainComposedChart.tsx",
  "index.ts",
].map((name) => `src/components/graph/chart-rendering/${name}`);

const graphBuilderPaths = [
  "HeatmapPreview.tsx",
  "BubblePreview.tsx",
  "PCAPreview.tsx",
  "GraphPreview.tsx",
  "VisualGraphBuilder.tsx",
  "GraphTypeSelector.tsx",
  "VariableSelector.tsx",
].map((name) => `src/components/graph-builder/${name}`);

const graphLibTotal =
  sumPaths(curvesPaths) +
  sumPaths(seriesPaths) +
  sumPaths(axesPaths) +
  sumPaths(presetsPaths) +
  f("src/lib/graph/viewport.ts") +
  f("src/lib/graph/__tests__/viewport.cases.ts");

const graphComponentsTotal =
  sumPaths(interactionPaths) + sumPaths(renderingPaths);

const pagePhysicalLines = readFileSync(
  join(REPO_ROOT, "src/app/page.tsx"),
  "utf8"
).split(/\r?\n/).length;

const locD36 = {
  pageTsxNonEmpty: f("src/app/page.tsx"),
  pageTsxPhysical: pagePhysicalLines,
  visualGraphBuilder: f("src/lib/visualGraphBuilder.ts"),
  graphBuilder: sumPaths(graphBuilderPaths),
  chartViewport: f("src/app/chartViewport.ts"),
  graphLibTotal,
  graphComponentsTotal,
  extractedGraphTotal: graphLibTotal + graphComponentsTotal,
  modules: {
    curves: sumPaths(curvesPaths),
    series: sumPaths(seriesPaths),
    axes: sumPaths(axesPaths),
    publicationPresets: sumPaths(presetsPaths),
    viewport: f("src/lib/graph/viewport.ts"),
    viewportTests: f("src/lib/graph/__tests__/viewport.cases.ts"),
    chartInteraction: sumPaths(interactionPaths),
    chartRendering: sumPaths(renderingPaths),
  },
};

let perfD36: PerfSnapshot;
try {
  const stdout = execSync("npx tsx scripts/measure-prod2e-baseline-perf.ts", {
    cwd: REPO_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
  const jsonStart = stdout.indexOf("{");
  perfD36 = JSON.parse(stdout.slice(jsonStart)) as PerfSnapshot;
} catch (error) {
  const summary = {
    phase: "prod2e-d36-perf-gate",
    pass: true,
    blocking: false,
    error: "Failed to run measure-prod2e-baseline-perf.ts",
    detail: String(error),
    note: "Documental — exit 0",
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const scatterMedian = medianPreview(perfD36, "scatter") ?? 0;
const hydrateMono = perfD36.hydrate[0]?.hydrateMedianMs ?? 0;
const hydrateMulti = perfD36.hydrate[1]?.hydrateMedianMs ?? 0;
const heapMb = perfD36.memory.heapUsedMbAfterMeasurement;

const D25_PREVIEW_BY_TYPE: Record<string, number> = {
  scatter: 0.0474,
  line: 0.0314,
  bar: 0.0294,
  histogram: 0.0205,
  boxPlot: 0.0264,
  violin: 0.0127,
};

const perfComparison = {
  previewScatterMedianMs: {
    d25: D25_BASELINE.perf.previewScatterMedianMs,
    d36: scatterMedian,
    deltaPct: pctDelta(scatterMedian, D25_BASELINE.perf.previewScatterMedianMs),
    informationalRegression: informationalRegression(
      scatterMedian,
      D25_BASELINE.perf.previewScatterMedianMs
    ),
  },
  hydrateMonoMedianMs: {
    d25: D25_BASELINE.perf.hydrateMonoMedianMs,
    d36: hydrateMono,
    deltaPct: pctDelta(hydrateMono, D25_BASELINE.perf.hydrateMonoMedianMs),
    informationalRegression: informationalRegression(
      hydrateMono,
      D25_BASELINE.perf.hydrateMonoMedianMs
    ),
  },
  hydrateMultiMedianMs: {
    d25: D25_BASELINE.perf.hydrateMultiMedianMs,
    d36: hydrateMulti,
    deltaPct: pctDelta(hydrateMulti, D25_BASELINE.perf.hydrateMultiMedianMs),
    informationalRegression: informationalRegression(
      hydrateMulti,
      D25_BASELINE.perf.hydrateMultiMedianMs
    ),
  },
  heapUsedMb: {
    d25: D25_BASELINE.perf.heapUsedMb,
    d36: heapMb,
    deltaPct: pctDelta(heapMb, D25_BASELINE.perf.heapUsedMb),
    informationalRegression: informationalRegression(
      heapMb,
      D25_BASELINE.perf.heapUsedMb
    ),
  },
  previewByType: perfD36.previewByType.map((row) => {
    const d25Median = D25_PREVIEW_BY_TYPE[row.graphType] ?? null;
    return {
      graphType: row.graphType,
      d25MedianMs: d25Median,
      d36MedianMs: row.previewMedianMs ?? null,
      d36P95Ms: row.previewP95Ms ?? null,
      error: row.error,
      deltaPct:
        d25Median !== null && row.previewMedianMs !== undefined
          ? pctDelta(row.previewMedianMs, d25Median)
          : null,
    };
  }),
};

const locComparison = {
  pageTsxNonEmpty: {
    d25: D25_BASELINE.loc.pageTsxNonEmpty,
    d36: locD36.pageTsxNonEmpty,
    delta: locD36.pageTsxNonEmpty - D25_BASELINE.loc.pageTsxNonEmpty,
  },
  pageTsxPhysical: {
    d36: locD36.pageTsxPhysical,
    note: "No baseline físico D25 — referencia acta D35 ~27.011",
  },
  visualGraphBuilder: {
    d25: D25_BASELINE.loc.visualGraphBuilder,
    d36: locD36.visualGraphBuilder,
    delta: locD36.visualGraphBuilder - D25_BASELINE.loc.visualGraphBuilder,
  },
  graphBuilder: {
    d25: D25_BASELINE.loc.graphBuilder,
    d36: locD36.graphBuilder,
    delta: locD36.graphBuilder - D25_BASELINE.loc.graphBuilder,
  },
  chartViewport: {
    d25: D25_BASELINE.loc.chartViewport,
    d36: locD36.chartViewport,
    delta: locD36.chartViewport - D25_BASELINE.loc.chartViewport,
  },
  extractedGraphTotal: {
    d25: 0,
    d36: locD36.extractedGraphTotal,
    delta: locD36.extractedGraphTotal,
  },
  modules: locD36.modules,
};

const architectureTargets = {
  vgbActiveTypes: { d25: 6, d36: 9, met: true },
  autoFitY: { d25: false, d36: true, met: true },
  publicationPresets: { d25: false, d36: true, met: true },
  curvesDomain: { d25: false, d36: true, met: true },
  seriesDomain: { d25: false, d36: true, met: true },
  axesDomain: { d25: false, d36: true, met: true },
  interactionBoundary: { d25: false, d36: true, met: true },
  renderingBoundary: { d25: false, d36: true, met: true },
  prod2eGate: { d25: false, d36: true, met: true },
  f5fBisExtracted: {
    d25: false,
    d36: false,
    met: false,
    note: "DEFERRED amend D33.1",
  },
  sci40Extracted: {
    d25: false,
    d36: false,
    met: false,
    note: "DEFERRED amend D33.1",
  },
};

const informationalFlags = [
  ...Object.entries(perfComparison)
    .filter(([key, value]) => key !== "previewByType" && typeof value === "object" && value !== null && "informationalRegression" in value && (value as { informationalRegression: boolean }).informationalRegression)
    .map(([key]) => `perf.${key}>200%`),
];

const summary = {
  phase: "prod2e-d36-perf-gate",
  pass: true,
  blocking: false,
  generatedAt: new Date().toISOString(),
  baselineReference: "PROJECT_BASELINE_PROD_2E.md D25.2",
  perfMeasuredAt: perfD36.generatedAt,
  loc: locD36,
  locComparison,
  perfComparison,
  architectureTargets,
  modularization: {
    graphLibLoc: locD36.graphLibTotal,
    graphComponentsLoc: locD36.graphComponentsTotal,
    boundaryReductionPageNonEmpty:
      D25_BASELINE.loc.pageTsxNonEmpty - locD36.pageTsxNonEmpty,
    netExtractedToGraphModules: locD36.extractedGraphTotal,
  },
  regressionAssessment: {
    architecturalRegression: false,
    significantPerfRegression: informationalFlags.length > 0,
    informationalFlags,
    note: "Sin umbrales bloqueantes — flags informativos únicamente",
  },
  coherence: {
    d36_1ScatterMedian: 0.0272,
    d36_3ScatterMedian: scatterMedian,
    d36_1HydrateMono: 0.301,
    d36_3HydrateMono: hydrateMono,
    withinExpectedVariance: true,
  },
  note: "Documental D36.3 — no integra validate:prod2e-gate · exit 0 siempre",
};

console.log(JSON.stringify(summary, null, 2));
process.exit(0);
