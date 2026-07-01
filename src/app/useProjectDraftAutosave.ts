"use client";

import { useEffect, useRef } from "react";

import { saveLocalProjectDraft } from "@/lib/project/application/local-project";
import type { LocalProjectRepository } from "@/lib/project/domain/local-project";

import { APP_VERSION } from "./projectFileActions";
import type { EditorProjectCollectContextV2 } from "./projectPersistence";

const AUTOSAVE_DEBOUNCE_MS = 3000;

export type UseProjectDraftAutosaveParams = {
  enabled: boolean;
  isProjectDirty: boolean;
  projectName: string;
  activeLocalProjectId: string | null;
  repo: LocalProjectRepository;
  buildCollectContextV2: () => EditorProjectCollectContextV2;
  onAutosaved?: () => void;
  onAutosaveError?: (message: string) => void;
};

export function useProjectDraftAutosave(params: UseProjectDraftAutosaveParams) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!params.enabled || !params.isProjectDirty || !params.activeLocalProjectId) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (savingRef.current) return;
      savingRef.current = true;
      void saveLocalProjectDraft({
        repo: params.repo,
        ctx: params.buildCollectContextV2(),
        projectName: params.projectName,
        appVersion: APP_VERSION,
      })
        .then((result) => {
          if (result.ok) {
            params.onAutosaved?.();
            return;
          }
          params.onAutosaveError?.(result.error.message);
        })
        .finally(() => {
          savingRef.current = false;
        });
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    params.enabled,
    params.isProjectDirty,
    params.projectName,
    params.activeLocalProjectId,
    params.repo,
    params.buildCollectContextV2,
    params.onAutosaved,
    params.onAutosaveError,
  ]);
}
