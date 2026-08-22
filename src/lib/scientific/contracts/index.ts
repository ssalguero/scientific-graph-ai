export {
  SCIENTIFIC_CAPABILITY_IDENTITIES,
  getScientificCapabilityIdentity,
  resolveScientificCapabilityAlias,
} from "./capability-identity";
export type {
  ScientificCapabilityClaimLevel,
  ScientificCapabilityIdentityDescriptor,
  ScientificCapabilityIdentityId,
} from "./capability-identity";

export {
  describeLiveDerivedResult,
  LIVE_DERIVED_RESULT_IDENTITY,
  SCIENTIFIC_ARTIFACT_KINDS,
} from "./artifacts";
export type {
  LiveDerivedResultDescriptor,
  LiveDerivedResultIdentityDescriptor,
  ScientificArtifactKind,
} from "./artifacts";

export {
  composeScientificProvenance,
} from "./provenance";
export type {
  ComposeScientificProvenanceInput,
  ScientificApproximationKind,
  ScientificApproximationProvenance,
  ScientificConfigurationProvenance,
  ScientificDatasetProvenance,
  ScientificMethodProvenance,
  ScientificProvenanceDescriptor,
  ScientificProvenancePrimitive,
  ScientificProvenanceValue,
  ScientificProvenanceWarning,
  ScientificSeriesProvenance,
  ScientificSourceProvenance,
} from "./provenance";

export {
  GE_PCA_SEMANTICS,
  PCA_CROSS_IMPLEMENTATION_POLICY,
  PCA_SEMANTIC_DESCRIPTORS,
  VGB_PCA_SEMANTICS,
} from "./pca-semantics";
export type { ScientificPcaSemanticDescriptor } from "./pca-semantics";

export {
  SCIENTIFIC_RESULT_CONTRACT_INVENTORY,
  getScientificResultContract,
  listScientificContractsBySciId,
} from "./result-inventory";
export type {
  ScientificApproximationPolicy,
  ScientificPersistencePolicy,
  ScientificResultContractDescriptor,
  ScientificResultContractId,
  ScientificSemanticFieldDescriptor,
} from "./result-inventory";

export {
  canonicalizeScientificValue,
  cloneScientificSemanticValue,
  cloneScientificValue,
  createScientificSemanticValue,
  toScientificValue,
} from "./semantic-values";
export type {
  CreateScientificSemanticValueInput,
  ScientificSemanticAuthority,
  ScientificSemanticEquivalencePolicy,
  ScientificSemanticUncertainty,
  ScientificSemanticValue,
  ScientificSemanticValueStatus,
} from "./semantic-values";

export {
  createCitableScientificSnapshot,
  createCitableSnapshotId,
  isCitableScientificSnapshot,
  reviveCitableScientificSnapshot,
} from "./citable-snapshot";
export type {
  CitableScientificSnapshot,
  CitableScientificSnapshotIdentity,
  CitableScientificSnapshotStatus,
  CreateCitableScientificSnapshotInput,
} from "./citable-snapshot";

export { assessScientificSnapshotFreshness } from "./freshness";
export type {
  AssessScientificSnapshotFreshnessInput,
  ScientificFreshnessAssessment,
  ScientificFreshnessReason,
  ScientificFreshnessReasonCode,
  ScientificFreshnessState,
} from "./freshness";

export { assessScientificArtifactEquivalence } from "./equivalence";
export type {
  ScientificArtifactEquivalenceAssessment,
  ScientificArtifactEquivalenceState,
} from "./equivalence";

export {
  assessSemanticProjectionParity,
  createLiveScientificProjection,
  projectCitableScientificSnapshot,
} from "./semantic-parity";
export type {
  CreateLiveScientificProjectionInput,
  ScientificProjectionArtifactIdentity,
  ScientificProjectionSurface,
  ScientificSemanticProjection,
} from "./semantic-parity";
