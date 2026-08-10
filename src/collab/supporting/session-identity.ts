/**
 * COLLAB-I6 — Collaboration Session identity (P3 C10).
 */

export const COLLAB_SESSION_COMPONENT_ID = "C10" as const;

export const COLLAB_SESSION_COMPONENT_NAME = "Collaboration Session" as const;

export const COLLAB_SESSION_PURPOSE =
  "Multi-participant collaboration participation context (≠ ENGINE Session)" as const;

export const COLLAB_SESSION_IDENTITY = {
  id: COLLAB_SESSION_COMPONENT_ID,
  name: COLLAB_SESSION_COMPONENT_NAME,
  purpose: COLLAB_SESSION_PURPOSE,
  phase: "COLLAB-I6" as const,
  ownsScientificTruth: false as const,
  equalsEngineSession: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
} as const;

export type CollabSessionIdentity = typeof COLLAB_SESSION_IDENTITY;
