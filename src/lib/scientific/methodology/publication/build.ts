import type { EffectSizePowerAnalysis } from "@/lib/scientific/inference";
import type { CanonicalNormalityAssessment } from "@/lib/scientific/normality";
import { formatPublicationAdvisorRecommendation } from "@/lib/scientific/normality";
import type { EvidenceStrengthEngineAnalysis } from "@/lib/scientific/methodology/evidence";
import type { MethodologicalDashboardAnalysis } from "@/lib/scientific/methodology/summary";
import type { PublicationReadinessAnalyzerAnalysis } from "@/lib/scientific/methodology/readiness";
import {
  deduplicateTextLines,
  pushUniqueTextLine,
} from "@/lib/scientific/shared/text";

import type {
  PublicationDashboardBuildInput,
  PublicationDashboardCanBuildInput,
  PublicationDashboardMultivariateSource,
} from "./input-types";
import type {
  PublicationDashboardAnalysis,
  PublicationDashboardInferentialHighlight,
  PublicationDashboardMultivariateHighlights,
  PublicationDashboardNormalitySummary,
} from "./types";
import { buildCompositeMethodologyDisclosure } from "../disclosure";

const formatVariableImportanceCoLeaders = (variables: string[]) =>
  variables.join(" / ");

export const canBuildPublicationDashboard = (
  input: PublicationDashboardCanBuildInput
) =>
  input.publicationReadinessAnalyzerAnalysis !== null ||
  input.methodologicalDashboardAnalysis !== null ||
  input.multivariateDashboardAnalysis !== null ||
  input.effectSizePowerAnalysis !== null ||
  input.canonicalNormalityAssessment.seriesAssessments.length > 0;

export const buildPublicationDashboardNormalitySummary = (
  assessment: CanonicalNormalityAssessment
): PublicationDashboardNormalitySummary | null => {
  if (assessment.seriesAssessments.length === 0) {
    return null;
  }

  let normalCount = 0;
  let nonNormalCount = 0;
  let questionableCount = 0;
  let contradictoryCount = 0;

  assessment.seriesAssessments.forEach((seriesAssessment) => {
    if (
      seriesAssessment.conclusion === "normal" ||
      seriesAssessment.conclusion === "probably-normal"
    ) {
      normalCount += 1;
      return;
    }
    if (seriesAssessment.conclusion === "non-normal") {
      nonNormalCount += 1;
      return;
    }
    if (seriesAssessment.conclusion === "questionable") {
      questionableCount += 1;
      return;
    }
    if (seriesAssessment.conclusion === "contradictory") {
      contradictoryCount += 1;
    }
  });

  return {
    seriesEvaluated: assessment.seriesAssessments.length,
    normalCount,
    nonNormalCount,
    questionableCount,
    contradictoryCount,
    globalHeadline:
      assessment.globalConclusion[0] ??
      "Evaluación integrada de normalidad disponible.",
    hasWarnings: assessment.warnings.length > 0,
  };
};

export const buildPublicationDashboardMultivariateHighlights = (
  analysis: PublicationDashboardMultivariateSource | null
): PublicationDashboardMultivariateHighlights | null => {
  if (!analysis) {
    return null;
  }

  const { summaryCards, diagnosis } = analysis;
  return {
    pcaVariance: summaryCards.pcaVariance,
    clusterCount: summaryCards.clusterCount,
    topVariable: summaryCards.topVariable,
    topVariableTied: summaryCards.topVariableTied,
    averageSimilarity: summaryCards.averageSimilarity,
    headline: diagnosis[0],
  };
};

export const buildPublicationDashboardInferentialHighlight = (
  analysis: EffectSizePowerAnalysis | null
): PublicationDashboardInferentialHighlight | null => {
  if (!analysis) {
    return null;
  }

  return {
    dominantMagnitude: analysis.dominantMagnitude,
    metric: analysis.dominantEntry?.metric,
    valueDisplay: analysis.dominantEntry?.valueDisplay,
    source: analysis.dominantEntry?.source,
    prospectiveSampleSize: analysis.prospectiveSampleSize ?? undefined,
    currentSampleSize: analysis.currentSampleSize ?? undefined,
    insufficientSampleWarning: analysis.insufficientSampleWarning,
  };
};

