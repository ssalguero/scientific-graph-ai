import {
  DEFAULT_PROJECT_NAME,
  hydrateProjectJson,
  serializeProject,
  type ProjectMetadataV1,
} from "@/lib/project";
import {
  formatProjectOpenError,
  formatProjectSaveError,
  formatProjectWarningCount,
  validateProjectFileSelection,
  type ProjectFileFeedbackKind,
} from "@/lib/project/userMessages";

import { applyExperimentalXViewportFit } from "./chartViewport";
import {
  applyHydrateProjectPatch,
  collectProjectSnapshot,
  createInitialProjectMetadata,
  sanitizeProjectFileName,
  type EditorProjectApplyContext,
  type EditorProjectReadContext,
  type EditorVisibilitySetters,
  type EditorVisibilityState,
} from "./projectPersistence";

export const APP_VERSION = "0.1.0";

export type ProjectFileFeedback = {
  kind: ProjectFileFeedbackKind;
  message: string;
};

export type ProjectFileActionsDeps = {
  projectMetadata: ProjectMetadataV1;
  setProjectMetadata: (value: ProjectMetadataV1) => void;
  setIsProjectDirty: (value: boolean) => void;
  setProjectFileFeedback: (value: ProjectFileFeedback | null) => void;
  suppressProjectDirtyRef: { current: boolean };
  buildReadContext: () => EditorProjectReadContext;
  buildApplyContext: () => EditorProjectApplyContext;
  resetScientificProject: () => void;
};

export const createProjectFileActions = (deps: ProjectFileActionsDeps) => {
  const handleNewProject = () => {
    deps.resetScientificProject();
    deps.setProjectFileFeedback({
      kind: "success",
      message: "Nuevo proyecto científico creado.",
    });
  };

  const handleSaveProject = (projectName: string) => {
    const trimmedName = projectName.trim() || DEFAULT_PROJECT_NAME;
    const nextMetadata: ProjectMetadataV1 = {
      ...deps.projectMetadata,
      name: trimmedName,
    };
    deps.setProjectMetadata(nextMetadata);

    const serialized = serializeProject({
      snapshot: collectProjectSnapshot({
        ...deps.buildReadContext(),
        metadata: nextMetadata,
      }),
      appVersion: APP_VERSION,
      options: { includeChecksum: false },
    });

    if (!serialized.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: formatProjectSaveError(serialized.errors),
      });
      return;
    }

    const downloadName = sanitizeProjectFileName(nextMetadata.name);
    const blob = new Blob([serialized.json], {
      type: "application/vnd.scientific-graph-ai.project+json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName;
    anchor.click();
    URL.revokeObjectURL(url);

    deps.setProjectMetadata({
      ...nextMetadata,
      updatedAt: serialized.file.exportedAt,
    });
    deps.suppressProjectDirtyRef.current = true;
    deps.setIsProjectDirty(false);

    deps.setProjectFileFeedback({
      kind: serialized.warnings.length > 0 ? "warning" : "success",
      message: `Proyecto guardado como ${downloadName}${formatProjectWarningCount(serialized.warnings.length)}.`,
    });
  };

  const handleOpenProjectFile = async (file: File) => {
    const selectionIssue = validateProjectFileSelection(file.name);
    if (selectionIssue) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: selectionIssue.message,
      });
      return;
    }

    try {
      const text = await file.text();
      const hydrated = hydrateProjectJson(text);
      if (!hydrated.ok) {
        deps.setProjectFileFeedback({
          kind: "error",
          message: formatProjectOpenError(hydrated.errors, { fileText: text }),
        });
        return;
      }

      const applyContext = deps.buildApplyContext();
      applyHydrateProjectPatch(hydrated.patch, applyContext);
      if (
        hydrated.patch.project.graphContext == null &&
        hydrated.patch.project.dataset.series.length > 0
      ) {
        applyExperimentalXViewportFit(
          hydrated.patch.project.dataset.series,
          applyContext
        );
      }
      deps.setProjectMetadata(hydrated.patch.project.metadata);
      deps.suppressProjectDirtyRef.current = true;
      deps.setIsProjectDirty(false);

      deps.setProjectFileFeedback({
        kind: hydrated.patch.warnings.length > 0 ? "warning" : "success",
        message: `Proyecto "${hydrated.patch.project.metadata.name}" abierto${formatProjectWarningCount(hydrated.patch.warnings.length)}.`,
      });
    } catch {
      deps.setProjectFileFeedback({
        kind: "error",
        message: "No se pudo leer el archivo de proyecto.",
      });
    }
  };

  return {
    handleNewProject,
    handleSaveProject,
    handleOpenProjectFile,
  };
};

export type { EditorVisibilityState, EditorVisibilitySetters };
