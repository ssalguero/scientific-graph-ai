import {
  DEFAULT_PROJECT_NAME,
  hydrateProjectJson,
  serializeProjectV2,
  type ProjectMetadataV1,
} from "@/lib/project";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
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
  collectProjectSnapshotV2,
  createInitialProjectMetadata,
  sanitizeProjectFileName,
  type EditorProjectApplyContext,
  type EditorProjectCollectContextV2,
  type HydrateProjectV2Patch,
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
  buildCollectContextV2: () => EditorProjectCollectContextV2;
  buildApplyContext: () => EditorProjectApplyContext;
  resetScientificProject: () => void;
  onProjectOpened?: (patch: HydrateProjectV2Patch) => void;
  onProjectSaved?: (meta: {
    target: "local" | "file";
    projectName: string;
  }) => void;
  prepareCollectContextForSave?: (
    ctx: EditorProjectCollectContextV2
  ) => EditorProjectCollectContextV2;
  finalizeProjectSnapshotForSave?: (
    project: ScientificProjectV2,
    ctx: EditorProjectCollectContextV2
  ) => ScientificProjectV2;
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

    const baseCtx = deps.buildCollectContextV2();
    const ctx = deps.prepareCollectContextForSave?.(baseCtx) ?? baseCtx;

    const collected = collectProjectSnapshotV2({
      ...ctx,
      metadata: nextMetadata,
    });
    const project =
      deps.finalizeProjectSnapshotForSave?.(collected, ctx) ?? collected;

    const serialized = serializeProjectV2({
      project,
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
    deps.onProjectSaved?.({
      target: "file",
      projectName: nextMetadata.name,
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
      deps.onProjectOpened?.(hydrated.patch);
      if (
        hydrated.patch.project.graphContext == null &&
        hydrated.patch.sessionDatasets.some(
          (dataset: SessionDataset) => dataset.datasetPayload.series.length > 0
        )
      ) {
        const activeSession = hydrated.patch.sessionDatasets.find(
          (dataset: SessionDataset) => dataset.id === hydrated.patch.activeDatasetId
        );
        if (activeSession) {
          applyExperimentalXViewportFit(
            activeSession.datasetPayload.series,
            applyContext
          );
        }
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

export { createInitialProjectMetadata };
