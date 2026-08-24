import { composeScientificProvenance } from "@/lib/scientific/contracts";
import type { ScientificProvenanceDescriptor } from "@/lib/scientific/contracts";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";

export const composeVgbFigureProvenance = (input: {
  entry: ProjectVisualGraphEntry;
  datasetId: string;
  datasetLabel?: string;
  sourceId?: string;
  sourceRevision?: number;
  worksheetModified?: boolean;
}): ScientificProvenanceDescriptor =>
  composeScientificProvenance({
    dataset: {
      id: input.datasetId,
      label: input.datasetLabel,
    },
    source: {
      kind: "worksheet",
      id: input.sourceId ?? input.datasetId,
      label: input.datasetLabel,
    },
    series: [
      input.entry.graphSpec.xVariable
        ? { id: input.entry.graphSpec.xVariable, role: "predictor" as const }
        : null,
      input.entry.graphSpec.yVariable
        ? { id: input.entry.graphSpec.yVariable, role: "response" as const }
        : null,
      input.entry.graphSpec.groupVariable
        ? { id: input.entry.graphSpec.groupVariable, role: "group" as const }
        : null,
    ].filter((series): series is { id: string; role: "predictor" | "response" | "group" } =>
      series !== null
    ),
    config: {
      id: `vgb-figure-${input.entry.id}`,
      values: {
        graphType: input.entry.graphSpec.graphType,
        errorBars: input.entry.graphSpec.errorBars,
        bins: input.entry.graphSpec.bins,
        pcaStandardize: input.entry.graphSpec.pcaStandardize ?? null,
        sourceRevision: input.sourceRevision ?? 0,
        worksheetModified: input.worksheetModified ?? false,
      },
    },
    method: {
      id:
        input.entry.graphSpec.graphType === "pca"
          ? "vgb.pca"
          : "vgb.preview-values",
      label:
        input.entry.graphSpec.graphType === "pca"
          ? "PCA del Constructor Visual"
          : "Valores de figura del Constructor Visual",
      version: "1",
      parameters: {
        graphType: input.entry.graphSpec.graphType,
        errorBars: input.entry.graphSpec.errorBars,
      },
    },
    approximation: {
      kind: "mixed",
      details:
        "La figura consume valores de vista VGB existentes; no recalcula estimadores científicos.",
    },
    warnings: input.worksheetModified
      ? [
          {
            code: "WORKSHEET_MODIFIED_AT_CAPTURE",
            message:
              "La hoja de trabajo estaba modificada al capturar la figura.",
            severity: "warning",
          },
        ]
      : [],
  });
