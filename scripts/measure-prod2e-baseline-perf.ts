/**
 * D25.2 — Medición read-only del motor gráfico (baseline PROD-2E).
 * No modifica producto; solo emite métricas JSON para PROJECT_BASELINE_PROD_2E.md.
 */
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { join } from "node:path";

import type { ExperimentalSeries } from "../src/lib/experimentalData";
import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
} from "../src/lib/experimentalWorksheet";
import { hydrateProjectJson } from "../src/lib/project";
import { rebuildVisualGraphRuntimeEntriesFromPatch } from "../src/lib/project/apply-hydrate-project-v2-patch";
import {
  buildVisualGraphPreview,
  DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  VISUAL_GRAPH_TYPES_V1,
  type VisualGraphType,
} from "../src/lib/visualGraphBuilder";

const REPO_ROOT = join(import.meta.dirname, "..");
const ITERATIONS = 50;

const control1: ExperimentalSeries = {
  id: "control1",
  name: "Control1",
  color: "#3b82f6",
  points: [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 30 },
    { x: 4, y: 25 },
    { x: 5, y: 35 },
  ],
};

const tratamiento1: ExperimentalSeries = {
  id: "tratamiento1",
  name: "Tratamiento1",
  color: "#ef4444",
  points: [
    { x: 1, y: 30 },
    { x: 2, y: 40 },
    { x: 3, y: 50 },
    { x: 4, y: 45 },
    { x: 5, y: 55 },
  ],
};

const grupo: ExperimentalSeries = {
  id: "grupo",
  name: "Grupo",
  color: "#22c55e",
  points: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
    { x: 4, y: 2 },
    { x: 5, y: 1 },
  ],
};

const series = [control1, tratamiento1, grupo];
const model = seriesToWorksheet(series);
const registry = {
  control1: DEFAULT_COLUMN_METADATA,
  tratamiento1: DEFAULT_COLUMN_METADATA,
  grupo: {
    columnType: "category" as const,
    transforms: [],
  },
};

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
};

const specForType = (graphType: VisualGraphType) => {
  const base = {
    ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
    graphType,
    xVariable: "x" as const,
    yVariable: "control1" as const,
    bins: 5,
  };
  if (graphType === "histogram") {
    return { ...base, xVariable: null, yVariable: "control1" as const };
  }
  if (graphType === "boxPlot" || graphType === "violin" || graphType === "bar") {
    return {
      ...base,
      xVariable: null,
      yVariable: "control1" as const,
      groupVariable: "grupo" as const,
    };
  }
  return base;
};

const measurePreviewMs = (graphType: VisualGraphType) => {
  const spec = specForType(graphType);
  const validation = buildVisualGraphPreview(spec, model, registry);
  if ("error" in validation) {
    return { graphType, error: validation.error };
  }

  const samples: number[] = [];
  for (let i = 0; i < ITERATIONS; i += 1) {
    const start = performance.now();
    buildVisualGraphPreview(spec, model, registry);
    samples.push(performance.now() - start);
  }

  const preview = buildVisualGraphPreview(spec, model, registry);
  if ("error" in preview) {
    return { graphType, error: preview.error };
  }

  const pointCount =
    preview.scatterPoints.length +
    preview.lineSeries.reduce((total, item) => total + item.points.length, 0) +
    preview.barData.length +
    preview.histogramBins.length +
    preview.boxPlotData.length +
    preview.violinData.reduce((total, item) => total + item.values.length, 0);

  return {
    graphType,
    previewMedianMs: Number(median(samples).toFixed(4)),
    previewP95Ms: Number(
      samples.sort((a, b) => a - b)[Math.floor(samples.length * 0.95)]!.toFixed(4)
    ),
    defaultPointCount: pointCount,
    iterations: ITERATIONS,
  };
};

const measureHydrateMs = (fixturePath: string) => {
  const raw = readFileSync(join(REPO_ROOT, fixturePath), "utf8");
  const samples: number[] = [];
  let graphCount = 0;

  for (let i = 0; i < ITERATIONS; i += 1) {
    const start = performance.now();
    const hydrated = hydrateProjectJson(raw);
    if (!hydrated.ok) {
      return { fixture: fixturePath, error: "hydrate failed" };
    }
    rebuildVisualGraphRuntimeEntriesFromPatch(hydrated.patch);
    samples.push(performance.now() - start);
    if (i === 0) {
      graphCount = hydrated.patch.project.visualGraphs?.length ?? 0;
    }
  }

  return {
    fixture: fixturePath,
    hydrateMedianMs: Number(median(samples).toFixed(4)),
    hydrateP95Ms: Number(
      samples.sort((a, b) => a - b)[Math.floor(samples.length * 0.95)]!.toFixed(4)
    ),
    visualGraphCount: graphCount,
    iterations: ITERATIONS,
  };
};

const previewMetrics = VISUAL_GRAPH_TYPES_V1.map((graphType) =>
  measurePreviewMs(graphType)
);

const hydrateMono = measureHydrateMs(
  "scripts/fixtures/project-v2-dataset5-with-visual-graph.sgproj"
);
const hydrateMulti = measureHydrateMs(
  "scripts/fixtures/project-v2-dataset5-dataset6-with-visual-graphs.sgproj"
);

const heapUsedMb = Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));

const summary = {
  schemaVersion: 1,
  phase: "prod2e-baseline-perf",
  generatedAt: new Date().toISOString(),
  previewByType: previewMetrics,
  hydrate: [hydrateMono, hydrateMulti],
  memory: {
    heapUsedMbAfterMeasurement: heapUsedMb,
    note: "Heap delta aproximado post-medición; no incluye render DOM",
  },
  datasetReference: {
    seriesCount: series.length,
    observationCount: series.reduce((total, item) => total + item.points.length, 0),
  },
};

console.log(JSON.stringify(summary, null, 2));
