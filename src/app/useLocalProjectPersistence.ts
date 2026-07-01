"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createLocalProjectRepository } from "@/lib/project/adapters/indexeddb";
import type { LocalProjectRepository } from "@/lib/project/domain/local-project";
import type { LocalProjectSummary } from "@/lib/project/domain/local-project";
import {
  detectRecoverableDraft,
  openLocalProjectDraft,
} from "@/lib/project/application/local-project";

import {
  createLocalProjectActions,
  type LocalProjectActions,
} from "./localProjectActions";
import type { ProjectFileFeedback } from "./projectFileActions";
import {
  applyHydrateProjectPatch,
  type EditorProjectApplyContext,
  type EditorProjectCollectContextV2,
} from "./projectPersistence";
import type { HydrateProjectV2Patch } from "@/lib/project/editor-hydrate-context-v2";

let sharedRepo: LocalProjectRepository | null = null;

export const getLocalProjectRepository = (): LocalProjectRepository => {
  if (!sharedRepo) {
    sharedRepo = createLocalProjectRepository();
  }
  return sharedRepo;
};

export type UseLocalProjectPersistenceParams = {
  buildCollectContextV2: () => EditorProjectCollectContextV2;
  buildApplyContext: () => EditorProjectApplyContext;
  setProjectFileFeedback: (value: ProjectFileFeedback | null) => void;
  setIsProjectDirty: (value: boolean) => void;
  suppressProjectDirtyRef: { current: boolean };
  onProjectOpened?: (patch: HydrateProjectV2Patch) => void;
};

export type LocalProjectRecoveryPrompt = {
  projectId: string;
  projectName: string;
};

export function useLocalProjectPersistence(params: UseLocalProjectPersistenceParams) {
  const repo = useMemo(() => getLocalProjectRepository(), []);
  const [projects, setProjects] = useState<LocalProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeLocalProjectId, setActiveLocalProjectId] = useState<string | null>(
    null
  );
  const [recoveryPrompt, setRecoveryPrompt] =
    useState<LocalProjectRecoveryPrompt | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const actions: LocalProjectActions = useMemo(
    () =>
      createLocalProjectActions({
        repo,
        setProjectFileFeedback: params.setProjectFileFeedback,
        setIsProjectDirty: params.setIsProjectDirty,
        suppressProjectDirtyRef: params.suppressProjectDirtyRef,
        buildCollectContextV2: params.buildCollectContextV2,
        buildApplyContext: params.buildApplyContext,
        onProjectOpened: params.onProjectOpened,
        setActiveLocalProjectId,
      }),
    [
      repo,
      params.buildApplyContext,
      params.buildCollectContextV2,
      params.onProjectOpened,
      params.setIsProjectDirty,
      params.setProjectFileFeedback,
      params.suppressProjectDirtyRef,
    ]
  );

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await actions.handleListLocalProjects();
      setProjects(list);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "No se pudo cargar la biblioteca local."
      );
    } finally {
      setIsLoading(false);
    }
  }, [actions]);

  const openLibrary = useCallback(async () => {
    setIsLibraryOpen(true);
    await refreshProjects();
  }, [refreshProjects]);

  const closeLibrary = useCallback(() => {
    setIsLibraryOpen(false);
  }, []);

  const checkRecovery = useCallback(async (projectId: string, projectName: string) => {
    const draft = await detectRecoverableDraft(repo, projectId);
    if (draft) {
      setRecoveryPrompt({ projectId, projectName });
    }
  }, [repo]);

  const dismissRecovery = useCallback(() => {
    setRecoveryPrompt(null);
  }, []);

  const restoreRecoveryDraft = useCallback(async () => {
    if (!recoveryPrompt) return false;
    const result = await openLocalProjectDraft({
      repo,
      id: recoveryPrompt.projectId,
    });
    if (!result.ok) {
      params.setProjectFileFeedback({
        kind: "error",
        message: result.error.message,
      });
      return false;
    }
    const applyContext = params.buildApplyContext();
    applyHydrateProjectPatch(result.value.patch, applyContext);
    params.onProjectOpened?.(result.value.patch);
    params.suppressProjectDirtyRef.current = true;
    params.setIsProjectDirty(true);
    setActiveLocalProjectId(recoveryPrompt.projectId);
    setRecoveryPrompt(null);
    params.setProjectFileFeedback({
      kind: "success",
      message: `Borrador recuperado: ${recoveryPrompt.projectName}.`,
    });
    return true;
  }, [params, recoveryPrompt, repo]);

  const recoveryCheckedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeLocalProjectId) return;
    if (recoveryCheckedRef.current === activeLocalProjectId) return;
    recoveryCheckedRef.current = activeLocalProjectId;
    const name =
      projects.find((item) => item.id === activeLocalProjectId)?.name ??
      "Proyecto";
    void checkRecovery(activeLocalProjectId, name);
  }, [activeLocalProjectId, checkRecovery, projects]);

  return {
    repo,
    projects,
    isLoading,
    loadError,
    activeLocalProjectId,
    setActiveLocalProjectId,
    recoveryPrompt,
    dismissRecovery,
    restoreRecoveryDraft,
    isLibraryOpen,
    openLibrary,
    closeLibrary,
    refreshProjects,
    ...actions,
  };
}
