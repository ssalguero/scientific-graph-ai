/**
 * AI-I3 — Recommendation Production capability identity.
 *
 * Authority: AI-P3 §6.3 · AI-P0 Decision Authority
 * Suggestive recommendations — never commands or scientific verdicts.
 * No recommendations generated at runtime.
 */

export const AI_RECOMMENDATION_PRODUCTION_ID =
  "recommendation-production" as const;

export const AI_RECOMMENDATION_PRODUCTION_PURPOSE =
  "Suggestive recommendations (not commands)" as const;

export const AI_RECOMMENDATION_PRODUCTION_RESPONSIBILITY =
  "Provide suggestive recommendations that never become commands or scientific verdicts" as const;

export const AI_RECOMMENDATION_PRODUCTION_NEVER_OWNS = [
  "commands",
  "scientific-verdicts",
  "product-flow-execution",
] as const;

/** Recommendations never become execution commands (Decision Authority). */
export const AI_RECOMMENDATION_IS_COMMAND = false as const;

export type AiRecommendationProductionId =
  typeof AI_RECOMMENDATION_PRODUCTION_ID;
