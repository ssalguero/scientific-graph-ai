/**
 * AI-I6 — Governance component registration.
 */

import { AI_CAPABILITY_GOVERNANCE_ID } from "../capability-governance";
import { AI_NON_AUTHORITATIVE_GUARD_ID } from "../non-authoritative-guard";
import { AI_OPTIONALITY_PRESERVATION_ID } from "../optionality-preservation";

export type AiGovernanceComponentId =
  | typeof AI_CAPABILITY_GOVERNANCE_ID
  | typeof AI_NON_AUTHORITATIVE_GUARD_ID
  | typeof AI_OPTIONALITY_PRESERVATION_ID;

export type AiGovernanceRegistration = {
  readonly id: AiGovernanceComponentId;
  readonly class: "governance";
  readonly phase: "AI-I6";
  readonly active: false;
  readonly runtimeGovernance: false;
};

export const AI_GOVERNANCE_REGISTRY: readonly AiGovernanceRegistration[] = [
  {
    id: AI_CAPABILITY_GOVERNANCE_ID,
    class: "governance",
    phase: "AI-I6",
    active: false,
    runtimeGovernance: false,
  },
  {
    id: AI_NON_AUTHORITATIVE_GUARD_ID,
    class: "governance",
    phase: "AI-I6",
    active: false,
    runtimeGovernance: false,
  },
  {
    id: AI_OPTIONALITY_PRESERVATION_ID,
    class: "governance",
    phase: "AI-I6",
    active: false,
    runtimeGovernance: false,
  },
] as const;

export const AI_GOVERNANCE_COMPONENT_COUNT = 3 as const;

export function listGovernanceComponentIds(): readonly AiGovernanceComponentId[] {
  return AI_GOVERNANCE_REGISTRY.map((c) => c.id);
}
