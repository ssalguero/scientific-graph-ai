import type { AutosaveIndicatorState } from "../../domain/persistence-status";

export type DeriveAutosaveIndicatorInput = {
  enabled: boolean;
  hasActiveLocalProject: boolean;
  isProjectDirty: boolean;
  isSaving: boolean;
  hasError: boolean;
};

export type DeriveAutosaveIndicatorResult = {
  state: AutosaveIndicatorState;
};

export const deriveAutosaveIndicatorState = (
  input: DeriveAutosaveIndicatorInput
): DeriveAutosaveIndicatorResult => {
  if (!input.enabled || !input.hasActiveLocalProject) {
    return { state: "idle" };
  }
  if (input.hasError) {
    return { state: "error" };
  }
  if (input.isSaving) {
    return { state: "saving" };
  }
  if (input.isProjectDirty) {
    return { state: "pending" };
  }
  return { state: "saved" };
};
