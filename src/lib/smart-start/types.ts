import type { LabUsageProfile } from "@/app/labUsageProfile";

/** Home launcher capability ids (six entries). */
export const SMART_START_CARD_OPTION_IDS = [
  "analyze-dataset",
  "compare-datasets",
  "math-graph",
  "analyze-workspace",
  "evaluate-publication",
  "expert-mode",
] as const;

export type SmartStartCardOptionId = (typeof SMART_START_CARD_OPTION_IDS)[number];

/** Intent ids include project recovery (NL / intent only — not a permanent Home icon). */
export type SmartStartIntentId = SmartStartCardOptionId | "open-project";

export const SMART_START_INTENT_IDS = [
  ...SMART_START_CARD_OPTION_IDS,
  "open-project",
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
