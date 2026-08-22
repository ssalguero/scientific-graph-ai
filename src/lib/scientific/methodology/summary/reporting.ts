import { getAssumptionTrackerClassificationLabel } from "@/lib/scientific/methodology/assumptions";
import { getConsistencyEngineClassificationLabel } from "@/lib/scientific/methodology/consistency";
import { getEvidenceStrengthEngineClassificationLabel } from "@/lib/scientific/methodology/evidence";
import { getPublicationReadinessAnalyzerClassificationLabel } from "@/lib/scientific/methodology/readiness";
import { getReportQualityEngineClassificationLabel } from "@/lib/scientific/methodology/report-quality";
import { getReproducibilityExplorerClassificationLabel } from "@/lib/scientific/methodology/reproducibility";
import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { MethodologicalDashboardAnalysis } from "./types";
import {
  COMPOSITE_METHODOLOGY_PRIMARY_LABELS,
  getCompositeMethodologyDisclosureReportLines,
} from "../disclosure";

export const getMethodologicalDashboardReportLines = (
  analysis: MethodologicalDashboardAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      `No hay datos suficientes para generar ${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-56"]}.`,
    ];
  }

  const lines = [
    `Salud metodológica compuesta: ${analysis.overallHealthScore.toFixed(1)}.`,
    `Indicadores compuestos evaluados: ${analysis.evaluatedEngines}.`,
    ...getCompositeMethodologyDisclosureReportLines(analysis.disclosure),
  ];
  const { summaryCards } = analysis;

  if (summaryCards.consistencyScore !== undefined) {
    lines.push(
      `Consistency: ${summaryCards.consistencyScore.toFixed(1)} — ${
        summaryCards.consistencyClassification
          ? getConsistencyEngineClassificationLabel(
              summaryCards.consistencyClassification
            )
          : "N/A"
      }.`
    );
  }

  if (summaryCards.qualityScore !== undefined) {
    lines.push(
      `Quality: ${summaryCards.qualityScore.toFixed(1)} — ${
        summaryCards.qualityClassification
          ? getReportQualityEngineClassificationLabel(
              summaryCards.qualityClassification
            )
          : "N/A"
      }.`
    );
  }

  if (summaryCards.reproducibilityScore !== undefined) {
    lines.push(
      `Potencial reproducible: ${summaryCards.reproducibilityScore.toFixed(1)} — ${
        summaryCards.reproducibilityClassification
          ? getReproducibilityExplorerClassificationLabel(
              summaryCards.reproducibilityClassification
            )
          : "N/A"
      }.`
    );
  }

  if (summaryCards.evidenceScore !== undefined) {
    lines.push(
      `Soporte compuesto: ${summaryCards.evidenceScore.toFixed(1)} — ${
        summaryCards.evidenceClassification
          ? getEvidenceStrengthEngineClassificationLabel(
              summaryCards.evidenceClassification
            )
          : "N/A"
      }.`
    );
  }

  if (summaryCards.assumptionScore !== undefined) {
    lines.push(
      `Assumptions: ${summaryCards.assumptionScore.toFixed(1)} — ${
        summaryCards.assumptionClassification
          ? getAssumptionTrackerClassificationLabel(
              summaryCards.assumptionClassification
            )
          : "N/A"
      }.`
    );
  }

  if (summaryCards.readinessScore !== undefined) {
    lines.push(
      `Preparación para revisión: ${summaryCards.readinessScore.toFixed(1)} — ${
        summaryCards.readinessClassification
          ? getPublicationReadinessAnalyzerClassificationLabel(
              summaryCards.readinessClassification
            )
          : "N/A"
      }.`
    );
  }

  if (analysis.diagnosis.length > 0) {
    lines.push("Diagnóstico global:");
    analysis.diagnosis.forEach((line) => lines.push(line));
  }

  return deduplicateTextLines(lines);
};
