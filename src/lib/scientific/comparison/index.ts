export type {
  BuildCaptureMetadataInput,
  BuildDatasetAnalysisProfileInput,
  CanBuildDatasetAnalysisProfileInput,
  ComparisonDatasetInfo,
  EvidenceStrengthClassification,
  MethodologicalSummaryCardsInput,
  MultivariateHighlightsInput,
  PublicationReadinessClassification,
  PublicationSnapshotInput,
} from "./input-types";

export type {
  ComparisonDeltaDirection,
  ComparisonCompatibilityAssessment,
  ComparisonCompatibilityState,
  ComparisonKpiRow,
  ComparisonSlot,
  ComparisonSlotId,
  DatasetAnalysisProfile,
  DatasetAnalysisProfileCaptureEngineFlags,
  DatasetAnalysisProfileCaptureMetadata,
  DatasetAnalysisProfileInferentialSnapshot,
  DatasetAnalysisProfileMethodologicalSnapshot,
  DatasetAnalysisProfileMultivariateSnapshot,
  DatasetAnalysisProfileNormalitySnapshot,
  DatasetAnalysisProfilePayload,
  DatasetAnalysisProfilePublicationSnapshot,
  MultiDatasetComparisonAnalysis,
} from "./types";

export {
  COMPARISON_DELTA_STABLE_THRESHOLD,
  COMPARISON_SLOT_LABELS,
} from "./constants";

export {
  buildCaptureMetadata,
  buildDatasetAnalysisProfile,
  canBuildDatasetAnalysisProfile,
  createEmptyComparisonSlots,
  mapInferentialToProfileSnapshot,
  mapMethodologicalToProfileSnapshot,
  mapMultivariateToProfileSnapshot,
  mapNormalitySummaryToProfileSnapshot,
  mapPublicationToProfileSnapshot,
} from "./profile";

export {
  buildComparisonKpiRow,
  buildMultiDatasetComparisonAnalysis,
  canBuildMultiDatasetComparisonAnalysis,
  computeComparisonDeltaDirection,
} from "./analysis";

export {
  buildComparabilityWarnings,
  buildCrossDatasetComparisonDiagnosis,
  buildCrossDatasetComparisonRecommendations,
} from "./interpretation";

export {
  formatComparisonNumericDelta,
  formatDatasetAnalysisProfileMiniSummary,
  formatProfileEffectValue,
  formatProfileEvidenceValue,
  formatProfileMethodologicalCard,
  formatProfileMethodologicalScore,
  formatProfileMultivariateValue,
  formatProfileProspectiveSampleSize,
  formatProfilePublicationStatusValue,
  formatProfileReadinessValue,
  getComparisonDeltaDirectionLabel,
} from "./format";

export {
  getEvidenceStrengthClassificationLabel,
  getPublicationReadinessClassificationLabel,
} from "./labels";

export type {
  MultiDatasetComparisonProjectionContext,
  MultiDatasetComparisonReportSection,
} from "./report";

export {
  MULTI_DATASET_COMPARISON_REPORT_TITLE,
  buildMultiDatasetComparisonPdfReportSection,
  buildMultiDatasetComparisonReportSection,
  canIncludeMultiDatasetComparisonInReport,
  getMultiDatasetComparisonPdfLines,
  getMultiDatasetComparisonReportLines,
  replaceMultiDatasetComparisonWithPdfProjection,
} from "./report";

export {
  attachCitableSnapshotToDatasetAnalysisProfile,
  buildDatasetAnalysisProfileSemanticValues,
  getAuthoritativeDatasetAnalysisProfile,
  invalidateDatasetAnalysisProfileSource,
  reviveDatasetAnalysisProfile,
} from "./snapshot";

export {
  buildScientificProjectionDisclosureLines,
  findProjectedSemanticValue,
  projectDatasetAnalysisProfile,
  readProjectedNumber,
  readProjectedString,
} from "./projection";

export {
  assessComparisonCompatibility,
  deriveComparisonSlotFreshness,
} from "./freshness";
export type {
  ComparisonSlotFreshness,
} from "./freshness";
