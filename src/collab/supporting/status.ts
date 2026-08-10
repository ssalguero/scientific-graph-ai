/**
 * COLLAB-I6 — Supporting (Presence, Session, Activity, Notifications) status.
 */

export const COLLAB_SUPPORTING_PHASE = "COLLAB-I6" as const;

export const COLLAB_SUPPORTING_STATUS = "SUPPORTING_COMPLETE" as const;

export type CollabSupportingStatus = typeof COLLAB_SUPPORTING_STATUS;
