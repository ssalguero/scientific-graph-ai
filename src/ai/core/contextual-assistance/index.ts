/**
 * AI-I3 — Contextual Assistance barrel (package-internal).
 *
 * Contextual Assistance + Recommendation Production + Explanation Production.
 * No prompts, providers, LLM, inference, chat, or runtime AI.
 */

export {
  AI_CONTEXTUAL_ASSISTANCE_PHASE,
  AI_CONTEXTUAL_ASSISTANCE_STATUS,
} from "./status";
export type { AiContextualAssistanceStatus } from "./status";

export {
  AI_CONTEXTUAL_ASSISTANCE_ID,
  AI_CONTEXTUAL_ASSISTANCE_PURPOSE,
  AI_CONTEXTUAL_ASSISTANCE_RESPONSIBILITY,
  AI_CONTEXTUAL_ASSISTANCE_NEVER_OWNS,
  AI_CONTEXTUAL_ASSISTANCE_LIFECYCLE,
} from "./assistance";

export type {
  AiContextualAssistanceId,
  AiContextualAssistanceLifecycle,
} from "./assistance";

export {
  AI_RECOMMENDATION_PRODUCTION_ID,
  AI_RECOMMENDATION_PRODUCTION_PURPOSE,
  AI_RECOMMENDATION_PRODUCTION_RESPONSIBILITY,
  AI_RECOMMENDATION_PRODUCTION_NEVER_OWNS,
  AI_RECOMMENDATION_IS_COMMAND,
  AI_RECOMMENDATION_PRODUCTION_LIFECYCLE,
} from "./recommendation";

export type {
  AiRecommendationProductionId,
  AiRecommendationProductionLifecycle,
} from "./recommendation";

export {
  AI_EXPLANATION_PRODUCTION_ID,
  AI_EXPLANATION_PRODUCTION_PURPOSE,
  AI_EXPLANATION_PRODUCTION_RESPONSIBILITY,
  AI_EXPLANATION_PRODUCTION_NEVER_OWNS,
  AI_EXPLANATION_PRODUCTION_LIFECYCLE,
} from "./explanation";

export type {
  AiExplanationProductionId,
  AiExplanationProductionLifecycle,
} from "./explanation";

export {
  AI_CONTEXTUAL_CAPABILITY_REGISTRY,
  listContextualCapabilityIds,
} from "./registration";

export type {
  AiContextualCapabilityId,
  AiContextualCapabilityRegistration,
} from "./registration";

export {
  composeContextualAssistance,
  assertContextualAssistanceInactive,
} from "./compose-contextual";

export type { AiContextualAssistanceSnapshot } from "./compose-contextual";
