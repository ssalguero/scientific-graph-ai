"use client";

import { useMemo } from "react";

import type { DetectPersistenceConflictInput } from "@/lib/project/application/persistence-conflict";
import type { FormatPersistenceConflictPromptOptions } from "@/lib/project/userMessages";

import { useAutosaveIndicator } from "./useAutosaveIndicator";
import { usePersistenceConflictState } from "./usePersistenceConflictState";
import { useProjectSizeAssessment } from "./useProjectSizeAssessment";

export type UseProjectPersistenceUiParams = {
  sessionConflictInput: DetectPersistenceConflictInput;
  recoveryConflictInput?: DetectPersistenceConflictInput | null;
  recoveryPromptOptions?: FormatPersistenceConflictPromptOptions;
  autosaveEnabled: boolean;
  hasActiveLocalProject: boolean;
  isProjectDirty: boolean;
  isAutosaving: boolean;
  autosaveHasError: boolean;
  projectSnapshotByteLength: number;
  sizeIssueCodes?: string[];
};

export function useProjectPersistenceUi(params: UseProjectPersistenceUiParams) {
  const sessionConflict = usePersistenceConflictState({
    input: params.sessionConflictInput,
  });

  const recoveryConflict = usePersistenceConflictState({
    input: params.recoveryConflictInput ?? null,
    promptOptions: params.recoveryPromptOptions,
  });

  const autosaveIndicator = useAutosaveIndicator({
    enabled: params.autosaveEnabled,
    hasActiveLocalProject: params.hasActiveLocalProject,
    isProjectDirty: params.isProjectDirty,
    isSaving: params.isAutosaving,
    hasError: params.autosaveHasError,
  });

  const projectSize = useProjectSizeAssessment({
    byteLength: params.projectSnapshotByteLength,
    issueCodes: params.sizeIssueCodes,
  });

  const recoveryPromptMessage = useMemo(() => {
    if (
      recoveryConflict.conflict?.kind !== "RECOVERABLE_DRAFT" ||
      !recoveryConflict.prompt
    ) {
      return null;
    }
    return recoveryConflict.prompt;
  }, [recoveryConflict.conflict?.kind, recoveryConflict.prompt]);

  return {
    sessionConflict,
    recoveryConflict,
    autosaveIndicator,
    projectSize,
    recoveryPromptMessage,
  };
}
