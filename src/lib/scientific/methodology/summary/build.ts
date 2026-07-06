import { deduplicateTextLines } from "@/lib/scientific/shared";

import type { MethodologicalDashboardBuildInput } from "./input-types";
import type { MethodologicalDashboardAnalysis } from "./types";

export const canBuildMethodologicalDashboard = (
  input: MethodologicalDashboardBuildInput
) =>
  input.consistencyEngineAnalysis !== null ||
  input.reportQualityEngineAnalysis !== null ||
  input.reproducibilityExplorerAnalysis !== null ||
  input.evidenceStrengthEngineAnalysis !== null ||
  input.assumptionTrackerAnalysis !== null ||
  input.publicationReadinessAnalyzerAnalysis !== null;

type MethodologicalDashboardDiagnosisInput = {
  summaryCards: MethodologicalDashboardAnalysis["summaryCards"];
  overallHealthScore: number;
};

const buildMethodologicalDashboardDiagnosis = (
  input: MethodologicalDashboardDiagnosisInput
): string[] => {
  const diagnosis: string[] = [];
  const {
    consistencyScore,
    evidenceScore,
    assumptionScore,
    reproducibilityScore,
    qualityScore,
    readinessScore,
  } = input.summaryCards;

  if (readinessScore !== undefined && readinessScore >= 85) {
    diagnosis.push(
      "El análisis presenta preparación adecuada para publicación."
    );
  }

  if (
    consistencyScore !== undefined &&
    consistencyScore >= 85 &&
    evidenceScore !== undefined &&
    evidenceScore >= 85
  ) {
    diagnosis.push(
      "Los distintos enfoques metodológicos convergen hacia conclusiones compatibles."
    );
  }

  if (assumptionScore !== undefined && assumptionScore < 70) {
    diagnosis.push(
      "Algunos supuestos estadísticos requieren revisión antes de interpretar los resultados."
    );
  }

  if (reproducibilityScore !== undefined && reproducibilityScore < 70) {
    diagnosis.push(
      "La reproducibilidad potencial del análisis es limitada."
    );
  }

  if (
    qualityScore !== undefined &&
    qualityScore >= 85 &&
    assumptionScore !== undefined &&
    assumptionScore < 70
  ) {
    diagnosis.push(
      "La calidad del reporte es alta, pero los supuestos estadísticos conviene validarlos."
    );
  }

  if (input.overallHealthScore < 70 && diagnosis.length === 0) {
    diagnosis.push(
      "La evaluación metodológica global sugiere revisar el diseño y los supuestos del análisis."
    );
  }

  return deduplicateTextLines(diagnosis);
};

export const buildMethodologicalDashboardAnalysis = (
  input: MethodologicalDashboardBuildInput
): MethodologicalDashboardAnalysis | null => {
  if (!canBuildMethodologicalDashboard(input)) {
    return null;
  }

  const summaryCards: MethodologicalDashboardAnalysis["summaryCards"] = {};
  const scores: number[] = [];

  if (input.consistencyEngineAnalysis) {
    summaryCards.consistencyScore =
      input.consistencyEngineAnalysis.consistencyScore;
    summaryCards.consistencyClassification =
      input.consistencyEngineAnalysis.classification;
    scores.push(input.consistencyEngineAnalysis.consistencyScore);
  }

  if (input.reportQualityEngineAnalysis) {
    summaryCards.qualityScore = input.reportQualityEngineAnalysis.qualityScore;
    summaryCards.qualityClassification =
      input.reportQualityEngineAnalysis.classification;
    scores.push(input.reportQualityEngineAnalysis.qualityScore);
  }

  if (input.reproducibilityExplorerAnalysis) {
    summaryCards.reproducibilityScore =
      input.reproducibilityExplorerAnalysis.reproducibilityScore;
    summaryCards.reproducibilityClassification =
      input.reproducibilityExplorerAnalysis.classification;
    scores.push(input.reproducibilityExplorerAnalysis.reproducibilityScore);
  }

  if (input.evidenceStrengthEngineAnalysis) {
    summaryCards.evidenceScore =
      input.evidenceStrengthEngineAnalysis.evidenceScore;
    summaryCards.evidenceClassification =
      input.evidenceStrengthEngineAnalysis.classification;
    scores.push(input.evidenceStrengthEngineAnalysis.evidenceScore);
  }

  if (input.assumptionTrackerAnalysis) {
    summaryCards.assumptionScore = input.assumptionTrackerAnalysis.overallScore;
    summaryCards.assumptionClassification =
      input.assumptionTrackerAnalysis.classification;
    scores.push(input.assumptionTrackerAnalysis.overallScore);
  }

  if (input.publicationReadinessAnalyzerAnalysis) {
    summaryCards.readinessScore =
      input.publicationReadinessAnalyzerAnalysis.readinessScore;
    summaryCards.readinessClassification =
      input.publicationReadinessAnalyzerAnalysis.classification;
    scores.push(input.publicationReadinessAnalyzerAnalysis.readinessScore);
  }

  const overallHealthScore =
    scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;
  const diagnosis = buildMethodologicalDashboardDiagnosis({
    summaryCards,
    overallHealthScore,
  });

  return {
    summaryCards,
    overallHealthScore,
    evaluatedEngines: scores.length,
    diagnosis,
  };
};
