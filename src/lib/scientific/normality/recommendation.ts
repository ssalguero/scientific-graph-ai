import { isCanonicalConclusionSupportiveOfNormality } from "./decision";
import type { CanonicalNormalityConclusion } from "./types";

export type StatisticalRecommendedTest =
  | "Pearson"
  | "Spearman"
  | "t-Test"
  | "Mann-Whitney U"
  | "ANOVA"
  | "Kruskal-Wallis";

export type StatisticalRecommendationScope =
  | "correlation"
  | "group-inference";

export type StatisticalAdvisorConfidence = "high" | "medium" | "low";

export type ResolvedStatisticalRecommendation = {
  recommendedTest: StatisticalRecommendedTest;
  scope: StatisticalRecommendationScope;
  reasoning: string;
};

export const isCorrelationRecommendedTest = (
  test: StatisticalRecommendedTest | string
) => test === "Pearson" || test === "Spearman";

export const resolveStatisticalAdvisorConfidence = (
  totalSampleSize: number
): StatisticalAdvisorConfidence =>
  totalSampleSize >= 30 ? "high" : totalSampleSize >= 15 ? "medium" : "low";

export const resolveSeriesAnalysisRecommendationCopy = (
  conclusion: CanonicalNormalityConclusion | null | undefined
): string => {
  if (!conclusion) {
    return "No hay evaluación integrada de normalidad suficiente para recomendar análisis paramétricos.";
  }

  if (!isCanonicalConclusionSupportiveOfNormality(conclusion)) {
    return "Se recomiendan pruebas no paramétricas.";
  }

  if (conclusion === "normal") {
    return "Los datos son compatibles con análisis paramétricos.";
  }

  return "Los datos podrían utilizar análisis paramétricos con precaución.";
};

export const formatAdvisorRecommendedTestAsPrimary = (
  test: StatisticalRecommendedTest | string
): string => {
  if (isCorrelationRecommendedTest(test)) {
    return `Recomendación de correlación: ${test}.`;
  }
  return `El Advisor Estadístico recomienda utilizar ${test} como análisis principal de inferencia de grupos.`;
};

export const formatAdvisorRecommendedTestLine = (
  test: StatisticalRecommendedTest | string,
  confidenceLabel: string
): string => {
  if (isCorrelationRecommendedTest(test)) {
    return `Recomendación de correlación (Advisor): ${test} (confianza ${confidenceLabel}).`;
  }
  return `Prueba recomendada por el Advisor (inferencia de grupos): ${test} (confianza ${confidenceLabel}).`;
};

export const formatPublicationAdvisorRecommendation = (
  test: string
): string => {
  if (isCorrelationRecommendedTest(test)) {
    return `Utilizar ${test} como recomendación de correlación, según el Advisor Estadístico.`;
  }
  return `Utilizar ${test} como análisis principal de inferencia de grupos, según el Advisor Estadístico.`;
};

export const resolveStatisticalRecommendedTest = (input: {
  groupCount: number;
  correlationRequested: boolean;
  canonicalNormalityPassed: boolean;
}): ResolvedStatisticalRecommendation | null => {
  const { groupCount, correlationRequested, canonicalNormalityPassed } = input;

  if (correlationRequested && groupCount >= 2) {
    return canonicalNormalityPassed
      ? {
          recommendedTest: "Pearson",
          scope: "correlation",
          reasoning:
            "Recomendación de correlación: Pearson, porque se solicitó correlación y la evaluación integrada de normalidad es compatible con ese supuesto. No sustituye la recomendación de inferencia de grupos ni las métricas de efecto.",
        }
      : {
          recommendedTest: "Spearman",
          scope: "correlation",
          reasoning:
            "Recomendación de correlación: Spearman, porque se solicitó correlación y la evaluación integrada de normalidad no respalda el supuesto paramétrico. Pearson no aplica como análisis general.",
        };
  }

  if (groupCount === 2) {
    return canonicalNormalityPassed
      ? {
          recommendedTest: "t-Test",
          scope: "group-inference",
          reasoning:
            "Se recomienda t-Test porque existen dos grupos visibles y la evaluación integrada de normalidad es compatible con ese supuesto.",
        }
      : {
          recommendedTest: "Mann-Whitney U",
          scope: "group-inference",
          reasoning:
            "Se recomienda Mann-Whitney porque la evaluación integrada de normalidad no respalda el supuesto paramétrico.",
        };
  }

  if (groupCount >= 3) {
    return canonicalNormalityPassed
      ? {
          recommendedTest: "ANOVA",
          scope: "group-inference",
          reasoning: `Se recomienda utilizar ANOVA porque existen ${groupCount} grupos visibles y la evaluación integrada de normalidad es compatible con ese supuesto.`,
        }
      : {
          recommendedTest: "Kruskal-Wallis",
          scope: "group-inference",
          reasoning: `Se recomienda Kruskal-Wallis porque existen ${groupCount} grupos visibles y la evaluación integrada de normalidad no respalda el supuesto paramétrico.`,
        };
  }

  return null;
};
