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
