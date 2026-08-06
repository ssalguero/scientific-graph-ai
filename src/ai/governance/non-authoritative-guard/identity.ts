/**
 * AI-I6 — Non-Authoritative Intelligence Guard (AI-P3 §9.2).
 * Preserves Decision Authority and non-authoritative posture.
 * Never validates scientific truth. Never executes workflows.
 */

export const AI_NON_AUTHORITATIVE_GUARD_ID =
  "non-authoritative-intelligence-guard" as const;

export const AI_NON_AUTHORITATIVE_GUARD_PURPOSE =
  "Preserve non-authoritative / Decision Authority boundaries" as const;

export const AI_NON_AUTHORITATIVE_GUARD_RESPONSIBILITY =
  "Preserve non-authoritative posture of intelligence and Decision Authority boundaries" as const;

export const AI_NON_AUTHORITATIVE_GUARD_NEVER_OWNS = [
  "final-scientific-decision",
  "scientific-truth",
  "execution-decision",
] as const;

/** Decision Authority remains with the user / ENGINE path — never absorbed. */
export const AI_DECISION_AUTHORITY_PRESERVED = true as const;

export const AI_GUARD_VALIDATES_SCIENTIFIC_TRUTH = false as const;
export const AI_GUARD_EXECUTES_WORKFLOWS = false as const;

export type AiNonAuthoritativeGuardId = typeof AI_NON_AUTHORITATIVE_GUARD_ID;

export const AI_NON_AUTHORITATIVE_GUARD_LIFECYCLE = {
  capabilityId: AI_NON_AUTHORITATIVE_GUARD_ID,
  state: "inactive" as const,
  runtimeEnforcement: false as const,
  permissionSystem: false as const,
};
