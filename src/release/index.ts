/**
 * RELEASE Domain — Public barrel.
 *
 * Consumers may import ONLY from `@/release`.
 *
 * RELEASE-P1: Governance & Evidence Architecture (CERTIFIED).
 * RELEASE-P2: Readiness & Gate Architecture (IMPLEMENTED — certification not claimed).
 *
 * @packageDocumentation
 */

export {
  RELEASE_DOMAIN_ID,
  RELEASE_DOMAIN_NAME,
  RELEASE_DOMAIN_ARCHITECTURAL_ROLE,
  RELEASE_DOMAIN_MOTTO,
  RELEASE_OWNERSHIP_PRINCIPLE,
  RELEASE_CENTRAL_RULE,
  RELEASE_P1_PHASE,
  RELEASE_P1_STATUS,
  RELEASE_P1_CERTIFICATION_STATUS,
  RELEASE_P2_PHASE,
  RELEASE_P2_STATUS,
  RELEASE_P2_CERTIFICATION_STATUS,
  RELEASE_FOUNDATION_IDENTITY,
} from "./foundation";

export type {
  ReleaseFoundationIdentity,
  ReleaseP1Status,
  ReleaseP2Status,
} from "./foundation";

export type {
  ReleaseOriginatingDomain,
  ReleaseEvidenceClass,
  ReleaseEvidenceLifecycleState,
  ReleaseEvidenceTrustClass,
  ReleaseEvidenceValidationOutcome,
  ReleaseExceptionSeverity,
  ReleaseGateCategory,
  ReleaseCertificationBoundaryLevel,
  ReleaseCompletenessDimension,
  ReleaseTraceabilityNode,
  ReleaseEvidenceId,
  ReleaseEvidenceRecord,
  ReleaseEvidenceInput,
} from "./types";

export {
  RELEASE_EVIDENCE_LIFECYCLE_STATES,
  RELEASE_GATE_CATEGORIES,
  RELEASE_CERTIFICATION_BOUNDARY_LEVELS,
  RELEASE_TRACEABILITY_CHAIN,
  asReleaseEvidenceId,
} from "./types";

export {
  CROSS_DOMAIN_BASELINE_FACTS,
  getPeerBaselineFact,
  listEvidencePathGaps,
  listConditionalPeerBaselines,
} from "./baseline";

export type { PeerBaselineFact, PeerBaselineClosedPending } from "./baseline";

export {
  RELEASE_MAY_DECIDE,
  RELEASE_MAY_REQUEST,
  RELEASE_MAY_REJECT_OR_BLOCK,
  RELEASE_MUST_NOT,
  releaseMay,
  releaseMustNot,
  requestTransfersPeerOwnership,
  CERTIFICATION_BOUNDARY_INVARIANT,
  listCertificationBoundaryLevels,
  isDomainCertificationGlobalRelease,
  evidenceAcceptanceAuthorizesProductionRelease,
  p1ClaimsGlobalReleaseCertification,
} from "./governance";

export type {
  ReleaseGovernanceCapability,
  ReleaseGovernanceProhibition,
} from "./governance";

export {
  EVIDENCE_LIFECYCLE_TRANSITIONS,
  canTransitionEvidenceLifecycle,
  transitionEvidenceLifecycle,
  isConsumableLifecycleState,
  evaluateEvidenceTrust,
  missingEvidenceBecomesPass,
  recordSupportsPass,
  preferAuthoritativeForDomainClaim,
  RELEASE_EVIDENCE_CLASSES,
  isKnownEvidenceClass,
  classifyEvidenceRecord,
  listEvidenceByClass,
  RELEASE_COMPLETENESS_DIMENSIONS,
  probeEvidenceCompleteness,
  createReleaseException,
  isBlocker,
  isWarning,
  warningAuthorizesRelease,
  listOpenBlockers,
  advancementBlockedByExceptions,
  missingEvidenceException,
  evidencePathGapException,
  normalizeEvidenceInput,
  validateEvidenceRecord,
  intakeCrossDomainBaseline,
  listReleaseGateCategories,
  gatesForEvidence,
  evidenceForGate,
  INDICATIVE_CLASS_GATE_MAP,
  finalCertificationGateImplemented,
  concreteGateCriteriaDefined,
  listTraceabilityChain,
  buildEvidenceTraceView,
  adjacentTraceLinks,
  releaseCandidateExecutionEnabled,
  releaseDecisionExecutionEnabled,
  createDecisionProvenanceDraft,
  decisionRecordingImplemented,
  createEvidenceIndex,
  isDefinitiveReleaseEvidenceIndex,
} from "./evidence";

export type {
  LifecycleTransitionResult,
  TrustEvaluationInput,
  TrustEvaluationResult,
  CompletenessProbe,
  ReleaseExceptionRecord,
  EvidenceValidationReport,
  IntakeResult,
  TraceabilityLink,
  EvidenceTraceView,
  ReleaseDecisionProvenanceDraft,
  EvidenceIndexQueryAnswer,
  ReleaseEvidenceIndex,
} from "./evidence";

export {
  RELEASE_READINESS_STATES,
  RELEASE_GATE_IDS,
  RELEASE_GATE_STATES,
  GATE_ID_TO_P1_CATEGORY,
  CATEGORY_GATES,
  isReleaseReadinessState,
  isReleaseGateId,
  isReleaseGateState,
  selectAcceptedEvidenceForReadiness,
  assertAcceptedOnly,
  buildReadinessInputBundle,
  warningSilentlyBecomesPass,
  collectEvidenceBlockers,
  propagateToGateBlockers,
  propagateToReadinessBlockers,
  propagateEvidenceToReadiness,
  warningDoesNotAuthorize,
  assessReleaseReadiness,
  readinessImpliesReleaseCertification,
  concreteReadinessThresholdsDefined,
  createReadinessSummaryView,
  isDefinitiveReadinessSummary,
  createReadinessDecisionProvenanceDraft,
  readinessDecisionRecordingImplemented,
  releaseCandidatePromotionImplemented,
  listReadinessTraceabilityChain,
  futureReleaseCandidatePromotionEnabled,
  RELEASE_READY_BOUNDARY_INVARIANT,
  readyImpliesCertified,
  readyImpliesReleaseCandidate,
  readyImpliesProductionReleased,
} from "./readiness";

export type {
  ReleaseReadinessState,
  ReleaseGateId,
  ReleaseGateState,
  ReadinessAssessmentAspect,
  ReadinessInputBundle,
  BlockerLayer,
  PropagatedBlocker,
  AspectObservation,
  ReadinessAssessmentResult,
  ReadinessSummaryView,
  ReadinessDecisionProvenanceDraft,
  ReadinessTraceabilityNode,
} from "./readiness";

export {
  listGateDescriptors,
  getGateDescriptor,
  concreteGateThresholdsDefined,
  listCategoryGateIds,
  defaultFinalCertificationDependencies,
  detectGateDependencyCycle,
  validateGateDependencies,
  finalCertificationDependsOnCategories,
  productionReleaseDependencyAllowed,
  createGateResult,
  gatePassImpliesGlobalCertification,
  isOpaqueGateResult,
  createReleaseWaiver,
  waiverRequiresProvenance,
} from "./gates";

export type {
  GateDescriptor,
  GateDependencyEdge,
  DependencyValidation,
  GateEvidenceTrace,
  GateResultRecord,
  ReleaseWaiverRecord,
} from "./gates";
