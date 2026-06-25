import type { ExperimentalSeries } from "../src/lib/experimentalData";
import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
} from "../src/lib/experimentalWorksheet";
import {
  applyVisualGraphSpecification,
  buildGraphSpecification,
  buildVisualGraphPreview,
  DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  hasVisualGraphPreviewChanged,
  incorporateVisualGraphIntoProject,
  validateVisualGraphConfiguration,
} from "../src/lib/visualGraphBuilder";

type CaseResult = { id: string; pass: boolean; detail?: string };

const results: CaseResult[] = [];

const control1: ExperimentalSeries = {
  id: "control1",
  name: "Control1",
  color: "#3b82f6",
  points: [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 30 },
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
  ],
};

const categorySeries: ExperimentalSeries = {
  id: "grupo",
  name: "Grupo",
  color: "#22c55e",
  points: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
  ],
};

const series = [control1, tratamiento1, categorySeries];
const model = seriesToWorksheet(series);
const registry = {
  control1: DEFAULT_COLUMN_METADATA,
  tratamiento1: DEFAULT_COLUMN_METADATA,
  grupo: {
    columnType: "category" as const,
    transforms: [],
  },
};

const scatterSpec = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "scatter" as const,
  xVariable: "x",
  yVariable: "control1",
};

const histogramSpec = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "histogram" as const,
  yVariable: "control1",
  bins: 3,
};

const boxPlotSpec = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "boxPlot" as const,
  yVariable: "control1",
  groupVariable: "grupo",
};

results.push({
  id: "visual-graph.scatter.valid",
  pass: validateVisualGraphConfiguration(scatterSpec, model, registry).ok === true,
});

results.push({
  id: "visual-graph.histogram.valid",
  pass: validateVisualGraphConfiguration(histogramSpec, model, registry).ok === true,
});

results.push({
  id: "visual-graph.boxplot.valid",
  pass: validateVisualGraphConfiguration(boxPlotSpec, model, registry).ok === true,
});

const missingVariable = validateVisualGraphConfiguration(
  { ...scatterSpec, yVariable: "missing" },
  model,
  registry
);
results.push({
  id: "visual-graph.missing-variable",
  pass:
    !missingVariable.ok &&
    missingVariable.message.includes('Variable "missing" no encontrada'),
});

const categoricalY = validateVisualGraphConfiguration(
  { ...scatterSpec, yVariable: "grupo" },
  model,
  registry
);
results.push({
  id: "visual-graph.categorical-y",
  pass:
    !categoricalY.ok &&
    categoricalY.message === "Variable no compatible con este gráfico.",
});

const previewA = buildVisualGraphPreview(scatterSpec, model, registry);
const previewB = buildVisualGraphPreview(
  { ...scatterSpec, yVariable: "tratamiento1" },
  model,
  registry
);
results.push({
  id: "visual-graph.preview-updated",
  pass:
    !("error" in previewA) &&
    !("error" in previewB) &&
    hasVisualGraphPreviewChanged(previewA, previewB),
  detail:
    !("error" in previewA) && !("error" in previewB)
      ? `${previewA.scatterPoints.length} vs ${previewB.scatterPoints.length}`
      : undefined,
});

const graphSpec = buildGraphSpecification(scatterSpec, model, registry);
results.push({
  id: "visual-graph.spec-built",
  pass:
    !("error" in graphSpec) &&
    graphSpec.graphType === "scatter" &&
    graphSpec.yLabel === "Control1" &&
    typeof graphSpec.createdAt === "string",
});

const applied = applyVisualGraphSpecification(scatterSpec, series, registry);
results.push({
  id: "visual-graph.apply-scatter",
  pass:
    applied.ok &&
    applied.displaySeries.length === 1 &&
    applied.displaySeries[0]?.points.length === 3,
});

const previewBeforeCreate = buildVisualGraphPreview(scatterSpec, model, registry);
const incorporated = incorporateVisualGraphIntoProject([], scatterSpec, series, registry);
results.push({
  id: "visual-graph.preview-to-project",
  pass:
    !("error" in previewBeforeCreate) &&
    incorporated.ok &&
    incorporated.graphs.length === 1 &&
    incorporated.entry.preview.title === previewBeforeCreate.title &&
    incorporated.entry.graphSpec.graphType === "scatter",
  detail: incorporated.ok
    ? `${incorporated.graphs.length} graph(s) in project`
    : incorporated.message,
});

const histogramInProject = incorporateVisualGraphIntoProject(
  incorporated.ok ? incorporated.graphs : [],
  histogramSpec,
  series,
  registry
);
results.push({
  id: "visual-graph.project-accumulates",
  pass:
    histogramInProject.ok &&
    histogramInProject.graphs.length === (incorporated.ok ? 2 : 1),
  detail: histogramInProject.ok
    ? `${histogramInProject.graphs.length} graph(s) total`
    : histogramInProject.message,
});

const summary = {
  phase: "visual-graph-builder-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
