/**
 * AI-I5 — Supporting Components barrel (package-internal).
 * No runtime support services. No scoring engines.
 */

export { AI_SUPPORTING_PHASE, AI_SUPPORTING_STATUS } from "./status";
export type { AiSupportingStatus } from "./status";

export {
  AI_ASSISTANCE_CONTEXT_ID,
  AI_ASSISTANCE_CONTEXT_PURPOSE,
  AI_ASSISTANCE_CONTEXT_RESPONSIBILITY,
  AI_ASSISTANCE_CONTEXT_NEVER_OWNS,
  AI_ASSISTANCE_CONTEXT_LIFECYCLE,
} from "./assistance-context";
export type { AiAssistanceContextId } from "./assistance-context";

export {
  AI_CAPABILITY_CATALOG_ID,
  AI_CAPABILITY_CATALOG_PURPOSE,
  AI_CAPABILITY_CATALOG_RESPONSIBILITY,
  AI_CAPABILITY_CATALOG_NEVER_OWNS,
  AI_CAPABILITY_CATALOG_LIFECYCLE,
} from "./capability-catalog";
export type { AiCapabilityCatalogId } from "./capability-catalog";

export {
  AI_ASSUMPTION_CONFIDENCE_ID,
  AI_ASSUMPTION_CONFIDENCE_PURPOSE,
  AI_ASSUMPTION_CONFIDENCE_RESPONSIBILITY,
  AI_ASSUMPTION_CONFIDENCE_NEVER_OWNS,
  AI_ASSUMPTION_CONFIDENCE_IS_CERTIFICATION,
  AI_ASSUMPTION_CONFIDENCE_LIFECYCLE,
} from "./assumption-confidence";
export type { AiAssumptionConfidenceId } from "./assumption-confidence";

export {
  AI_SUPPORTING_REGISTRY,
  AI_SUPPORTING_COMPONENT_COUNT,
  listSupportingComponentIds,
} from "./registration";
export type {
  AiSupportingComponentId,
  AiSupportingRegistration,
} from "./registration";

export { composeSupporting } from "./compose-supporting";
export type { AiSupportingSnapshot } from "./compose-supporting";
