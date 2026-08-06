/**
 * AI-I3 — Contextual Assistance lifecycle (architectural only).
 * No runtime execution. No conversations. No chat.
 */

export type AiContextualAssistanceLifecycle = {
  readonly capabilityId: "contextual-assistance";
  readonly state: "inactive";
  readonly runtimeAssistance: false;
  readonly conversationsEnabled: false;
};

export const AI_CONTEXTUAL_ASSISTANCE_LIFECYCLE: AiContextualAssistanceLifecycle =
  {
    capabilityId: "contextual-assistance",
    state: "inactive",
    runtimeAssistance: false,
    conversationsEnabled: false,
  };