const buildPublicationDashboardCrossDomainDiagnosis = (input: {
  publicationStatus: PublicationReadinessAnalyzerAnalysis["classification"];
  publicationScore: number;
  methodologicalHealthScore?: number;
  evidenceClassification?: EvidenceStrengthEngineAnalysis["classification"];
  inferentialHighlight?: PublicationDashboardInferentialHighlight;
  multivariateHighlights?: PublicationDashboardMultivariateHighlights;
}): string[] => {
  const diagnosis: string[] = [];
  const dominantMagnitude = input.inferentialHighlight?.dominantMagnitude;

  if (input.publicationStatus === "publication-ready") {
    pushUniqueTextLine(
      diagnosis,
      "Las señales compuestas muestran preparación alta para revisión científica humana."
    );
  }

  if (input.publicationStatus === "near-ready") {
    pushUniqueTextLine(
      diagnosis,
      "Las señales compuestas se aproximan a preparación alta; conviene revisar los riesgos listados."
    );
  }

  if (
    input.evidenceClassification === "strong" &&
    dominantMagnitude === "large"
  ) {
    pushUniqueTextLine(
      diagnosis,
      "El indicador compuesto de soporte es alto y el efecto dominante tiene magnitud elevada."
    );
  }

  if (
    input.evidenceClassification === "strong" &&
    dominantMagnitude === "trivial"
  ) {
    pushUniqueTextLine(
      diagnosis,
      "Los indicadores metodológicos convergen, pero la magnitud inferencial dominante es limitada."
    );
  }

  if (
    input.methodologicalHealthScore !== undefined &&
    input.methodologicalHealthScore >= 85 &&
    input.multivariateHighlights?.pcaVariance !== undefined &&
    input.multivariateHighlights.pcaVariance >= 80
  ) {
    pushUniqueTextLine(
      diagnosis,
      "La estructura multivariante y la evaluación metodológica global están alineadas favorablemente."
    );
  }

  if (input.publicationScore >= 70 && dominantMagnitude === "large") {
    pushUniqueTextLine(
      diagnosis,
      "La magnitud del efecto observado es relevante para la revisión de resultados."
    );
  }

  if (
    input.publicationStatus === "requires-review" ||
    input.publicationStatus === "not-ready"
  ) {
    pushUniqueTextLine(
      diagnosis,
      "Se recomienda revisión metodológica adicional antes de redactar el manuscrito."
    );
  }

  return deduplicateTextLines(diagnosis);
};

const buildPublicationDashboardRisks = (input: {
  inferentialHighlight?: PublicationDashboardInferentialHighlight;
  normalitySummary?: PublicationDashboardNormalitySummary;
  methodologicalDashboardAnalysis: MethodologicalDashboardAnalysis | null;
  publicationScore: number;
  evidenceScore?: number;
  recommendedTest?: string;
}): string[] => {
  const risks: string[] = [];

  if (input.inferentialHighlight?.insufficientSampleWarning) {
    pushUniqueTextLine(
      risks,
      "Potencia estadística limitada: el tamaño muestral actual está por debajo del recomendado."
    );
  }

  const assumptionScore =
    input.methodologicalDashboardAnalysis?.summaryCards.assumptionScore;
  if (assumptionScore !== undefined && assumptionScore < 70) {
    pushUniqueTextLine(
      risks,
      "Algunos supuestos estadísticos requieren revisión antes de interpretar los resultados."
    );
  }

  if (
    input.normalitySummary &&
    (input.normalitySummary.nonNormalCount > 0 ||
      input.normalitySummary.contradictoryCount > 0)
  ) {
    pushUniqueTextLine(
      risks,
      "El perfil de normalidad no es uniforme; conviene validar la coherencia con la prueba inferencial reportada."
    );
  }

  const parametricRecommendedTest =
    input.recommendedTest === "t-Test" || input.recommendedTest === "ANOVA";
  if (
    parametricRecommendedTest &&
    input.normalitySummary &&
    (input.normalitySummary.nonNormalCount > 0 ||
      input.normalitySummary.contradictoryCount > 0)
  ) {
    pushUniqueTextLine(
      risks,
      "Posible desalineación entre la prueba inferencial recomendada y la evaluación de normalidad."
    );
  }

  if (
    input.evidenceScore !== undefined &&
    input.evidenceScore >= 70 &&
    input.publicationScore < 70
  ) {
    pushUniqueTextLine(
      risks,
      "El soporte compuesto supera la preparación global para revisión; revisar supuestos y reproducibilidad potencial."
    );
  }

  const reproducibilityScore =
    input.methodologicalDashboardAnalysis?.summaryCards.reproducibilityScore;
  if (reproducibilityScore !== undefined && reproducibilityScore < 70) {
    pushUniqueTextLine(
      risks,
      "La reproducibilidad potencial del análisis es limitada."
    );
  }

  return deduplicateTextLines(risks);
};

