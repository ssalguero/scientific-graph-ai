/**
 * RELEASE-P1 — Types barrel.
 */

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
} from "./vocabulary";

export {
  RELEASE_EVIDENCE_LIFECYCLE_STATES,
  RELEASE_GATE_CATEGORIES,
  RELEASE_CERTIFICATION_BOUNDARY_LEVELS,
  RELEASE_TRACEABILITY_CHAIN,
} from "./vocabulary";

export type {
  ReleaseEvidenceId,
  ReleaseEvidenceProvenance,
  ReleaseEvidenceFreshness,
  ReleaseEvidenceBlocking,
  ReleaseEvidenceSupersession,
  ReleaseEvidenceRecord,
  ReleaseEvidenceInput,
} from "./evidence";

export { asReleaseEvidenceId } from "./evidence";
