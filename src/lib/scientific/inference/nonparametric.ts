import type { ExperimentalSeries } from "@/lib/experimentalData";
import { getSeriesYValues } from "@/lib/scientific/shared/series";
import { NON_PARAMETRIC_ALPHA } from "./constants";
import {
  approximateTwoTailedNormalPValue,
  approximateUpperTailChiSquarePValue,
} from "./distribution";
import type {
  KruskalWallisResult,
  MannWhitneyResult,
  PooledRankEntry,
} from "./types";

const assignPooledRanks = (
  entries: { value: number; group: number }[]
): PooledRankEntry[] => {
  const ranked = entries.map((entry) => ({ ...entry, rank: 0 }));
  ranked.sort((left, right) => left.value - right.value);

  let start = 0;
  while (start < ranked.length) {
    let end = start;
    while (
      end + 1 < ranked.length &&
      ranked[end + 1].value === ranked[start].value
    ) {
      end += 1;
    }

    const averageRank = (start + end + 2) / 2;
    for (let index = start; index <= end; index += 1) {
      ranked[index].rank = averageRank;
    }
    start = end + 1;
  }

  return ranked;
};

export const calculateMannWhitney = (
  seriesA: ExperimentalSeries,
  seriesB: ExperimentalSeries
): MannWhitneyResult | null => {
  const valuesA = getSeriesYValues(seriesA);
  const valuesB = getSeriesYValues(seriesB);
  const sampleSizeA = valuesA.length;
  const sampleSizeB = valuesB.length;

  if (sampleSizeA === 0 || sampleSizeB === 0) return null;

  const ranked = assignPooledRanks([
    ...valuesA.map((value) => ({ value, group: 0 })),
    ...valuesB.map((value) => ({ value, group: 1 })),
  ]);

  const rankSumA = ranked
    .filter((entry) => entry.group === 0)
    .reduce((sum, entry) => sum + entry.rank, 0);
  const u1 =
    sampleSizeA * sampleSizeB +
    (sampleSizeA * (sampleSizeA + 1)) / 2 -
    rankSumA;
  const u2 = sampleSizeA * sampleSizeB - u1;
  const uStatistic = Math.min(u1, u2);

  const meanU = (sampleSizeA * sampleSizeB) / 2;
  const standardErrorU = Math.sqrt(
    (sampleSizeA * sampleSizeB * (sampleSizeA + sampleSizeB + 1)) / 12
  );

  if (standardErrorU === 0) return null;

  const zScore = (uStatistic - meanU) / standardErrorU;
  const pValue = approximateTwoTailedNormalPValue(zScore);

  if (!Number.isFinite(pValue)) return null;

  return {
    seriesA: seriesA.name,
    seriesB: seriesB.name,
    sampleSizeA,
    sampleSizeB,
    uStatistic,
    zScore,
    pValue,
    significant: pValue < NON_PARAMETRIC_ALPHA,
  };
};

export const calculateKruskalWallis = (
  series: ExperimentalSeries[]
): KruskalWallisResult | null => {
  const groups = series
    .map((item, groupIndex) => ({
      values: getSeriesYValues(item),
      groupIndex,
    }))
    .filter((group) => group.values.length > 0);

  const groupCount = groups.length;
  if (groupCount < 3) return null;

  const ranked = assignPooledRanks(
    groups.flatMap((group) =>
      group.values.map((value) => ({ value, group: group.groupIndex }))
    )
  );
  const totalSampleSize = ranked.length;
  const rankSums = new Array<number>(groupCount).fill(0);
  const groupSizes = new Array<number>(groupCount).fill(0);

  ranked.forEach((entry) => {
    rankSums[entry.group] += entry.rank;
    groupSizes[entry.group] += 1;
  });

  let hStatistic = 0;
  for (let index = 0; index < groupCount; index += 1) {
    if (groupSizes[index] === 0) return null;
    hStatistic += (rankSums[index] ** 2) / groupSizes[index];
  }

  hStatistic =
    (12 / (totalSampleSize * (totalSampleSize + 1))) * hStatistic -
    3 * (totalSampleSize + 1);

  const degreesOfFreedom = groupCount - 1;
  const pValue = approximateUpperTailChiSquarePValue(
    hStatistic,
    degreesOfFreedom
  );

  if (!Number.isFinite(pValue)) return null;

  return {
    groupCount,
    totalSampleSize,
    hStatistic,
    degreesOfFreedom,
    pValue,
    significant: pValue < NON_PARAMETRIC_ALPHA,
  };
};
