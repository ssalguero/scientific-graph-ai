import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { PublicationReadinessAnalyzerAnalysis } from "./types";
import { getPublicationReadinessAnalyzerClassificationLabel } from "./labels";
import {
  COMPOSITE_METHODOLOGY_PRIMARY_LABELS,
  getCompositeMethodologyDisclosureReportLines,
} from "../disclosure";

export const getPublicationReadinessAnalyzerReportLines = (
  analysis: PublicationReadinessAnalyzerAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      `No hay datos suficientes para generar ${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-55"]}.`,
    ];
  }

  const lines = [
    `Puntuación compuesta de preparación para revisión: ${analysis.readinessScore.toFixed(1)}.`,
    `Clasificación: ${getPublicationReadinessAnalyzerClassificationLabel(analysis.classification)}.`,
    `Áreas evaluadas: ${analysis.evaluatedAreas}.`,
    ...getCompositeMethodologyDisclosureReportLines(analysis.disclosure),
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
