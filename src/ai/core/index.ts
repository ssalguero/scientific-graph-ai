/**
 * AI Core barrel (package-internal).
 *
 * AI-I2: Intelligence Generation + Scientific Grounding
 * AI-I3: Contextual Assistance + Recommendation + Explanation
 * AI-I4: Analytical Interpretation Support + Workflow Guidance
 *
 * Do not import from outside `@/ai`.
 * No prompts, providers, LLM, inference, workflow execution, or runtime AI.
 */

export { AI_CORE_PHASE, AI_CORE_STATUS } from "./status";
export type { AiCoreStatus } from "./status";

export {
  AI_CORE_CAPABILITIES_PHASE,
  AI_CORE_CAPABILITIES_STATUS,
} from "./core-capabilities-status";
export type { AiCoreCapabilitiesStatus } from "./core-capabilities-status";

export {
  AI_INTELLIGENCE_GENERATION_ID,
  AI_INTELLIGENCE_GENERATION_PURPOSE,
  AI_INTELLIGENCE_GENERATION_RESPONSIBILITY,
  AI_INTELLIGENCE_GENERATION_NEVER_OWNS,
  AI_INTELLIGENCE_GENERATION_AUTHORITATIVE,
  AI_CAPABILITY_LIFECYCLE_STATES,
  AI_INTELLIGENCE_GENERATION_LIFECYCLE,
} from "./intelligence-generation";

export type {
  AiIntelligenceGenerationId,
  AiCapabilityLifecycleState,
  AiIntelligenceGenerationLifecycle,
} from "./intelligence-generation";

export {
  AI_SCIENTIFIC_GROUNDING_ID,
  AI_SCIENTIFIC_GROUNDING_PURPOSE,
  AI_SCIENTIFIC_GROUNDING_RESPONSIBILITY,
  AI_SCIENTIFIC_GROUNDING_NEVER_OWNS,
  AI_SCIENTIFIC_TRUTH_OWNER,
  AI_SCIENTIFIC_GROUNDING_SOURCE,
  AI_SCIENTIFIC_GROUNDING_DERIVATION,
} from "./scientific-grounding";

export type {
  AiScientificGroundingId,
  AiScientificGroundingDerivation,
} from "./scientific-grounding";

export {
  AI_CONTEXTUAL_ASSISTANCE_PHASE,
  AI_CONTEXTUAL_ASSISTANCE_STATUS,
  AI_CONTEXTUAL_ASSISTANCE_ID,
  AI_CONTEXTUAL_ASSISTANCE_PURPOSE,
  AI_CONTEXTUAL_ASSISTANCE_RESPONSIBILITY,
  AI_CONTEXTUAL_ASSISTANCE_NEVER_OWNS,
  AI_CONTEXTUAL_ASSISTANCE_LIFECYCLE,
  AI_RECOMMENDATION_PRODUCTION_ID,
  AI_RECOMMENDATION_PRODUCTION_PURPOSE,
  AI_RECOMMENDATION_PRODUCTION_RESPONSIBILITY,
  AI_RECOMMENDATION_PRODUCTION_NEVER_OWNS,
  AI_RECOMMENDATION_IS_COMMAND,
  AI_RECOMMENDATION_PRODUCTION_LIFECYCLE,
  AI_EXPLANATION_PRODUCTION_ID,
  AI_EXPLANATION_PRODUCTION_PURPOSE,
  AI_EXPLANATION_PRODUCTION_RESPONSIBILITY,
  AI_EXPLANATION_PRODUCTION_NEVER_OWNS,
  AI_EXPLANATION_PRODUCTION_LIFECYCLE,
  AI_CONTEXTUAL_CAPABILITY_REGISTRY,
  listContextualCapabilityIds,
  composeContextualAssistance,
  assertContextualAssistanceInactive,
} from "./contextual-assistance";

export type {
  AiContextualAssistanceStatus,
  AiContextualAssistanceId,
  AiContextualAssistanceLifecycle,
  AiRecommendationProductionId,
  AiRecommendationProductionLifecycle,
  AiExplanationProductionId,
  AiExplanationProductionLifecycle,
  AiContextualCapabilityId,
  AiContextualCapabilityRegistration,
  AiContextualAssistanceSnapshot,
} from "./contextual-assistance";

export {
  AI_ANALYTICAL_INTERPRETATION_ID,
  AI_ANALYTICAL_INTERPRETATION_PURPOSE,
  AI_ANALYTICAL_INTERPRETATION_RESPONSIBILITY,
  AI_ANALYTICAL_INTERPRETATION_NEVER_OWNS,
  AI_ANALYTICAL_INTERPRETATION_CERTIFIES_CORRECTNESS,
  AI_ANALYTICAL_INTERPRETATION_LIFECYCLE,
} from "./analytical-interpretation";

export type {
  AiAnalyticalInterpretationId,
  AiAnalyticalInterpretationLifecycle,
} from "./analytical-interpretation";

export {
  AI_WORKFLOW_GUIDANCE_ID,
  AI_WORKFLOW_GUIDANCE_PURPOSE,
  AI_WORKFLOW_GUIDANCE_RESPONSIBILITY,
  AI_WORKFLOW_GUIDANCE_NEVER_OWNS,
  AI_WORKFLOW_EXECUTION_OWNER,
  AI_WORKFLOW_GUIDANCE_EXECUTES,
  AI_WORKFLOW_GUIDANCE_LIFECYCLE,
} from "./workflow-guidance";

export type {
  AiWorkflowGuidanceId,
  AiWorkflowGuidanceLifecycle,
} from "./workflow-guidance";

export {
  AI_CORE_CAPABILITY_REGISTRY,
  AI_CORE_CAPABILITY_COUNT,
  listCoreCapabilityIds,
  isIntelligenceGenerationActive,
  isAnyCoreCapabilityActive,
  isCoreCapabilitySetComplete,
} from "./capability-registry";

export type { AiCoreCapabilityId, AiCoreCapabilityRegistration } from "./capability-registry";

export { composeAiCore, assertCoreInactive } from "./wiring";
export type { AiCoreSnapshot } from "./wiring";

export {
  composeCoreCapabilities,
  assertCoreCapabilitiesInactive,
} from "./compose-core-capabilities";
export type { AiCoreCapabilitiesSnapshot } from "./compose-core-capabilities";
