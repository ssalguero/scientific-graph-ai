/**
 * COLLAB-I5 — Review & Lifecycle status markers.
 */

export const COLLAB_REVIEW_MANAGEMENT_PHASE = "COLLAB-I5" as const;

export const COLLAB_REVIEW_MANAGEMENT_STATUS =
  "REVIEW_LIFECYCLE_COMPLETE" as const;

export type CollabReviewManagementStatus =
  typeof COLLAB_REVIEW_MANAGEMENT_STATUS;
