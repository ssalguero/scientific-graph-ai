/**
 * AI-I8 — Extension Infrastructure phase markers.
 * Extension slots only. No assistants, prediction, or runtime AI.
 */

export const AI_EXTENSION_PHASE = "AI-I8" as const;

export const AI_EXTENSION_STATUS = "EXTENSION_INFRASTRUCTURE_COMPLETE" as const;

export type AiExtensionStatus = typeof AI_EXTENSION_STATUS;
