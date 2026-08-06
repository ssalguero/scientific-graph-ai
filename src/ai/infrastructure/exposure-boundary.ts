/**
 * AI-I1 — Intelligence Exposure Boundary (structural skeleton).
 *
 * Authority: AI-P3 §11.1 · AI-P4 Exposure Rules · AI-P6 AI-I1
 * Conceptual outward face of intelligence to peers.
 * Not an API. Not a consumer surface. No runtime behavior.
 */

export const AI_EXPOSURE_BOUNDARY_ID = "intelligence-exposure-boundary" as const;

export const AI_EXPOSURE_BOUNDARY_PURPOSE =
  "Conceptual outward face of intelligence to peer domains" as const;

/** Ownership quartet — what this boundary never owns (AI-P3). */
export const AI_EXPOSURE_BOUNDARY_NEVER_OWNS = [
  "apis",
  "contracts-as-runtime",
  "presentation",
  "peer-consumption-machinery",
  "scientific-truth",
  "workflow-execution",
] as const;

export type AiExposureBoundaryId = typeof AI_EXPOSURE_BOUNDARY_ID;
