import type { NormalityConsensus } from "@/lib/scientific/normality";
import {
  deduplicateTextLines,
  pushUniqueTextLine,
} from "@/lib/scientific/shared/text";
import {
  EFFECT_MAGNITUDE_ORDER,
  EFFECT_SIZE_ALPHA,
  EFFECT_SIZE_D_THRESHOLDS,
  EFFECT_SIZE_DELTA_THRESHOLDS,
  EFFECT_SIZE_ETA_THRESHOLDS,
  EFFECT_SIZE_POWER_DISCLAIMER,
  EFFECT_SIZE_R_THRESHOLDS,
  EFFECT_SIZE_TARGET_POWER,
  EFFECT_SIZE_Z_ALPHA_TWO_TAILED,
  EFFECT_SIZE_Z_TARGET_POWER,
  T_CRITICAL_95_TABLE,
  TUKEY_HSD_Q_CRITICAL,
} from "./constants";
import { approximateStandardNormalCdf } from "./distribution";
import { getEffectMagnitudeLabel } from "./labels";
import type {
  AnovaAnalysis,
  AnovaResult,
  EffectMagnitude,
  EffectSizeEntry,
  EffectSizePowerAnalysis,
  KruskalWallisResult,
  MannWhitneyResult,
  PostHocComparison,
  TTestResult,
} from "./types";

const classifyEffectMagnitude = (
  value: number,
  thresholds: [number, number, number]
): EffectMagnitude => {
  const magnitude = Math.abs(value);
  if (magnitude >= thresholds[2]) return "large";
  if (magnitude >= thresholds[1]) return "medium";
  if (magnitude >= thresholds[0]) return "small";
  return "trivial";
};

const interpolateCriticalTFromTable = (degreesOfFreedom: number): number => {
  if (degreesOfFreedom <= 0) return Number.NaN;
  if (degreesOfFreedom <= T_CRITICAL_95_TABLE[0][0]) {
    return T_CRITICAL_95_TABLE[0][1];
  }

  for (let index = 1; index < T_CRITICAL_95_TABLE.length; index += 1) {
    const [upperDf, upperT] = T_CRITICAL_95_TABLE[index];
    const [lowerDf, lowerT] = T_CRITICAL_95_TABLE[index - 1];
    if (degreesOfFreedom <= upperDf) {
      if (!Number.isFinite(upperDf)) return upperT;
      const weight = (degreesOfFreedom - lowerDf) / (upperDf - lowerDf);
      return lowerT + weight * (upperT - lowerT);
    }
  }

  return T_CRITICAL_95_TABLE[T_CRITICAL_95_TABLE.length - 1][1];
};

const computeCriticalTValue = (
  alpha: number,
  degreesOfFreedom: number
): number => {
  if (degreesOfFreedom <= 0 || alpha <= 0 || alpha >= 1) return Number.NaN;
  if (Math.abs(alpha - EFFECT_SIZE_ALPHA) > 1e-12) return Number.NaN;

  return interpolateCriticalTFromTable(degreesOfFreedom);
};

const computeCohensD = (result: TTestResult): number => {
  const pooledVariance =
    ((result.sampleSizeA - 1) * result.standardDeviationA ** 2 +
      (result.sampleSizeB - 1) * result.standardDeviationB ** 2) /
    result.degreesOfFreedom;
  if (pooledVariance <= 0) return 0;
  return (result.meanA - result.meanB) / Math.sqrt(pooledVariance);
};

const computeHedgesG = (cohensD: number, degreesOfFreedom: number): number =>
  degreesOfFreedom > 1
    ? cohensD * (1 - 3 / (4 * degreesOfFreedom - 1))
    : cohensD;

const computeCohensDCI = (
  cohensD: number,
  sampleSizeA: number,
  sampleSizeB: number
): { lower: number; upper: number } => {
  const variance =
    (sampleSizeA + sampleSizeB) / (sampleSizeA * sampleSizeB) +
    (cohensD * cohensD) / (2 * (sampleSizeA + sampleSizeB));
  const margin = EFFECT_SIZE_Z_ALPHA_TWO_TAILED * Math.sqrt(variance);
  return { lower: cohensD - margin, upper: cohensD + margin };
};

const computeMeanDifferenceCI = (
  result: TTestResult
): { lower: number; upper: number } | null => {
  const pooledVariance =
    ((result.sampleSizeA - 1) * result.standardDeviationA ** 2 +
      (result.sampleSizeB - 1) * result.standardDeviationB ** 2) /
    result.degreesOfFreedom;
  if (pooledVariance <= 0) return null;

  const standardError = Math.sqrt(
    pooledVariance * (1 / result.sampleSizeA + 1 / result.sampleSizeB)
  );
  const criticalT = computeCriticalTValue(
    EFFECT_SIZE_ALPHA,
    result.degreesOfFreedom
  );
  if (!Number.isFinite(criticalT)) return null;

  const difference = result.meanA - result.meanB;
  return {
    lower: difference - criticalT * standardError,
    upper: difference + criticalT * standardError,
  };
};

