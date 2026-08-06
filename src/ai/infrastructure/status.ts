/**
 * AI-I1 — Infrastructure phase markers.
 * No runtime intelligence. No APIs.
 */

export const AI_INFRASTRUCTURE_PHASE = "AI-I1" as const;

export const AI_INFRASTRUCTURE_STATUS = "INFRASTRUCTURE_COMPLETE" as const;

export type AiInfrastructureStatus = typeof AI_INFRASTRUCTURE_STATUS;
