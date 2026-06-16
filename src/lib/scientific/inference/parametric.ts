import type { ExperimentalSeries } from "@/lib/experimentalData";
import { getSampleMeanAndStdDev } from "@/lib/scientific/shared/stats";
import { getSeriesYValues } from "@/lib/scientific/shared/series";
import {
  ANOVA_ALPHA,
  T_TEST_ALPHA,
  TUKEY_HSD_Q_CRITICAL,
} from "./constants";
import {
  approximateTwoTailedTPValue,
  approximateUpperTailFPValue,
} from "./distribution";
import type {
  AnovaAnalysis,
  PostHocComparison,
  TTestResult,
} from "./types";

export const calculateIndependentTTest = (
  seriesA: ExperimentalSeries,
  seriesB: ExperimentalSeries
): TTestResult | null => {
  const statsA = getSampleMeanAndStdDev(getSeriesYValues(seriesA));
  const statsB = getSampleMeanAndStdDev(getSeriesYValues(seriesB));

  if (!statsA || !statsB || statsA.count < 2 || statsB.count < 2) {
    return null;
  }

  const sampleSizeA = statsA.count;
  const sampleSizeB = statsB.count;
  const degreesOfFreedom = sampleSizeA + sampleSizeB - 2;

  if (degreesOfFreedom <= 0) return null;

  const varianceA = statsA.stdDev ** 2;
  const varianceB = statsB.stdDev ** 2;
  const pooledVariance =
    ((sampleSizeA - 1) * varianceA + (sampleSizeB - 1) * varianceB) /
    degreesOfFreedom;

  if (pooledVariance === 0) return null;

  const tStatistic =
    (statsA.mean - statsB.mean) /
    Math.sqrt(pooledVariance * (1 / sampleSizeA + 1 / sampleSizeB));
  const pValue = approximateTwoTailedTPValue(tStatistic, degreesOfFreedom);

  if (!Number.isFinite(pValue)) return null;

  return {
    seriesA: seriesA.name,
    seriesB: seriesB.name,
    sampleSizeA,
    sampleSizeB,
    meanA: statsA.mean,
    meanB: statsB.mean,
    standardDeviationA: statsA.stdDev,
    standardDeviationB: statsB.stdDev,
    tStatistic,
    degreesOfFreedom,
    pValue,
    significant: pValue < T_TEST_ALPHA,
  };
};

export const calculateOneWayAnova = (
  series: ExperimentalSeries[]
): AnovaAnalysis | null => {
  const groups = series
    .map((item) => {
      const values = getSeriesYValues(item);
      const stats = getSampleMeanAndStdDev(values);
      if (!stats || stats.count === 0) return null;

      return {
        seriesId: item.id,
        seriesName: item.name,
        values,
        sampleSize: stats.count,
        mean: stats.mean,
        standardDeviation: stats.stdDev,
      };
    })
    .filter((group): group is NonNullable<typeof group> => group !== null);

  const groupCount = groups.length;
  if (groupCount < 3) return null;

  const totalSampleSize = groups.reduce(
    (sum, group) => sum + group.sampleSize,
    0
  );
  const betweenGroupsDF = groupCount - 1;
  const withinGroupsDF = totalSampleSize - groupCount;
  const totalDF = totalSampleSize - 1;

  if (withinGroupsDF <= 0) return null;

  const allValues = groups.flatMap((group) => group.values);
  const grandMean =
    allValues.reduce((sum, value) => sum + value, 0) / totalSampleSize;
  const betweenGroupsSS = groups.reduce(
    (sum, group) =>
      sum + group.sampleSize * (group.mean - grandMean) ** 2,
    0
  );
  const withinGroupsSS = groups.reduce(
    (sum, group) =>
      sum +
      group.values.reduce(
        (innerSum, value) => innerSum + (value - group.mean) ** 2,
        0
      ),
    0
  );
  const totalSS = allValues.reduce(
    (sum, value) => sum + (value - grandMean) ** 2,
    0
  );

  if (withinGroupsSS === 0) return null;

  const meanSquareBetween = betweenGroupsSS / betweenGroupsDF;
  const meanSquareWithin = withinGroupsSS / withinGroupsDF;
  const fStatistic = meanSquareBetween / meanSquareWithin;
  const pValue = approximateUpperTailFPValue(
    fStatistic,
    betweenGroupsDF,
    withinGroupsDF
  );

  if (!Number.isFinite(pValue)) return null;

  return {
    result: {
      groupCount,
      totalSampleSize,
      betweenGroupsSS,
      withinGroupsSS,
      totalSS,
      betweenGroupsDF,
      withinGroupsDF,
      totalDF,
      meanSquareBetween,
      meanSquareWithin,
      fStatistic,
      pValue,
      significant: pValue < ANOVA_ALPHA,
    },
    groups: groups.map(
      ({ seriesId, seriesName, sampleSize, mean, standardDeviation }) => ({
        seriesId,
        seriesName,
        sampleSize,
        mean,
        standardDeviation,
      })
    ),
  };
};

export const calculateTukeyComparisons = (
  analysis: AnovaAnalysis
): PostHocComparison[] => {
  const meanSquareWithin = analysis.result.meanSquareWithin;
  if (meanSquareWithin <= 0) return [];

  const comparisons: PostHocComparison[] = [];

  for (let indexA = 0; indexA < analysis.groups.length; indexA += 1) {
    for (let indexB = indexA + 1; indexB < analysis.groups.length; indexB += 1) {
      const groupA = analysis.groups[indexA];
      const groupB = analysis.groups[indexB];
      const meanDifference = groupA.mean - groupB.mean;
      const standardError = Math.sqrt(
        (meanSquareWithin / 2) *
          (1 / groupA.sampleSize + 1 / groupB.sampleSize)
      );

      if (standardError === 0) continue;

      const qStatistic = Math.abs(meanDifference) / standardError;

      comparisons.push({
        seriesA: groupA.seriesName,
        seriesB: groupB.seriesName,
        meanDifference,
        standardError,
        qStatistic,
        significant: qStatistic > TUKEY_HSD_Q_CRITICAL,
      });
    }
  }

  return comparisons;
};