const buildPublicationDashboardRecommendations = (input: {
  publicationRisks: string[];
  inferentialHighlight?: PublicationDashboardInferentialHighlight;
  multivariateHighlights?: PublicationDashboardMultivariateHighlights;
  publicationStatus: PublicationReadinessAnalyzerAnalysis["classification"];
  recommendedTest?: string;
}): string[] => {
  const recommendations: string[] = [];

  if (input.publicationRisks.length > 0) {
    pushUniqueTextLine(
      recommendations,
      "Abordar los riesgos metodológicos identificados antes de la redacción final."
    );
  }

  if (
    input.inferentialHighlight?.dominantMagnitude === "large" &&
    !input.inferentialHighlight.insufficientSampleWarning
  ) {
    pushUniqueTextLine(
      recommendations,
      "Reportar la magnitud del efecto junto con la prueba inferencial en la sección de Resultados."
    );
  }

  if (input.inferentialHighlight?.insufficientSampleWarning) {
    pushUniqueTextLine(
      recommendations,
      "Considerar ampliación muestral o reportar explícitamente la limitación de potencia en la Discusión."
    );
  }

  if (
    input.multivariateHighlights?.topVariableTied &&
    input.multivariateHighlights.topVariableTied.length > 1
  ) {
    pushUniqueTextLine(
      recommendations,
      `Mencionar el co-liderazgo de ${formatVariableImportanceCoLeaders(
        input.multivariateHighlights.topVariableTied
      )} al describir la estructura informativa.`
    );
  }

  if (input.publicationStatus === "near-ready") {
    pushUniqueTextLine(
      recommendations,
      "Realizar una revisión final de supuestos y reproducibilidad potencial antes de cualquier envío."
    );
  }

  if (input.recommendedTest) {
    pushUniqueTextLine(
      recommendations,
      formatPublicationAdvisorRecommendation(input.recommendedTest)
    );
  }

  return deduplicateTextLines(recommendations);
};

