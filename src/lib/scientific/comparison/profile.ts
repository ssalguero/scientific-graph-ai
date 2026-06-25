import type { EffectSizePowerAnalysis } from "@/lib/scientific/inference";
import { COMPARISON_SLOT_LABELS } from "./constants";
import type {
  BuildCaptureMetadataInput,
  BuildDatasetAnalysisProfileInput,
  CanBuildDatasetAnalysisProfileInput,
  MethodologicalSummaryCardsInput,
  MultivariateHighlightsInput,
  PublicationSnapshotInput,
} from "./input-types";
import type {
  ComparisonSlot,
  ComparisonSlotId,
  DatasetAnalysisProfile,
  DatasetAnalysisProfileCaptureMetadata,
  DatasetAnalysisProfileInferentialSnapshot,
  DatasetAnalysisProfileMethodologicalSnapshot,
  DatasetAnalysisProfileMultivariateSnapshot,
  DatasetAnalysisProfileNormalitySnapshot,
  DatasetAnalysisProfilePublicationSnapshot,
} from "./types";

const PUBLICATION_SNAPSHOT_TOP_N = 3;

export const createEmptyComparisonSlots = (): Record<
  ComparisonSlotId,
  ComparisonSlot
> => ({
  A: { id: "A", label: COMPARISON_SLOT_LABELS.A, profile: null },
  B: { id: "B", label: COMPARISON_SLOT_LABELS.B, profile: null },
});

export const mapNormalitySummaryToProfileSnapshot = (
  summary: DatasetAnalysisProfileNormalitySnapshot | null | undefined
): DatasetAnalysisProfileNormalitySnapshot | undefined => {
  if (!summary) {
    return undefined;
  }
  return {
    seriesEvaluated: summary.seriesEvaluated,
    normalCount: summary.normalCount,
    nonNormalCount: summary.nonNormalCount,
    questionableCount: summary.questionableCount,
    contradictoryCount: summary.contradictoryCount,
    globalHeadline: summary.globalHeadline,
    hasWarnings: summary.hasWarnings,
  };
};

export const mapInferentialToProfileSnapshot = (
  analysis: EffectSizePowerAnalysis | null
): DatasetAnalysisProfileInferentialSnapshot | undefined => {
  if (!analysis) {
    return undefined;
  }
  return {
    dominantMagnitude: analysis.dominantMagnitude,
    metric: analysis.dominantEntry?.metric,
    valueDisplay: analysis.dominantEntry?.valueDisplay,
    prospectiveSampleSize: analysis.prospectiveSampleSize,
  };
};

const countMethodologicalEngines = (
  cards: MethodologicalSummaryCardsInput
): number => {
  let count = 0;
  if (cards.consistencyScore !== undefined) count += 1;
  if (cards.qualityScore !== undefined) count += 1;
  if (cards.reproducibilityScore !== undefined) count += 1;
  if (cards.evidenceScore !== undefined) count += 1;
  if (cards.assumptionScore !== undefined) count += 1;
  if (cards.readinessScore !== undefined) count += 1;
  return count;
};

export const mapMethodologicalToProfileSnapshot = (input: {
  summaryCards: MethodologicalSummaryCardsInput | null | undefined;
  evaluatedEngines?: number;
}): DatasetAnalysisProfileMethodologicalSnapshot | undefined => {
  const { summaryCards } = input;
  if (!summaryCards) {
    return undefined;
  }

  const evaluatedEngines =
    input.evaluatedEngines ?? countMethodologicalEngines(summaryCards);
  if (evaluatedEngines === 0) {
    return undefined;
  }

  return {
    consistencyScore: summaryCards.consistencyScore,
    qualityScore: summaryCards.qualityScore,
    reproducibilityScore: summaryCards.reproducibilityScore,
    evidenceScore: summaryCards.evidenceScore,
    assumptionScore: summaryCards.assumptionScore,
    readinessScore: summaryCards.readinessScore,
    evaluatedEngines,
  };
};

