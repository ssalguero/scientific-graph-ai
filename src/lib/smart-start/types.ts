import type { LabUsageProfile } from "@/app/labUsageProfile";

export const SMART_START_CARD_OPTION_IDS = [
  "analyze-dataset",
  "compare-datasets",
  "evaluate-publication",
  "math-graph",
  "open-project",
] as const;

export type SmartStartCardOptionId = (typeof SMART_START_CARD_OPTION_IDS)[number];

export type SmartStartIntentId = SmartStartCardOptionId | "expert-mode";

export const SMART_START_INTENT_IDS = [
  ...SMART_START_CARD_OPTION_IDS,
  "expert-mode",
] as const satisfies readonly SmartStartIntentId[];

export const SMART_START_NAV_INTENT_IDS = [
  "idle",
  ...SMART_START_CARD_OPTION_IDS,
] as const;

export type SmartStartNavIntent = (typeof SMART_START_NAV_INTENT_IDS)[number];

export type IntentConfidence = "high" | "medium" | "low";

export type IntentRecommendation = {
  intentId: SmartStartIntentId;
  flowLabel: string;
  destinationLabel: string;
  recommendedProfile: LabUsageProfile;
  profileLabel: string;
  confidence: IntentConfidence;
  matchedKeywords: string[];
};
