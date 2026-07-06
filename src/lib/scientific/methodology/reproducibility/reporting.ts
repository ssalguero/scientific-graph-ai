import { deduplicateTextLines } from "@/lib/scientific/shared";

import { getReproducibilityExplorerClassificationLabel } from "./labels";
import type { ReproducibilityExplorerAnalysis } from "./types";

export const getReproducibilityExplorerReportLines = (
  analysis: ReproducibilityExplorerAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Reproducibility Explorer."];
  }

  const lines = [
    `Reproducibility Score: ${analysis.reproducibilityScore.toFixed(1)}.`,
    `Clasificación: ${getReproducibilityExplorerClassificationLabel(analysis.classification)}.`,
    `Factores evaluados: ${analysis.evaluatedFactors}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
