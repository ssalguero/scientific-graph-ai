/**
 * COLLAB-I5 — Review Management identity (P3 C4).
 */

export const COLLAB_REVIEW_COMPONENT_ID = "C4" as const;

export const COLLAB_REVIEW_COMPONENT_NAME = "Review Management" as const;

export const COLLAB_REVIEW_PURPOSE =
  "Coordinate Reviews as collaboration metadata processes (≠ ENGINE Product Flows)" as const;

export const COLLAB_REVIEW_IDENTITY = {
  id: COLLAB_REVIEW_COMPONENT_ID,
  name: COLLAB_REVIEW_COMPONENT_NAME,
  purpose: COLLAB_REVIEW_PURPOSE,
  phase: "COLLAB-I5" as const,
  ownsScientificTruth: false as const,
  ownsWorkflowOrchestration: false as const,
  ownsPresentation: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
  equalsEngineWorkflow: false as const,
} as const;

export type CollabReviewIdentity = typeof COLLAB_REVIEW_IDENTITY;
