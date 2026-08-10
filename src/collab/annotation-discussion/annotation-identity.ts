/**
 * COLLAB-I4 — Annotation Management identity (P3 C5).
 */

export const COLLAB_ANNOTATION_COMPONENT_ID = "C5" as const;

export const COLLAB_ANNOTATION_COMPONENT_NAME =
  "Annotation Management" as const;

export const COLLAB_ANNOTATION_PURPOSE =
  "Attach Annotations and Scientific Comments as collaboration metadata on peer identities" as const;

export const COLLAB_ANNOTATION_IDENTITY = {
  id: COLLAB_ANNOTATION_COMPONENT_ID,
  name: COLLAB_ANNOTATION_COMPONENT_NAME,
  purpose: COLLAB_ANNOTATION_PURPOSE,
  phase: "COLLAB-I4" as const,
  ownsScientificTruth: false as const,
  ownsWorkflowOrchestration: false as const,
  ownsPresentation: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
} as const;

export type CollabAnnotationIdentity = typeof COLLAB_ANNOTATION_IDENTITY;
