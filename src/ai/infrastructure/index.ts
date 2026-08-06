/**
 * AI-I1 — Infrastructure barrel (package-internal).
 *
 * Structural readiness only. Do not import from outside `@/ai`.
 * No intelligence. No providers. No prompts. No runtime AI.
 */

export {
  AI_INFRASTRUCTURE_PHASE,
  AI_INFRASTRUCTURE_STATUS,
} from "./status";
export type { AiInfrastructureStatus } from "./status";

export {
  AI_EXPOSURE_BOUNDARY_ID,
  AI_EXPOSURE_BOUNDARY_PURPOSE,
  AI_EXPOSURE_BOUNDARY_NEVER_OWNS,
} from "./exposure-boundary";
export type { AiExposureBoundaryId } from "./exposure-boundary";

export {
  AI_COORDINATION_BOUNDARY_ID,
  AI_COORDINATION_BOUNDARY_PURPOSE,
  AI_COORDINATION_BOUNDARY_NEVER_OWNS,
  AI_COORDINATION_OWNER,
} from "./coordination-boundary";
export type { AiCoordinationBoundaryId } from "./coordination-boundary";

export {
  AI_CONTRACT_CLASSIFICATION,
  AI_CONTRACT_CLASSIFICATION_MEANING,
} from "./contract-classification";
export type { AiContractClassification } from "./contract-classification";

export {
  AI_IMPLEMENTATION_NAMESPACES,
} from "./namespaces";
export type { AiImplementationNamespace } from "./namespaces";

export {
  AI_DOMAIN_SLOT_REGISTRY,
  listRegisteredNamespaces,
} from "./registration";
export type { AiDomainSlotRegistration } from "./registration";

export { composeAiInfrastructure } from "./wiring";
export type { AiInfrastructureSnapshot } from "./wiring";
