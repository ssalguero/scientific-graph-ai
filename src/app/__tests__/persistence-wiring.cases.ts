import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PROJECT_SIZE_WARN_BYTES } from "@/lib/project/constants";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import { ProjectScientificFilePanel } from "../ProjectScientificFilePanel";
import {
  buildAutosaveIndicatorView,
  buildPersistenceConflictView,
  buildProjectSizeAssessmentView,
} from "../persistence/persistenceViews";
import { buildSessionRevisionRef } from "../persistence/revisionRefs";

const PROJECT_ID = "00000000-0000-4000-8000-00000000b604";
const sessionRevision = buildSessionRevisionRef({
  id: PROJECT_ID,
  name: "Demo",
  createdAt: "2026-06-30T10:00:00.000Z",
  updatedAt: "2026-06-30T10:00:00.000Z",
});

export const runPersistenceWiringCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const idleAutosave = buildAutosaveIndicatorView({
    enabled: false,
    hasActiveLocalProject: false,
    isProjectDirty: false,
    isSaving: false,
    hasError: false,
  });
  assertCase("wire.autosave.idle", idleAutosave.state === "idle");
  assertCase(
    "wire.autosave.idleLabel",
    idleAutosave.label.includes("inactivo")
  );

  const savingAutosave = buildAutosaveIndicatorView({
    enabled: true,
    hasActiveLocalProject: true,
    isProjectDirty: true,
    isSaving: true,
    hasError: false,
  });
  assertCase("wire.autosave.saving", savingAutosave.state === "saving");
  assertCase(
    "wire.autosave.savingClass",
    savingAutosave.className.includes("app-accent")
  );

  const dirtyConflict = buildPersistenceConflictView({
    isSessionDirty: true,
    sessionRevision,
    incomingRevision: sessionRevision,
  });
  assertCase("wire.conflict.blocking", dirtyConflict.uiState === "blocking");
  assertCase("wire.conflict.shouldBlock", dirtyConflict.shouldBlock === true);
  assertCase(
    "wire.conflict.prompt",
    dirtyConflict.prompt?.includes("cambios sin guardar") === true
  );

  const noneConflict = buildPersistenceConflictView({
    isSessionDirty: false,
    sessionRevision,
    incomingRevision: sessionRevision,
  });
  assertCase("wire.conflict.none", noneConflict.uiState === "none");

  const normalSize = buildProjectSizeAssessmentView({
    byteLength: 1024,
  });
  assertCase("wire.size.normal", normalSize.uiState === "normal");
  assertCase("wire.size.normalMessage", normalSize.message === null);

  const warningSize = buildProjectSizeAssessmentView({
    byteLength: Math.floor(PROJECT_SIZE_WARN_BYTES * 0.85),
  });
  assertCase("wire.size.warning", warningSize.uiState === "warning");
  assertCase(
    "wire.size.warningMessage",
    warningSize.message?.includes("se acerca") === true
  );

  const criticalSize = buildProjectSizeAssessmentView({
    byteLength: PROJECT_SIZE_WARN_BYTES + 1,
  });
  assertCase("wire.size.critical", criticalSize.uiState === "critical");

  const firstAutosave = buildAutosaveIndicatorView({
    enabled: true,
    hasActiveLocalProject: true,
    isProjectDirty: false,
    isSaving: false,
    hasError: false,
  });
  const secondAutosave = buildAutosaveIndicatorView({
    enabled: true,
    hasActiveLocalProject: true,
    isProjectDirty: false,
    isSaving: false,
    hasError: false,
  });
  assertCase(
    "wire.autosave.memoStable",
    firstAutosave.label === secondAutosave.label &&
      firstAutosave.className === secondAutosave.className
  );

  const markup = renderToStaticMarkup(
    createElement(ProjectScientificFilePanel, {
      projectMetadata: {
        id: PROJECT_ID,
        name: "Demo",
        createdAt: "2026-06-30T10:00:00.000Z",
        updatedAt: "2026-06-30T10:00:00.000Z",
      },
      feedback: null,
      onDismissFeedback: () => {},
      onNewProject: () => {},
      onSaveProject: () => {},
      onOpenProjectFile: async () => {},
      autosaveIndicator: savingAutosave,
      sessionConflict: noneConflict,
      projectSizeMessage: warningSize.message,
    })
  );
  assertCase(
    "wire.render.autosaveLabel",
    markup.includes(savingAutosave.label)
  );
  assertCase(
    "wire.render.sizeWarning",
    warningSize.message ? markup.includes(warningSize.message) : false
  );

  return results;
};
