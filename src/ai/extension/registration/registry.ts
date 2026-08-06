/**
 * AI-I8 — Extension slot registration / catalog.
 * Certified inventory slots only. No new capability categories. No runtime.
 */

import { AI_DISCIPLINE_SPECIFIC_EXTENSION_ID } from "../discipline-specific";
import { AI_PREDICTIVE_ASSISTANCE_EXTENSION_ID } from "../predictive-assistance";
import { AI_SPECIALIZED_ASSISTANT_EXTENSION_ID } from "../specialized-assistants";

export type AiExtensionSlotId =
  | typeof AI_SPECIALIZED_ASSISTANT_EXTENSION_ID
  | typeof AI_DISCIPLINE_SPECIFIC_EXTENSION_ID
  | typeof AI_PREDICTIVE_ASSISTANCE_EXTENSION_ID;

export type AiExtensionRegistration = {
  readonly id: AiExtensionSlotId;
  readonly class: "extension";
  readonly phase: "AI-I8";
  readonly active: false;
  readonly implemented: false;
  readonly runtimeExtension: false;
  readonly introducesNewCapabilityCategory: false;
};

export const AI_EXTENSION_REGISTRY: readonly AiExtensionRegistration[] = [
  {
    id: AI_SPECIALIZED_ASSISTANT_EXTENSION_ID,
    class: "extension",
    phase: "AI-I8",
    active: false,
    implemented: false,
    runtimeExtension: false,
    introducesNewCapabilityCategory: false,
  },
  {
    id: AI_DISCIPLINE_SPECIFIC_EXTENSION_ID,
    class: "extension",
    phase: "AI-I8",
    active: false,
    implemented: false,
    runtimeExtension: false,
    introducesNewCapabilityCategory: false,
  },
  {
    id: AI_PREDICTIVE_ASSISTANCE_EXTENSION_ID,
    class: "extension",
    phase: "AI-I8",
    active: false,
    implemented: false,
    runtimeExtension: false,
    introducesNewCapabilityCategory: false,
  },
] as const;

export const AI_EXTENSION_SLOT_COUNT = 3 as const;

/** Catalog of certified extension slot identities (AI-P3 §8). */
export const AI_EXTENSION_CATALOG = AI_EXTENSION_REGISTRY.map((r) => r.id);

export function listExtensionSlotIds(): readonly AiExtensionSlotId[] {
  return AI_EXTENSION_REGISTRY.map((r) => r.id);
}
