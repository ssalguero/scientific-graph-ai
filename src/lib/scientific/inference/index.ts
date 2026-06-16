export type {
  AnovaAnalysis,
  AnovaGroupSummary,
  AnovaResult,
  EffectMagnitude,
  EffectSizeEntry,
  EffectSizePowerAnalysis,
  KruskalWallisResult,
  MannWhitneyResult,
  NonParametricMode,
  PostHocComparison,
  TTestResult,
} from "./types";

export type { InferentialNormalityInput } from "./input-types";

export {
  buildEffectSizePowerAnalysis,
  canBuildEffectSizePowerAnalysis,
} from "./effect-size";

export {
  calculateIndependentTTest,
  calculateOneWayAnova,
  calculateTukeyComparisons,
} from "./parametric";

export {
  calculateKruskalWallis,
  calculateMannWhitney,
} from "./nonparametric";

export {
  buildPostHocSummary,
  getAnovaBadge,
  getAnovaInterpretation,
  getEffectMagnitudeLabel,
  getNonParametricBadge,
  getNonParametricRecommendation,
  getPostHocComparisonResultLabel,
  getTTestBadge,
  getTTestInterpretation,
} from "./labels";

export { resolveTTestSeriesSelection } from "./selection";

export { getEffectSizePowerReportLines } from "./reporting";
