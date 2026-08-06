/**
 * AI-I3 — Contextual Assistance phase markers.
 * Architectural readiness only. No runtime assistance.
 */

export const AI_CONTEXTUAL_ASSISTANCE_PHASE = "AI-I3" as const;

export const AI_CONTEXTUAL_ASSISTANCE_STATUS =
  "CONTEXTUAL_ASSISTANCE_COMPLETE" as const;

export type AiContextualAssistanceStatus =
  typeof AI_CONTEXTUAL_ASSISTANCE_STATUS;
