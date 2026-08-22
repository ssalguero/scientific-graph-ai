import {
  createCitableScientificSnapshot,
  createScientificSemanticValue,
  reviveCitableScientificSnapshot,
  toScientificValue,
  type ScientificProvenanceDescriptor,
  type ScientificSemanticValue,
} from "@/lib/scientific/contracts";
import type {
  DatasetAnalysisProfile,
  DatasetAnalysisProfileCaptureMetadata,
  DatasetAnalysisProfilePayload,
} from "./types";

const SNAPSHOT_LIMITATIONS = [
  "El perfil captura KPIs federados disponibles; no es una prueba estadística combinada.",
  "El texto diagnóstico o recomendatorio conserva autoridad de sistema y no implica aprobación del investigador.",
] as const;

const profilePayload = (
  profile: DatasetAnalysisProfile
): DatasetAnalysisProfilePayload => ({
  slotLabel: profile.slotLabel,
  datasetInfo: { ...profile.datasetInfo },
  capturedAt: profile.capturedAt,
  seriesCount: profile.seriesCount,
  totalObservations: profile.totalObservations,
  readinessScore: profile.readinessScore,
  readinessClassification: profile.readinessClassification,
  overallHealthScore: profile.overallHealthScore,
  evidenceScore: profile.evidenceScore,
  evidenceClassification: profile.evidenceClassification,
  publicationStatus: profile.publicationStatus,
  publicationScore: profile.publicationScore,
  normality: profile.normality ? { ...profile.normality } : undefined,
  inferential: profile.inferential ? { ...profile.inferential } : undefined,
  multivariateHeadline: profile.multivariateHeadline,
  methodological: profile.methodological
    ? { ...profile.methodological }
    : undefined,
  multivariate: profile.multivariate
    ? {
        ...profile.multivariate,
        topVariableTied: profile.multivariate.topVariableTied
          ? [...profile.multivariate.topVariableTied]
          : undefined,
      }
    : undefined,
  publication: profile.publication
    ? {
        ...profile.publication,
        crossDomainDiagnosisTop: profile.publication.crossDomainDiagnosisTop
          ? [...profile.publication.crossDomainDiagnosisTop]
          : undefined,
        publicationRisksTop: profile.publication.publicationRisksTop
          ? [...profile.publication.publicationRisksTop]
          : undefined,
      }
    : undefined,
  isComplete: profile.isComplete,
});

const factualValue = (
  field: string,
  value: unknown,
  approximation: ScientificProvenanceDescriptor["approximation"]["kind"],
  unit?: string
): ScientificSemanticValue =>
  createScientificSemanticValue({
    field,
    value: toScientificValue(value),
    unit,
    status: value === undefined ? "not-applicable" : "known",
    authority: "system-factual",
    approximation,
    equivalencePolicy: "exact",
  });

export const buildDatasetAnalysisProfileSemanticValues = (
  profile: DatasetAnalysisProfile,
  provenance: ScientificProvenanceDescriptor
): readonly ScientificSemanticValue[] => {
  const payload = profilePayload(profile);
  const approximation = provenance.approximation.kind;
  const normalityFactual = payload.normality
    ? {
        seriesEvaluated: payload.normality.seriesEvaluated,
        normalCount: payload.normality.normalCount,
        nonNormalCount: payload.normality.nonNormalCount,
        questionableCount: payload.normality.questionableCount,
        contradictoryCount: payload.normality.contradictoryCount,
        hasWarnings: payload.normality.hasWarnings,
      }
    : undefined;
  const inferentialFactual = payload.inferential
    ? {
        dominantMagnitude: payload.inferential.dominantMagnitude,
        metric: payload.inferential.metric,
        prospectiveSampleSize: payload.inferential.prospectiveSampleSize,
      }
    : undefined;
  const multivariateFactual = payload.multivariate
    ? {
        pcaVariance: payload.multivariate.pcaVariance,
        clusterCount: payload.multivariate.clusterCount,
        topVariable: payload.multivariate.topVariable,
        topVariableTied: payload.multivariate.topVariableTied,
        averageSimilarity: payload.multivariate.averageSimilarity,
      }
    : undefined;
  return [
    createScientificSemanticValue({
      field: "comparisonProfile",
      label: "Perfil SCI-58 capturado",
      value: toScientificValue(payload),
      status: "known",
      authority: "mixed-system",
      approximation,
      equivalencePolicy: "non-comparable",
    }),
    factualValue(
      "dataset.fileName",
      payload.datasetInfo.fileName,
      approximation
    ),
    factualValue(
      "dataset.importedAt",
      payload.datasetInfo.importedAt,
      approximation
    ),
    factualValue("seriesCount", payload.seriesCount, approximation, "series"),
    factualValue(
      "totalObservations",
      payload.totalObservations,
      approximation,
      "observations"
    ),
    factualValue(
      "readinessScore",
      payload.readinessScore,
      approximation,
      "0–100"
    ),
    factualValue(
      "overallHealthScore",
      payload.overallHealthScore,
      approximation,
      "0–100"
    ),
    factualValue(
      "evidenceScore",
      payload.evidenceScore,
      approximation,
      "0–100"
    ),
    factualValue("normality", normalityFactual, approximation),
    factualValue("inferential", inferentialFactual, approximation),
    factualValue("methodological", payload.methodological, approximation),
    factualValue("multivariate", multivariateFactual, approximation),
    createScientificSemanticValue({
      field: "displayOnly.inferentialValue",
      value: toScientificValue(payload.inferential?.valueDisplay),
      status:
        payload.inferential?.valueDisplay === undefined
          ? "not-applicable"
          : "known",
      authority: "mixed-system",
      approximation,
      equivalencePolicy: "non-comparable",
    }),
    createScientificSemanticValue({
      field: "systemAdvisory",
      value: toScientificValue({
        normalityHeadline: payload.normality?.globalHeadline,
        multivariateHeadline: payload.multivariateHeadline,
        crossDomainDiagnosisTop: payload.publication?.crossDomainDiagnosisTop,
        publicationRisksTop: payload.publication?.publicationRisksTop,
      }),
      status: "known",
      authority: "system-advisory",
      approximation,
      equivalencePolicy: "non-comparable",
    }),
  ];
};

