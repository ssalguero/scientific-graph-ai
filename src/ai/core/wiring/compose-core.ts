/**
 * AI-I2 — Core composition (structural wiring only).
 * Pure. Deterministic. No I/O. No peer-domain calls. No inference.
 */

import { AI_CORE_CAPABILITY_REGISTRY } from "../capability-registry";
import {
  AI_INTELLIGENCE_GENERATION_ID,
  AI_INTELLIGENCE_GENERATION_LIFECYCLE,
} from "../intelligence-generation";
import {
  AI_SCIENTIFIC_GROUNDING_DERIVATION,
  AI_SCIENTIFIC_GROUNDING_ID,
} from "../scientific-grounding";
import { AI_CORE_PHASE, AI_CORE_STATUS } from "../status";

export type AiCoreSnapshot = {
  readonly phase: typeof AI_CORE_PHASE;
  readonly status: typeof AI_CORE_STATUS;
  readonly intelligenceGenerationId: typeof AI_INTELLIGENCE_GENERATION_ID;
  readonly scientificGroundingId: typeof AI_SCIENTIFIC_GROUNDING_ID;
  readonly capabilityCount: number;
  readonly intelligenceGenerationActive: false;
  readonly scientificGroundingMutatesData: false;
  readonly runtimeIntelligence: false;
  readonly truthOwner: typeof AI_SCIENTIFIC_GROUNDING_DERIVATION.truthOwner;
};

/**
 * Compose Core structural snapshot.
 * Depends conceptually on Infrastructure readiness; does not invoke runtime AI.
 */
export function composeAiCore(): AiCoreSnapshot {
  return {
    phase: AI_CORE_PHASE,
    status: AI_CORE_STATUS,
    intelligenceGenerationId: AI_INTELLIGENCE_GENERATION_ID,
    scientificGroundingId: AI_SCIENTIFIC_GROUNDING_ID,
    capabilityCount: AI_CORE_CAPABILITY_REGISTRY.length,
    intelligenceGenerationActive: false,
    scientificGroundingMutatesData: AI_SCIENTIFIC_GROUNDING_DERIVATION.mutatesData,
    runtimeIntelligence: false,
    truthOwner: AI_SCIENTIFIC_GROUNDING_DERIVATION.truthOwner,
  };
}

/** Reaffirm IG lifecycle remains inactive. */
export function assertCoreInactive(): boolean {
  return (
    AI_INTELLIGENCE_GENERATION_LIFECYCLE.runtimeExecution === false &&
    AI_INTELLIGENCE_GENERATION_LIFECYCLE.inferenceEnabled === false
  );
}
