import { deriveAutosaveIndicatorState } from "../persistence-status";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

export const runPersistenceStatusApplicationCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const base = {
    enabled: true,
    hasActiveLocalProject: true,
    isProjectDirty: false,
    isSaving: false,
    hasError: false,
  };

  assertCase(
    "app.autosave.idle.disabled",
    deriveAutosaveIndicatorState({ ...base, enabled: false }).state === "idle"
  );
  assertCase(
    "app.autosave.idle.noProject",
    deriveAutosaveIndicatorState({ ...base, hasActiveLocalProject: false })
      .state === "idle"
  );
  assertCase(
    "app.autosave.error",
    deriveAutosaveIndicatorState({ ...base, hasError: true }).state === "error"
  );
  assertCase(
    "app.autosave.saving",
    deriveAutosaveIndicatorState({ ...base, isSaving: true }).state === "saving"
  );
  assertCase(
    "app.autosave.pending",
    deriveAutosaveIndicatorState({ ...base, isProjectDirty: true }).state ===
      "pending"
  );
  assertCase(
    "app.autosave.saved",
    deriveAutosaveIndicatorState(base).state === "saved"
  );
  assertCase(
    "app.autosave.errorOverridesSaving",
    deriveAutosaveIndicatorState({ ...base, isSaving: true, hasError: true })
      .state === "error"
  );

  return results;
};
