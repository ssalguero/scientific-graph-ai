/**
 * AI-I5 — Assumption & Confidence Indication identity (AI-P3 §7.3).
 * Conceptual transparency indicators — not scoring engines or scientific certification.
 */

export const AI_ASSUMPTION_CONFIDENCE_ID =
  "assumption-confidence-indication" as const;

export const AI_ASSUMPTION_CONFIDENCE_PURPOSE =
  "Conceptual transparency indicators (not scoring engines)" as const;

export const AI_ASSUMPTION_CONFIDENCE_RESPONSIBILITY =
  "Accompany intelligence with conceptual assumption and confidence indication; never scientific certification" as const;

export const AI_ASSUMPTION_CONFIDENCE_NEVER_OWNS = [
  "scoring-engines",
  "scientific-certification",
  "statistical-authority-over-truth",
] as const;

export const AI_ASSUMPTION_CONFIDENCE_IS_CERTIFICATION = false as const;

export type AiAssumptionConfidenceId = typeof AI_ASSUMPTION_CONFIDENCE_ID;

export const AI_ASSUMPTION_CONFIDENCE_LIFECYCLE = {
  capabilityId: AI_ASSUMPTION_CONFIDENCE_ID,
  state: "inactive" as const,
  runtimeIndication: false as const,
  scoringEngine: false as const,
};
