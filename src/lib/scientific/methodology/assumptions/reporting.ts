import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { AssumptionTrackerAnalysis } from "./types";
import {
  getAssumptionTrackerClassificationLabel,
  getAssumptionTrackerStatusLabel,
} from "./labels";

export const getAssumptionTrackerReportLines = (
  analysis: AssumptionTrackerAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Assumption Tracker."];
  }

  const lines = [
    `Assumption Score: ${analysis.overallScore.toFixed(1)}.`,
    `Clasificación: ${getAssumptionTrackerClassificationLabel(analysis.classification)}.`,
    "Tabla de supuestos:",
  ];

  analysis.assumptions.forEach((assumption) => {
    lines.push(
      `${assumption.name}: ${getAssumptionTrackerStatusLabel(assumption.status)} (${assumption.source}).`
    );
  });

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};
