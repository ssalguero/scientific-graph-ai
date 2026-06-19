import type { DatasetAnalysisProfile } from "../../types";

const baseDatasetInfo = (
  fileName: string,
  seriesCount: number,
  observationCount: number
) => ({
  fileName,
  importedAt: "2026-06-01T12:00:00.000Z",
  seriesCount,
  observationCount,
});

/** Canonical Dataset5 slot A baseline (SCI-60 / gate D5). */
export const buildCanonicalDataset5Profile = (): DatasetAnalysisProfile => ({
  slotLabel: "A",
  datasetInfo: baseDatasetInfo("Dataset5.csv", 4, 44),
  capturedAt: "2026-06-01T12:00:00.000Z",
  seriesCount: 4,
  totalObservations: 44,
  readinessScore: 77.0,
  readinessClassification: "near-ready",
  overallHealthScore: 77.0,
  evidenceScore: 82.7,
  evidenceClassification: "strong",
  publicationStatus: "near-ready",
  publicationScore: 77.0,
  normality: {
    seriesEvaluated: 4,
    normalCount: 2,
    nonNormalCount: 1,
    questionableCount: 1,
    contradictoryCount: 0,
    hasWarnings: false,
  },
  inferential: {
    dominantMagnitude: "large",
    metric: "Cohen's d",
    valueDisplay: "−1.36",
  },
  isComplete: true,
});

/** Canonical Dataset6 slot B baseline (SCI-60 / gate D6). */
export const buildCanonicalDataset6Profile = (): DatasetAnalysisProfile => ({
  slotLabel: "B",
  datasetInfo: baseDatasetInfo("Dataset6.csv", 4, 40),
  capturedAt: "2026-06-01T13:00:00.000Z",
  seriesCount: 4,
  totalObservations: 40,
  readinessScore: 67.5,
  readinessClassification: "requires-review",
  overallHealthScore: 67.5,
  evidenceScore: 73.3,
  evidenceClassification: "strong",
  publicationStatus: "requires-review",
  publicationScore: 67.5,
  normality: {
    seriesEvaluated: 4,
    normalCount: 1,
    nonNormalCount: 2,
    questionableCount: 1,
    contradictoryCount: 0,
    hasWarnings: true,
  },
  inferential: {
    dominantMagnitude: "large",
    metric: "Cohen's d",
    valueDisplay: "−1.98",
  },
  isComplete: true,
});

export const buildIncompleteProfile = (
  slotLabel: "A" | "B"
): DatasetAnalysisProfile => ({
  slotLabel,
  datasetInfo: baseDatasetInfo("Partial.csv", 2, 10),
  capturedAt: "2026-06-01T12:00:00.000Z",
  seriesCount: 2,
  totalObservations: 10,
  readinessScore: 50.0,
  isComplete: false,
});
