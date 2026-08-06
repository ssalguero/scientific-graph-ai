/**
 * AI-I8 — Extension Infrastructure composition (structural only).
 * Pure. No assistants. No prediction. No runtime extensions.
 */

import { AI_EXTENSION_REGISTRY } from "./registration";
import { AI_EXTENSION_PHASE, AI_EXTENSION_STATUS } from "./status";

export type AiExtensionSnapshot = {
  readonly phase: typeof AI_EXTENSION_PHASE;
  readonly status: typeof AI_EXTENSION_STATUS;
  readonly slotCount: number;
  readonly anyImplemented: false;
  readonly runtimeExtension: false;
  readonly specializedAssistantsImplemented: false;
  readonly predictionImplemented: false;
  readonly introducesNewCapabilityCategory: false;
  readonly aiOptionalPreserved: true;
};

export function composeExtension(): AiExtensionSnapshot {
  return {
    phase: AI_EXTENSION_PHASE,
    status: AI_EXTENSION_STATUS,
    slotCount: AI_EXTENSION_REGISTRY.length,
    anyImplemented: false,
    runtimeExtension: false,
    specializedAssistantsImplemented: false,
    predictionImplemented: false,
    introducesNewCapabilityCategory: false,
    aiOptionalPreserved: true,
  };
}

export function assertExtensionSlotsInactive(): boolean {
  return AI_EXTENSION_REGISTRY.every((r) => !r.active && !r.implemented);
}