const computeAnovaEtaSquared = (result: AnovaResult): number =>
  result.totalSS > 0 ? result.betweenGroupsSS / result.totalSS : 0;

const computeAnovaOmegaSquared = (result: AnovaResult): number => {
  const denominator = result.totalSS + result.meanSquareWithin;
  if (denominator <= 0) return 0;
  return Math.max(
    0,
    (result.betweenGroupsSS -
      result.betweenGroupsDF * result.meanSquareWithin) /
      denominator
  );
};

const computeTukeyPairCI = (
  comparison: PostHocComparison
): { lower: number; upper: number } => ({
  lower:
    comparison.meanDifference -
    TUKEY_HSD_Q_CRITICAL * comparison.standardError,
  upper:
    comparison.meanDifference +
    TUKEY_HSD_Q_CRITICAL * comparison.standardError,
});

const computeMannWhitneyREffectSize = (result: MannWhitneyResult): number => {
  const totalSampleSize = result.sampleSizeA + result.sampleSizeB;
  if (totalSampleSize <= 0) return 0;
  return Math.abs(result.zScore) / Math.sqrt(totalSampleSize);
};

// El U reportado es min(U1, U2), por lo que solo la magnitud de delta es
// recuperable (la dirección requiere conocer a qué grupo corresponde U).
const computeCliffsDeltaMagnitude = (result: MannWhitneyResult): number => {
  const pairProduct = result.sampleSizeA * result.sampleSizeB;
  if (pairProduct <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - (2 * result.uStatistic) / pairProduct));
};

const computeKruskalWallisEpsilonSquared = (
  result: KruskalWallisResult
): number => {
  const totalSampleSize = result.totalSampleSize;
  if (totalSampleSize <= 1) return 0;
  return Math.min(
    1,
    result.hStatistic /
      ((totalSampleSize * totalSampleSize - 1) / (totalSampleSize + 1))
  );
};

const computeProspectiveSampleSizePerGroup = (
  standardizedEffect: number
): number | null => {
  const magnitude = Math.abs(standardizedEffect);
  if (magnitude <= 0) return null;
  return Math.ceil(
    2 *
      ((EFFECT_SIZE_Z_ALPHA_TWO_TAILED + EFFECT_SIZE_Z_TARGET_POWER) /
        magnitude) **
        2
  );
};

const computeObservedPowerFromStatistic = (statistic: number): number => {
  const absoluteStatistic = Math.abs(statistic);
  const power =
    1 -
    approximateStandardNormalCdf(
      EFFECT_SIZE_Z_ALPHA_TWO_TAILED - absoluteStatistic
    ) +
    approximateStandardNormalCdf(
      -EFFECT_SIZE_Z_ALPHA_TWO_TAILED - absoluteStatistic
    );
  return Math.max(0, Math.min(1, power));
};

const buildEffectSizeEntry = (input: {
  source: string;
  comparison: string;
  metric: string;
  value: number;
  precision: number;
  thresholds: [number, number, number];
  magnitudeValue?: number;
  ci?: { lower: number; upper: number } | null;
}): EffectSizeEntry => {
  const magnitude = classifyEffectMagnitude(
    input.magnitudeValue ?? input.value,
    input.thresholds
  );
  return {
    source: input.source,
    comparison: input.comparison,
    metric: input.metric,
    value: input.value,
    valueDisplay: input.value.toFixed(input.precision),
    ciLower: input.ci?.lower,
    ciUpper: input.ci?.upper,
    ciDisplay: input.ci
      ? `IC95% [${input.ci.lower.toFixed(input.precision)}, ${input.ci.upper.toFixed(input.precision)}]`
      : undefined,
    magnitude,
    magnitudeLabel: getEffectMagnitudeLabel(magnitude),
  };
};

export const canBuildEffectSizePowerAnalysis = (input: {
  tTestResult: TTestResult | null;
  anovaAnalysis: AnovaAnalysis | null;
  mannWhitneyResult: MannWhitneyResult | null;
  kruskalWallisResult: KruskalWallisResult | null;
}) =>
  input.tTestResult !== null ||
  input.anovaAnalysis !== null ||
  input.mannWhitneyResult !== null ||
  input.kruskalWallisResult !== null;

