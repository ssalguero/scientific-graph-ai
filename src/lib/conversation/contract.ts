import type { HomeGuidanceContext } from "@/lib/smart-start/types";

/**
 * P6.0 conversational contract.
 * Home is the only wired domain. Unwired domain types exist for later
 * Conversation Core context adapters and must not be imported by UI.
 * Adapters normalize context for the Conversation Core; they are not
 * conversational brains.
 */

export const CONVERSATION_DOMAIN_IDS = [
  "home",
  "compare",
  "analyze",
  "math",
  "evaluate",
  "results",
  "advanced",
  "reports",
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
  "reports",
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

/**
 * Existing SPA workspace sections, documented only to contrast with
 * ConversationDomainId. Not a navigation table. Never pass to
 * a workspace section mutator.
 */
export const DOCUMENTED_WORKSPACE_SECTIONS = [
  "home",
  "data",
  "analysis",
  "results",
  "reports",
] as const;

export type DocumentedWorkspaceSection =
  (typeof DOCUMENTED_WORKSPACE_SECTIONS)[number];

/**
 * Conversation domains that are not sidebar/workspace sections.
 * compare / math / advanced live under data. evaluate lives under analysis.
 * analyze is the conversation domain for the analysis workspace section.
 * Documentation only — not a navigation map.
 */
export const CONVERSATION_DOMAINS_THAT_ARE_NOT_WORKSPACE_SECTIONS = [
  "compare",
  "analyze",
  "math",
  "evaluate",
  "advanced",
] as const satisfies readonly ConversationDomainId[];

/**
 * Human-readable surface notes. Not a navigation table.
 * results and reports are distinct domains and distinct workspace sections;
 * both remain unwired.
 */
export const CONVERSATION_DOMAIN_SURFACE_NOTES = {
  home: "workspace section home; only wired conversation domain",
  compare: "not a workspace section; lives in data (multi-dataset / compare slots)",
  analyze: "conversation domain for workspace section analysis",
  math: "not a workspace section; lives in data (curves / constructor)",
  evaluate: "not a workspace section; lives in analysis (publication evaluation)",
  advanced: "not a workspace section; lives in data (advanced / expert view)",
  results: "workspace section results; unwired; talk about existing outputs only",
  reports: "workspace section reports; unwired; distinct from results; existing reports only",
} as const satisfies Record<ConversationDomainId, string>;

export type HomeConversationContext = {
  domain: "home";
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
};

/**
 * P6 adapter not wired. Do not import from UI.
 * Adapters normalize context for the Conversation Core; they are not
 * conversational brains.
 */
export type CompareConversationContext = {
  domain: "compare";
  slotAOccupied: boolean | null;
  slotBOccupied: boolean | null;
  groupLabels: readonly string[] | null;
  workflowStepLabel: string | null;
};

/**
 * P6 adapter not wired. Do not import from UI.
 * scientificArea is product language, not AnalysisInspectorSection.
 */
export type AnalyzeConversationContext = {
  domain: "analyze";
  hasDataset: boolean | null;
  scientificArea:
    | "mathematics_area"
    | "statistics_area"
    | "visualization_area"
    | "inference_area"
    | "advisor_area"
    | null;
  userStatedMethod: string | null;
  hasExecutedAnalysis: boolean | null;
};

/**
 * P6 adapter not wired. Do not import from UI.
 * Curves/constructor occupancy, not a DataWorkspaceView id.
 */
export type MathConversationContext = {
  domain: "math";
  constructorOpen: boolean | null;
  hasVisibleCurves: boolean | null;
};

/**
 * P6 adapter not wired. Do not import from UI.
 * Evaluate overlaps spatially with Analyze; it is not a workspace section.
 */
export type EvaluateConversationContext = {
  domain: "evaluate";
  publicationWorkflowAvailable: boolean | null;
  statedGoal: string | null;
};

/**
 * P6 adapter not wired. Do not import from UI.
 * Conversation may explain already-executed results. It must not generate them.
 */
export type ResultsConversationContext = {
  domain: "results";
  hasExistingResults: boolean | null;
  cautionCount: number | null;
};

/**
 * P6 adapter not wired. Do not import from UI.
 * Expert/advanced occupancy, not a DataWorkspaceView id.
 */
export type AdvancedConversationContext = {
  domain: "advanced";
  expertProfileActive: boolean | null;
};

/**
 * P6 adapter not wired. Do not import from UI.
 * Talk about existing reports/publication dashboards. Do not produce reports
 * or execute analysis through conversation.
 */
export type ReportsConversationContext = {
  domain: "reports";
  hasExistingReport: boolean | null;
  hasPublicationDashboard: boolean | null;
};

export type UnwiredConversationContext =
  | CompareConversationContext
  | AnalyzeConversationContext
  | MathConversationContext
  | EvaluateConversationContext
  | ResultsConversationContext
  | AdvancedConversationContext
  | ReportsConversationContext;

export type ConversationContext = HomeConversationContext | UnwiredConversationContext;

export function isWiredConversationDomain(
  domain: ConversationDomainId
): domain is (typeof WIRED_CONVERSATION_DOMAINS)[number] {
  return (WIRED_CONVERSATION_DOMAINS as readonly string[]).includes(domain);
}

/**
 * Maps existing Home session flags onto the transversal contract. Does not add state.
 * Tests-only during P6.0. Home runtime must not call this.
 */
export function homeConversationContext(
  home: HomeGuidanceContext
): HomeConversationContext {
  return {
    domain: "home",
    hasDataset: home.hasDataset,
    hasExperimentalSeries: home.hasExperimentalSeries,
  };
}
