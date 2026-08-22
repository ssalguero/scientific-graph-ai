import type { ContractFoundationAssertCase } from "@/lib/scientific/contracts/__tests__/run-assertions";
import {
  assessSemanticProjectionParity,
  composeScientificProvenance,
} from "@/lib/scientific/contracts";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";
import { buildVisualGraphSemanticProjection } from "../visual-graph";

const entry: ProjectVisualGraphEntry = {
  id: "graph-1",
  createdAt: "2026-08-21T20:00:00.000Z",
  graphSpec: {
    id: "graph-1",
    createdAt: "2026-08-21T20:00:00.000Z",
    graphType: "bar",
    xVariable: "group",
    yVariable: "value",
    groupVariable: null,
    color: "#000000",
    marker: "circle",
    lineStyle: "solid",
    markerSize: 6,
    errorBars: "sem",
    bins: 10,
    xLabel: "Grupo",
    yLabel: "Concentración (mg/L)",
    groupLabel: null,
  },
  preview: {
    graphType: "bar",
    title: "Concentración",
    xLabel: "Grupo",
    yLabel: "Concentración (mg/L)",
    scatterPoints: [],
    lineSeries: [],
    barData: [{ category: "A", value: 12, error: 1.5 }],
    histogramBins: [],
    boxPlotData: [],
    violinData: [],
    heatmapData: [],
    bubbleData: [],
    pcaData: [],
    pcaMeta: null,
  },
  displaySeries: [],
};

const provenance = composeScientificProvenance({
  dataset: { id: "dataset-1", label: "Dataset.csv" },
  source: { kind: "worksheet", id: "worksheet-1" },
  series: [{ id: "value", role: "response" }],
  config: { id: "vgb-graph-1", values: { errorBars: "sem" } },
  method: {
    id: "vgb.bar-preview",
    label: "Vista de barras del Constructor Visual",
    version: "1",
    parameters: { errorBars: "sem" },
  },
  approximation: { kind: "exact-formula", details: "Media y SEM." },
  warnings: [],
});

export const runVisualGraphSemanticCases = (
  assertCase: ContractFoundationAssertCase
) => {
  const figure = buildVisualGraphSemanticProjection({ entry, provenance });
  const results = buildVisualGraphSemanticProjection({
    entry,
    provenance,
    surface: "results",
  });
  const barValues = figure.semanticValues.find(
    (value) => value.field === "values.barData"
  );
  const yUnit = figure.semanticValues.find(
    (value) => value.field === "units.y"
  );
  assertCase(
    "pr2.figure.contract",
    figure.resultContractId === "vgb.preview-values"
  );
  assertCase(
    "pr2.figure.live-not-citable",
    figure.artifactIdentity.kind === "live-derived-result" &&
      figure.artifactIdentity.citable === false
  );
  assertCase(
    "pr2.figure.units",
    barValues?.unit === undefined &&
      yUnit?.status === "unknown" &&
      yUnit.value === null
  );
  assertCase(
    "pr2.figure.uncertainty",
    barValues?.uncertainty?.kind === "sem" &&
      Array.isArray(barValues.uncertainty.value)
  );
  assertCase(
    "pr2.figure.provenance",
    figure.provenance.source.id === "worksheet-1" &&
      figure.configurationIdentity.values.errorBars === "sem"
  );
  assertCase(
    "pr2.figure.surface-parity",
    assessSemanticProjectionParity([figure, results]).equivalent
  );
};
