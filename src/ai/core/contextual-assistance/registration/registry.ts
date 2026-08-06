/**
 * AI-I3 — Contextual assistance capability registration.
 * Registers CA / Recommendation / Explanation identities. No runtime activation.
 */

import { AI_CONTEXTUAL_ASSISTANCE_ID } from "../assistance";
import { AI_EXPLANATION_PRODUCTION_ID } from "../explanation";
import { AI_RECOMMENDATION_PRODUCTION_ID } from "../recommendation";

export type AiContextualCapabilityId =
  | typeof AI_CONTEXTUAL_ASSISTANCE_ID
  | typeof AI_RECOMMENDATION_PRODUCTION_ID
  | typeof AI_EXPLANATION_PRODUCTION_ID;

export type AiContextualCapabilityRegistration = {
  readonly id: AiContextualCapabilityId;
  readonly class: "core";
  readonly phase: "AI-I3";
  readonly active: false;
  readonly runtimeIntelligence: false;
};

export const AI_CONTEXTUAL_CAPABILITY_REGISTRY: readonly AiContextualCapabilityRegistration[] =
  [
    {
      id: AI_CONTEXTUAL_ASSISTANCE_ID,
      class: "core",
      phase: "AI-I3",
      active: false,
      runtimeIntelligence: false,
    },
    {
      id: AI_RECOMMENDATION_PRODUCTION_ID,
      class: "core",
      phase: "AI-I3",
      active: false,
      runtimeIntelligence: false,
    },
    {
      id: AI_EXPLANATION_PRODUCTION_ID,
      class: "core",
      phase: "AI-I3",
      active: false,
      runtimeIntelligence: false,
    },
  ] as const;

export function listContextualCapabilityIds(): readonly AiContextualCapabilityId[] {
  return AI_CONTEXTUAL_CAPABILITY_REGISTRY.map((c) => c.id);
}
