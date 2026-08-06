/**
 * AI-I2 — Intelligence Generation capability identity.
 *
 * Authority: AI-P3 §6.2 · AI-P2 Core Capabilities · AI-P1 Architectural Authority
 * Owns capability identity only. Does not generate intelligence at runtime.
 */

export const AI_INTELLIGENCE_GENERATION_ID = "intelligence-generation" as const;

export const AI_INTELLIGENCE_GENERATION_PURPOSE =
  "Produce non-authoritative intelligence" as const;

export const AI_INTELLIGENCE_GENERATION_RESPONSIBILITY =
  "Produce non-authoritative intelligence in support of scientific work" as const;

export const AI_INTELLIGENCE_GENERATION_NEVER_OWNS = [
  "scientific-truth",
  "workflow-execution",
  "presentation",
  "peer-domain-ownership",
] as const;

/** Architectural posture — never authoritative scientific verdicts. */
export const AI_INTELLIGENCE_GENERATION_AUTHORITATIVE = false as const;

export type AiIntelligenceGenerationId = typeof AI_INTELLIGENCE_GENERATION_ID;
