import { deduplicateTextLines } from "@/lib/scientific/shared";

import { getReportQualityEngineClassificationLabel } from "./labels";
import type { ReportQualityEngineAnalysis } from "./types";
import {
  COMPOSITE_METHODOLOGY_PRIMARY_LABELS,
  getCompositeMethodologyDisclosureReportLines,
} from "../disclosure";

export const getReportQualityEngineReportLines = (
  analysis: ReportQualityEngineAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      `No hay datos suficientes para generar ${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-51"]}.`,
    ];
  }

  const lines = [
    `Puntuación compuesta de calidad metodológica: ${analysis.qualityScore.toFixed(1)}.`,
    `Clasificación: ${getReportQualityEngineClassificationLabel(analysis.classification)}.`,
    `Criterios evaluados: ${analysis.evaluatedCriteria}.`,
    ...getCompositeMethodologyDisclosureReportLines(analysis.disclosure),
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
