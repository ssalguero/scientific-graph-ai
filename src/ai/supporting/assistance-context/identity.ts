/**
 * AI-I5 — Assistance Context identity (AI-P3 §7.1).
 * Never owns product/scientific context systems or user persistence.
 */

export const AI_ASSISTANCE_CONTEXT_ID = "assistance-context" as const;

export const AI_ASSISTANCE_CONTEXT_PURPOSE =
  "Conceptual product / scientific / user context dimensions" as const;

export const AI_ASSISTANCE_CONTEXT_RESPONSIBILITY =
  "Represent conceptual assistance context spanning product, scientific, and user dimensions available through proper domain boundaries" as const;

export const AI_ASSISTANCE_CONTEXT_NEVER_OWNS = [
  "product-context-systems",
  "scientific-knowledge-stores",
  "user-persistence",
] as const;

export type AiAssistanceContextId = typeof AI_ASSISTANCE_CONTEXT_ID;

export const AI_ASSISTANCE_CONTEXT_LIFECYCLE = {
  capabilityId: AI_ASSISTANCE_CONTEXT_ID,
  state: "inactive" as const,
  runtimeContext: false as const,
};
