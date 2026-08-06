/**
 * AI-I3 — Contextual Assistance composition (structural wiring only).
 * Pure. Deterministic. No I/O. No recommendations/explanations generated.
 */

import {
  AI_CONTEXTUAL_ASSISTANCE_ID,
  AI_CONTEXTUAL_ASSISTANCE_LIFECYCLE,
} from "./assistance";
import {
  AI_EXPLANATION_PRODUCTION_ID,
  AI_EXPLANATION_PRODUCTION_LIFECYCLE,
} from "./explanation";
import {
  AI_RECOMMENDATION_PRODUCTION_ID,
  AI_RECOMMENDATION_PRODUCTION_LIFECYCLE,
} from "./recommendation";
import { AI_CONTEXTUAL_CAPABILITY_REGISTRY } from "./registration";
import {
  AI_CONTEXTUAL_ASSISTANCE_PHASE,
  AI_CONTEXTUAL_ASSISTANCE_STATUS,
} from "./status";

export type AiContextualAssistanceSnapshot = {
  readonly phase: typeof AI_CONTEXTUAL_ASSISTANCE_PHASE;
  readonly status: typeof AI_CONTEXTUAL_ASSISTANCE_STATUS;
  readonly contextualAssistanceId: typeof AI_CONTEXTUAL_ASSISTANCE_ID;
  readonly recommendationProductionId: typeof AI_RECOMMENDATION_PRODUCTION_ID;
  readonly explanationProductionId: typeof AI_EXPLANATION_PRODUCTION_ID;
  readonly capabilityCount: number;
  readonly runtimeAssistance: false;
  readonly runtimeRecommendations: false;
  readonly runtimeExplanations: false;
  readonly runtimeIntelligence: false;
};

export function composeContextualAssistance(): AiContextualAssistanceSnapshot {
  return {
    phase: AI_CONTEXTUAL_ASSISTANCE_PHASE,
    status: AI_CONTEXTUAL_ASSISTANCE_STATUS,
    contextualAssistanceId: AI_CONTEXTUAL_ASSISTANCE_ID,
    recommendationProductionId: AI_RECOMMENDATION_PRODUCTION_ID,
    explanationProductionId: AI_EXPLANATION_PRODUCTION_ID,
    capabilityCount: AI_CONTEXTUAL_CAPABILITY_REGISTRY.length,
    runtimeAssistance: false,
    runtimeRecommendations: false,
    runtimeExplanations: false,
    runtimeIntelligence: false,
  };
}

export function assertContextualAssistanceInactive(): boolean {
  return (
    AI_CONTEXTUAL_ASSISTANCE_LIFECYCLE.runtimeAssistance === false &&
    AI_RECOMMENDATION_PRODUCTION_LIFECYCLE.generatesRecommendations === false &&
    AI_EXPLANATION_PRODUCTION_LIFECYCLE.generatesExplanations === false
  );
}
