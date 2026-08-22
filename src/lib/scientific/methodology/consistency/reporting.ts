import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { ConsistencyEngineAnalysis } from "./types";
import { getConsistencyEngineClassificationLabel } from "./labels";
import {
  COMPOSITE_METHODOLOGY_PRIMARY_LABELS,
  getCompositeMethodologyDisclosureReportLines,
} from "../disclosure";

export const getConsistencyEngineReportLines = (
  analysis: ConsistencyEngineAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      `No hay datos suficientes para generar ${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"]}.`,
    ];
  }

  const lines = [
    `Puntuación compuesta de consistencia: ${analysis.consistencyScore.toFixed(1)}.`,
    `Clasificación: ${getConsistencyEngineClassificationLabel(analysis.classification)}.`,
    `Evidencias: ${analysis.evidenceCount}.`,
    `Módulos de apoyo: ${
      analysis.supportingModules.length > 0
        ? analysis.supportingModules.join(", ")
        : "Ninguno."
    }.`,
    ...getCompositeMethodologyDisclosureReportLines(analysis.disclosure),
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
