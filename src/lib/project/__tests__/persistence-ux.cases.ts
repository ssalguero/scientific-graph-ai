import { PROJECT_SIZE_WARN_BYTES } from "../constants";
import type { PersistenceConflict } from "../domain/persistence-conflict";
import type { AutosaveIndicatorState } from "../domain/persistence-status";
import { assessProjectSizeWarning } from "../application/persistence-size";
import {
  formatAutosaveIndicatorState,
  formatLocalProjectAutosaveStatus,
  formatPersistenceConflictPrompt,
  formatPersistenceConflictResolutionLabel,
  formatProjectSizeWarning,
  formatProjectValidationIssue,
  getProjectSizeWarningFeedbackKind,
} from "../userMessages";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const conflict = (
  kind: PersistenceConflict["kind"]
): PersistenceConflict => ({
  kind,
  severity: kind === "SESSION_DIRTY" ? "blocking" : "warning",
  incomingRevision: {
    projectId: "00000000-0000-4000-8000-00000000b603",
    updatedAt: "2026-06-30T12:00:00.000Z",
    source: "sgproj-file",
  },
});

export const runPersistenceUxCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const noneAssessment = assessProjectSizeWarning({
    byteLength: 1024,
    thresholdBytes: PROJECT_SIZE_WARN_BYTES,
  });
  assertCase("ux.size.none.null", formatProjectSizeWarning(noneAssessment) === null);
  assertCase(
    "ux.size.none.feedbackKind",
    getProjectSizeWarningFeedbackKind(noneAssessment.tier) === null
  );

  const approachingAssessment = assessProjectSizeWarning({
    byteLength: Math.floor(PROJECT_SIZE_WARN_BYTES * 0.8),
    thresholdBytes: PROJECT_SIZE_WARN_BYTES,
  });
  assertCase(
    "ux.size.approaching.message",
    formatProjectSizeWarning(approachingAssessment)?.includes("se acerca") === true
  );
  assertCase(
    "ux.size.approaching.feedbackKind",
    getProjectSizeWarningFeedbackKind(approachingAssessment.tier) === "warning"
  );

  const serializeExceeded = assessProjectSizeWarning({
    byteLength: PROJECT_SIZE_WARN_BYTES + 1,
    thresholdBytes: PROJECT_SIZE_WARN_BYTES,
    issueCodes: ["S-SIZE"],
  });
  assertCase(
    "ux.size.serialize.message",
    formatProjectSizeWarning(serializeExceeded)?.includes("serializar") === true
  );

  const parseExceeded = assessProjectSizeWarning({
    byteLength: 1024,
    thresholdBytes: PROJECT_SIZE_WARN_BYTES,
    issueCodes: ["P-SIZE"],
  });
  assertCase(
    "ux.size.parse.message",
    formatProjectSizeWarning(parseExceeded)?.includes("abrir") === true
  );

  assertCase(
    "ux.validation.sSize.code",
    formatProjectValidationIssue({
      code: "S-SIZE",
      path: "project",
      message: "fallback",
      severity: "warning",
    }).includes("serializar")
  );
  assertCase(
    "ux.validation.pSize.code",
    formatProjectValidationIssue({
      code: "P-SIZE",
      path: "file",
      message: "fallback",
      severity: "warning",
    }).includes("abrir")
  );

  assertCase(
    "ux.conflict.sessionDirty",
    formatPersistenceConflictPrompt(conflict("SESSION_DIRTY")).includes(
      "cambios sin guardar"
    )
  );
  assertCase(
    "ux.conflict.incomingNewer",
    formatPersistenceConflictPrompt(conflict("INCOMING_NEWER")).includes(
      "más reciente"
    )
  );
  assertCase(
    "ux.conflict.incomingOlderLocal",
    formatPersistenceConflictPrompt(
      conflict("INCOMING_OLDER_THAN_LOCAL")
    ).includes("anterior")
  );
  assertCase(
    "ux.conflict.recoverableDraft.generic",
    formatPersistenceConflictPrompt(conflict("RECOVERABLE_DRAFT")).includes(
      "borrador autoguardado"
    )
  );
  assertCase(
    "ux.conflict.recoverableDraft.named",
    formatPersistenceConflictPrompt(conflict("RECOVERABLE_DRAFT"), {
      projectName: "Ensayo A",
    }).includes('"Ensayo A"')
  );

  const autosaveStates: AutosaveIndicatorState[] = [
    "idle",
    "pending",
    "saving",
    "saved",
    "error",
  ];
  for (const state of autosaveStates) {
    assertCase(
      `ux.autosave.${state}.nonEmpty`,
      formatAutosaveIndicatorState(state).length > 0
    );
  }
  assertCase(
    "ux.autosave.legacySaved",
    formatLocalProjectAutosaveStatus(true) === formatAutosaveIndicatorState("saved")
  );
  assertCase(
    "ux.autosave.legacyPending",
    formatLocalProjectAutosaveStatus(false) ===
      formatAutosaveIndicatorState("pending")
  );

  assertCase(
    "ux.resolve.loadIncoming",
    formatPersistenceConflictResolutionLabel("LOAD_INCOMING").includes("Cargar")
  );
  assertCase(
    "ux.resolve.cancel",
    formatPersistenceConflictResolutionLabel("CANCEL") === "Cancelar"
  );

  return results;
};
