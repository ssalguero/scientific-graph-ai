/**
 * AI-I3 — Explanation Production capability identity.
 *
 * Authority: AI-P3 §6.4 · Scientific Principles (Explainability First)
 * Explainability of produced intelligence — no explanations generated at runtime.
 */

export const AI_EXPLANATION_PRODUCTION_ID = "explanation-production" as const;

export const AI_EXPLANATION_PRODUCTION_PURPOSE =
  "Explainability of produced intelligence" as const;

export const AI_EXPLANATION_PRODUCTION_RESPONSIBILITY =
  "Provide explainable accounts of why intelligence was produced" as const;

export const AI_EXPLANATION_PRODUCTION_NEVER_OWNS = [
  "scientific-certification",
  "opaque-automation-ownership",
] as const;

export type AiExplanationProductionId = typeof AI_EXPLANATION_PRODUCTION_ID;
