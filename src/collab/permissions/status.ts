/**
 * COLLAB-I3 — Permissions phase markers.
 *
 * Authority: COLLAB-P6 I3 · COLLAB-P2 · COLLAB-P3 C3 · COLLAB-P4.
 * Permission Service evaluation only. No annotations / presence / peer integration.
 */

export const COLLAB_PERMISSIONS_PHASE = "COLLAB-I3" as const;

export const COLLAB_PERMISSIONS_STATUS = "PERMISSIONS_COMPLETE" as const;

export type CollabPermissionsStatus = typeof COLLAB_PERMISSIONS_STATUS;
