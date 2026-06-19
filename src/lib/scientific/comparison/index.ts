export type {
  ComparisonDatasetInfo,
  EvidenceStrengthClassification,
  PublicationReadinessClassification,
  BuildDatasetAnalysisProfileInput,
  CanBuildDatasetAnalysisProfileInput,
} from "./input-types";

export type {
  ComparisonDeltaDirection,
  ComparisonKpiRow,
  ComparisonSlot,
  ComparisonSlotId,
  DatasetAnalysisProfile,
  DatasetAnalysisProfileInferentialSnapshot,
  DatasetAnalysisProfileNormalitySnapshot,
  MultiDatasetComparisonAnalysis,
} from "./types";

export {
  COMPARISON_DELTA_STABLE_THRESHOLD,
  COMPARISON_SLOT_LABELS,
} from "./constants";

export {
  buildDatasetAnalysisProfile,
  canBuildDatasetAnalysisProfile,
  createEmptyComparisonSlots,
  mapInferentialToProfileSnapshot,
  mapNormalitySummaryToProfileSnapshot,
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
  formatProfilePublicationStatusValue,
  formatProfileReadinessValue,
  getComparisonDeltaDirectionLabel,
} from "./format";

export {
  getEvidenceStrengthClassificationLabel,
  getPublicationReadinessClassificationLabel,
} from "./labels";
