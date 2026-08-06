/**
 * AI-I8 — Extension Infrastructure barrel (package-internal).
 * Certified extension slots only. No assistants, prediction, or runtime AI.
 */

export { AI_EXTENSION_PHASE, AI_EXTENSION_STATUS } from "./status";
export type { AiExtensionStatus } from "./status";

export {
  AI_SPECIALIZED_ASSISTANT_EXTENSION_ID,
  AI_SPECIALIZED_ASSISTANT_EXTENSION_PURPOSE,
  AI_SPECIALIZED_ASSISTANT_EXTENSION_RESPONSIBILITY,
  AI_SPECIALIZED_ASSISTANT_EXTENSION_NEVER_OWNS,
  AI_SPECIALIZED_ASSISTANT_IMPLEMENTED,
  AI_SPECIALIZED_ASSISTANT_EXTENSION_SLOT,
} from "./specialized-assistants";
export type { AiSpecializedAssistantExtensionId } from "./specialized-assistants";

export {
  AI_DISCIPLINE_SPECIFIC_EXTENSION_ID,
  AI_DISCIPLINE_SPECIFIC_EXTENSION_PURPOSE,
  AI_DISCIPLINE_SPECIFIC_EXTENSION_RESPONSIBILITY,
  AI_DISCIPLINE_SPECIFIC_EXTENSION_NEVER_OWNS,
  AI_DISCIPLINE_LOGIC_IMPLEMENTED,
  AI_DISCIPLINE_SPECIFIC_EXTENSION_SLOT,
} from "./discipline-specific";
export type { AiDisciplineSpecificExtensionId } from "./discipline-specific";

export {
  AI_PREDICTIVE_ASSISTANCE_EXTENSION_ID,
  AI_PREDICTIVE_ASSISTANCE_EXTENSION_PURPOSE,
  AI_PREDICTIVE_ASSISTANCE_EXTENSION_RESPONSIBILITY,
  AI_PREDICTIVE_ASSISTANCE_EXTENSION_NEVER_OWNS,
  AI_PREDICTION_IMPLEMENTED,
  AI_INFERENCE_ENABLED,
  AI_PREDICTIVE_ASSISTANCE_EXTENSION_SLOT,
} from "./predictive-assistance";
export type { AiPredictiveAssistanceExtensionId } from "./predictive-assistance";

export {
  AI_EXTENSION_REGISTRY,
  AI_EXTENSION_SLOT_COUNT,
  AI_EXTENSION_CATALOG,
  listExtensionSlotIds,
} from "./registration";
export type { AiExtensionSlotId, AiExtensionRegistration } from "./registration";

export { composeExtension, assertExtensionSlotsInactive } from "./compose-extension";
export type { AiExtensionSnapshot } from "./compose-extension";