export const mapMultivariateToProfileSnapshot = (
  highlights: MultivariateHighlightsInput | null | undefined
): DatasetAnalysisProfileMultivariateSnapshot | undefined => {
  if (!highlights) {
    return undefined;
  }

  const hasContent =
    highlights.pcaVariance !== undefined ||
    highlights.clusterCount !== undefined ||
    highlights.topVariable !== undefined ||
    (highlights.topVariableTied?.length ?? 0) > 0 ||
    highlights.averageSimilarity !== undefined ||
    highlights.headline !== undefined;

  if (!hasContent) {
    return undefined;
  }

  return {
    pcaVariance: highlights.pcaVariance,
    clusterCount: highlights.clusterCount,
    topVariable: highlights.topVariable,
    topVariableTied: highlights.topVariableTied,
    averageSimilarity: highlights.averageSimilarity,
    headline: highlights.headline,
  };
};

export const mapPublicationToProfileSnapshot = (
  input: PublicationSnapshotInput | null | undefined
): DatasetAnalysisProfilePublicationSnapshot | undefined => {
  if (!input) {
    return undefined;
  }

  const crossDomainDiagnosisTop = input.crossDomainDiagnosis?.slice(
    0,
    PUBLICATION_SNAPSHOT_TOP_N
  );
  const publicationRisksTop = input.publicationRisks?.slice(
    0,
    PUBLICATION_SNAPSHOT_TOP_N
  );

  const hasContent =
    (crossDomainDiagnosisTop?.length ?? 0) > 0 ||
    (publicationRisksTop?.length ?? 0) > 0 ||
    input.prospectiveSampleSize !== undefined ||
    input.currentSampleSize !== undefined ||
    input.insufficientSampleWarning != null;

  if (!hasContent) {
    return undefined;
  }

  return {
    crossDomainDiagnosisTop,
    publicationRisksTop,
    prospectiveSampleSize: input.prospectiveSampleSize,
    currentSampleSize: input.currentSampleSize,
    insufficientSampleWarning: input.insufficientSampleWarning,
  };
};

export const buildCaptureMetadata = (
  input: BuildCaptureMetadataInput
): DatasetAnalysisProfileCaptureMetadata => ({
  sourceDatasetChecksum: input.sourceDatasetChecksum ?? null,
  worksheetModifiedAtCapture: input.worksheetModifiedAtCapture,
  captureEngineFlags: {
    hasMethodologicalDashboard: input.hasMethodologicalDashboard,
    hasPublicationReadiness: input.hasPublicationReadiness,
    hasEvidenceEngine: input.hasEvidenceEngine,
    hasMultivariateDashboard: input.hasMultivariateDashboard,
    hasEffectSizePower: input.hasEffectSizePower,
    normalityAssessmentCount: input.normalityAssessmentCount,
  },
});

const countCompleteProfileMetrics = (profile: DatasetAnalysisProfile): number => {
  let count = 0;
  if (profile.readinessScore !== undefined) count += 1;
  if (profile.overallHealthScore !== undefined) count += 1;
  if (profile.evidenceScore !== undefined) count += 1;
  return count;
};

export const canBuildDatasetAnalysisProfile = (
  input: CanBuildDatasetAnalysisProfileInput
): boolean => {
  if (!input.datasetInfo) {
    return false;
  }
  const hasCoreMetric =
    input.hasPublicationReadinessAnalyzer ||
    input.hasMethodologicalDashboard ||
    input.hasEvidenceStrengthEngine;
  const hasNormality = input.normalityAssessmentCount > 0;
  return hasCoreMetric || hasNormality;
};

export const buildDatasetAnalysisProfile = (
  input: BuildDatasetAnalysisProfileInput
): DatasetAnalysisProfile => {
  const multivariateHeadline =
    input.multivariateHeadline ?? input.multivariate?.headline;

  const profile: DatasetAnalysisProfile = {
    slotLabel: input.slotLabel,
    datasetInfo: input.datasetInfo,
    capturedAt: new Date().toISOString(),
    seriesCount: input.seriesCount,
    totalObservations: input.totalObservations,
    readinessScore: input.readinessScore,
    readinessClassification: input.readinessClassification,
    overallHealthScore: input.overallHealthScore,
    evidenceScore: input.evidenceScore,
    evidenceClassification: input.evidenceClassification,
    publicationStatus: input.publicationStatus,
    publicationScore: input.publicationScore,
    normality: input.normality,
    inferential: input.inferential,
    multivariateHeadline,
    methodological: input.methodological,
    multivariate: input.multivariate,
    publication: input.publication,
    captureMetadata: input.captureMetadata,
    isComplete: false,
  };
  profile.isComplete = countCompleteProfileMetrics(profile) >= 3;
  return profile;
};
