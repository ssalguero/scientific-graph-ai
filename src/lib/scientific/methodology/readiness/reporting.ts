import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { PublicationReadinessAnalyzerAnalysis } from "./types";
import { getPublicationReadinessAnalyzerClassificationLabel } from "./labels";

export const getPublicationReadinessAnalyzerReportLines = (
  analysis: PublicationReadinessAnalyzerAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      "No hay datos suficientes para generar Publication Readiness Analyzer.",
    ];
  }

  const lines = [
    `Readiness Score: ${analysis.readinessScore.toFixed(1)}.`,
    `Clasificación: ${getPublicationReadinessAnalyzerClassificationLabel(analysis.classification)}.`,
    `Áreas evaluadas: ${analysis.evaluatedAreas}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
