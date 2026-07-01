"use client";

import { useMemo } from "react";

import type { DetectPersistenceConflictInput } from "@/lib/project/application/persistence-conflict";
import type { FormatPersistenceConflictPromptOptions } from "@/lib/project/userMessages";

import { buildPersistenceConflictView } from "./persistenceViews";
import type { PersistenceConflictView } from "./types";

export type UsePersistenceConflictStateParams = {
  input: DetectPersistenceConflictInput | null;
  promptOptions?: FormatPersistenceConflictPromptOptions;
};

export function usePersistenceConflictState(
  params: UsePersistenceConflictStateParams
): PersistenceConflictView {
  const { input, promptOptions } = params;

  return useMemo(() => {
    if (!input) {
      return {
        uiState: "none",
        conflict: null,
        shouldBlock: false,
        prompt: null,
      };
    }
    return buildPersistenceConflictView(input, promptOptions);
  }, [
    input?.isSessionDirty,
    input?.sessionRevision?.projectId,
    input?.sessionRevision?.updatedAt,
    input?.sessionRevision?.exportedAt,
    input?.sessionRevision?.source,
    input?.incomingRevision.projectId,
    input?.incomingRevision.updatedAt,
    input?.incomingRevision.exportedAt,
    input?.incomingRevision.source,
    input?.localCommittedRevision?.projectId,
    input?.localCommittedRevision?.updatedAt,
    input?.localCommittedRevision?.exportedAt,
    input?.localCommittedRevision?.source,
    input?.localDraftRevision?.projectId,
    input?.localDraftRevision?.updatedAt,
    input?.localDraftRevision?.exportedAt,
    input?.localDraftRevision?.source,
    promptOptions?.projectName,
  ]);
}
