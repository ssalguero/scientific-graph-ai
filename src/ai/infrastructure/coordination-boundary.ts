/**
 * AI-I1 — Coordination Boundary (structural skeleton).
 *
 * Authority: AI-P3 §11.2 · AI-P4 · AI-P6 AI-I1
 * Conceptual participation under ENGINE coordination.
 * Never owns Product Flows or workflow execution.
 * Not an API. No runtime behavior.
 */

export const AI_COORDINATION_BOUNDARY_ID = "coordination-boundary" as const;

export const AI_COORDINATION_BOUNDARY_PURPOSE =
  "Conceptual participation of AI under ENGINE coordination authority" as const;

export const AI_COORDINATION_BOUNDARY_NEVER_OWNS = [
  "product-flows",
  "workflow-execution",
  "engine-coordination-ownership",
  "scientific-truth",
  "presentation",
] as const;

/** ENGINE remains sole coordination owner (AI Optional · Decision Authority). */
export const AI_COORDINATION_OWNER = "ENGINE" as const;

export type AiCoordinationBoundaryId = typeof AI_COORDINATION_BOUNDARY_ID;
