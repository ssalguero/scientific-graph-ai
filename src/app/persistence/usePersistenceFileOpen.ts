"use client";

import { useCallback, useState } from "react";

import {
  shouldHydrateAfterConflictResolution,
  type DetectPersistenceConflictInput,
} from "@/lib/project/application/persistence-conflict";
import type { PersistenceConflictResolution } from "@/lib/project/domain/persistence-conflict";
import type { LocalProjectRepository } from "@/lib/project/domain/local-project";
import type { ProjectMetadataV1 } from "@/lib/project";

import { buildPersistenceConflictView } from "./persistenceViews";
import {
  buildIncomingRevisionFromSgprojText,
  buildLocalCommittedRevisionRef,
  buildSessionRevisionRef,
} from "./revisionRefs";
import type { PersistenceConflictView } from "./types";

export type PendingFileOpenConflict = {
  file: File;
  view: PersistenceConflictView;
};

export type UsePersistenceFileOpenParams = {
  repo: LocalProjectRepository;
  projectMetadata: ProjectMetadataV1;
  isProjectDirty: boolean;
  activeLocalProjectId: string | null;
  openProjectFile: (file: File) => Promise<void>;
};

export function usePersistenceFileOpen(params: UsePersistenceFileOpenParams) {
  const [pendingConflict, setPendingConflict] =
    useState<PendingFileOpenConflict | null>(null);

  const dismissPendingConflict = useCallback(() => {
    setPendingConflict(null);
  }, []);

  const resolvePendingConflict = useCallback(
    async (resolution: PersistenceConflictResolution) => {
      if (!pendingConflict) return;
      const file = pendingConflict.file;
      setPendingConflict(null);
      if (shouldHydrateAfterConflictResolution(resolution)) {
        await params.openProjectFile(file);
      }
    },
    [pendingConflict, params.openProjectFile]
  );

  const handleOpenProjectFile = useCallback(
    async (file: File) => {
      const sessionRevision = buildSessionRevisionRef(params.projectMetadata);
      const sessionDirtyView = buildPersistenceConflictView({
        isSessionDirty: params.isProjectDirty,
        sessionRevision,
        incomingRevision: sessionRevision,
      });

      if (sessionDirtyView.shouldBlock) {
        setPendingConflict({ file, view: sessionDirtyView });
        return;
      }

      const text = await file.text();
      const incoming = buildIncomingRevisionFromSgprojText(text);
      if (!incoming.ok) {
        await params.openProjectFile(file);
        return;
      }

      let localCommittedRevision:
        | DetectPersistenceConflictInput["localCommittedRevision"]
        | undefined;
      if (params.activeLocalProjectId) {
        const localRecord = await params.repo.getById(params.activeLocalProjectId);
        if (localRecord && localRecord.summary.id === incoming.metadata.id) {
          localCommittedRevision = buildLocalCommittedRevisionRef(
            localRecord.summary
          );
        }
      }

      const conflictView = buildPersistenceConflictView({
        isSessionDirty: false,
        sessionRevision,
        incomingRevision: incoming.revision,
        localCommittedRevision,
      });

      if (conflictView.uiState === "none") {
        await params.openProjectFile(file);
        return;
      }

      setPendingConflict({ file, view: conflictView });
    },
    [
      params.activeLocalProjectId,
      params.isProjectDirty,
      params.openProjectFile,
      params.projectMetadata,
      params.repo,
    ]
  );

  return {
    pendingFileOpenConflict: pendingConflict,
    dismissPendingFileOpenConflict: dismissPendingConflict,
    resolvePendingFileOpenConflict: resolvePendingConflict,
    handleOpenProjectFile,
  };
}
