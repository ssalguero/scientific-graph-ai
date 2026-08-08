/**
 * RELEASE-P1 — Canonical vocabulary (planning contract materialization).
 *
 * Types only + const catalogs. No promotion / deployment / shipping.
 */

/** Peer and RELEASE originating domains for evidence ownership. */
export type ReleaseOriginatingDomain =
  | "ENGINE"
  | "DATA"
  | "AI"
  | "COLLAB"
  | "PLUGINS"
  | "PERFORMANCE"
  | "UX"
  | "RELEASE"
  | "CROSS_CUTTING";

/** P0.5 / P1 §8 evidence taxonomy. */
export type ReleaseEvidenceClass =
  | "DOMAIN_CERTIFICATION"
  | "ARCHITECTURE_FREEZE"
  | "IMPLEMENTATION_GATE"
  | "VALIDATION_GATE"
  | "TEST"
  | "GOVERNANCE_VALIDATOR"
  | "COMPATIBILITY"
  | "PERFORMANCE"
  | "PERSISTENCE_DATA"
  | "DOCUMENTATION"
  | "KNOWN_LIMITATION"
  | "RELEASE_SPECIFIC_CHECK";

/** P1 §7 evidence lifecycle (definitions + transition helpers; not release-state machine). */
export type ReleaseEvidenceLifecycleState =
  | "DISCOVERED"
  | "REGISTERED"
  | "NORMALIZED"
  | "VALIDATED"
  | "ACCEPTED"
  | "CONSUMED"
  | "SUPERSEDED"
  | "INVALIDATED";

/** P1 §9 trust classes. */
export type ReleaseEvidenceTrustClass =
  | "AUTHORITATIVE"
  | "SUPPORTING"
  | "DERIVED"
  | "STALE"
  | "CONFLICTING"
  | "MISSING"
  | "INVALID";

/** RELEASE validation outcome for an evidence item (not global release PASS). */
export type ReleaseEvidenceValidationOutcome =
  | "PASS"
  | "FAIL"
  | "CONDITIONAL"
  | "NOT_EVALUATED";

/** P1 §13 exception severity. */
export type ReleaseExceptionSeverity = "WARNING" | "BLOCKER";

/** P0.6 gate categories — relationships only; no criteria. */
export type ReleaseGateCategory =
  | "Functional"
  | "Architectural"
  | "Governance"
  | "Integration"
  | "Performance"
  | "Persistence/Data"
  | "Documentation"
  | "Regression"
  | "Security/Safety"
  | "Final Certification";

/** P1 §16 certification boundary levels. */
export type ReleaseCertificationBoundaryLevel =
  | "DOMAIN_CERTIFICATION"
  | "RELEASE_EVIDENCE_ACCEPTANCE"
  | "RELEASE_CERTIFICATION"
  | "PRODUCTION_RELEASE";

/** Completeness dimensions (P1 §11) — no thresholds. */
export type ReleaseCompletenessDimension =
  | "EXISTS"
  | "VALID"
  | "CURRENT"
  | "COVERS_SCOPE"
  | "TRACEABLE"
  | "SUFFICIENT_FOR_CERTIFICATION";

/** Traceability chain nodes (P1 §12). */
export type ReleaseTraceabilityNode =
  | "Domain"
  | "Capability"
  | "Certification"
  | "Evidence"
  | "Validation"
  | "Gate"
  | "ReleaseCandidate"
  | "ReleaseDecision";

export const RELEASE_EVIDENCE_LIFECYCLE_STATES = [
  "DISCOVERED",
  "REGISTERED",
  "NORMALIZED",
  "VALIDATED",
  "ACCEPTED",
  "CONSUMED",
  "SUPERSEDED",
  "INVALIDATED",
] as const satisfies readonly ReleaseEvidenceLifecycleState[];

export const RELEASE_GATE_CATEGORIES = [
  "Functional",
  "Architectural",
  "Governance",
  "Integration",
  "Performance",
  "Persistence/Data",
  "Documentation",
  "Regression",
  "Security/Safety",
  "Final Certification",
] as const satisfies readonly ReleaseGateCategory[];

export const RELEASE_CERTIFICATION_BOUNDARY_LEVELS = [
  "DOMAIN_CERTIFICATION",
  "RELEASE_EVIDENCE_ACCEPTANCE",
  "RELEASE_CERTIFICATION",
  "PRODUCTION_RELEASE",
] as const satisfies readonly ReleaseCertificationBoundaryLevel[];

export const RELEASE_TRACEABILITY_CHAIN = [
  "Domain",
  "Capability",
  "Certification",
  "Evidence",
  "Validation",
  "Gate",
  "ReleaseCandidate",
  "ReleaseDecision",
] as const satisfies readonly ReleaseTraceabilityNode[];
