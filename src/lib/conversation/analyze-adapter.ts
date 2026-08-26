import type {
  AnalyzeConversationContext,
  ConversationDomainId,
} from "./contract";

export type AnalyzeInspectorCategory =
  | "visualization"
  | "mathematics"
  | "statistics"
  | "inference"
  | "advisor";

export type AnalyzeAdapterInput = {
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
  inspectorCategory: AnalyzeInspectorCategory | null;
  hasExecutedAnalysis: boolean | null;
};

const SCIENTIFIC_AREA_BY_CATEGORY: Record<
  AnalyzeInspectorCategory,
  AnalyzeConversationContext["scientificArea"]
> = {
  visualization: "visualization_area",
  mathematics: "mathematics_area",
  statistics: "statistics_area",
  inference: "inference_area",
  advisor: "advisor_area",
};

/**
 * Normalizes Analyze surface flags into conversation context.
 * Does not classify intent, emit orientation, or mutate workspace state.
 */
export function normalizeAnalyzeContext(
  input: AnalyzeAdapterInput
): AnalyzeConversationContext {
  return {
    domain: "analyze",
    hasDataset: input.hasDataset,
    hasExperimentalSeries: input.hasExperimentalSeries,
    scientificArea: input.inspectorCategory
      ? SCIENTIFIC_AREA_BY_CATEGORY[input.inspectorCategory]
      : null,
    userStatedMethod: null,
    hasExecutedAnalysis: input.hasExecutedAnalysis,
  };
}

export type WorkspaceSurfaceInput = {
  workspaceSection: "home" | "data" | "analysis" | "results" | "reports";
  dataWorkspaceView:
    | "experimental"
    | "curves"
    | "advanced"
    | "visual-builder";
  comparisonSurfaceOpen: boolean;
  importDestinationActive: boolean;
};

/**
 * Where the user currently is. Not a navigation command.
 * Does not restrict which domain a question may refer to.
 *
 * null = no specific conversation domain for this surface, not lost context.
 * visual-builder is VGB, distinct from math (curves / y=f(x) GE).
 * experimental without compare is Datos capture, not a conversation domain.
 * Do not invent a ConversationDomainId to avoid null.
 */
export function deriveActiveConversationDomain(
  surface: WorkspaceSurfaceInput
): ConversationDomainId | null {
  if (surface.workspaceSection === "analysis") return "analyze";
  if (surface.workspaceSection !== "data") return null;
  if (surface.importDestinationActive) return null;
  if (surface.comparisonSurfaceOpen) return "compare";
  if (surface.dataWorkspaceView === "curves") return "math";
  if (surface.dataWorkspaceView === "advanced") return "advanced";
  if (surface.dataWorkspaceView === "visual-builder") return null;
  return null;
}
