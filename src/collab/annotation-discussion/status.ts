/**
 * COLLAB-I4 — Annotation & Discussion phase markers.
 *
 * Authority: COLLAB-P6 I4 · COLLAB-P2 · COLLAB-P3 C5–C6 · COLLAB-P5 Collaborate.
 * Metadata only on peer identities. No review runtime (I5). No presence (I6).
 */

export const COLLAB_ANNOTATION_DISCUSSION_PHASE = "COLLAB-I4" as const;

export const COLLAB_ANNOTATION_DISCUSSION_STATUS =
  "ANNOTATION_DISCUSSION_COMPLETE" as const;

export type CollabAnnotationDiscussionStatus =
  typeof COLLAB_ANNOTATION_DISCUSSION_STATUS;
