import {
  createLiveScientificProjection,
  createScientificSemanticValue,
  toScientificValue,
  type ScientificProjectionSurface,
  type ScientificProvenanceDescriptor,
  type ScientificSemanticProjection,
  type ScientificSemanticValue,
} from "@/lib/scientific/contracts";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";

const resultContractForGraph = (
  entry: ProjectVisualGraphEntry
): "vgb.pca" | "vgb.preview-values" =>
  entry.graphSpec.graphType === "pca" ? "vgb.pca" : "vgb.preview-values";

const buildPreviewValues = (
  entry: ProjectVisualGraphEntry,
  provenance: ScientificProvenanceDescriptor
): readonly ScientificSemanticValue[] => {
  const approximation = provenance.approximation.kind;
  const factual = (
    field: string,
    value: unknown,
    unit?: string
  ): ScientificSemanticValue =>
    createScientificSemanticValue({
      field,
      value: toScientificValue(value),
      unit,
      status: "known",
      authority: "system-factual",
      approximation,
      equivalencePolicy: "exact",
    });
  const values: ScientificSemanticValue[] = [
    factual("figure.graphType", entry.graphSpec.graphType),
    factual("figure.scientificConfiguration", {
      graphType: entry.graphSpec.graphType,
      xVariable: entry.graphSpec.xVariable,
      yVariable: entry.graphSpec.yVariable,
      groupVariable: entry.graphSpec.groupVariable,
      colorVariable: entry.graphSpec.colorVariable,
      sizeVariable: entry.graphSpec.sizeVariable,
      errorBars: entry.graphSpec.errorBars,
      bins: entry.graphSpec.bins,
      pcaVariables: entry.graphSpec.pcaVariables,
      pcaStandardize: entry.graphSpec.pcaStandardize,
    }),
    createScientificSemanticValue({
      field: "figure.displayContext",
      value: toScientificValue({
        title: entry.preview.title,
        xLabel: entry.graphSpec.xLabel,
        yLabel: entry.graphSpec.yLabel,
        groupLabel: entry.graphSpec.groupLabel,
      }),
      status: "known",
      authority: "mixed-system",
      approximation,
      equivalencePolicy: "non-comparable",
    }),
    createScientificSemanticValue({
      field: "units.x",
      value: null,
      status: "unknown",
      authority: "system-factual",
      approximation,
      equivalencePolicy: "non-comparable",
    }),
    createScientificSemanticValue({
      field: "units.y",
      value: null,
      status: "unknown",
      authority: "system-factual",
      approximation,
      equivalencePolicy: "non-comparable",
    }),
  ];

  if (entry.preview.scatterPoints.length > 0) {
    values.push(factual("values.scatterPoints", entry.preview.scatterPoints));
  }
  if (entry.preview.lineSeries.length > 0) {
    values.push(factual("values.lineSeries", entry.preview.lineSeries));
  }
  if (entry.preview.barData.length > 0) {
    values.push(
      createScientificSemanticValue({
        field: "values.barData",
        value: toScientificValue(entry.preview.barData),
        status: "known",
        authority: "system-factual",
        approximation,
        uncertainty:
          entry.graphSpec.errorBars === "none"
            ? undefined
            : {
                kind:
                  entry.graphSpec.errorBars === "ci95"
                    ? "ci"
                    : entry.graphSpec.errorBars,
                value: toScientificValue(
                  entry.preview.barData.map((item) => item.error ?? null)
                ),
                confidenceLevel:
                  entry.graphSpec.errorBars === "ci95" ? 0.95 : undefined,
              },
        equivalencePolicy: "exact",
      })
    );
  }
  if (entry.preview.histogramBins.length > 0) {
    values.push(factual("values.histogramBins", entry.preview.histogramBins));
  }
  if (entry.preview.boxPlotData.length > 0) {
    values.push(factual("values.boxPlotData", entry.preview.boxPlotData));
  }
  if (entry.preview.violinData.length > 0) {
    values.push(factual("values.rawValueStrip", entry.preview.violinData));
  }
  if (entry.preview.heatmapData.length > 0) {
    values.push(factual("values.heatmap", entry.preview.heatmapData));
  }
  if (entry.preview.bubbleData.length > 0) {
    values.push(factual("values.bubble", entry.preview.bubbleData));
  }
  if (entry.preview.pcaData.length > 0) {
    values.push(factual("values.pcaScores", entry.preview.pcaData));
  }
  if (entry.preview.pcaMeta) {
    values.push(factual("values.pcaVariance", entry.preview.pcaMeta, "%"));
  }

  return values;
};

export const buildVisualGraphSemanticProjection = (input: {
  entry: ProjectVisualGraphEntry;
  provenance: ScientificProvenanceDescriptor;
  surface?: Extract<ScientificProjectionSurface, "results" | "figure">;
}): ScientificSemanticProjection =>
  createLiveScientificProjection({
    surface: input.surface ?? "figure",
    resultContractId: resultContractForGraph(input.entry),
    provenance: input.provenance,
    semanticValues: buildPreviewValues(input.entry, input.provenance),
    limitations: [
      "La proyección describe una figura de trabajo; no expresa revisión ni publicación.",
      "La configuración visual no sustituye una exportación científica numérica.",
    ],
  });
