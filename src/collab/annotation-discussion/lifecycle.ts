/**
 * COLLAB-I4 — Collaborate lifecycle stage (P5).
 *
 * I4 realizes Collaborate for annotation/discussion metadata only.
 * Review+ stages are DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE.
 */

export const COLLAB_I4_LIFECYCLE_STAGE = "Collaborate" as const;

export type CollabI4LifecycleStage = typeof COLLAB_I4_LIFECYCLE_STAGE;

export const COLLAB_I4_LIFECYCLE_MEANING =
  "Ongoing collaboration metadata activity: annotations, scientific comments, discussions" as const;

export const COLLAB_I4_DEFERRED_LIFECYCLE_STAGES = [
  "Review",
  "Revise",
  "Approve",
  "Archive",
] as const;
