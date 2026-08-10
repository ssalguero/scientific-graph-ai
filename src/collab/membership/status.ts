/**
 * COLLAB-I2 — Sharing & Membership phase markers.
 *
 * Authority: COLLAB-P6 I2 · COLLAB-P2 · COLLAB-P3 C2 · COLLAB-P5 Share/Join.
 * Metadata only. No permission evaluation (I3). No peer runtime integration (I8).
 */

export const COLLAB_SHARING_MEMBERSHIP_PHASE = "COLLAB-I2" as const;

export const COLLAB_SHARING_MEMBERSHIP_STATUS =
  "SHARING_MEMBERSHIP_COMPLETE" as const;

export type CollabSharingMembershipStatus =
  typeof COLLAB_SHARING_MEMBERSHIP_STATUS;
