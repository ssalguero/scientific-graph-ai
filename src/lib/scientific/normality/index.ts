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
export {
  buildReportFacingNormalityGlobalConclusion,
  doesCanonicalAssessmentSupportNormality,
  isCanonicalConclusionSupportiveOfNormality,
} from "./decision";
export {
  resolveStatisticalRecommendedTest,
  type StatisticalRecommendedTest,
} from "./recommendation";
export { getCanonicalNormalityScore } from "./scoring";

export {
  getNormalityClassificationLabel,
  getNormalityConfidenceLabel,
  getNormalityConsensusConclusionLabel,
  getNormalityConsensusEmoji,
} from "./labels";

export {
  appendCanonicalNormalityFindings,
  buildScientificReportNormalityContent,
  getCanonicalNormalityFindingLine,
  getCanonicalNormalityReportLines,
  getCanonicalNormalitySeriesFooterText,
  LEGACY_SCI11_REPORT_FACING_COMPATIBLE_PHRASE,
} from "./reporting";
export type { ReportFacingSci11Diagnostic } from "./reporting";
