import {
  LIVE_DERIVED_RESULT_IDENTITY,
  type ScientificArtifactKind,
} from "./artifacts";
import type {
  CitableScientificSnapshot,
  CitableScientificSnapshotIdentity,
} from "./citable-snapshot";
import type {
  ScientificFreshnessAssessment,
  ScientificFreshnessState,
} from "./freshness";
import type { ScientificProvenanceDescriptor } from "./provenance";
import {
  getScientificResultContract,
  type ScientificResultContractId,
} from "./result-inventory";
import {
  canonicalizeScientificValue,
  cloneScientificSemanticValue,
  toScientificValue,
  type ScientificSemanticValue,
} from "./semantic-values";

export type ScientificProjectionSurface =
  | "results"
  | "report"
  | "pdf"
  | "comparison"
  | "figure"
  | "numeric-export-foundation";

export type ScientificProjectionArtifactIdentity =
  | typeof LIVE_DERIVED_RESULT_IDENTITY
  | CitableScientificSnapshotIdentity;

export type ScientificSemanticProjection = {
  schema: "scientific-semantic-projection/v1";
  surface: ScientificProjectionSurface;
  artifactIdentity: ScientificProjectionArtifactIdentity;
  resultContractId: ScientificResultContractId;
  artifactKind: ScientificArtifactKind;
  semanticValues: readonly ScientificSemanticValue[];
  sourceIdentity: Pick<
    ScientificProvenanceDescriptor,
    "dataset" | "source" | "series"
  >;
  configurationIdentity: ScientificProvenanceDescriptor["config"];
  methodIdentity: ScientificProvenanceDescriptor["method"];
  approximation: ScientificProvenanceDescriptor["approximation"];
  warnings: ScientificProvenanceDescriptor["warnings"];
  limitations: readonly string[];
  provenance: ScientificProvenanceDescriptor;
  freshness: {
    state: ScientificFreshnessState;
    reasons: readonly string[];
  };
};

export type CreateLiveScientificProjectionInput = {
  surface: ScientificProjectionSurface;
  resultContractId: ScientificResultContractId;
  provenance: ScientificProvenanceDescriptor;
  semanticValues: readonly ScientificSemanticValue[];
  limitations?: readonly string[];
  freshness?: ScientificFreshnessAssessment;
};

const cloneProvenance = (
  provenance: ScientificProvenanceDescriptor
): ScientificProvenanceDescriptor => structuredClone(provenance);

const buildProjection = (input: {
  surface: ScientificProjectionSurface;
  artifactIdentity: ScientificProjectionArtifactIdentity;
  resultContractId: ScientificResultContractId;
  provenance: ScientificProvenanceDescriptor;
  semanticValues: readonly ScientificSemanticValue[];
  limitations: readonly string[];
  freshness: ScientificSemanticProjection["freshness"];
}): ScientificSemanticProjection => {
  const contract = getScientificResultContract(input.resultContractId);
  const provenance = cloneProvenance(input.provenance);
  return {
    schema: "scientific-semantic-projection/v1",
    surface: input.surface,
    artifactIdentity: structuredClone(input.artifactIdentity),
    resultContractId: input.resultContractId,
    artifactKind: contract.artifactKind,
    semanticValues: input.semanticValues.map(cloneScientificSemanticValue),
    sourceIdentity: {
      dataset: { ...provenance.dataset },
      source: { ...provenance.source },
      series: provenance.series.map((series) => ({ ...series })),
    },
    configurationIdentity: structuredClone(provenance.config),
    methodIdentity: structuredClone(provenance.method),
    approximation: { ...provenance.approximation },
    warnings: provenance.warnings.map((warning) => ({ ...warning })),
    limitations: [...input.limitations],
    provenance,
    freshness: {
      state: input.freshness.state,
      reasons: [...input.freshness.reasons],
    },
  };
};

export const projectCitableScientificSnapshot = (
  snapshot: CitableScientificSnapshot,
  surface: ScientificProjectionSurface,
  freshness?: ScientificFreshnessAssessment
): ScientificSemanticProjection =>
  buildProjection({
    surface,
    artifactIdentity: snapshot.identity,
    resultContractId: snapshot.resultContractId,
    provenance: snapshot.provenance,
    semanticValues: snapshot.semanticValues,
    limitations: snapshot.limitations,
    freshness: {
      state: freshness?.state ?? "UNKNOWN",
      reasons:
        freshness?.reasons.map((reason) => reason.message) ??
        ["No se evaluó la vigencia contra un contexto actual."],
    },
  });

export const createLiveScientificProjection = (
  input: CreateLiveScientificProjectionInput
): ScientificSemanticProjection =>
  buildProjection({
    surface: input.surface,
    artifactIdentity: LIVE_DERIVED_RESULT_IDENTITY,
    resultContractId: input.resultContractId,
    provenance: input.provenance,
    semanticValues: input.semanticValues,
    limitations: input.limitations ?? [],
    freshness: {
      state: input.freshness?.state ?? "CURRENT",
      reasons:
        input.freshness?.reasons.map((reason) => reason.message) ??
        ["Resultado derivado del contexto activo actual."],
    },
  });

const parityState = (projection: ScientificSemanticProjection): unknown => ({
  artifactIdentity: projection.artifactIdentity,
  resultContractId: projection.resultContractId,
  artifactKind: projection.artifactKind,
  semanticValues: projection.semanticValues,
  sourceIdentity: projection.sourceIdentity,
  configurationIdentity: projection.configurationIdentity,
  methodIdentity: projection.methodIdentity,
  approximation: projection.approximation,
  warnings: projection.warnings,
  limitations: projection.limitations,
  provenance: projection.provenance,
  freshness: projection.freshness,
});

export const assessSemanticProjectionParity = (
  projections: readonly ScientificSemanticProjection[]
): { equivalent: boolean; reasons: readonly string[] } => {
  if (projections.length < 2) {
    return {
      equivalent: false,
      reasons: ["Se requieren al menos dos proyecciones para evaluar paridad."],
    };
  }
  const reference = canonicalizeScientificValue(
    toScientificValue(parityState(projections[0]!))
  );
  const divergent = projections.filter(
    (projection) =>
      canonicalizeScientificValue(toScientificValue(parityState(projection))) !==
      reference
  );
  return divergent.length === 0
    ? {
        equivalent: true,
        reasons: [
          "Las proyecciones preservan identidad, valores, unidades, incertidumbre, método, fuente, configuración, aproximación, advertencias, proveniencia y vigencia.",
        ],
      }
    : {
        equivalent: false,
        reasons: [
          `Se detectaron ${divergent.length} proyecciones con semántica divergente.`,
        ],
      };
};
