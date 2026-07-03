import { isVisible, listWorkflowToggleKeys } from "@/lib/scientific/visibility/queries";
import type { VisibilityState } from "@/lib/scientific/visibility/types";

import type { GuidedWorkflowToggleKey, GuidedWorkflowToggleSetters } from "./toggles";

export type WorkflowVisibilitySnapshot = Readonly<
  Record<GuidedWorkflowToggleKey, boolean>
>;

export const captureWorkflowVisibilitySnapshot = (
  state: VisibilityState
): WorkflowVisibilitySnapshot => {
  const snapshot = {} as Record<GuidedWorkflowToggleKey, boolean>;

  for (const key of listWorkflowToggleKeys()) {
    snapshot[key as GuidedWorkflowToggleKey] = isVisible(state, key);
  }

  return snapshot;
};

export const restoreWorkflowVisibilitySnapshot = (
  snapshot: WorkflowVisibilitySnapshot,
  setters: GuidedWorkflowToggleSetters
): void => {
  for (const key of listWorkflowToggleKeys()) {
    setters[key as GuidedWorkflowToggleKey](snapshot[key as GuidedWorkflowToggleKey]);
  }
};
