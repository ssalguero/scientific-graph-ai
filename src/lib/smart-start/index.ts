export type {
  IntentConfidence,
  IntentRecommendation,
  SmartStartIntentId,
  SmartStartNavIntent,
} from "./types";

export { SMART_START_OPTIONS } from "./options";

export {
  classifyIntent,
  formatIntentRecommendationSummary,
} from "@/app/intentAssistant";
