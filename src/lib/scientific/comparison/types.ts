import type { EffectMagnitude } from "@/lib/scientific/inference";
import type {
  ComparisonDatasetInfo,
  EvidenceStrengthClassification,
  PublicationReadinessClassification,
} from "./input-types";

export type ComparisonSlotId = "A" | "B";

export type ComparisonDeltaDirection =
  | "improved"
  | "regressed"
  | "stable"
  | "n/a";

export type DatasetAnalysisProfileNormalitySnapshot = {
  seriesEvaluated: number;
  normalCount: number;
  nonNormalCount: number;
  questionableCount: number;
  contradictoryCount: number;
  globalHeadline?: string;
  hasWarnings: boolean;
};

export type DatasetAnalysisProfileInferentialSnapshot = {
  dominantMagnitude?: EffectMagnitude;
  metric?: string;
  valueDisplay?: string;
  prospectiveSampleSize?: number | null;
};

export type DatasetAnalysisProfileMethodologicalSnapshot = {
  consistencyScore?: number;
  qualityScore?: number;
  reproducibilityScore?: number;
  evidenceScore?: number;
  assumptionScore?: number;
  readinessScore?: number;
  evaluatedEngines: number;
};

export type DatasetAnalysisProfileMultivariateSnapshot = {
  pcaVariance?: number;
  clusterCount?: number;
  topVariable?: string;
  topVariableTied?: string[];
  averageSimilarity?: number;
  headline?: string;
};

export type DatasetAnalysisProfilePublicationSnapshot = {
  crossDomainDiagnosisTop?: string[];
  publicationRisksTop?: string[];
  prospectiveSampleSize?: number | null;
  currentSampleSize?: number | null;
  insufficientSampleWarning?: string | null;
};

export type DatasetAnalysisProfileCaptureEngineFlags = {
  hasMethodologicalDashboard: boolean;
  hasPublicationReadiness: boolean;
  hasEvidenceEngine: boolean;
  hasMultivariateDashboard: boolean;
  hasEffectSizePower: boolean;
  normalityAssessmentCount: number;
};

export type DatasetAnalysisProfileCaptureMetadata = {
  sourceDatasetChecksum?: string | null;
  worksheetModifiedAtCapture?: boolean;
  captureEngineFlags?: DatasetAnalysisProfileCaptureEngineFlags;
};

export type DatasetAnalysisProfile = {
  slotLabel: ComparisonSlotId;
  datasetInfo: ComparisonDatasetInfo;
  capturedAt: string;
  seriesCount: number;
  totalObservations: number;
  readinessScore?: number;
  readinessClassification?: PublicationReadinessClassification;
  overallHealthScore?: number;
  evidenceScore?: number;
  evidenceClassification?: EvidenceStrengthClassification;
  publicationStatus?: PublicationReadinessClassification;
  publicationScore?: number;
  normality?: DatasetAnalysisProfileNormalitySnapshot;
  inferential?: DatasetAnalysisProfileInferentialSnapshot;
  multivariateHeadline?: string;
  methodological?: DatasetAnalysisProfileMethodologicalSnapshot;
  multivariate?: DatasetAnalysisProfileMultivariateSnapshot;
  publication?: DatasetAnalysisProfilePublicationSnapshot;
  captureMetadata?: DatasetAnalysisProfileCaptureMetadata;
  isComplete: boolean;
};

export type ComparisonSlot = {
  id: ComparisonSlotId;
  label: string;
  profile: DatasetAnalysisProfile | null;
};

export type ComparisonKpiRow = {
  key: string;
  title: string;
  slotAValue: string;
  slotBValue: string;
  slotANumeric: number | null;
  slotBNumeric: number | null;
  delta: number | null;
  deltaDirection: ComparisonDeltaDirection;
};

export type MultiDatasetComparisonAnalysis = {
  slotA: DatasetAnalysisProfile;
  slotB: DatasetAnalysisProfile;
  kpiRows: ComparisonKpiRow[];
  comparabilityWarnings: string[];
  crossDatasetDiagnosis: string[];
  comparisonRecommendations: string[];
  evaluatedMetrics: number;
  methodologicalBreakdownAvailable?: boolean;
  multivariateSectionAvailable?: boolean;
  publicationHighlightsAvailable?: boolean;
};
