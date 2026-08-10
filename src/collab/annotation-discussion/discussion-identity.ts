/**
 * COLLAB-I4 — Discussion Management identity (P3 C6).
 */

export const COLLAB_DISCUSSION_COMPONENT_ID = "C6" as const;

export const COLLAB_DISCUSSION_COMPONENT_NAME =
  "Discussion Management" as const;

export const COLLAB_DISCUSSION_PURPOSE =
  "Host Discussion threads as collaboration metadata about certified peer entities" as const;

export const COLLAB_DISCUSSION_IDENTITY = {
  id: COLLAB_DISCUSSION_COMPONENT_ID,
  name: COLLAB_DISCUSSION_COMPONENT_NAME,
  purpose: COLLAB_DISCUSSION_PURPOSE,
  phase: "COLLAB-I4" as const,
  ownsScientificTruth: false as const,
  ownsWorkflowOrchestration: false as const,
  ownsPresentation: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
} as const;

export type CollabDiscussionIdentity = typeof COLLAB_DISCUSSION_IDENTITY;
