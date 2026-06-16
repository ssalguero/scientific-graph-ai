import type { InferentialNormalityInput } from "./input-types";
import type { AnovaResult, EffectMagnitude, PostHocComparison, TTestResult } from "./types";

export const getTTestBadge = (result: TTestResult) =>
  result.significant
    ? "🟢 Diferencia significativa"
    : "⚪ Sin diferencia significativa";

export const getTTestInterpretation = (result: TTestResult) =>
  result.significant
    ? "Diferencia estadísticamente significativa entre las medias."
    : "No se detectó diferencia significativa.";

export const getAnovaBadge = (result: AnovaResult) =>
  result.significant
    ? "🟢 Diferencias significativas detectadas"
    : "⚪ No se detectaron diferencias significativas";

export const getAnovaInterpretation = (result: AnovaResult) =>
  result.significant
    ? "Al menos una media difiere significativamente del resto."
    : "No se detectan diferencias estadísticamente significativas entre las medias.";

export const getPostHocComparisonResultLabel = (significant: boolean) =>
  significant
    ? "🟢 Diferencia significativa"
    : "⚪ No significativa";

export const buildPostHocSummary = (comparisons: PostHocComparison[]): string => {
  const significantPairs = comparisons.filter((comparison) => comparison.significant);

  if (significantPairs.length === 0) {
    return "No se detectaron diferencias significativas entre pares.";
  }

  const pairDescriptions = significantPairs.map(
    (comparison) => `${comparison.seriesA} y ${comparison.seriesB}`
  );

  if (pairDescriptions.length === 1) {
    return `Las diferencias significativas se detectaron entre ${pairDescriptions[0]}.`;
  }

  const lastPair = pairDescriptions.pop();
  return `Las diferencias significativas se detectaron entre ${pairDescriptions.join(", ")}, y entre ${lastPair}.`;
};

export const getNonParametricBadge = (significant: boolean) =>
  significant
    ? "🟢 Diferencia significativa"
    : "⚪ Sin diferencia significativa";

export const getNonParametricRecommendation = (
  analyses: InferentialNormalityInput[],
  seriesNames: string[]
): string => {
  const relevant = analyses.filter((item) =>
    seriesNames.includes(item.seriesName)
  );
  const allClearlyNormal =
    relevant.length > 0 &&
    relevant.every((item) => item.classification === "normal");

  if (allClearlyNormal) {
    return "Considere también pruebas paramétricas para comparación.";
  }

  return "Esta prueba es apropiada para datos que no cumplen supuestos de normalidad.";
};

export const getEffectMagnitudeLabel = (magnitude: EffectMagnitude) => {
  if (magnitude === "large") return "grande";
  if (magnitude === "medium") return "mediano";
  if (magnitude === "small") return "pequeño";
  return "trivial";
};
