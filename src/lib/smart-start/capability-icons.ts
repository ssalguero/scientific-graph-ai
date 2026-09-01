/**
 * CRP-6.3 — Maps Smart Start capabilities → WorkspaceIcon registry keys.
 * Not barrel-exported from smart-start (allowlist).
 */
import type { WorkspaceIconName } from "@/components/workspace/iconography/workspaceIconRegistry";
import type { SmartStartCardOptionId } from "./types";

export const SMART_START_WORKSPACE_ICON: Record<
  SmartStartCardOptionId,
  WorkspaceIconName
> = {
  "analyze-dataset": "cap-import",
  "compare-datasets": "cap-compare",
  "math-graph": "cap-graph",
  "constructor-visual": "cap-advanced",
  "analyze-workspace": "cap-analyze",
  "evaluate-publication": "cap-publish",
};
