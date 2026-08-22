import { deduplicateTextLines } from "@/lib/scientific/shared";

import { getReproducibilityExplorerClassificationLabel } from "./labels";
import type { ReproducibilityExplorerAnalysis } from "./types";
import {
  COMPOSITE_METHODOLOGY_PRIMARY_LABELS,
  getCompositeMethodologyDisclosureReportLines,
} from "../disclosure";

export const getReproducibilityExplorerReportLines = (
  analysis: ReproducibilityExplorerAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      `No hay datos suficientes para generar ${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-52"]}.`,
    ];
  }

  const lines = [
    `Puntuación compuesta de reproducibilidad potencial: ${analysis.reproducibilityScore.toFixed(1)}.`,
    `Clasificación: ${getReproducibilityExplorerClassificationLabel(analysis.classification)}.`,
    `Factores evaluados: ${analysis.evaluatedFactors}.`,
    ...getCompositeMethodologyDisclosureReportLines(analysis.disclosure),
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
