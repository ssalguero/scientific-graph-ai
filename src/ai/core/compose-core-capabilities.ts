/**
 * AI-I4 — Compose full Core capability set (structural snapshot only).
 * Pure. Deterministic. No I/O. No execution. No runtime intelligence.
 */

import { AI_ANALYTICAL_INTERPRETATION_ID } from "./analytical-interpretation";
import { AI_CORE_CAPABILITY_REGISTRY } from "./capability-registry";
import {
  AI_CORE_CAPABILITIES_PHASE,
  AI_CORE_CAPABILITIES_STATUS,
} from "./core-capabilities-status";
import { AI_WORKFLOW_EXECUTION_OWNER, AI_WORKFLOW_GUIDANCE_ID } from "./workflow-guidance";

export type AiCoreCapabilitiesSnapshot = {
  readonly phase: typeof AI_CORE_CAPABILITIES_PHASE;
  readonly status: typeof AI_CORE_CAPABILITIES_STATUS;
  readonly capabilityCount: number;
  readonly analyticalInterpretationId: typeof AI_ANALYTICAL_INTERPRETATION_ID;
  readonly workflowGuidanceId: typeof AI_WORKFLOW_GUIDANCE_ID;
  readonly workflowExecutionOwner: typeof AI_WORKFLOW_EXECUTION_OWNER;
  readonly coreSetComplete: true;
  readonly runtimeIntelligence: false;
  readonly workflowExecution: false;
  readonly scientificValidation: false;
};

/**
 * Compose complete Core capability structural snapshot (AI-I2…AI-I4).
 */
export function composeCoreCapabilities(): AiCoreCapabilitiesSnapshot {
  return {
    phase: AI_CORE_CAPABILITIES_PHASE,
    status: AI_CORE_CAPABILITIES_STATUS,
    capabilityCount: AI_CORE_CAPABILITY_REGISTRY.length,
    analyticalInterpretationId: AI_ANALYTICAL_INTERPRETATION_ID,
    workflowGuidanceId: AI_WORKFLOW_GUIDANCE_ID,
    workflowExecutionOwner: AI_WORKFLOW_EXECUTION_OWNER,
    coreSetComplete: true,
    runtimeIntelligence: false,
    workflowExecution: false,
    scientificValidation: false,
  };
}

export function assertCoreCapabilitiesInactive(): boolean {
  return !AI_CORE_CAPABILITY_REGISTRY.some((c) => c.active);
}
