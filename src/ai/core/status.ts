/**
 * AI-I2 — Core Intelligence phase markers.
 * Architectural readiness only. No runtime intelligence.
 */

export const AI_CORE_PHASE = "AI-I2" as const;

export const AI_CORE_STATUS = "CORE_INTELLIGENCE_COMPLETE" as const;

export type AiCoreStatus = typeof AI_CORE_STATUS;
