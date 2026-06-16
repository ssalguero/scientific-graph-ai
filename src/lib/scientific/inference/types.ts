export type TTestResult = {
  seriesA: string;
  seriesB: string;
  sampleSizeA: number;
  sampleSizeB: number;
  meanA: number;
  meanB: number;
  standardDeviationA: number;
  standardDeviationB: number;
  tStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  significant: boolean;
};

export type AnovaResult = {
  groupCount: number;
  totalSampleSize: number;
  betweenGroupsSS: number;
  withinGroupsSS: number;
  totalSS: number;
  betweenGroupsDF: number;
  withinGroupsDF: number;
  totalDF: number;
  meanSquareBetween: number;
  meanSquareWithin: number;
  fStatistic: number;
  pValue: number;
  significant: boolean;
};

export type AnovaGroupSummary = {
  seriesId: string;
  seriesName: string;
  sampleSize: number;
  mean: number;
  standardDeviation: number;
};

export type AnovaAnalysis = {
  result: AnovaResult;
  groups: AnovaGroupSummary[];
};

export type PostHocComparison = {
  seriesA: string;
  seriesB: string;
  meanDifference: number;
  standardError: number;
  qStatistic: number;
  significant: boolean;
};

export type NonParametricMode = "mann-whitney" | "kruskal-wallis";

export type MannWhitneyResult = {
  seriesA: string;
  seriesB: string;
  sampleSizeA: number;
  sampleSizeB: number;
  uStatistic: number;
  zScore: number;
  pValue: number;
  significant: boolean;
};

export type KruskalWallisResult = {
  groupCount: number;
  totalSampleSize: number;
  hStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  significant: boolean;
};

export type EffectMagnitude = "trivial" | "small" | "medium" | "large";

export type EffectSizeEntry = {
  source: string;
  comparison: string;
  metric: string;
  value: number;
  valueDisplay: string;
  ciLower?: number;
  ciUpper?: number;
  ciDisplay?: string;
  magnitude: EffectMagnitude;
  magnitudeLabel: string;
};

export type EffectSizePowerAnalysis = {
  entries: EffectSizeEntry[];
  dominantMagnitude: EffectMagnitude;
  dominantEntry: EffectSizeEntry | null;
  prospectiveSampleSize: number | null;
  currentSampleSize: number | null;
  observedPower: number | null;
  powerDisclaimer: string;
  insufficientSampleWarning: string | null;
  interpretation: string[];
};

export type PooledRankEntry = {
  value: number;
  group: number;
  rank: number;
};
