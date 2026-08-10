/**
 * COLLAB-I1 — Infrastructure phase markers.
 *
 * Authority: COLLAB-P6 I1 · COLLAB-P4 · COLLAB-P3.
 * Public contract surface skeleton only. No concrete schemas. No collaboration runtime.
 */

export const COLLAB_INFRASTRUCTURE_PHASE = "COLLAB-I1" as const;

export const COLLAB_INFRASTRUCTURE_STATUS = "INFRASTRUCTURE_COMPLETE" as const;

export type CollabInfrastructureStatus = typeof COLLAB_INFRASTRUCTURE_STATUS;
