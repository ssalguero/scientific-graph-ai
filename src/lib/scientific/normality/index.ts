export type {
  CanonicalNormalityConclusion,
  CanonicalNormalityAssessment,
  NormalityClassification,
  NormalityConfidence,
  NormalityConsensus,
} from "./types";

export type {
  CanonicalNormalityKernelInput,
  CanonicalNormalityNormalityInput,
  CanonicalNormalityQQInput,
  CanonicalNormalityViolinInput,
  KernelDistributionShape,
  QQPlotInterpretation,
  ViolinShapeInterpretation,
} from "./input-types";

export { buildCanonicalNormalityAssessment } from "./build";
export { getCanonicalNormalityScore } from "./scoring";

export {
  getNormalityClassificationLabel,
  getNormalityConfidenceLabel,
  getNormalityConsensusConclusionLabel,
  getNormalityConsensusEmoji,
} from "./labels";

export {
  appendCanonicalNormalityFindings,
  getCanonicalNormalityFindingLine,
  getCanonicalNormalityReportLines,
  getCanonicalNormalitySeriesFooterText,
} from "./reporting";
