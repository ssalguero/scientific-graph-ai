/**
 * COLLAB-I9 — Hardening status markers.
 */

export const COLLAB_HARDENING_PHASE = "COLLAB-I9" as const;

export const COLLAB_HARDENING_STATUS = "HARDENING_COMPLETE" as const;

export type CollabHardeningStatus = typeof COLLAB_HARDENING_STATUS;
