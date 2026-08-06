/**
 * AI-I6 — Capability Governance identity (AI-P3 §9.1).
 * Owns governance capability identity. Never owns implementation or execution.
 */

export const AI_CAPABILITY_GOVERNANCE_ID = "capability-governance" as const;

export const AI_CAPABILITY_GOVERNANCE_PURPOSE =
  "Define, evolve, govern capabilities (Capability Authority)" as const;

export const AI_CAPABILITY_GOVERNANCE_RESPONSIBILITY =
  "Exercise Capability Authority over definition, evolution, and governance of intelligence capabilities" as const;

export const AI_CAPABILITY_GOVERNANCE_NEVER_OWNS = [
  "peer-domain-capabilities",
  "scientific-truth",
  "workflow-execution",
  "presentation",
  "implementation-runtime",
] as const;

export type AiCapabilityGovernanceId = typeof AI_CAPABILITY_GOVERNANCE_ID;

export const AI_CAPABILITY_GOVERNANCE_LIFECYCLE = {
  capabilityId: AI_CAPABILITY_GOVERNANCE_ID,
  state: "inactive" as const,
  runtimeGovernance: false as const,
  policyEngine: false as const,
};
