/**
 * RELEASE-P2 — Readiness traceability chain (D-P2-14).
 */

export const READINESS_TRACEABILITY_CHAIN = [
  "Domain",
  "Capability",
  "Certification",
  "Evidence",
  "EvidenceValidation",
  "Gate",
  "GateResult",
  "ReadinessAssessment",
  "ReleaseCertification",
  "FutureReleaseCandidate",
] as const;

export type ReadinessTraceabilityNode =
  (typeof READINESS_TRACEABILITY_CHAIN)[number];

export function listReadinessTraceabilityChain(): readonly ReadinessTraceabilityNode[] {
  return READINESS_TRACEABILITY_CHAIN;
}

/** P2 stops before RC promotion. */
export function futureReleaseCandidatePromotionEnabled(): false {
  return false;
}
