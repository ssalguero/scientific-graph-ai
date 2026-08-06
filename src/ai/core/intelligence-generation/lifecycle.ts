/**
 * AI-I2 — Intelligence Generation capability lifecycle (architectural only).
 * No runtime activation. No inference. No async execution.
 */

export const AI_CAPABILITY_LIFECYCLE_STATES = [
  "declared",
  "registered",
  "inactive",
] as const;

export type AiCapabilityLifecycleState = (typeof AI_CAPABILITY_LIFECYCLE_STATES)[number];

export type AiIntelligenceGenerationLifecycle = {
  readonly capabilityId: "intelligence-generation";
  readonly state: "inactive";
  readonly runtimeExecution: false;
  readonly inferenceEnabled: false;
};

export const AI_INTELLIGENCE_GENERATION_LIFECYCLE: AiIntelligenceGenerationLifecycle = {
  capabilityId: "intelligence-generation",
  state: "inactive",
  runtimeExecution: false,
  inferenceEnabled: false,
};
