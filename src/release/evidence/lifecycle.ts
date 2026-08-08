/**
 * RELEASE-P1 — Evidence lifecycle transitions (P1 §7).
 *
 * Evidence lifecycle only — NOT the P0 release-state machine (PLANNED→RELEASED).
 */

import type {
  ReleaseEvidenceLifecycleState,
  ReleaseEvidenceRecord,
} from "../types";

/** Allowed forward / terminal transitions. */
export const EVIDENCE_LIFECYCLE_TRANSITIONS: Readonly<
  Record<ReleaseEvidenceLifecycleState, readonly ReleaseEvidenceLifecycleState[]>
> = {
  DISCOVERED: ["REGISTERED", "INVALIDATED"],
  REGISTERED: ["NORMALIZED", "INVALIDATED"],
  NORMALIZED: ["VALIDATED", "INVALIDATED"],
  VALIDATED: ["ACCEPTED", "INVALIDATED"],
  ACCEPTED: ["CONSUMED", "SUPERSEDED", "INVALIDATED"],
  CONSUMED: ["SUPERSEDED", "INVALIDATED"],
  SUPERSEDED: [],
  INVALIDATED: [],
};

export type LifecycleTransitionResult =
  | { readonly ok: true; readonly record: ReleaseEvidenceRecord }
  | { readonly ok: false; readonly reason: string };

export function canTransitionEvidenceLifecycle(
  from: ReleaseEvidenceLifecycleState,
  to: ReleaseEvidenceLifecycleState,
): boolean {
  return EVIDENCE_LIFECYCLE_TRANSITIONS[from].includes(to);
}

export function transitionEvidenceLifecycle(
  record: ReleaseEvidenceRecord,
  to: ReleaseEvidenceLifecycleState,
): LifecycleTransitionResult {
  if (!canTransitionEvidenceLifecycle(record.lifecycleState, to)) {
    return {
      ok: false,
      reason: `Illegal evidence lifecycle transition ${record.lifecycleState} → ${to}`,
    };
  }
  return {
    ok: true,
    record: { ...record, lifecycleState: to },
  };
}

/** Consumed evidence must have been accepted first (invariant helper). */
export function isConsumableLifecycleState(
  state: ReleaseEvidenceLifecycleState,
): boolean {
  return state === "ACCEPTED" || state === "CONSUMED";
}
