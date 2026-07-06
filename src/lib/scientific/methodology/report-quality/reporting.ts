import { deduplicateTextLines } from "@/lib/scientific/shared";

import { getReportQualityEngineClassificationLabel } from "./labels";
import type { ReportQualityEngineAnalysis } from "./types";

export const getReportQualityEngineReportLines = (
  analysis: ReportQualityEngineAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Report Quality Engine."];
  }

  const lines = [
    `Quality Score: ${analysis.qualityScore.toFixed(1)}.`,
    `Clasificación: ${getReportQualityEngineClassificationLabel(analysis.classification)}.`,
    `Criterios evaluados: ${analysis.evaluatedCriteria}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
