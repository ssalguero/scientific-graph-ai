import {
  detectPersistenceConflict,
  shouldBlockHydrate,
  shouldHydrateAfterConflictResolution,
} from "../persistence-conflict";
import {
  createProjectRevisionRef,
  type ProjectRevisionRef,
} from "../../domain/persistence-conflict";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const PROJECT_ID = "00000000-0000-4000-8000-00000000b602";

const revision = (
  overrides: Partial<ProjectRevisionRef> & Pick<ProjectRevisionRef, "updatedAt">
): ProjectRevisionRef =>
  createProjectRevisionRef({
    projectId: PROJECT_ID,
    source: "session",
    ...overrides,
  });

export const runPersistenceConflictApplicationCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const session = revision({ updatedAt: "2026-06-30T10:00:00.000Z" });
  const incomingNewer = revision({
    updatedAt: "2026-06-30T11:00:00.000Z",
    source: "sgproj-file",
    exportedAt: "2026-06-30T11:00:00.000Z",
  });
  const incomingOlder = revision({
    updatedAt: "2026-06-30T09:00:00.000Z",
    source: "sgproj-file",
  });
  const localCommitted = revision({
    updatedAt: "2026-06-30T10:30:00.000Z",
    source: "local-committed",
  });
  const localDraft = revision({
    updatedAt: "2026-06-30T12:00:00.000Z",
    source: "local-draft",
  });

  const dirtyResult = detectPersistenceConflict({
    isSessionDirty: true,
    sessionRevision: session,
    incomingRevision: incomingNewer,
  });
  assertCase(
    "app.conflict.sessionDirty.kind",
    dirtyResult.conflict?.kind === "SESSION_DIRTY"
  );
  assertCase(
    "app.conflict.sessionDirty.blocking",
    dirtyResult.conflict ? shouldBlockHydrate(dirtyResult.conflict) : false
  );

  const equivalent = detectPersistenceConflict({
    isSessionDirty: false,
    sessionRevision: session,
    incomingRevision: { ...session, source: "sgproj-file" },
  });
  assertCase("app.conflict.equivalent.null", equivalent.conflict === null);

  const newer = detectPersistenceConflict({
    isSessionDirty: false,
    sessionRevision: session,
    incomingRevision: incomingNewer,
  });
  assertCase(
    "app.conflict.incomingNewer.kind",
    newer.conflict?.kind === "INCOMING_NEWER"
  );
  assertCase(
    "app.conflict.incomingNewer.warning",
    newer.conflict?.severity === "warning"
  );
  assertCase(
    "app.conflict.incomingNewer.notBlocking",
    newer.conflict ? !shouldBlockHydrate(newer.conflict) : false
  );

  const olderLocal = detectPersistenceConflict({
    isSessionDirty: false,
    sessionRevision: session,
    incomingRevision: incomingOlder,
    localCommittedRevision: localCommitted,
  });
  assertCase(
    "app.conflict.incomingOlderLocal.kind",
    olderLocal.conflict?.kind === "INCOMING_OLDER_THAN_LOCAL"
  );

  const recoverable = detectPersistenceConflict({
    isSessionDirty: false,
    sessionRevision: session,
    incomingRevision: incomingNewer,
    localCommittedRevision: localCommitted,
    localDraftRevision: localDraft,
  });
  assertCase(
    "app.conflict.recoverableDraft.kind",
    recoverable.conflict?.kind === "RECOVERABLE_DRAFT"
  );

  const differentId = detectPersistenceConflict({
    isSessionDirty: false,
    sessionRevision: session,
    incomingRevision: revision({
      projectId: "other-project-id",
      updatedAt: "2026-06-30T12:00:00.000Z",
      source: "sgproj-file",
    }),
  });
  assertCase("app.conflict.differentId.null", differentId.conflict === null);

  assertCase(
    "app.resolve.loadIncoming",
    shouldHydrateAfterConflictResolution("LOAD_INCOMING") === true
  );
  assertCase(
    "app.resolve.discardAndLoad",
    shouldHydrateAfterConflictResolution("DISCARD_AND_LOAD") === true
  );
  assertCase(
    "app.resolve.keepCurrent",
    shouldHydrateAfterConflictResolution("KEEP_CURRENT") === false
  );
  assertCase(
    "app.resolve.cancel",
    shouldHydrateAfterConflictResolution("CANCEL") === false
  );

  const newerWithoutSession = detectPersistenceConflict({
    isSessionDirty: false,
    incomingRevision: incomingNewer,
    localCommittedRevision: revision({
      updatedAt: "2026-06-30T09:00:00.000Z",
      source: "local-committed",
    }),
  });
  assertCase(
    "app.conflict.withoutSession.noIncomingNewer",
    newerWithoutSession.conflict?.kind !== "INCOMING_NEWER"
  );

  return results;
};