export const buildEffectSizePowerAnalysis = (input: {
  tTestResult: TTestResult | null;
  anovaAnalysis: AnovaAnalysis | null;
  postHocComparisons: PostHocComparison[];
  mannWhitneyResult: MannWhitneyResult | null;
  kruskalWallisResult: KruskalWallisResult | null;
  normalityConsensus: NormalityConsensus[];
}): EffectSizePowerAnalysis | null => {
  if (!canBuildEffectSizePowerAnalysis(input)) return null;

  const entries: EffectSizeEntry[] = [];

  if (input.tTestResult) {
    const comparison = `${input.tTestResult.seriesA} vs ${input.tTestResult.seriesB}`;
    const cohensD = computeCohensD(input.tTestResult);
    const hedgesG = computeHedgesG(
      cohensD,
      input.tTestResult.degreesOfFreedom
    );

    entries.push(
      buildEffectSizeEntry({
        source: "t-Test",
        comparison,
        metric: "Cohen's d",
        value: cohensD,
        precision: 2,
        thresholds: EFFECT_SIZE_D_THRESHOLDS,
        ci: computeCohensDCI(
          cohensD,
          input.tTestResult.sampleSizeA,
          input.tTestResult.sampleSizeB
        ),
      })
    );
    entries.push(
      buildEffectSizeEntry({
        source: "t-Test",
        comparison,
        metric: "Hedges' g",
        value: hedgesG,
        precision: 2,
        thresholds: EFFECT_SIZE_D_THRESHOLDS,
      })
    );
    entries.push(
      buildEffectSizeEntry({
        source: "t-Test",
        comparison,
        metric: "Diferencia de medias",
        value: input.tTestResult.meanA - input.tTestResult.meanB,
        precision: 2,
        thresholds: EFFECT_SIZE_D_THRESHOLDS,
        magnitudeValue: cohensD,
        ci: computeMeanDifferenceCI(input.tTestResult),
      })
    );
  }

  if (input.anovaAnalysis) {
    const comparison = `${input.anovaAnalysis.result.groupCount} grupos`;
    entries.push(
      buildEffectSizeEntry({
        source: "ANOVA",
        comparison,
        metric: "Eta²",
        value: computeAnovaEtaSquared(input.anovaAnalysis.result),
        precision: 3,
        thresholds: EFFECT_SIZE_ETA_THRESHOLDS,
      })
    );
    entries.push(
      buildEffectSizeEntry({
        source: "ANOVA",
        comparison,
        metric: "Omega²",
        value: computeAnovaOmegaSquared(input.anovaAnalysis.result),
        precision: 3,
        thresholds: EFFECT_SIZE_ETA_THRESHOLDS,
      })
    );

    const meanSquareWithin = input.anovaAnalysis.result.meanSquareWithin;
    input.postHocComparisons.forEach((pairComparison) => {
      const standardizedPairEffect =
        meanSquareWithin > 0
          ? pairComparison.meanDifference / Math.sqrt(meanSquareWithin)
          : 0;
      entries.push(
        buildEffectSizeEntry({
          source: "Tukey",
          comparison: `${pairComparison.seriesA} ↔ ${pairComparison.seriesB}`,
          metric: "Δ medias (IC95% aprox.)",
          value: pairComparison.meanDifference,
          precision: 2,
          thresholds: EFFECT_SIZE_D_THRESHOLDS,
          magnitudeValue: standardizedPairEffect,
          ci: computeTukeyPairCI(pairComparison),
        })
      );
    });
  }

  if (input.mannWhitneyResult) {
    const comparison = `${input.mannWhitneyResult.seriesA} vs ${input.mannWhitneyResult.seriesB}`;
    entries.push(
      buildEffectSizeEntry({
        source: "Mann-Whitney",
        comparison,
        metric: "r",
        value: computeMannWhitneyREffectSize(input.mannWhitneyResult),
        precision: 2,
        thresholds: EFFECT_SIZE_R_THRESHOLDS,
      })
    );
    entries.push(
      buildEffectSizeEntry({
        source: "Mann-Whitney",
        comparison,
        metric: "Cliff's Delta (magnitud)",
        value: computeCliffsDeltaMagnitude(input.mannWhitneyResult),
        precision: 2,
        thresholds: EFFECT_SIZE_DELTA_THRESHOLDS,
      })
    );
  }

  if (input.kruskalWallisResult) {
    entries.push(
      buildEffectSizeEntry({
        source: "Kruskal-Wallis",
        comparison: `${input.kruskalWallisResult.groupCount} grupos`,
        metric: "Epsilon²",
        value: computeKruskalWallisEpsilonSquared(input.kruskalWallisResult),
        precision: 3,
        thresholds: EFFECT_SIZE_ETA_THRESHOLDS,
      })
    );
  }

  if (entries.length === 0) return null;

  const dominantEntry = entries.reduce((leader, entry) =>
    EFFECT_MAGNITUDE_ORDER.indexOf(entry.magnitude) >
    EFFECT_MAGNITUDE_ORDER.indexOf(leader.magnitude)
      ? entry
      : leader
  );
  const dominantMagnitude = dominantEntry.magnitude;

  let prospectiveSampleSize: number | null = null;
  let currentSampleSize: number | null = null;
  let observedPower: number | null = null;

  if (input.tTestResult) {
    const hedgesG = computeHedgesG(
      computeCohensD(input.tTestResult),
      input.tTestResult.degreesOfFreedom
    );
    prospectiveSampleSize = computeProspectiveSampleSizePerGroup(hedgesG);
    currentSampleSize = Math.min(
      input.tTestResult.sampleSizeA,
      input.tTestResult.sampleSizeB
    );
    observedPower = computeObservedPowerFromStatistic(
      input.tTestResult.tStatistic
    );
  } else if (input.mannWhitneyResult) {
    const rEffectSize = computeMannWhitneyREffectSize(
      input.mannWhitneyResult
    );
    const approximateD =
      rEffectSize < 1
        ? (2 * rEffectSize) / Math.sqrt(1 - rEffectSize * rEffectSize)
        : null;
    prospectiveSampleSize =
      approximateD !== null
        ? computeProspectiveSampleSizePerGroup(approximateD)
        : null;
    currentSampleSize = Math.min(
      input.mannWhitneyResult.sampleSizeA,
      input.mannWhitneyResult.sampleSizeB
    );
    observedPower = computeObservedPowerFromStatistic(
      input.mannWhitneyResult.zScore
    );
  }

  const insufficientSampleWarning =
    prospectiveSampleSize !== null &&
    currentSampleSize !== null &&
    currentSampleSize < prospectiveSampleSize
      ? `El tamaño muestral actual (n = ${currentSampleSize} por grupo) está por debajo del recomendado (n = ${prospectiveSampleSize}) para detectar el efecto observado con una potencia del ${Math.round(EFFECT_SIZE_TARGET_POWER * 100)}%.`
      : null;

  const interpretation: string[] = [];
  pushUniqueTextLine(
    interpretation,
    `El efecto dominante observado es ${getEffectMagnitudeLabel(dominantMagnitude)} (${dominantEntry.metric} = ${dominantEntry.valueDisplay}, ${dominantEntry.source}).`
  );

  if (input.tTestResult) {
    const meanDifferenceCI = computeMeanDifferenceCI(input.tTestResult);
    if (meanDifferenceCI) {
      pushUniqueTextLine(
        interpretation,
        meanDifferenceCI.lower > 0 || meanDifferenceCI.upper < 0
          ? "El intervalo de confianza de la diferencia de medias excluye el 0, lo que respalda una diferencia real entre los grupos."
          : "El intervalo de confianza de la diferencia de medias incluye el 0; la diferencia observada podría no ser real."
      );
    }
  }

  if (prospectiveSampleSize !== null && currentSampleSize !== null) {
    pushUniqueTextLine(
      interpretation,
      insufficientSampleWarning ??
        `El tamaño muestral actual (n = ${currentSampleSize} por grupo) es suficiente para detectar el efecto observado con una potencia del ${Math.round(EFFECT_SIZE_TARGET_POWER * 100)}%.`
    );
  }

  if (observedPower !== null) {
    pushUniqueTextLine(
      interpretation,
      `Potencia observada (aprox.): ${(observedPower * 100).toFixed(1)}%. ${EFFECT_SIZE_POWER_DISCLAIMER}`
    );
  }

  const prefersNonParametric =
    input.normalityConsensus.some(
      (consensus) =>
        consensus.conclusion === "non-normal" ||
        consensus.conclusion === "contradictory"
    ) &&
    (input.mannWhitneyResult !== null || input.kruskalWallisResult !== null);
  if (prefersNonParametric) {
    pushUniqueTextLine(
      interpretation,
      "Dada la evaluación de normalidad, las métricas de efecto no paramétricas (r, Cliff's Delta, Epsilon²) son las más apropiadas para este conjunto."
    );
  }

  return {
    entries,
    dominantMagnitude,
    dominantEntry,
    prospectiveSampleSize,
    currentSampleSize,
    observedPower,
    powerDisclaimer: EFFECT_SIZE_POWER_DISCLAIMER,
    insufficientSampleWarning,
    interpretation: deduplicateTextLines(interpretation),
  };
};
