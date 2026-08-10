/**
 * COLLAB-I6 — Activity Timeline identity (P3 C8).
 */

export const COLLAB_ACTIVITY_COMPONENT_ID = "C8" as const;

export const COLLAB_ACTIVITY_COMPONENT_NAME = "Activity Timeline" as const;

export const COLLAB_ACTIVITY_PURPOSE =
  "Auditable chronological record of collaboration actions (≠ Scientific History)" as const;

export const COLLAB_ACTIVITY_IDENTITY = {
  id: COLLAB_ACTIVITY_COMPONENT_ID,
  name: COLLAB_ACTIVITY_COMPONENT_NAME,
  purpose: COLLAB_ACTIVITY_PURPOSE,
  phase: "COLLAB-I6" as const,
  ownsScientificTruth: false as const,
  equalsScientificHistory: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
} as const;

export type CollabActivityIdentity = typeof COLLAB_ACTIVITY_IDENTITY;
