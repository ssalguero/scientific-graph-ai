/**
 * COLLAB-I5 — Review lifecycle stages (P5 Review → Revise → Approve).
 *
 * Archive and I6+ accompaniment (presence/session/activity/notifications)
 * remain DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE.
 */

export const COLLAB_I5_LIFECYCLE_STAGES = [
  "Review",
  "Revise",
  "Approve",
] as const;

export type CollabI5LifecycleStage = (typeof COLLAB_I5_LIFECYCLE_STAGES)[number];

export const COLLAB_I5_LIFECYCLE_MEANINGS = {
  Review:
    "Structured Review metadata process over certified peer identities (Review Management)",
  Revise:
    "Collaboration metadata requesting or recording revision intent; scientific mutation remains peer-owned",
  Approve:
    "Review outcome recorded as collaboration metadata — not scientific certification by COLLAB",
} as const satisfies Record<CollabI5LifecycleStage, string>;

/** Legal transitions for I5 lifecycle adherence (P5 §transitions). */
export const COLLAB_I5_LEGAL_TRANSITIONS = [
  { from: "Review", to: "Revise" },
  { from: "Revise", to: "Review" },
  { from: "Review", to: "Approve" },
] as const satisfies ReadonlyArray<{
  readonly from: CollabI5LifecycleStage;
  readonly to: CollabI5LifecycleStage;
}>;

export const COLLAB_I5_DEFERRED_LIFECYCLE_STAGES = ["Archive"] as const;

export const COLLAB_I5_INITIAL_STAGE = "Review" as const satisfies CollabI5LifecycleStage;

export function isCollabI5LifecycleStage(
  value: string,
): value is CollabI5LifecycleStage {
  return (COLLAB_I5_LIFECYCLE_STAGES as readonly string[]).includes(value);
}

export function isLegalCollabI5Transition(
  from: CollabI5LifecycleStage,
  to: CollabI5LifecycleStage,
): boolean {
  return COLLAB_I5_LEGAL_TRANSITIONS.some((t) => t.from === from && t.to === to);
}