const isProfilePayload = (
  value: unknown
): value is DatasetAnalysisProfilePayload => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Partial<DatasetAnalysisProfilePayload>;
  return (
    (candidate.slotLabel === "A" || candidate.slotLabel === "B") &&
    candidate.datasetInfo !== null &&
    typeof candidate.datasetInfo === "object" &&
    typeof candidate.capturedAt === "string" &&
    typeof candidate.seriesCount === "number" &&
    typeof candidate.totalObservations === "number" &&
    typeof candidate.isComplete === "boolean"
  );
};

export const getAuthoritativeDatasetAnalysisProfile = (
  profile: DatasetAnalysisProfile
): DatasetAnalysisProfile => {
  const semanticValue = profile.captureMetadata?.snapshot?.semanticValues.find(
    (value) => value.field === "comparisonProfile"
  );
  if (!semanticValue || !isProfilePayload(semanticValue.value)) {
    return profile;
  }
  return {
    ...(structuredClone(semanticValue.value) as DatasetAnalysisProfilePayload),
    captureMetadata: profile.captureMetadata,
  };
};

const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach((child) => {
      deepFreeze(child);
    });
    Object.freeze(value);
  }
  return value;
};

export const attachCitableSnapshotToDatasetAnalysisProfile = (input: {
  profile: DatasetAnalysisProfile;
  captureMetadata: DatasetAnalysisProfileCaptureMetadata;
  snapshotId?: string;
}): DatasetAnalysisProfile => {
  if (!input.captureMetadata.provenance) {
    return deepFreeze({
      ...input.profile,
      captureMetadata: structuredClone(input.captureMetadata),
    }) as DatasetAnalysisProfile;
  }

  const snapshot = createCitableScientificSnapshot({
    snapshotId: input.snapshotId,
    capturedAt: input.profile.capturedAt,
    resultContractId: "sci-58.comparison",
    provenance: input.captureMetadata.provenance,
    semanticValues: buildDatasetAnalysisProfileSemanticValues(
      input.profile,
      input.captureMetadata.provenance
    ),
    limitations: SNAPSHOT_LIMITATIONS,
  });
  return deepFreeze({
    ...input.profile,
    captureMetadata: {
      ...structuredClone(input.captureMetadata),
      snapshot,
    },
  }) as DatasetAnalysisProfile;
};

export const reviveDatasetAnalysisProfile = (
  profile: DatasetAnalysisProfile | null
): DatasetAnalysisProfile | null => {
  if (!profile) {
    return null;
  }
  const snapshot = reviveCitableScientificSnapshot(
    profile.captureMetadata?.snapshot
  );
  const cloned = structuredClone(profile);
  return deepFreeze({
    ...cloned,
    captureMetadata: cloned.captureMetadata
      ? {
          ...cloned.captureMetadata,
          snapshot: snapshot ?? undefined,
        }
      : undefined,
  }) as DatasetAnalysisProfile;
};

export const invalidateDatasetAnalysisProfileSource = (
  profile: DatasetAnalysisProfile
): DatasetAnalysisProfile =>
  deepFreeze({
    ...profile,
    captureMetadata: {
      ...profile.captureMetadata,
      sourceUnavailable: true,
    },
  }) as DatasetAnalysisProfile;
