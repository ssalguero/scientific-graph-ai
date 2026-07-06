import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { EvidenceStrengthEngineAnalysis } from "./types";
import { getEvidenceStrengthEngineClassificationLabel } from "./labels";

export const getEvidenceStrengthEngineReportLines = (
  analysis: EvidenceStrengthEngineAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Evidence Strength Engine."];
  }

  const lines = [
    `Evidence Score: ${analysis.evidenceScore.toFixed(1)}.`,
    `Clasificación: ${getEvidenceStrengthEngineClassificationLabel(analysis.classification)}.`,
    `Fuentes evaluadas: ${analysis.evidenceSources}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
