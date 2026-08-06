/**
 * AI-I5 — Supporting composition (structural only).
 */

import { AI_SUPPORTING_REGISTRY } from "./registration";
import { AI_SUPPORTING_PHASE, AI_SUPPORTING_STATUS } from "./status";

export type AiSupportingSnapshot = {
  readonly phase: typeof AI_SUPPORTING_PHASE;
  readonly status: typeof AI_SUPPORTING_STATUS;
  readonly componentCount: number;
  readonly runtimeIntelligence: false;
  readonly scoringEngine: false;
};

export function composeSupporting(): AiSupportingSnapshot {
  return {
    phase: AI_SUPPORTING_PHASE,
    status: AI_SUPPORTING_STATUS,
    componentCount: AI_SUPPORTING_REGISTRY.length,
    runtimeIntelligence: false,
    scoringEngine: false,
  };
}
