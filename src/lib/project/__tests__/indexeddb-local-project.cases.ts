import {
  deleteLocalProject,
  detectRecoverableDraft,
  duplicateLocalProject,
  exportLocalProjectToSgproj,
  InMemoryLocalProjectRepository,
  listLocalProjects,
  openLocalProject,
  renameLocalProject,
  saveLocalProject,
  saveLocalProjectDraft,
  verifyEnvelopeChecksum,
} from "@/lib/project/application/local-project";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  buildLocalProjectCollectContext,
  buildMultiLocalProjectCollectContext,
  captureMetadataNameFromPatch,
} from "./indexeddb-local-project-helpers";

/** Async entry for validate script. */
export const runIndexedDbLocalProjectCaseSuite = async (): Promise<
  CaseResult[]
> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const projectId = "00000000-0000-4000-8000-00000000b501";
  const repo = new InMemoryLocalProjectRepository();
  const ctx = buildLocalProjectCollectContext(projectId, "Alpha project");

  const saved = await saveLocalProject({ repo, ctx, projectName: "Alpha project" });
  assertCase("local.save.ok", saved.ok === true);
  if (!saved.ok) return results;

  const listed = await listLocalProjects(repo, "lastAccessedAt");
  assertCase("local.list.count", listed.length === 1);
  assertCase("local.list.name", listed[0]?.name === "Alpha project");
  assertCase("local.list.integrity", listed[0]?.integrityStatus === "VALID");
  assertCase("local.list.storageState", listed[0]?.storageState === "NORMAL");

  const opened = await openLocalProject({ repo, id: projectId });
  assertCase("local.open.ok", opened.ok === true);
  if (opened.ok) {
    assertCase("local.open.integrity", opened.value.integrityStatus === "VALID");
    assertCase(
      "local.open.hydrateName",
      captureMetadataNameFromPatch(opened.value.patch) === "Alpha project"
    );
  }

  const afterOpenList = await listLocalProjects(repo, "lastAccessedAt");
  assertCase(
    "local.touchLastAccessed.updates",
    (afterOpenList[0]?.lastAccessedAt ?? "") >= ctx.metadata.updatedAt
  );

  const renamed = await renameLocalProject(repo, projectId, "Beta project");
  assertCase("local.rename.ok", renamed.ok === true);
  if (renamed.ok) {
    assertCase("local.rename.summary", renamed.value.name === "Beta project");
  }

  const reopenedAfterRename = await openLocalProject({
    repo,
    id: projectId,
    touchAccess: false,
  });
  assertCase("local.rename.reopen.ok", reopenedAfterRename.ok === true);
  if (reopenedAfterRename.ok) {
    assertCase(
      "local.rename.reopen.name",
      captureMetadataNameFromPatch(reopenedAfterRename.value.patch) ===
        "Beta project"
    );
  }

  const exported = await exportLocalProjectToSgproj(repo, projectId);
  assertCase("local.export.ok", exported.ok === true);
  if (exported.ok) {
    const parsed = JSON.parse(exported.value);
    assertCase(
      "local.export.metadataName",
      parsed.project.metadata.name === "Beta project"
    );
  }

  const multiCtx = buildMultiLocalProjectCollectContext(
    "00000000-0000-4000-8000-00000000b502"
  );
  const multiSaved = await saveLocalProject({
    repo,
    ctx: multiCtx,
    projectName: "Multi project",
  });
  assertCase("local.multi.save.ok", multiSaved.ok === true);

  const duplicated = await duplicateLocalProject(repo, projectId, "Beta copy");
  assertCase("local.duplicate.ok", duplicated.ok === true);
  if (duplicated.ok) {
    assertCase("local.duplicate.newId", duplicated.value.id !== projectId);
    assertCase("local.duplicate.name", duplicated.value.summary.name === "Beta copy");
  }

  const draftSaved = await saveLocalProjectDraft({
    repo,
    ctx: buildLocalProjectCollectContext(projectId, "Beta project"),
    projectName: "Beta draft name",
  });
  assertCase("local.draft.save.ok", draftSaved.ok === true);

  const recoverable = await detectRecoverableDraft(repo, projectId);
  assertCase("local.draft.recoverable", recoverable !== null);

  const listedWithDraft = await listLocalProjects(repo);
  const committedEntry = listedWithDraft.find((item) => item.id === projectId);
  assertCase(
    "local.draft.flag",
    committedEntry?.hasAutosaveDraft === true ||
      committedEntry?.storageState === "RECOVERABLE"
  );

  await deleteLocalProject(repo, projectId);
  const afterDelete = await repo.getById(projectId);
  assertCase("local.delete.removesCommitted", afterDelete === null);
  const afterDeleteDraft = await repo.getAutosaveDraft(projectId);
  assertCase("local.delete.removesDraft", afterDeleteDraft === null);

  const record = await repo.getById("00000000-0000-4000-8000-00000000b502");
  if (record) {
    const badJson = record.envelope.json.slice(0, -4) + "XXXX";
    const status = verifyEnvelopeChecksum(badJson, record.storageMeta.checksum);
    assertCase("local.integrity.checksumFailed", status === "CHECKSUM_FAILED");
  }

  return results;
};
