import type { EffectSizePowerAnalysis } from "@/lib/scientific/inference";
import { COMPARISON_SLOT_LABELS } from "./constants";
import type {
  BuildDatasetAnalysisProfileInput,
  CanBuildDatasetAnalysisProfileInput,
} from "./input-types";
import type {
  ComparisonSlot,
  ComparisonSlotId,
  DatasetAnalysisProfile,
  DatasetAnalysisProfileInferentialSnapshot,
  DatasetAnalysisProfileNormalitySnapshot,
} from "./types";

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
    multivariateHeadline: input.multivariateHeadline,
    isComplete: false,
  };
  profile.isComplete = countCompleteProfileMetrics(profile) >= 3;
  return profile;
};
