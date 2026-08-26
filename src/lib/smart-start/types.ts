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

/** Home Guidance AI — session flags actually known to Home (P2). */
export type HomeGuidanceContext = {
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
};

export type GuidanceClarificationSlot = "data_source" | null;

export type GuidanceGoal =
  | "analyze"
  | "import"
  | "compare"
  | "plot"
  | "evaluate"
  | "explore"
  | "unknown";

export type GuidanceDataSource = "csv" | "file" | "unspecified" | "session";

/** Non-authoritative user-stated interest. Not a Card, method choice, or command. */
export type MethodInterest = {
  userTerm: string;
  productLocation: "analysis/mathematics";
};

export type HomeGuidanceConversationState = {
  lastUserText: string;
  candidateIntentIds: SmartStartIntentId[];
  pendingSlot: GuidanceClarificationSlot;
  suggestedCardIds: SmartStartCardOptionId[];
  clarificationAsked: boolean;
  methodInterest: MethodInterest | null;
};

export const EMPTY_HOME_GUIDANCE_CONVERSATION: HomeGuidanceConversationState = {
  lastUserText: "",
  candidateIntentIds: [],
  pendingSlot: null,
  suggestedCardIds: [],
  clarificationAsked: false,
  methodInterest: null,
};

export type GuidanceUncertainty = "none" | "low" | "unknown_context";

/** Semantic guidance decision. Not a navigation command. */
export type GuidanceDecision = {
  interpretation: string;
  explanation: string;
  prerequisite: string | null;
  suggestedCardIds: SmartStartCardOptionId[];
  primaryCardId: SmartStartCardOptionId | null;
  clarification: string | null;
  uncertainty: GuidanceUncertainty;
  candidateIntentIds: SmartStartIntentId[];
  goal: GuidanceGoal;
  dataSource: GuidanceDataSource;
  methodInterest: MethodInterest | null;
};
