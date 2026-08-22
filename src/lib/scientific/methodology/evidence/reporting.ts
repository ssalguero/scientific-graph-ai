import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { EvidenceStrengthEngineAnalysis } from "./types";
import { getEvidenceStrengthEngineClassificationLabel } from "./labels";
import {
  COMPOSITE_METHODOLOGY_PRIMARY_LABELS,
  getCompositeMethodologyDisclosureReportLines,
} from "../disclosure";

export const getEvidenceStrengthEngineReportLines = (
  analysis: EvidenceStrengthEngineAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      `No hay datos suficientes para generar ${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-53"]}.`,
    ];
  }

  const lines = [
    `Puntuación compuesta de soporte evidenciario: ${analysis.evidenceScore.toFixed(1)}.`,
    `Clasificación: ${getEvidenceStrengthEngineClassificationLabel(analysis.classification)}.`,
    `Fuentes evaluadas: ${analysis.evidenceSources}.`,
    ...getCompositeMethodologyDisclosureReportLines(analysis.disclosure),
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
