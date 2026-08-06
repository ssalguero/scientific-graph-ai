/**
 * AI-I3 — Explanation Production lifecycle (architectural only).
 */

export type AiExplanationProductionLifecycle = {
  readonly capabilityId: "explanation-production";
  readonly state: "inactive";
  readonly runtimeExplanations: false;
  readonly generatesExplanations: false;
};

export const AI_EXPLANATION_PRODUCTION_LIFECYCLE: AiExplanationProductionLifecycle =
  {
    capabilityId: "explanation-production",
    state: "inactive",
    runtimeExplanations: false,
    generatesExplanations: false,
  };
