/**
 * COLLAB-I2 — Share / Join lifecycle stage markers (P5).
 *
 * I2 realizes Share → Join only. Later stages are
 * DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE.
 */

export const COLLAB_I2_LIFECYCLE_STAGES = ["Share", "Join"] as const;

export type CollabI2LifecycleStage = (typeof COLLAB_I2_LIFECYCLE_STAGES)[number];

/** Full P5 chain cited for boundary; only Share/Join are in I2 scope. */
export const COLLAB_LIFECYCLE_CHAIN_CITED = [
  "Share",
  "Join",
  "Collaborate",
  "Review",
  "Revise",
  "Approve",
  "Archive",
] as const;

export const COLLAB_I2_LIFECYCLE_MEANING = {
  Share:
    "Shared Project / Workspace made available for collaborative participation",
  Join: "Actor obtains Membership under a conceptual Role",
} as const satisfies Record<CollabI2LifecycleStage, string>;

export const COLLAB_I2_DEFERRED_LIFECYCLE_STAGES = [
  "Collaborate",
  "Review",
  "Revise",
  "Approve",
  "Archive",
] as const;
