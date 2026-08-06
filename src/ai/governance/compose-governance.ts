/**
 * AI-I6 — Governance composition (structural only).
 * No policy evaluation. No enforcement. No authorization engine.
 */

import {
  AI_DECISION_AUTHORITY_PRESERVED,
} from "./non-authoritative-guard";
import {
  AI_MANDATORY_FOR_SCIENTIFIC_CORRECTNESS,
  AI_OPTIONAL_PRESERVED,
} from "./optionality-preservation";
import { AI_GOVERNANCE_REGISTRY } from "./registration";
import { AI_GOVERNANCE_PHASE, AI_GOVERNANCE_STATUS } from "./status";

export type AiGovernanceSnapshot = {
  readonly phase: typeof AI_GOVERNANCE_PHASE;
  readonly status: typeof AI_GOVERNANCE_STATUS;
  readonly componentCount: number;
  readonly decisionAuthorityPreserved: typeof AI_DECISION_AUTHORITY_PRESERVED;
  readonly aiOptionalPreserved: typeof AI_OPTIONAL_PRESERVED;
  readonly mandatoryForScientificCorrectness: typeof AI_MANDATORY_FOR_SCIENTIFIC_CORRECTNESS;
  readonly runtimeGovernance: false;
  readonly policyEngine: false;
  readonly permissionSystem: false;
};

export function composeGovernance(): AiGovernanceSnapshot {
  return {
    phase: AI_GOVERNANCE_PHASE,
    status: AI_GOVERNANCE_STATUS,
    componentCount: AI_GOVERNANCE_REGISTRY.length,
    decisionAuthorityPreserved: AI_DECISION_AUTHORITY_PRESERVED,
    aiOptionalPreserved: AI_OPTIONAL_PRESERVED,
    mandatoryForScientificCorrectness: AI_MANDATORY_FOR_SCIENTIFIC_CORRECTNESS,
    runtimeGovernance: false,
    policyEngine: false,
    permissionSystem: false,
  };
}

export function assertGovernanceInactive(): boolean {
  return !AI_GOVERNANCE_REGISTRY.some((c) => c.active);
}
