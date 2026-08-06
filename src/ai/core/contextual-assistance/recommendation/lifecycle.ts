/**
 * AI-I3 — Recommendation Production lifecycle (architectural only).
 */

export type AiRecommendationProductionLifecycle = {
  readonly capabilityId: "recommendation-production";
  readonly state: "inactive";
  readonly runtimeRecommendations: false;
  readonly generatesRecommendations: false;
};

export const AI_RECOMMENDATION_PRODUCTION_LIFECYCLE: AiRecommendationProductionLifecycle =
  {
    capabilityId: "recommendation-production",
    state: "inactive",
    runtimeRecommendations: false,
    generatesRecommendations: false,
  };
