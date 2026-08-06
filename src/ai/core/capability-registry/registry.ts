/**
 * Core capability registry (architectural registration only).
 * AI-I2: Intelligence Generation + Scientific Grounding
 * AI-I3: Contextual Assistance + Recommendation + Explanation
 * AI-I4: Analytical Interpretation Support + Workflow Guidance
 * Does not activate runtime intelligence.
 */

import { AI_ANALYTICAL_INTERPRETATION_ID } from "../analytical-interpretation";
import { AI_CONTEXTUAL_ASSISTANCE_ID } from "../contextual-assistance/assistance";
import { AI_EXPLANATION_PRODUCTION_ID } from "../contextual-assistance/explanation";
import { AI_RECOMMENDATION_PRODUCTION_ID } from "../contextual-assistance/recommendation";
import {
  AI_INTELLIGENCE_GENERATION_ID,
  AI_INTELLIGENCE_GENERATION_LIFECYCLE,
} from "../intelligence-generation";
import { AI_SCIENTIFIC_GROUNDING_ID } from "../scientific-grounding";
import { AI_WORKFLOW_GUIDANCE_ID } from "../workflow-guidance";

export type AiCoreCapabilityId =
  | typeof AI_INTELLIGENCE_GENERATION_ID
  | typeof AI_SCIENTIFIC_GROUNDING_ID
  | typeof AI_CONTEXTUAL_ASSISTANCE_ID
  | typeof AI_RECOMMENDATION_PRODUCTION_ID
  | typeof AI_EXPLANATION_PRODUCTION_ID
  | typeof AI_ANALYTICAL_INTERPRETATION_ID
  | typeof AI_WORKFLOW_GUIDANCE_ID;

export type AiCoreCapabilityRegistration = {
  readonly id: AiCoreCapabilityId;
  readonly class: "core";
  readonly phase: "AI-I2" | "AI-I3" | "AI-I4";
  readonly active: false;
  readonly runtimeIntelligence: false;
};

export const AI_CORE_CAPABILITY_REGISTRY: readonly AiCoreCapabilityRegistration[] =
  [
    {
      id: AI_INTELLIGENCE_GENERATION_ID,
      class: "core",
      phase: "AI-I2",
      active: false,
      runtimeIntelligence: false,
    },
    {
      id: AI_SCIENTIFIC_GROUNDING_ID,
      class: "core",
      phase: "AI-I2",
      active: false,
      runtimeIntelligence: false,
    },
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
    {
      id: AI_ANALYTICAL_INTERPRETATION_ID,
      class: "core",
      phase: "AI-I4",
      active: false,
      runtimeIntelligence: false,
    },
    {
      id: AI_WORKFLOW_GUIDANCE_ID,
      class: "core",
      phase: "AI-I4",
      active: false,
      runtimeIntelligence: false,
    },
  ] as const;

/** Frozen Core inventory count (AI-P3 §6.1–6.7). */
export const AI_CORE_CAPABILITY_COUNT = 7 as const;

export function listCoreCapabilityIds(): readonly AiCoreCapabilityId[] {
  return AI_CORE_CAPABILITY_REGISTRY.map((c) => c.id);
}

export function isIntelligenceGenerationActive(): boolean {
  return AI_INTELLIGENCE_GENERATION_LIFECYCLE.runtimeExecution;
}

/** Any Core capability remains inactive through AI-I4. */
export function isAnyCoreCapabilityActive(): boolean {
  return AI_CORE_CAPABILITY_REGISTRY.some((c) => c.active);
}

export function isCoreCapabilitySetComplete(): boolean {
  return AI_CORE_CAPABILITY_REGISTRY.length === AI_CORE_CAPABILITY_COUNT;
}
