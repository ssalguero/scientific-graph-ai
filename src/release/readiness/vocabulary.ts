/**
 * RELEASE-P2 — Readiness & gate vocabulary (extends P1; does not replace it).
 */

import type { ReleaseGateCategory } from "../types";

/** D-P2-01 readiness states. */
export type ReleaseReadinessState =
  | "READY"
  | "NOT_READY"
  | "PENDING"
  | "BLOCKED";

/** D-P2-05 / D-P2-09 gate IDs and states. */
export type ReleaseGateId =
  | "FUNCTIONAL"
  | "ARCHITECTURAL"
  | "GOVERNANCE"
  | "INTEGRATION"
  | "PERFORMANCE"
  | "PERSISTENCE_DATA"
  | "DOCUMENTATION"
  | "REGRESSION"
  | "SECURITY_SAFETY"
  | "FINAL_CERTIFICATION";

export type ReleaseGateState =
  | "NOT_EVALUATED"
  | "READY"
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "WAIVED";

export type ReadinessAssessmentAspect =
  | "complete"
  | "incomplete"
  | "valid"
  | "stale"
  | "conflicting"
  | "blocker"
  | "limitation"
  | "warning";

export const RELEASE_READINESS_STATES = [
  "READY",
  "NOT_READY",
  "PENDING",
  "BLOCKED",
] as const satisfies readonly ReleaseReadinessState[];

export const RELEASE_GATE_IDS = [
  "FUNCTIONAL",
  "ARCHITECTURAL",
  "GOVERNANCE",
  "INTEGRATION",
  "PERFORMANCE",
  "PERSISTENCE_DATA",
  "DOCUMENTATION",
  "REGRESSION",
  "SECURITY_SAFETY",
  "FINAL_CERTIFICATION",
] as const satisfies readonly ReleaseGateId[];

export const RELEASE_GATE_STATES = [
  "NOT_EVALUATED",
  "READY",
  "PASS",
  "FAIL",
  "BLOCKED",
  "WAIVED",
] as const satisfies readonly ReleaseGateState[];

/** Map P2 gate IDs ↔ P1 ReleaseGateCategory labels (compatible, non-forking). */
export const GATE_ID_TO_P1_CATEGORY: Readonly<
  Record<ReleaseGateId, ReleaseGateCategory>
> = {
  FUNCTIONAL: "Functional",
  ARCHITECTURAL: "Architectural",
  GOVERNANCE: "Governance",
  INTEGRATION: "Integration",
  PERFORMANCE: "Performance",
  PERSISTENCE_DATA: "Persistence/Data",
  DOCUMENTATION: "Documentation",
  REGRESSION: "Regression",
  SECURITY_SAFETY: "Security/Safety",
  FINAL_CERTIFICATION: "Final Certification",
};

export const CATEGORY_GATES: readonly ReleaseGateId[] = [
  "FUNCTIONAL",
  "ARCHITECTURAL",
  "GOVERNANCE",
  "INTEGRATION",
  "PERFORMANCE",
  "PERSISTENCE_DATA",
  "DOCUMENTATION",
  "REGRESSION",
  "SECURITY_SAFETY",
] as const;

export function isReleaseReadinessState(
  value: string,
): value is ReleaseReadinessState {
  return (RELEASE_READINESS_STATES as readonly string[]).includes(value);
}

export function isReleaseGateId(value: string): value is ReleaseGateId {
  return (RELEASE_GATE_IDS as readonly string[]).includes(value);
}

export function isReleaseGateState(value: string): value is ReleaseGateState {
  return (RELEASE_GATE_STATES as readonly string[]).includes(value);
}
