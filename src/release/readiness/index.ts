/**
 * RELEASE-P2 — Readiness barrel.
 */

export {
  RELEASE_READINESS_STATES,
  RELEASE_GATE_IDS,
  RELEASE_GATE_STATES,
  GATE_ID_TO_P1_CATEGORY,
  CATEGORY_GATES,
  isReleaseReadinessState,
  isReleaseGateId,
  isReleaseGateState,
} from "./vocabulary";
export type {
  ReleaseReadinessState,
  ReleaseGateId,
  ReleaseGateState,
  ReadinessAssessmentAspect,
} from "./vocabulary";

export {
  selectAcceptedEvidenceForReadiness,
  assertAcceptedOnly,
  buildReadinessInputBundle,
} from "./inputs";
export type { ReadinessInputBundle } from "./inputs";

export {
  warningSilentlyBecomesPass,
  collectEvidenceBlockers,
  propagateToGateBlockers,
  propagateToReadinessBlockers,
  propagateEvidenceToReadiness,
  warningDoesNotAuthorize,
} from "./blocking";
export type { BlockerLayer, PropagatedBlocker } from "./blocking";

export {
  assessReleaseReadiness,
  readinessImpliesReleaseCertification,
  concreteReadinessThresholdsDefined,
} from "./assessment";
export type {
  AspectObservation,
  ReadinessAssessmentResult,
} from "./assessment";

export {
  createReadinessSummaryView,
  isDefinitiveReadinessSummary,
} from "./summary";
export type { ReadinessSummaryView } from "./summary";

export {
  createReadinessDecisionProvenanceDraft,
  readinessDecisionRecordingImplemented,
  releaseCandidatePromotionImplemented,
} from "./provenance";
export type { ReadinessDecisionProvenanceDraft } from "./provenance";

export {
  READINESS_TRACEABILITY_CHAIN,
  listReadinessTraceabilityChain,
  futureReleaseCandidatePromotionEnabled,
} from "./traceability";
export type { ReadinessTraceabilityNode } from "./traceability";

export {
  RELEASE_READY_BOUNDARY_INVARIANT,
  readyImpliesCertified,
  readyImpliesReleaseCandidate,
  readyImpliesProductionReleased,
} from "./boundary";
