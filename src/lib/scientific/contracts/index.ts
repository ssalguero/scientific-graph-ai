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

export {
  SCIENTIFIC_GENERATED_TEXT_REVIEW_SCHEMA,
  createGeneratedTextArtifactIdentityFromSnapshot,
  createGeneratedTextContentIdentity,
  createGeneratedTextEvidenceIdentity,
  fingerprintGeneratedTextValue,
  freezeGeneratedTextReviewRecord,
  isGeneratedTextReviewIsoTimestamp,
  isGeneratedTextReviewRecord,
  reviveGeneratedTextReviewRecord,
} from "./generated-text-review";
export type {
  CreateGeneratedTextReviewRecordInput,
  GeneratedTextArtifactIdentity,
  GeneratedTextClassification,
  GeneratedTextContentIdentity,
  GeneratedTextEvidenceIdentity,
  GeneratedTextProducer,
  GeneratedTextReviewRecord,
  GeneratedTextReviewer,
  GeneratedTextReviewState,
  GeneratedTextReviewTransition,
  GeneratedTextReviewTransitionKind,
  GeneratedTextReviewValidity,
} from "./generated-text-review";

export {
  SCIENTIFIC_VGB_FIGURE_LIFECYCLE_SCHEMA,
  SCIENTIFIC_VGB_FIGURE_LIFECYCLE_STORE_SCHEMA,
  SCIENTIFIC_VGB_PUBLICATION_FIGURE_SCHEMA,
  SCIENTIFIC_VGB_WORKING_FIGURE_SCHEMA,
  VGB_DISPLAY_SERIES_DISPOSITION,
  VGB_FIGURE_LIFECYCLE_STATES,
  createVgbPublicationFigureId,
  extractVgbFigureCosmeticBinding,
  extractVgbFigureScientificBinding,
  fingerprintVgbFigureCosmeticBinding,
  fingerprintVgbFigureEvidence,
  fingerprintVgbFigureScientificBinding,
  freezeVgbFigureLifecycleStore,
  freezeVgbPublicationFigureArtifact,
  freezeVgbWorkingFigureRecord,
  isVgbFigureLifecycleStore,
  isVgbPublicationFigureArtifact,
  isVgbWorkingFigureRecord,
} from "./vgb-figure-lifecycle";
export type {
  VgbDisplaySeriesDisposition,
  VgbFigureCosmeticBinding,
  VgbFigureLifecyclePhase,
  VgbFigureLifecycleState,
  VgbFigureLifecycleStore,
  VgbFigureScientificBinding,
  VgbPublicationFigureArtifact,
  VgbWorkingFigureRecord,
} from "./vgb-figure-lifecycle";
