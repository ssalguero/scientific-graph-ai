import {
  areProjectRevisionIdsEqual,
  areRevisionsEquivalent,
  createProjectRevisionRef,
  isIncomingRevisionNewerThan,
  isIncomingRevisionOlderThan,
  type PersistenceConflict,
  type ProjectRevisionRef,
} from "../../domain/persistence-conflict";

export type DetectPersistenceConflictInput = {
  isSessionDirty: boolean;
  sessionRevision?: ProjectRevisionRef;
  incomingRevision: ProjectRevisionRef;
  localCommittedRevision?: ProjectRevisionRef;
  localDraftRevision?: ProjectRevisionRef;
};

export type DetectPersistenceConflictResult = {
  conflict: PersistenceConflict | null;
};

export const shouldBlockHydrate = (conflict: PersistenceConflict): boolean =>
  conflict.severity === "blocking";

export const detectPersistenceConflict = (
  input: DetectPersistenceConflictInput
): DetectPersistenceConflictResult => {
  const incoming = createProjectRevisionRef(input.incomingRevision);

  if (input.isSessionDirty) {
    return {
      conflict: {
        kind: "SESSION_DIRTY",
        severity: "blocking",
        sessionRevision: input.sessionRevision,
        incomingRevision: incoming,
        localCommittedRevision: input.localCommittedRevision,
      },
    };
  }

  if (
    input.localDraftRevision &&
    input.localCommittedRevision &&
    areProjectRevisionIdsEqual(
      input.localDraftRevision.projectId,
      input.localCommittedRevision.projectId
    ) &&
    isIncomingRevisionNewerThan(
      input.localCommittedRevision,
      input.localDraftRevision
    )
  ) {
    return {
      conflict: {
        kind: "RECOVERABLE_DRAFT",
        severity: "warning",
        sessionRevision: input.sessionRevision,
        incomingRevision: incoming,
        localCommittedRevision: input.localCommittedRevision,
      },
    };
  }

  const sessionRevision = input.sessionRevision;
  if (
    sessionRevision &&
    areProjectRevisionIdsEqual(sessionRevision.projectId, incoming.projectId)
  ) {
    if (areRevisionsEquivalent(sessionRevision, incoming)) {
      return { conflict: null };
    }

    if (isIncomingRevisionNewerThan(sessionRevision, incoming)) {
      return {
        conflict: {
          kind: "INCOMING_NEWER",
          severity: "warning",
          sessionRevision,
          incomingRevision: incoming,
          localCommittedRevision: input.localCommittedRevision,
        },
      };
    }
  }

  if (
    input.localCommittedRevision &&
    areProjectRevisionIdsEqual(
      input.localCommittedRevision.projectId,
      incoming.projectId
    ) &&
    isIncomingRevisionOlderThan(input.localCommittedRevision, incoming)
  ) {
    return {
      conflict: {
        kind: "INCOMING_OLDER_THAN_LOCAL",
        severity: "warning",
        sessionRevision,
        incomingRevision: incoming,
        localCommittedRevision: input.localCommittedRevision,
      },
    };
  }

  return { conflict: null };
};
