import {
  buildCaptureMetadata,
  buildDatasetAnalysisProfile,
  mapMethodologicalToProfileSnapshot,
  mapMultivariateToProfileSnapshot,
  mapPublicationToProfileSnapshot,
} from "../profile";
import type { AssertCase } from "./run-assertions";

export const runProfileCases = (assertCase: AssertCase) => {
  const methodological = mapMethodologicalToProfileSnapshot({
    summaryCards: {
      consistencyScore: 85,
      qualityScore: 80,
      reproducibilityScore: 75,
      evidenceScore: 82.7,
      assumptionScore: 70,
      readinessScore: 77,
    },
  });
  assertCase(
    "mapper.methodological.evaluatedEngines",
    methodological?.evaluatedEngines === 6
  );
  assertCase(
    "mapper.methodological.consistency",
    methodological?.consistencyScore === 85
  );

  assertCase(
    "mapper.methodological.empty",
    mapMethodologicalToProfileSnapshot({ summaryCards: {} }) === undefined
  );

  const multivariate = mapMultivariateToProfileSnapshot({
    pcaVariance: 80,
    headline: "Test headline",
  });
  assertCase(
    "mapper.multivariate.headline",
    multivariate?.headline === "Test headline"
  );
  assertCase("mapper.multivariate.pca", multivariate?.pcaVariance === 80);

  const publication = mapPublicationToProfileSnapshot({
    crossDomainDiagnosis: ["Line 1", "Line 2", "Line 3", "Line 4"],
    publicationRisks: ["Risk 1"],
    prospectiveSampleSize: 20,
    insufficientSampleWarning: "Warning",
  });
  assertCase(
    "mapper.publication.topN",
    publication?.crossDomainDiagnosisTop?.length === 3
  );
  assertCase(
    "mapper.publication.prospective",
    publication?.prospectiveSampleSize === 20
  );

  const metadata = buildCaptureMetadata({
    worksheetModifiedAtCapture: true,
    hasMethodologicalDashboard: true,
    hasPublicationReadiness: true,
    hasEvidenceEngine: true,
    hasMultivariateDashboard: false,
    hasEffectSizePower: true,
    normalityAssessmentCount: 4,
  });
  assertCase(
    "mapper.captureMetadata.flags",
    metadata.captureEngineFlags?.normalityAssessmentCount === 4
  );
  assertCase(
    "mapper.captureMetadata.worksheet",
    metadata.worksheetModifiedAtCapture === true
  );

  const profile = buildDatasetAnalysisProfile({
    slotLabel: "A",
    datasetInfo: {
      fileName: "Test.csv",
      importedAt: "2026-06-01T12:00:00.000Z",
      seriesCount: 2,
      observationCount: 10,
    },
    seriesCount: 2,
    totalObservations: 10,
    readinessScore: 77,
    overallHealthScore: 77,
    evidenceScore: 82.7,
    methodological,
    multivariate,
    publication,
    captureMetadata: metadata,
  });
  assertCase("builder.enriched.isComplete", profile.isComplete === true);
  assertCase(
    "builder.enriched.multivariateHeadlineFallback",
    profile.multivariateHeadline === "Test headline"
  );
  assertCase(
    "builder.enriched.methodological",
    profile.methodological?.evaluatedEngines === 6
  );
};
