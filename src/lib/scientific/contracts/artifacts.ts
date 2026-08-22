/**
 * CTR-02 — Artifact taxonomy. Artifact identity is deliberately independent
 * from any one scientific result payload.
 */
import type { ScientificProvenanceDescriptor } from "./provenance";

export type ScientificArtifactKind =
  | "dataset"
  | "source"
  | "series"
  | "configuration"
  | "scientific-result"
  | "aggregate-result"
  | "comparison-snapshot"
  | "workflow-state"
  | "visualization"
  | "preview-values"
  | "report"
  | "live-derived-result"
  | "citable-scientific-snapshot";

export const SCIENTIFIC_ARTIFACT_KINDS = [
  "dataset",
  "source",
  "series",
  "configuration",
  "scientific-result",
  "aggregate-result",
  "comparison-snapshot",
  "workflow-state",
  "visualization",
  "preview-values",
  "report",
  "live-derived-result",
  "citable-scientific-snapshot",
] as const satisfies readonly ScientificArtifactKind[];

export type LiveDerivedResultIdentityDescriptor = {
  kind: "live-derived-result";
  identityScope: "runtime-session";
  lifecycle: "ephemeral";
  citable: false;
  persistencePolicy: "forbidden";
  requiresProvenance: true;
  description: string;
};

/**
 * Runtime calculations are observations of current inputs, not durable
 * scientific records. A future citable artifact must receive a distinct,
 * materialized identity rather than reusing this one.
 */
export const LIVE_DERIVED_RESULT_IDENTITY = {
  kind: "live-derived-result",
  identityScope: "runtime-session",
  lifecycle: "ephemeral",
  citable: false,
  persistencePolicy: "forbidden",
  requiresProvenance: true,
  description:
    "Resultado derivado en vivo: efímero, no citable y no persistible como registro científico.",
} as const satisfies LiveDerivedResultIdentityDescriptor;

export type LiveDerivedResultDescriptor = {
  identity: LiveDerivedResultIdentityDescriptor;
  resultContractId: string;
  provenance: ScientificProvenanceDescriptor;
};

/**
 * Binds a federated result contract to its current source/configuration
 * context without persisting the live value or allocating citable identity.
 */
export const describeLiveDerivedResult = (input: {
  resultContractId: string;
  provenance: ScientificProvenanceDescriptor;
}): LiveDerivedResultDescriptor => ({
  identity: LIVE_DERIVED_RESULT_IDENTITY,
  resultContractId: input.resultContractId,
  provenance: input.provenance,
});
