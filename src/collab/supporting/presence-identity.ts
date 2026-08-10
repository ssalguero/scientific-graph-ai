/**
 * COLLAB-I6 — Presence Service identity (P3 C7).
 */

export const COLLAB_PRESENCE_COMPONENT_ID = "C7" as const;

export const COLLAB_PRESENCE_COMPONENT_NAME = "Presence Service" as const;

export const COLLAB_PRESENCE_PURPOSE =
  "Presence awareness without mutating science or blocking peers (async metadata)" as const;

export const COLLAB_PRESENCE_IDENTITY = {
  id: COLLAB_PRESENCE_COMPONENT_ID,
  name: COLLAB_PRESENCE_COMPONENT_NAME,
  purpose: COLLAB_PRESENCE_PURPOSE,
  phase: "COLLAB-I6" as const,
  ownsScientificTruth: false as const,
  ownsWorkflowOrchestration: false as const,
  ownsPresentation: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
  realtime: false as const,
} as const;

export type CollabPresenceIdentity = typeof COLLAB_PRESENCE_IDENTITY;
