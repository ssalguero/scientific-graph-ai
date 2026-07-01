import type {
  LocalProjectRepository,
  LocalProjectSummary,
} from "@/lib/project/domain/local-project";
import {
  deleteLocalProject,
  duplicateLocalProject,
  exportLocalProjectToSgproj,
  listLocalProjects,
  openLocalProject,
  renameLocalProject,
  saveLocalProject,
  type OpenLocalProjectResult,
} from "@/lib/project/application/local-project";
import {
  formatLocalProjectError,
  formatLocalProjectIntegrityWarning,
} from "@/lib/project/userMessages";

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
};

const applyOpenedProject = (
  deps: LocalProjectActionsDeps,
  opened: OpenLocalProjectResult
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
    }
  }
  deps.suppressProjectDirtyRef.current = true;
  deps.setIsProjectDirty(false);
  deps.setActiveLocalProjectId?.(opened.patch.project.metadata.id);
};

export const createLocalProjectActions = (deps: LocalProjectActionsDeps) => {
  const handleSaveLocalProject = async (projectName: string) => {
    const result = await saveLocalProject({
      repo: deps.repo,
      ctx: deps.buildCollectContextV2(),
      projectName,
      appVersion: APP_VERSION,
    });
    if (!result.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: formatLocalProjectError(result.error),
      });
      return null;
    }
    deps.suppressProjectDirtyRef.current = true;
    deps.setIsProjectDirty(false);
    deps.setActiveLocalProjectId?.(result.value.id);
    deps.setProjectFileFeedback({
      kind: "success",
      message: `Proyecto guardado localmente: ${result.value.name}.`,
    });
    return result.value;
  };

  const handleOpenLocalProject = async (
    id: string,
    options?: { skipIntegrityWarning?: boolean }
  ) => {
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

    const result = await openLocalProject({ repo: deps.repo, id });
    if (!result.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: formatLocalProjectError(result.error),
      });
      return false;
    }

    applyOpenedProject(deps, result.value);
    deps.setProjectFileFeedback({
      kind:
        result.value.integrityStatus === "CHECKSUM_FAILED" ? "warning" : "success",
      message: `Proyecto "${result.value.summary.name}" abierto desde biblioteca local.`,
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
    const result = await exportLocalProjectToSgproj(deps.repo, id);
    if (!result.ok) {
      deps.setProjectFileFeedback({
        kind: "error",
        message: formatLocalProjectError(result.error),
      });
      return;
    }
    const blob = new Blob([result.value], {
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

  return {
    handleSaveLocalProject,
    handleOpenLocalProject,
    handleListLocalProjects,
    handleDeleteLocalProject,
    handleDuplicateLocalProject,
    handleRenameLocalProject,
    handleExportLocalProjectSgproj,
  };
};

export type LocalProjectActions = ReturnType<typeof createLocalProjectActions>;
