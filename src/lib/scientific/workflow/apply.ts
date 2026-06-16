import type {
  GuidedWorkflowToggleKey,
  GuidedWorkflowToggleSetters,
} from "./toggles";

export const applyGuidedWorkflowToggles = (
  toggles: GuidedWorkflowToggleKey[],
  setters: GuidedWorkflowToggleSetters
): void => {
  toggles.forEach((key) => {
    setters[key](true);
  });
};
