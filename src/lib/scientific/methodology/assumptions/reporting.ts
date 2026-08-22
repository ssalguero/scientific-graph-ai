import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { AssumptionTrackerAnalysis } from "./types";
import {
  getAssumptionTrackerClassificationLabel,
  getAssumptionTrackerStatusLabel,
} from "./labels";
import {
  COMPOSITE_METHODOLOGY_PRIMARY_LABELS,
  getCompositeMethodologyDisclosureReportLines,
} from "../disclosure";

export const getAssumptionTrackerReportLines = (
  analysis: AssumptionTrackerAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      `No hay datos suficientes para generar ${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-54"]}.`,
    ];
  }

  const lines = [
    `Puntuación compuesta de cobertura de supuestos: ${analysis.overallScore.toFixed(1)}.`,
    `Clasificación: ${getAssumptionTrackerClassificationLabel(analysis.classification)}.`,
    "Tabla de supuestos:",
    ...getCompositeMethodologyDisclosureReportLines(analysis.disclosure),
  ];

  analysis.assumptions.forEach((assumption) => {
    lines.push(
      `${assumption.name}: ${getAssumptionTrackerStatusLabel(assumption.status)} (${assumption.source}).`
    );
  });

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
