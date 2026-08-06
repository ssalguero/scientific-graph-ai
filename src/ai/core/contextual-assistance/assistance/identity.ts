/**
 * AI-I3 — Contextual Assistance capability identity.
 *
 * Authority: AI-P3 §6.1 · AI-P2 Core Capabilities · AI-P6 AI-I3
 * Owns assistance capability identity only. No runtime assistance.
 */

export const AI_CONTEXTUAL_ASSISTANCE_ID = "contextual-assistance" as const;

export const AI_CONTEXTUAL_ASSISTANCE_PURPOSE =
  "Contextual scientific assistance" as const;

export const AI_CONTEXTUAL_ASSISTANCE_RESPONSIBILITY =
  "Assist users using available scientific and product context without owning that context" as const;

export const AI_CONTEXTUAL_ASSISTANCE_NEVER_OWNS = [
  "scientific-context-ownership",
  "product-context-ownership",
  "scientific-truth",
  "presentation",
] as const;

export type AiContextualAssistanceId = typeof AI_CONTEXTUAL_ASSISTANCE_ID;
