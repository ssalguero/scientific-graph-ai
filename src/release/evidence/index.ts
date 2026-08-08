/**
 * RELEASE-P1 — Evidence barrel.
 */

export {
  EVIDENCE_LIFECYCLE_TRANSITIONS,
  canTransitionEvidenceLifecycle,
  transitionEvidenceLifecycle,
  isConsumableLifecycleState,
} from "./lifecycle";
export type { LifecycleTransitionResult } from "./lifecycle";

export {
  evaluateEvidenceTrust,
  missingEvidenceBecomesPass,
  recordSupportsPass,
  preferAuthoritativeForDomainClaim,
} from "./trust";
export type { TrustEvaluationInput, TrustEvaluationResult } from "./trust";

export {
  RELEASE_EVIDENCE_CLASSES,
  isKnownEvidenceClass,
  classifyEvidenceRecord,
  listEvidenceByClass,
} from "./classification";

export {
  RELEASE_COMPLETENESS_DIMENSIONS,
  probeEvidenceCompleteness,
} from "./completeness";
export type { CompletenessProbe } from "./completeness";

export {
  createReleaseException,
  isBlocker,
  isWarning,
  warningAuthorizesRelease,
  listOpenBlockers,
  advancementBlockedByExceptions,
  missingEvidenceException,
  evidencePathGapException,
} from "./gaps";
export type { ReleaseExceptionRecord, ExceptionCreateInput } from "./gaps";

export { normalizeEvidenceInput, validateEvidenceRecord } from "./validate";
export type { EvidenceValidationReport } from "./validate";

export { intakeCrossDomainBaseline } from "./intake";
export type { IntakeResult } from "./intake";

export {
  listReleaseGateCategories,
  gatesForEvidence,
  evidenceForGate,
  INDICATIVE_CLASS_GATE_MAP,
  finalCertificationGateImplemented,
  concreteGateCriteriaDefined,
} from "./gate-relation";

export {
  listTraceabilityChain,
  buildEvidenceTraceView,
  adjacentTraceLinks,
  releaseCandidateExecutionEnabled,
  releaseDecisionExecutionEnabled,
} from "./traceability";
export type { TraceabilityLink, EvidenceTraceView } from "./traceability";

export {
  createDecisionProvenanceDraft,
  decisionRecordingImplemented,
} from "./provenance";
export type { ReleaseDecisionProvenanceDraft } from "./provenance";

export {
  createEvidenceIndex,
  isDefinitiveReleaseEvidenceIndex,
} from "./index-model";
export type {
  EvidenceIndexQueryAnswer,
  ReleaseEvidenceIndex,
} from "./index-model";
