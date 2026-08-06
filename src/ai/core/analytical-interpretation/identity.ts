/**
 * AI-I4 — Analytical Interpretation Support capability identity.
 *
 * Authority: AI-P3 §6.6 · AI-P6 AI-I4
 * Never certifies scientific correctness. Never owns DATA.
 */

export const AI_ANALYTICAL_INTERPRETATION_ID =
  "analytical-interpretation-support" as const;

export const AI_ANALYTICAL_INTERPRETATION_PURPOSE =
  "Non-authoritative interpretation support" as const;

export const AI_ANALYTICAL_INTERPRETATION_RESPONSIBILITY =
  "Support interpretation of scientific information without certifying scientific correctness" as const;

export const AI_ANALYTICAL_INTERPRETATION_NEVER_OWNS = [
  "scientific-correctness-certification",
  "scientific-truth",
] as const;

/** Interpretation never certifies scientific correctness. */
export const AI_ANALYTICAL_INTERPRETATION_CERTIFIES_CORRECTNESS = false as const;

export type AiAnalyticalInterpretationId =
  typeof AI_ANALYTICAL_INTERPRETATION_ID;