export const buildPublicationDashboardAnalysis = (
  input: PublicationDashboardBuildInput
): PublicationDashboardAnalysis | null => {
  if (!canBuildPublicationDashboard(input)) {
    return null;
  }

  const publicationStatus =
    input.publicationReadinessAnalyzerAnalysis?.classification ?? "not-ready";
  const publicationScore =
    input.publicationReadinessAnalyzerAnalysis?.readinessScore ?? 50;
  const methodologicalHealthScore =
    input.methodologicalDashboardAnalysis?.overallHealthScore;
  const evidenceScore = input.evidenceStrengthEngineAnalysis?.evidenceScore;
  const evidenceClassification =
    input.evidenceStrengthEngineAnalysis?.classification;
  const normalitySummary = buildPublicationDashboardNormalitySummary(
    input.canonicalNormalityAssessment
  );
  const multivariateHighlights = buildPublicationDashboardMultivariateHighlights(
    input.multivariateDashboardAnalysis
  );
  const inferentialHighlight = buildPublicationDashboardInferentialHighlight(
    input.effectSizePowerAnalysis
  );
  const recommendedTest = input.statisticalRecommendation?.recommendedTest;
  const advisorConfidence = input.statisticalRecommendation?.confidence;

  let evaluatedDomains = 0;
  if (input.publicationReadinessAnalyzerAnalysis) evaluatedDomains += 1;
  if (input.methodologicalDashboardAnalysis) evaluatedDomains += 1;
  if (input.multivariateDashboardAnalysis) evaluatedDomains += 1;
  if (input.evidenceStrengthEngineAnalysis) evaluatedDomains += 1;
  if (input.effectSizePowerAnalysis) evaluatedDomains += 1;
  if (normalitySummary) evaluatedDomains += 1;

  const publicationRisks = buildPublicationDashboardRisks({
    inferentialHighlight: inferentialHighlight ?? undefined,
    normalitySummary: normalitySummary ?? undefined,
    methodologicalDashboardAnalysis: input.methodologicalDashboardAnalysis,
    publicationScore,
    evidenceScore,
    recommendedTest,
  });
  const crossDomainDiagnosis = buildPublicationDashboardCrossDomainDiagnosis({
    publicationStatus,
    publicationScore,
    methodologicalHealthScore,
    evidenceClassification,
    inferentialHighlight: inferentialHighlight ?? undefined,
    multivariateHighlights: multivariateHighlights ?? undefined,
  });
  const publicationRecommendations = buildPublicationDashboardRecommendations({
    publicationRisks,
    inferentialHighlight: inferentialHighlight ?? undefined,
    multivariateHighlights: multivariateHighlights ?? undefined,
    publicationStatus,
    recommendedTest,
  });

  return {
    publicationStatus,
    publicationScore,
    methodologicalHealthScore,
    evidenceScore,
    evidenceClassification,
    normalitySummary: normalitySummary ?? undefined,
    multivariateHighlights: multivariateHighlights ?? undefined,
    inferentialHighlight: inferentialHighlight ?? undefined,
    recommendedTest,
    advisorConfidence,
    crossDomainDiagnosis,
    publicationRisks,
    publicationRecommendations,
    evaluatedDomains,
    disclosure: buildCompositeMethodologyDisclosure([
      {
        id: "publication-readiness",
        label: "Composite publication-readiness score",
        role: "score",
        status: input.publicationReadinessAnalyzerAnalysis
          ? "evaluated"
          : "defaulted",
        provenance: input.publicationReadinessAnalyzerAnalysis
          ? "upstream-composite-output"
          : "neutral-fallback",
        fallback: input.publicationReadinessAnalyzerAnalysis
          ? undefined
          : 'score 50 and status "not-ready"',
      },
      {
        id: "methodological-health",
        label: "Composite methodological-health score",
        role: "interpretation",
        status: input.methodologicalDashboardAnalysis
          ? "evaluated"
          : "not-evaluated",
        provenance: "upstream-composite-output",
      },
      {
        id: "multivariate-summary",
        label: "Multivariate summary",
        role: "interpretation",
        status: input.multivariateDashboardAnalysis
          ? "evaluated"
          : "not-evaluated",
        provenance: "direct-input-summary",
      },
      {
        id: "evidence-strength",
        label: "Composite evidence-strength score",
        role: "interpretation",
        status: input.evidenceStrengthEngineAnalysis
          ? "evaluated"
          : "not-evaluated",
        provenance: "upstream-composite-output",
      },
      {
        id: "effect-size-power",
        label: "Effect-size and power summary",
        role: "interpretation",
        status: input.effectSizePowerAnalysis ? "evaluated" : "not-evaluated",
        provenance: "direct-input-summary",
      },
      {
        id: "normality",
        label: "Canonical normality summary",
        role: "interpretation",
        status: normalitySummary ? "evaluated" : "not-evaluated",
        provenance: "direct-input-summary",
      },
      {
        id: "statistical-recommendation",
        label: "Statistical recommendation",
        role: "display",
        status: input.statisticalRecommendation
          ? "evaluated"
          : "not-evaluated",
        provenance: "direct-input-summary",
      },
    ]),
  };
};
