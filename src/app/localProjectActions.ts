/**
 * Local project actions for GraphEditor (IndexedDB open/save/export UI glue).
 *
 * ENGINE-9: Certified Product Flows (open / save / export / close) go through
 * `@/engine`. This module keeps view-state feedback, hydrate apply, and Blob
 * download — not business orchestration.
 */

import {
  closeProject,
  exportProject,
  openProject,
  saveProject,
} from "@/engine";
import type {
  LocalProjectRepository,
  LocalProjectSummary,
} from "@/lib/project/domain/local-project";
import {
  deleteLocalProject,
  duplicateLocalProject,
  listLocalProjects,
  renameLocalProject,
} from "@/lib/project/application/local-project";
import {
  formatLocalProjectError,
  formatLocalProjectIntegrityWarning,
} from "@/lib/project/userMessages";

import { ensureAppEngineConfigured } from "./engineBootstrap";
import { applyExperimentalXViewportFit } from "./chartViewport";
import {
  applyHydrateProjectPatch,
  type EditorProjectApplyContext,
  type EditorProjectCollectContextV2,
  type HydrateProjectV2Patch,
} from "./projectPersistence";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { APP_VERSION, type ProjectFileFeedback } from "./projectFileActions";

export type LocalProjectActionsDeps = {
  repo: LocalProjectRepository;
  setProjectFileFeedback: (value: ProjectFileFeedback | null) => void;
  setIsProjectDirty: (value: boolean) => void;
  suppressProjectDirtyRef: { current: boolean };
  buildCollectContextV2: () => EditorProjectCollectContextV2;
  buildApplyContext: () => EditorProjectApplyContext;
  onProjectOpened?: (patch: HydrateProjectV2Patch) => void;
  setActiveLocalProjectId?: (id: string | null) => void;
  prepareCollectContextForSave?: (
    ctx: EditorProjectCollectContextV2
  ) => EditorProjectCollectContextV2;
};

export const buildLocalSaveCollectContext = (
  buildCollectContextV2: () => EditorProjectCollectContextV2,
  prepareCollectContextForSave?: (
    ctx: EditorProjectCollectContextV2
  ) => EditorProjectCollectContextV2
): EditorProjectCollectContextV2 => {
  const base = buildCollectContextV2();
  const prepared = prepareCollectContextForSave?.(base) ?? base;
  return {
    ...prepared,
    projectVisualGraphEntries: base.projectVisualGraphEntries,
  };
};

type OpenedProjectView = {
  patch: HydrateProjectV2Patch;
  integrityStatus: "VALID" | "CHECKSUM_FAILED" | "NOT_VERIFIED";
  summary: { name: string };
};

type SaveProjectView = {
  id: string;
  name: string;
  summary?: LocalProjectSummary;
};

type ExportProjectView = {
  json: string;
};

const engineFailureMessage = (response: {
  error?: { message?: string; code?: string } | undefined;
}): string => {
  if (response.error?.message) return response.error.message;
  if (response.error?.code) return response.error.code;
  return "Operación de proyecto fallida.";
};

const applyOpenedProject = (
  deps: LocalProjectActionsDeps,
  opened: OpenedProjectView
) => {
  const applyContext = deps.buildApplyContext();
  applyHydrateProjectPatch(opened.patch, applyContext);
  deps.onProjectOpened?.(opened.patch);
  if (
    opened.patch.project.graphContext == null &&
    opened.patch.sessionDatasets.some(
      (dataset: SessionDataset) => dataset.datasetPayload.series.length > 0
    )
  ) {
    const activeSession = opened.patch.sessionDatasets.find(
      (dataset: SessionDataset) => dataset.id === opened.patch.activeDatasetId
    );
    if (activeSession) {
      applyExperimentalXViewportFit(
        activeSession.datasetPayload.series,
        applyContext
      );
      applyContext.setAutoScaleY(true);
    }
  }
  deps.suppressProjectDirtyRef.current = true;
  deps.setIsProjectDirty(false);
  deps.setActiveLocalProjectId?.(opened.patch.project.metadata.id);
};

