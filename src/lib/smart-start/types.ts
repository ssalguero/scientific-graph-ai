import type { LabUsageProfile } from "@/app/labUsageProfile";

/** Home launcher capability ids. Count follows the approved Face Card map. */
export const SMART_START_CARD_OPTION_IDS = [
  "analyze-dataset",
  "compare-datasets",
  "math-graph",
  "constructor-visual",
  "analyze-workspace",
  "evaluate-publication",
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

export type GuidanceClarificationSlot = "data_source" | "continuation" | null;

/** P5.1 detection only. Not a guidance path switch. */
export type GuidanceTurnType =
  | "closing"
  | "topic_change"
  | "clarification"
  | "continuation_answer"
  | "follow_up"
  | "new_intent";

/** Typed companion to continuationPrompt. P5.1 does not add a continuation slot. */
export type ContinuationKind =
  | "explain_more"
  | "next_step"
  | "deepen_concept"
  | "review_options"
  | "ask_before_continue"
  | "none";

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

export type GuidanceSpeechAct = "use" | "define" | "explore" | "unknown";

/** Verified Home guidance product areas. Not inspector navigation commands. */
export type GuidanceProductAreaId =
  | "analysis/mathematics"
  | "analysis/statistics"
  | "analysis/inference";

/**
 * User-mentioned scientific vocabulary. Not a Card, not a classifier winner.
 * conceptId "unknown" + productAreaId null means no verified product location.
 */
export type UserConcept = {
  userTerm: string;
  conceptId: string;
  productAreaId: GuidanceProductAreaId | null;
};

export type HomeGuidanceConversationState = {
  lastUserText: string;
  candidateIntentIds: SmartStartIntentId[];
  pendingSlot: GuidanceClarificationSlot;
  suggestedCardIds: SmartStartCardOptionId[];
  clarificationAsked: boolean;
  methodInterest: MethodInterest | null;
  userConcepts: UserConcept[];
  speechAct: GuidanceSpeechAct;
  lastDecision: GuidanceDecision | null;
  turnCount: number;
  continuationKind: ContinuationKind;
};

export const EMPTY_HOME_GUIDANCE_CONVERSATION: HomeGuidanceConversationState = {
  lastUserText: "",
  candidateIntentIds: [],
  pendingSlot: null,
  suggestedCardIds: [],
  clarificationAsked: false,
  methodInterest: null,
  userConcepts: [],
  speechAct: "unknown",
  lastDecision: null,
  turnCount: 0,
  continuationKind: "none",
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
  speechAct: GuidanceSpeechAct;
  userConcepts: UserConcept[];
  /**
   * P4 `ask_before_continue` is display-only and must not create a slot.
   * P5.2 question-form `deepen_concept` / `next_step` may stamp `pendingSlot: "continuation"`.
   */
  continuationPrompt: string | null;
  turnType: GuidanceTurnType;
  turnCount: number;
  continuationKind: ContinuationKind;
};
