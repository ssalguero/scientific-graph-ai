import type { SmartStartCardOptionId } from "@/lib/smart-start/types";

/**
 * Display / explain only. Never pass to workspace mutators.
 *
 * Semantic orientation: where conversation may point the user in product
 * language. The human decides whether to click a Card, change surface, or
 * do nothing.
 *
 * Not a navigation command. Not an execution order.
 * Do not pass these values to workspace, inspector, Card, or workflow mutators.
 */

export type ConversationOrientationKind =
  | "home_card"
  | "scientific_area"
  | "data_area"
  | "existing_dashboard"
  | "guided_workflow_option";

/**
 * Product-language areas. Values are intentionally not 1:1 with
 * WorkspaceSection, AnalysisInspectorSection, or DataWorkspaceView
 * so they cannot be passed to UI setters.
 */
export type ConversationProductArea =
  | "home_launcher_cards"
  | "scientific_mathematics"
  | "scientific_statistics"
  | "scientific_visualization"
  | "scientific_inference"
  | "scientific_advisor"
  | "data_compare_groups"
  | "data_graphs_math"
  | "data_advanced_tools"
  | "publication_evaluation"
  | "existing_results"
  | "existing_reports";

/**
 * Output of a future Conversation Core. Not produced by domain adapters.
 * homeCardId is a Card the user may choose; it is not an execution command.
 */
export type ConversationOrientation = {
  kind: ConversationOrientationKind;
  productArea: ConversationProductArea;
  meaning: string;
  homeCardId?: SmartStartCardOptionId;
};