export const createLocalProjectActions = (deps: LocalProjectActionsDeps) => {
  const handleSaveLocalProject = async (projectName: string) => {
    ensureAppEngineConfigured();
    const response = await saveProject({
      projectName,
      ctx: buildLocalSaveCollectContext(
        deps.buildCollectContextV2,
        deps.prepareCollectContextForSave
      ),
      appVersion: APP_VERSION,
    });
    if (!response.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: engineFailureMessage(response),
      });
      return null;
    }
    const saved = response.result as SaveProjectView | undefined;
    if (!saved?.id) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: "Guardado sin resultado de proyecto.",
      });
      return null;
    }
    deps.suppressProjectDirtyRef.current = true;
    deps.setIsProjectDirty(false);
    deps.setActiveLocalProjectId?.(saved.id);
    deps.setProjectFileFeedback({
      kind: "success",
      message: `Proyecto guardado localmente: ${saved.name}.`,
    });
    return (
      saved.summary ??
      ({
        id: saved.id,
        name: saved.name,
      } as LocalProjectSummary)
    );
  };

  const handleOpenLocalProject = async (
    id: string,
    options?: { skipIntegrityWarning?: boolean }
  ) => {
    ensureAppEngineConfigured();
    const record = await deps.repo.getById(id);
    if (
      record &&
      record.storageMeta.integrityStatus === "CHECKSUM_FAILED" &&
      !options?.skipIntegrityWarning
    ) {
      deps.setProjectFileFeedback({
        kind: "warning",
        message: formatLocalProjectIntegrityWarning(),
      });
    }

    const response = await openProject({ id });
    if (!response.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: engineFailureMessage(response),
      });
      return false;
    }

    const opened = response.result as OpenedProjectView | undefined;
    if (!opened?.patch) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: "Apertura sin parche de hidratación.",
      });
      return false;
    }

    applyOpenedProject(deps, opened);
    deps.setProjectFileFeedback({
      kind:
        opened.integrityStatus === "CHECKSUM_FAILED" ? "warning" : "success",
      message: `Proyecto "${opened.summary.name}" abierto desde biblioteca local.`,
    });
    return true;
  };

  const handleListLocalProjects = async (): Promise<LocalProjectSummary[]> =>
    listLocalProjects(deps.repo, "lastAccessedAt");

  const handleDeleteLocalProject = async (id: string) => {
    const result = await deleteLocalProject(deps.repo, id);
    if (!result.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: formatLocalProjectError(result.error),
      });
      return false;
    }
    deps.setProjectFileFeedback({
      kind: "success",
      message: "Proyecto eliminado de la biblioteca local.",
    });
    return true;
  };

  const handleDuplicateLocalProject = async (id: string, newName: string) => {
    const result = await duplicateLocalProject(deps.repo, id, newName);
    if (!result.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: formatLocalProjectError(result.error),
      });
      return null;
    }
    deps.setProjectFileFeedback({
      kind: "success",
      message: `Copia creada: ${result.value.summary.name}.`,
    });
    return result.value;
  };

  const handleRenameLocalProject = async (id: string, newName: string) => {
    const result = await renameLocalProject(deps.repo, id, newName);
    if (!result.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: formatLocalProjectError(result.error),
      });
      return null;
    }
    return result.value;
  };

  const handleExportLocalProjectSgproj = async (id: string) => {
    ensureAppEngineConfigured();
    const response = await exportProject({ projectId: id });
    if (!response.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: engineFailureMessage(response),
      });
      return;
    }
    const exported = response.result as ExportProjectView | undefined;
    if (!exported?.json) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: "Exportación sin payload .sgproj.",
      });
      return;
    }
    const blob = new Blob([exported.json], {
      type: "application/vnd.scientific-graph-ai.project+json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "project.sgproj";
    anchor.click();
    URL.revokeObjectURL(url);
    deps.setProjectFileFeedback({
      kind: "success",
      message: "Proyecto exportado como .sgproj.",
    });
  };

  const handleCloseLocalProject = async () => {
    ensureAppEngineConfigured();
    await closeProject({});
  };

  return {
    handleSaveLocalProject,
    handleOpenLocalProject,
    handleListLocalProjects,
    handleDeleteLocalProject,
    handleDuplicateLocalProject,
    handleRenameLocalProject,
    handleExportLocalProjectSgproj,
    handleCloseLocalProject,
  };
};

export type LocalProjectActions = ReturnType<typeof createLocalProjectActions>;
