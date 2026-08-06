/**
 * AI-I4 — Core capabilities completion phase markers.
 * Completes the Core capability set (AI-I2…AI-I4). No runtime AI.
 */

export const AI_CORE_CAPABILITIES_PHASE = "AI-I4" as const;

export const AI_CORE_CAPABILITIES_STATUS = "CORE_CAPABILITIES_COMPLETE" as const;

export type AiCoreCapabilitiesStatus = typeof AI_CORE_CAPABILITIES_STATUS;
