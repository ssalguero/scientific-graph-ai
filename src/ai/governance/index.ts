/**
 * AI-I6 — Governance Components barrel (package-internal).
 * No runtime governance, policy engines, or enforcement.
 */

export { AI_GOVERNANCE_PHASE, AI_GOVERNANCE_STATUS } from "./status";
export type { AiGovernanceStatus } from "./status";

export {
  AI_CAPABILITY_GOVERNANCE_ID,
  AI_CAPABILITY_GOVERNANCE_PURPOSE,
  AI_CAPABILITY_GOVERNANCE_RESPONSIBILITY,
  AI_CAPABILITY_GOVERNANCE_NEVER_OWNS,
  AI_CAPABILITY_GOVERNANCE_LIFECYCLE,
} from "./capability-governance";
export type { AiCapabilityGovernanceId } from "./capability-governance";

export {
  AI_NON_AUTHORITATIVE_GUARD_ID,
  AI_NON_AUTHORITATIVE_GUARD_PURPOSE,
  AI_NON_AUTHORITATIVE_GUARD_RESPONSIBILITY,
  AI_NON_AUTHORITATIVE_GUARD_NEVER_OWNS,
  AI_DECISION_AUTHORITY_PRESERVED,
  AI_GUARD_VALIDATES_SCIENTIFIC_TRUTH,
  AI_GUARD_EXECUTES_WORKFLOWS,
  AI_NON_AUTHORITATIVE_GUARD_LIFECYCLE,
} from "./non-authoritative-guard";
export type { AiNonAuthoritativeGuardId } from "./non-authoritative-guard";

export {
  AI_OPTIONALITY_PRESERVATION_ID,
  AI_OPTIONALITY_PRESERVATION_PURPOSE,
  AI_OPTIONALITY_PRESERVATION_RESPONSIBILITY,
  AI_OPTIONALITY_PRESERVATION_NEVER_OWNS,
  AI_OPTIONAL_PRESERVED,
  AI_MANDATORY_FOR_SCIENTIFIC_CORRECTNESS,
  AI_OPTIONALITY_PRESERVATION_LIFECYCLE,
} from "./optionality-preservation";
export type { AiOptionalityPreservationId } from "./optionality-preservation";

export {
  AI_GOVERNANCE_REGISTRY,
  AI_GOVERNANCE_COMPONENT_COUNT,
  listGovernanceComponentIds,
} from "./registration";
export type {
  AiGovernanceComponentId,
  AiGovernanceRegistration,
} from "./registration";

export { composeGovernance, assertGovernanceInactive } from "./compose-governance";
export type { AiGovernanceSnapshot } from "./compose-governance";
