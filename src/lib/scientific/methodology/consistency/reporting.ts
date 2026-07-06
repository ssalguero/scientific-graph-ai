import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { ConsistencyEngineAnalysis } from "./types";
import { getConsistencyEngineClassificationLabel } from "./labels";

export const getConsistencyEngineReportLines = (
  analysis: ConsistencyEngineAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Consistency Engine."];
  }

  const lines = [
    `Consistency Score: ${analysis.consistencyScore.toFixed(1)}.`,
    `Clasificación: ${getConsistencyEngineClassificationLabel(analysis.classification)}.`,
    `Evidencias: ${analysis.evidenceCount}.`,
    `Módulos de apoyo: ${
      analysis.supportingModules.length > 0
        ? analysis.supportingModules.join(", ")
        : "Ninguno."
    }.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
