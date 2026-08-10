/**
 * COLLAB-I8 — AI peer-only boundary (P1 · P4 §4.4).
 *
 * No `@/ai` dependency edge. Collaborative AI remains Future Evolution.
 * Does not import the AI package.
 */

export const COLLAB_AI_PEER_SEAM_ID = "collab-ai-peer" as const;

export type CollabAiPeerBoundary = {
  readonly seamId: typeof COLLAB_AI_PEER_SEAM_ID;
  readonly dependencyEdge: false;
  readonly collaborativeAiInV1: false;
  readonly neverOwnsReasoning: true;
  readonly mayExposeCollaborationContextMetadata: true;
};

/** Assert AI remains peer-only relative to COLLAB (no dependency edge). */
export function assertAiPeerOnlyBoundary(): CollabAiPeerBoundary {
  return {
    seamId: COLLAB_AI_PEER_SEAM_ID,
    dependencyEdge: false,
    collaborativeAiInV1: false,
    neverOwnsReasoning: true,
    mayExposeCollaborationContextMetadata: true,
  };
}
