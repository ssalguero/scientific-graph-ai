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

/** Enriched Dataset5 profile with methodological / multivariate / publication snapshots. */
export const buildEnrichedDataset5Profile = (): DatasetAnalysisProfile => ({
  ...buildCanonicalDataset5Profile(),
  inferential: {
    dominantMagnitude: "large",
    metric: "Cohen's d",
    valueDisplay: "−1.36",
    prospectiveSampleSize: 24,
  },
  multivariateHeadline: "Estructura multivariante estable",
  methodological: {
    consistencyScore: 85.0,
    qualityScore: 82.0,
    reproducibilityScore: 78.0,
    evidenceScore: 82.7,
    assumptionScore: 75.0,
    readinessScore: 77.0,
    evaluatedEngines: 6,
  },
  multivariate: {
    pcaVariance: 82.5,
    clusterCount: 2,
    topVariable: "Series A",
    averageSimilarity: 71.0,
    headline: "Estructura multivariante estable",
  },
  publication: {
    crossDomainDiagnosisTop: [
      "La evidencia inferencial es sólida y está respaldada por un efecto de magnitud elevada.",
    ],
    publicationRisksTop: ["Revisar supuestos en series cuestionables."],
    prospectiveSampleSize: 24,
    currentSampleSize: 44,
    insufficientSampleWarning: null,
  },
  captureMetadata: {
    worksheetModifiedAtCapture: false,
    captureEngineFlags: {
      hasMethodologicalDashboard: true,
      hasPublicationReadiness: true,
      hasEvidenceEngine: true,
      hasMultivariateDashboard: true,
      hasEffectSizePower: true,
      normalityAssessmentCount: 4,
    },
  },
});

/** Enriched Dataset6 profile with methodological / multivariate / publication snapshots. */
export const buildEnrichedDataset6Profile = (): DatasetAnalysisProfile => ({
  ...buildCanonicalDataset6Profile(),
  inferential: {
    dominantMagnitude: "large",
    metric: "Cohen's d",
    valueDisplay: "−1.98",
    prospectiveSampleSize: 32,
  },
  multivariateHeadline: "Mayor dispersión multivariante",
  methodological: {
    consistencyScore: 72.0,
    qualityScore: 70.0,
    reproducibilityScore: 65.0,
    evidenceScore: 73.3,
    assumptionScore: 58.0,
    readinessScore: 67.5,
    evaluatedEngines: 6,
  },
  multivariate: {
    pcaVariance: 61.0,
    clusterCount: 3,
    topVariable: "Series C",
    averageSimilarity: 58.0,
    headline: "Mayor dispersión multivariante",
  },
  publication: {
    crossDomainDiagnosisTop: [
      "Se recomienda revisión metodológica adicional antes de redactar el manuscrito.",
    ],
    publicationRisksTop: [
      "Series no normales requieren validación de pruebas paramétricas.",
    ],
    prospectiveSampleSize: 32,
    currentSampleSize: 40,
    insufficientSampleWarning: "Tamaño muestral por debajo del recomendado.",
  },
  captureMetadata: {
    worksheetModifiedAtCapture: false,
    captureEngineFlags: {
      hasMethodologicalDashboard: true,
      hasPublicationReadiness: true,
      hasEvidenceEngine: true,
      hasMultivariateDashboard: true,
      hasEffectSizePower: true,
      normalityAssessmentCount: 4,
    },
  },
});
