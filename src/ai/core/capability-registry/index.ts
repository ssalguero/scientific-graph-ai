/**
 * AI-I2 — Capability registry barrel.
 */

export {
  AI_CORE_CAPABILITY_REGISTRY,
  AI_CORE_CAPABILITY_COUNT,
  listCoreCapabilityIds,
  isIntelligenceGenerationActive,
  isAnyCoreCapabilityActive,
  isCoreCapabilitySetComplete,
} from "./registry";

export type { AiCoreCapabilityId, AiCoreCapabilityRegistration } from "./registry";
