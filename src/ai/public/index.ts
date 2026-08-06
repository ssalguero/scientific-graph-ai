/**
 * AI public aggregate — phase status markers only.
 * Does not re-export core wiring, capability registry, or infrastructure internals.
 */

export {
  AI_DOMAIN_ID,
  AI_DOMAIN_PRODUCT_NAME,
  AI_DOMAIN_ARCHITECTURAL_ROLE,
  AI_DOMAIN_MOTTO,
  AI_FOUNDATION_PHASE,
  AI_FOUNDATION_STATUS,
  AI_FOUNDATION_IDENTITY,
} from "../foundation";

export type { AiFoundationIdentity, AiFoundationStatus } from "../foundation";

export {
  AI_INFRASTRUCTURE_PHASE,
  AI_INFRASTRUCTURE_STATUS,
} from "../infrastructure/status";

export type { AiInfrastructureStatus } from "../infrastructure/status";

export { AI_CORE_PHASE, AI_CORE_STATUS } from "../core/status";

export type { AiCoreStatus } from "../core/status";

export {
  AI_CONTEXTUAL_ASSISTANCE_PHASE,
  AI_CONTEXTUAL_ASSISTANCE_STATUS,
} from "../core/contextual-assistance/status";

export type { AiContextualAssistanceStatus } from "../core/contextual-assistance/status";

export {
  AI_CORE_CAPABILITIES_PHASE,
  AI_CORE_CAPABILITIES_STATUS,
} from "../core/core-capabilities-status";

export type { AiCoreCapabilitiesStatus } from "../core/core-capabilities-status";

export { AI_SUPPORTING_PHASE, AI_SUPPORTING_STATUS } from "../supporting/status";

export type { AiSupportingStatus } from "../supporting/status";

export { AI_GOVERNANCE_PHASE, AI_GOVERNANCE_STATUS } from "../governance/status";

export type { AiGovernanceStatus } from "../governance/status";

export { AI_INTEGRATION_PHASE, AI_INTEGRATION_STATUS } from "../integration/status";

export type { AiIntegrationStatus } from "../integration/status";

export { AI_EXTENSION_PHASE, AI_EXTENSION_STATUS } from "../extension/status";

export type { AiExtensionStatus } from "../extension/status";

export {
  AI_HARDENING_PHASE,
  AI_HARDENING_STATUS,
  AI_CERTIFICATION_READY,
} from "../hardening/status";

export type { AiHardeningStatus } from "../hardening/status";

export {
  AI_CERTIFICATION_PHASE,
  AI_CERTIFICATION_STATUS,
  AI_DOMAIN_STATUS,
  AI_IMPLEMENTATION_SERIES_CLOSED,
} from "../certification/status";

export type { AiCertificationStatus, AiDomainStatus } from "../certification/status";
