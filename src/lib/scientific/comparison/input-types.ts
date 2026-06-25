export type ComparisonDatasetInfo = {
  fileName: string;
  importedAt: string;
  seriesCount: number;
  observationCount: number;
};

export type PublicationReadinessClassification =
  | "publication-ready"
  | "near-ready"
  | "requires-review"
  | "not-ready";

export type EvidenceStrengthClassification =
  | "very-strong"
  | "strong"
  | "moderate"
  | "limited";

export type CanBuildDatasetAnalysisProfileInput = {
  datasetInfo: ComparisonDatasetInfo | null;
  hasPublicationReadinessAnalyzer: boolean;
  hasMethodologicalDashboard: boolean;
  hasEvidenceStrengthEngine: boolean;
  normalityAssessmentCount: number;
};

export type MethodologicalSummaryCardsInput = {
  consistencyScore?: number;
  qualityScore?: number;
  reproducibilityScore?: number;
  evidenceScore?: number;
  assumptionScore?: number;
  readinessScore?: number;
};

export type MultivariateHighlightsInput = {
  pcaVariance?: number;
  clusterCount?: number;
  topVariable?: string;
  topVariableTied?: string[];
  averageSimilarity?: number;
  headline?: string;
};

export type PublicationSnapshotInput = {
  crossDomainDiagnosis?: string[];
  publicationRisks?: string[];
  prospectiveSampleSize?: number | null;
  currentSampleSize?: number | null;
  insufficientSampleWarning?: string | null;
};

export type BuildCaptureMetadataInput = {
  sourceDatasetChecksum?: string | null;
  worksheetModifiedAtCapture?: boolean;
  hasMethodologicalDashboard: boolean;
  hasPublicationReadiness: boolean;
  hasEvidenceEngine: boolean;
  hasMultivariateDashboard: boolean;
  hasEffectSizePower: boolean;
  normalityAssessmentCount: number;
};

export type BuildDatasetAnalysisProfileInput = {
  slotLabel: import("./types").ComparisonSlotId;
  datasetInfo: ComparisonDatasetInfo;
  seriesCount: number;
  totalObservations: number;
  readinessScore?: number;
  readinessClassification?: PublicationReadinessClassification;
  overallHealthScore?: number;
  evidenceScore?: number;
  evidenceClassification?: EvidenceStrengthClassification;
  publicationStatus?: PublicationReadinessClassification;
  publicationScore?: number;
  normality?: import("./types").DatasetAnalysisProfileNormalitySnapshot;
  inferential?: import("./types").DatasetAnalysisProfileInferentialSnapshot;
  multivariateHeadline?: string;
  methodological?: import("./types").DatasetAnalysisProfileMethodologicalSnapshot;
  multivariate?: import("./types").DatasetAnalysisProfileMultivariateSnapshot;
  publication?: import("./types").DatasetAnalysisProfilePublicationSnapshot;
  captureMetadata?: import("./types").DatasetAnalysisProfileCaptureMetadata;
};
