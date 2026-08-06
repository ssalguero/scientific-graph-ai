/**
 * AI-I5 — Supporting component registration.
 */

import { AI_ASSISTANCE_CONTEXT_ID } from "../assistance-context";
import { AI_ASSUMPTION_CONFIDENCE_ID } from "../assumption-confidence";
import { AI_CAPABILITY_CATALOG_ID } from "../capability-catalog";

export type AiSupportingComponentId =
  | typeof AI_ASSISTANCE_CONTEXT_ID
  | typeof AI_CAPABILITY_CATALOG_ID
  | typeof AI_ASSUMPTION_CONFIDENCE_ID;

export type AiSupportingRegistration = {
  readonly id: AiSupportingComponentId;
  readonly class: "supporting";
  readonly phase: "AI-I5";
  readonly active: false;
  readonly runtimeIntelligence: false;
};

export const AI_SUPPORTING_REGISTRY: readonly AiSupportingRegistration[] = [
  {
    id: AI_ASSISTANCE_CONTEXT_ID,
    class: "supporting",
    phase: "AI-I5",
    active: false,
    runtimeIntelligence: false,
  },
  {
    id: AI_CAPABILITY_CATALOG_ID,
    class: "supporting",
    phase: "AI-I5",
    active: false,
    runtimeIntelligence: false,
  },
  {
    id: AI_ASSUMPTION_CONFIDENCE_ID,
    class: "supporting",
    phase: "AI-I5",
    active: false,
    runtimeIntelligence: false,
  },
] as const;

export const AI_SUPPORTING_COMPONENT_COUNT = 3 as const;

export function listSupportingComponentIds(): readonly AiSupportingComponentId[] {
  return AI_SUPPORTING_REGISTRY.map((c) => c.id);
}
