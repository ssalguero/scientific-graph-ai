/**
 * AI-I7 — Cross-Domain Integration barrel (package-internal).
 * Structural pathways only. No runtime communication, APIs, or providers.
 */

export { AI_INTEGRATION_PHASE, AI_INTEGRATION_STATUS } from "./status";
export type { AiIntegrationStatus } from "./status";

export {
  AI_DATA_INTEGRATION_ID,
  AI_DATA_INTEGRATION_PEER,
  AI_DATA_INTEGRATION_CONTRACT_CLASS,
  AI_DATA_INTEGRATION_PURPOSE,
  AI_DATA_INTEGRATION_NEVER_OWNS,
  AI_DATA_INTEGRATION_PATHWAY,
} from "./data-integration";
export type { AiDataIntegrationId } from "./data-integration";

export {
  AI_ENGINE_INTEGRATION_ID,
  AI_ENGINE_INTEGRATION_PEER,
  AI_ENGINE_INTEGRATION_CONTRACT_CLASS,
  AI_ENGINE_INTEGRATION_PURPOSE,
  AI_ENGINE_INTEGRATION_NEVER_OWNS,
  AI_ENGINE_EXECUTION_OWNER,
  AI_ENGINE_INTEGRATION_PATHWAY,
} from "./engine-integration";
export type { AiEngineIntegrationId } from "./engine-integration";

export {
  AI_UX_INTEGRATION_ID,
  AI_UX_INTEGRATION_PEER,
  AI_UX_INTEGRATION_CONTRACT_CLASS,
  AI_UX_INTEGRATION_PURPOSE,
  AI_UX_INTEGRATION_NEVER_OWNS,
  AI_PRESENTATION_OWNER,
  AI_UX_INTEGRATION_PATHWAY,
} from "./ux-integration";
export type { AiUxIntegrationId } from "./ux-integration";

export {
  AI_COORDINATION_PATHWAY_ID,
  AI_COORDINATION_PATHWAY,
} from "./coordination";
export type { AiCoordinationPathwayId } from "./coordination";

export {
  AI_EXPOSURE_PATHWAY_ID,
  AI_EXPOSURE_PATHWAY,
} from "./exposure";
export type { AiExposurePathwayId } from "./exposure";

export {
  AI_INTEGRATION_REGISTRY,
  AI_INTEGRATION_PATHWAY_COUNT,
  listIntegrationPathwayIds,
} from "./registration";
export type {
  AiIntegrationPathwayId,
  AiIntegrationRegistration,
} from "./registration";

export {
  composeIntegration,
  assertDataIntegrationNonMutating,
} from "./compose-integration";
export type { AiIntegrationSnapshot } from "./compose-integration";
