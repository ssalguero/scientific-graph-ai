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
};
