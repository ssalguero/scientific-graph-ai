import { getEffectMagnitudeLabel } from "@/lib/scientific/inference";
import { getEvidenceStrengthEngineClassificationLabel } from "@/lib/scientific/methodology/evidence";
import { getPublicationReadinessAnalyzerClassificationLabel } from "@/lib/scientific/methodology/readiness";
import { deduplicateTextLines } from "@/lib/scientific/shared/text";

import type { PublicationDashboardAdvisorConfidence } from "./input-types";
import type { PublicationDashboardAnalysis } from "./types";
import {
  COMPOSITE_METHODOLOGY_PRIMARY_LABELS,
  getCompositeMethodologyDisclosureReportLines,
} from "../disclosure";

const formatPCAVariancePercent = (value: number) => `${value.toFixed(1)}%`;

const formatVariableImportanceCoLeaders = (variables: string[]) =>
  variables.join(" / ");

const getStatisticalAdvisorConfidenceLabel = (
  confidence: PublicationDashboardAdvisorConfidence
) =>
  confidence === "high" ? "Alta" : confidence === "medium" ? "Media" : "Baja";

export const getPublicationDashboardReportLines = (
  analysis: PublicationDashboardAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      `No hay datos suficientes para generar ${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-60"]}.`,
    ];
  }

  const lines = [
    `Estado compuesto para revisión: ${getPublicationReadinessAnalyzerClassificationLabel(
      analysis.publicationStatus
    )}.`,
    `Puntuación compuesta de preparación: ${analysis.publicationScore.toFixed(1)}.`,
    `Dominios evaluados: ${analysis.evaluatedDomains}.`,
    ...getCompositeMethodologyDisclosureReportLines(analysis.disclosure),
  ];

  if (analysis.methodologicalHealthScore !== undefined) {
    lines.push(
      `Overall Health (referencia SCI-56): ${analysis.methodologicalHealthScore.toFixed(1)}.`
    );
  }

  if (
    analysis.evidenceScore !== undefined &&
    analysis.evidenceClassification
  ) {
    lines.push(
      `Evidence (referencia SCI-53): ${analysis.evidenceScore.toFixed(1)} — ${getEvidenceStrengthEngineClassificationLabel(
        analysis.evidenceClassification
      )}.`
    );
  }

  if (
    analysis.inferentialHighlight?.metric &&
    analysis.inferentialHighlight.valueDisplay
  ) {
    lines.push(
      `Efecto dominante: ${getEffectMagnitudeLabel(
        analysis.inferentialHighlight.dominantMagnitude ?? "trivial"
      )} (${analysis.inferentialHighlight.metric} = ${analysis.inferentialHighlight.valueDisplay}, ${analysis.inferentialHighlight.source ?? "inferencia"}).`
    );
  }

  if (analysis.normalitySummary) {
    lines.push(
      `Normalidad integrada: ${analysis.normalitySummary.globalHeadline}`
    );
    lines.push(
      `Series evaluadas: ${analysis.normalitySummary.seriesEvaluated}; normales=${analysis.normalitySummary.normalCount}, no normales=${analysis.normalitySummary.nonNormalCount}, cuestionables=${analysis.normalitySummary.questionableCount}, contradictorias=${analysis.normalitySummary.contradictoryCount}.`
    );
  }

  if (analysis.multivariateHighlights?.pcaVariance !== undefined) {
    lines.push(
      `PCA (referencia SCI-40): ${formatPCAVariancePercent(
        analysis.multivariateHighlights.pcaVariance
      )} varianza acumulada.`
    );
  }

  if (analysis.multivariateHighlights?.clusterCount !== undefined) {
    lines.push(
      `Clustering (referencia SCI-40): ${analysis.multivariateHighlights.clusterCount} grupos.`
    );
  }

  if (analysis.multivariateHighlights?.topVariable) {
    lines.push(
      `Variable líder (referencia SCI-40): ${
        analysis.multivariateHighlights.topVariableTied &&
        analysis.multivariateHighlights.topVariableTied.length > 1
          ? formatVariableImportanceCoLeaders(
              analysis.multivariateHighlights.topVariableTied
            )
          : analysis.multivariateHighlights.topVariable
      }.`
    );
  }

  if (
    analysis.inferentialHighlight?.prospectiveSampleSize !== null &&
    analysis.inferentialHighlight?.prospectiveSampleSize !== undefined &&
    analysis.inferentialHighlight.currentSampleSize !== null &&
    analysis.inferentialHighlight.currentSampleSize !== undefined
  ) {
    lines.push(
      `Potencia prospectiva: n recomendado = ${analysis.inferentialHighlight.prospectiveSampleSize}; n actual = ${analysis.inferentialHighlight.currentSampleSize}.`
    );
  }

  if (analysis.recommendedTest) {
    lines.push(
      `Prueba recomendada (Advisor): ${analysis.recommendedTest}${
        analysis.advisorConfidence
          ? ` (confianza ${getStatisticalAdvisorConfidenceLabel(
              analysis.advisorConfidence
            )})`
          : ""
      }.`
    );
  }

  if (analysis.crossDomainDiagnosis.length > 0) {
    lines.push("Diagnóstico compuesto:");
    analysis.crossDomainDiagnosis.forEach((line) => lines.push(line));
  }

  if (analysis.publicationRisks.length > 0) {
    lines.push("Riesgos para revisión:");
    analysis.publicationRisks.forEach((line) => lines.push(line));
  }

  if (analysis.publicationRecommendations.length > 0) {
    lines.push("Sugerencias para revisión:");
    analysis.publicationRecommendations.forEach((line) => lines.push(line));
  }

  return deduplicateTextLines(lines);
};
