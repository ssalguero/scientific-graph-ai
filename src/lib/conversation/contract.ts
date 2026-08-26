import type { HomeGuidanceContext } from "@/lib/smart-start/types";

/**
 * P5.4 conversational architecture freeze.
 * Home is the only wired domain. Other domain types exist for later adapters
 * and must not be imported by UI in this phase.
 */

export const CONVERSATION_DOMAIN_IDS = [
  "home",
  "compare",
  "analyze",
  "math",
  "evaluate",
  "results",
  "advanced",
] as const;

export type ConversationDomainId = (typeof CONVERSATION_DOMAIN_IDS)[number];

export const WIRED_CONVERSATION_DOMAINS = ["home"] as const satisfies readonly ConversationDomainId[];

export const UNWIRED_CONVERSATION_DOMAINS = [
  "compare",
  "analyze",
  "math",
  "evaluate",
  "results",
  "advanced",
] as const satisfies readonly ConversationDomainId[];

export const CONVERSATION_POLICY = {
  onDemandOnly: true,
  allowLlm: false,
  allowAutoNavigation: false,
  allowAutoExecution: false,
  allowMethodDecision: false,
  allowPersistentMemory: false,
  allowProactiveIntervention: false,
  allowTranscript: false,
  maxClarifications: 1,
  maxContinuationInvitationsAfterYes: 1,
} as const;

export type ConversationPolicy = typeof CONVERSATION_POLICY;

export type HomeConversationContext = {
  domain: "home";
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
};

/** P6 adapter not wired. Do not import from UI. */
export type CompareConversationContext = {
  domain: "compare";
  datasetIds: readonly string[] | null;
  groupLabels: readonly string[] | null;
  currentStep: string | null;
  selectedVariables: readonly string[] | null;
};

/** P6 adapter not wired. Do not import from UI. */
export type AnalyzeConversationContext = {
  domain: "analyze";
  datasetId: string | null;
  inspectorSection: string | null;
  userSelectedMethod: string | null;
  analysisStatus: string | null;
};

/** P6 adapter not wired. Do not import from UI. */
export type MathConversationContext = {
  domain: "math";
  expression: string | null;
  visibleCurveIds: readonly string[] | null;
};

/** P6 adapter not wired. Do not import from UI. */
export type EvaluateConversationContext = {
  domain: "evaluate";
  statedGoal: string | null;
  methodUnderReview: string | null;
};

/** P6 adapter not wired. Do not import from UI. */
export type ResultsConversationContext = {
  domain: "results";
  executedAnalysisIds: readonly string[] | null;
  cautionCount: number | null;
};

/** P6 adapter not wired. Do not import from UI. */
export type AdvancedConversationContext = {
  domain: "advanced";
  surfaceId: string | null;
};

export type UnwiredConversationContext =
  | CompareConversationContext
  | AnalyzeConversationContext
  | MathConversationContext
  | EvaluateConversationContext
  | ResultsConversationContext
  | AdvancedConversationContext;

export type ConversationContext = HomeConversationContext | UnwiredConversationContext;

export function isWiredConversationDomain(
  domain: ConversationDomainId
): domain is (typeof WIRED_CONVERSATION_DOMAINS)[number] {
  return (WIRED_CONVERSATION_DOMAINS as readonly string[]).includes(domain);
}

/** Maps existing Home session flags onto the transversal contract. Does not add state. */
export function homeConversationContext(
  home: HomeGuidanceContext
): HomeConversationContext {
  return {
    domain: "home",
    hasDataset: home.hasDataset,
    hasExperimentalSeries: home.hasExperimentalSeries,
  };
}
