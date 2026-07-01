import { collectProjectSnapshotV2 } from "../../collect-project-snapshot-v2";
import type { EditorProjectCollectContextV2 } from "../../editor-collect-context-v2";
import type { HydrateProjectV2Patch } from "../../editor-hydrate-context-v2";
import { hydrateProjectJson } from "../../hydrate";
import { serializeProjectV2 } from "../../serialize-project-v2";
import type {
  LocalProjectId,
  LocalProjectRecord,
  LocalProjectRepository,
  LocalProjectResult,
  LocalProjectSummary,
  LocalProjectSummaryOrderBy,
} from "../../domain/local-project";
import { localProjectError, localProjectFail, localProjectOk } from "../../domain/local-project";
import { isScientificProjectV2 } from "../../domain/scientific-project";
import {
  computeEnvelopeChecksum,
  verifyEnvelopeChecksum,
} from "./checksum";
import { duplicateEnvelopeForNewProject } from "./duplicate-project";
import { patchEnvelopeMetadataName } from "./envelope-metadata-patch";
import {
  buildIndexableMetadataFromFile,
  buildLocalProjectRecord,
  buildSummaryFromRecordParts,
  sortSummaries,
} from "./record-builder";
import { LOCAL_PROJECT_DEFAULT_APP_VERSION } from "./constants";

export type SaveLocalProjectInput = {
  repo: LocalProjectRepository;
  ctx: EditorProjectCollectContextV2;
  projectName: string;
  appVersion?: string;
};

export const saveLocalProject = async (
  input: SaveLocalProjectInput
): Promise<LocalProjectResult<LocalProjectSummary>> => {
  const trimmedName = input.projectName.trim();
  if (!trimmedName) {
    return localProjectFail(
      localProjectError("INVALID_NAME", "Project name cannot be empty")
    );
  }

  const metadata = { ...input.ctx.metadata, name: trimmedName };
  const project = collectProjectSnapshotV2({ ...input.ctx, metadata });
  const serialized = serializeProjectV2({
    project,
    appVersion: input.appVersion ?? LOCAL_PROJECT_DEFAULT_APP_VERSION,
    options: { includeChecksum: false },
  });

  if (!serialized.ok) {
    return localProjectFail(
      localProjectError(
        "SERIALIZE_FAILED",
        serialized.errors.map((item) => item.message).join("; ")
      )
    );
  }

  const checksum = await computeEnvelopeChecksum(serialized.json);
  const existing = await input.repo.getById(metadata.id);
  const record = buildLocalProjectRecord({
    file: serialized.file,
    json: serialized.json,
    source: "user",
    storageState: "NORMAL",
    integrityStatus: "VALID",
    checksum,
    lastAccessedAt: existing?.summary.lastAccessedAt ?? metadata.updatedAt,
  });

  try {
    await input.repo.save(record);
    return localProjectOk(record.summary);
  } catch (error) {
    return localProjectFail(
      localProjectError("TRANSACTION_FAILED", "Failed to save local project", error)
    );
  }
};

export type OpenLocalProjectInput = {
  repo: LocalProjectRepository;
  id: LocalProjectId;
  touchAccess?: boolean;
};

export type OpenLocalProjectResult = {
  patch: HydrateProjectV2Patch;
  integrityStatus: "VALID" | "CHECKSUM_FAILED" | "NOT_VERIFIED";
  summary: LocalProjectSummary;
};

const hydrateRecordEnvelope = (
  record: LocalProjectRecord
): LocalProjectResult<OpenLocalProjectResult> => {
  const integrityStatus = verifyEnvelopeChecksum(
    record.envelope.json,
    record.storageMeta.checksum
  );
  const hydrated = hydrateProjectJson(record.envelope.json);
  if (!hydrated.ok) {
    return localProjectFail(
      localProjectError(
        "HYDRATE_FAILED",
        hydrated.errors.map((item) => item.message).join("; ")
      )
    );
  }
  return localProjectOk({
    patch: hydrated.patch,
    integrityStatus,
    summary: {
      ...record.summary,
      integrityStatus,
    },
  });
};

export const openLocalProject = async (
  input: OpenLocalProjectInput
): Promise<LocalProjectResult<OpenLocalProjectResult>> => {
  const record = await input.repo.getById(input.id);
  if (!record) {
    return localProjectFail(
      localProjectError("NOT_FOUND", `Local project ${input.id} not found`)
    );
  }

  const opened = hydrateRecordEnvelope(record);
  if (!opened.ok) {
    return opened;
  }

  if (input.touchAccess !== false) {
    try {
      await input.repo.touchLastAccessed(input.id);
    } catch {
      // non-fatal for open
    }
  }

  return localProjectOk({
    ...opened.value,
    summary: {
      ...opened.value.summary,
      lastAccessedAt: new Date().toISOString(),
    },
  });
};

export const openLocalProjectDraft = async (
  input: OpenLocalProjectInput
): Promise<LocalProjectResult<OpenLocalProjectResult>> => {
  const draft = await input.repo.getAutosaveDraft(input.id);
  if (!draft) {
    return localProjectFail(
      localProjectError("NOT_FOUND", `Draft for project ${input.id} not found`)
    );
  }
  const opened = hydrateRecordEnvelope(draft);
  if (!opened.ok) {
    return opened;
  }
  if (input.touchAccess !== false) {
    try {
      await input.repo.touchLastAccessed(input.id);
    } catch {
      // non-fatal
    }
  }
  return opened;
};

export const listLocalProjects = async (
  repo: LocalProjectRepository,
  orderBy: LocalProjectSummaryOrderBy = "lastAccessedAt"
): Promise<LocalProjectSummary[]> => repo.listSummaries({ orderBy });

export type UpdateLocalProjectInput = SaveLocalProjectInput & {
  id: LocalProjectId;
};

export const updateLocalProject = async (
  input: UpdateLocalProjectInput
): Promise<LocalProjectResult<LocalProjectSummary>> => {
  if (input.id !== input.ctx.metadata.id) {
    return localProjectFail(
      localProjectError("INVALID_NAME", "Project id mismatch on update")
    );
  }
  return saveLocalProject(input);
};

export const renameLocalProject = async (
  repo: LocalProjectRepository,
  id: LocalProjectId,
  newName: string
): Promise<LocalProjectResult<LocalProjectSummary>> => {
  const trimmed = newName.trim();
  if (!trimmed) {
    return localProjectFail(
      localProjectError("INVALID_NAME", "Project name cannot be empty")
    );
  }

  const existing = await repo.getById(id);
  if (!existing) {
    return localProjectFail(
      localProjectError("NOT_FOUND", `Local project ${id} not found`)
    );
  }

  try {
    const updatedAt = new Date().toISOString();
    const patched = patchEnvelopeMetadataName(
      existing.envelope.json,
      trimmed,
      updatedAt
    );
    const checksum = await computeEnvelopeChecksum(patched.json);
    const metadata = buildIndexableMetadataFromFile(patched.file);
    const record = buildLocalProjectRecord({
      file: patched.file,
      json: patched.json,
      source: "user",
      storageState: existing.storageMeta.storageState === "RECOVERABLE"
        ? "RECOVERABLE"
        : "NORMAL",
      integrityStatus: "VALID",
      checksum,
      lastAccessedAt: existing.summary.lastAccessedAt,
      hasAutosaveDraft: existing.summary.hasAutosaveDraft,
    });
    await repo.save(record);
    return localProjectOk(record.summary);
  } catch (error) {
    return localProjectFail(
      localProjectError("TRANSACTION_FAILED", "Failed to rename local project", error)
    );
  }
};

export const deleteLocalProject = async (
  repo: LocalProjectRepository,
  id: LocalProjectId
): Promise<LocalProjectResult<void>> => {
  const exists = await repo.exists(id);
  if (!exists) {
    return localProjectFail(
      localProjectError("NOT_FOUND", `Local project ${id} not found`)
    );
  }
  try {
    await repo.delete(id);
    return localProjectOk(undefined);
  } catch (error) {
    return localProjectFail(
      localProjectError("TRANSACTION_FAILED", "Failed to delete local project", error)
    );
  }
};

export type DuplicateLocalProjectResult = {
  id: LocalProjectId;
  summary: LocalProjectSummary;
};

export const duplicateLocalProject = async (
  repo: LocalProjectRepository,
  id: LocalProjectId,
  newName: string
): Promise<LocalProjectResult<DuplicateLocalProjectResult>> => {
  const source = await repo.getById(id);
  if (!source) {
    return localProjectFail(
      localProjectError("NOT_FOUND", `Local project ${id} not found`)
    );
  }

  const trimmed = newName.trim();
  if (!trimmed) {
    return localProjectFail(
      localProjectError("INVALID_NAME", "Project name cannot be empty")
    );
  }

  if (!isScientificProjectV2(source.envelope.file.project)) {
    return localProjectFail(
      localProjectError("HYDRATE_FAILED", "Only V2 projects can be duplicated locally")
    );
  }

  const newProjectId = crypto.randomUUID();
  const now = new Date().toISOString();
  const duplicated = duplicateEnvelopeForNewProject(
    source.envelope.file,
    source.envelope.json,
    newProjectId,
    trimmed,
    now,
    now
  );
  const checksum = await computeEnvelopeChecksum(duplicated.json);
  const record = buildLocalProjectRecord({
    file: duplicated.file,
    json: duplicated.json,
    source: "user",
    storageState: "NORMAL",
    integrityStatus: "VALID",
    checksum,
    lastAccessedAt: now,
  });

  try {
    await repo.save(record);
    return localProjectOk({ id: newProjectId, summary: record.summary });
  } catch (error) {
    return localProjectFail(
      localProjectError(
        "TRANSACTION_FAILED",
        "Failed to duplicate local project",
        error
      )
    );
  }
};

export const detectRecoverableDraft = async (
  repo: LocalProjectRepository,
  id: LocalProjectId
): Promise<LocalProjectRecord | null> => {
  const committed = await repo.getById(id);
  const draft = await repo.getAutosaveDraft(id);
  if (!draft || !committed) return draft;

  const draftTime = Date.parse(draft.summary.updatedAt);
  const committedTime = Date.parse(committed.summary.updatedAt);
  if (Number.isNaN(draftTime) || Number.isNaN(committedTime)) {
    return draft;
  }
  return draftTime > committedTime ? draft : null;
};

export const exportLocalProjectToSgproj = async (
  repo: LocalProjectRepository,
  id: LocalProjectId
): Promise<LocalProjectResult<string>> => {
  const record = await repo.getById(id);
  if (!record) {
    return localProjectFail(
      localProjectError("NOT_FOUND", `Local project ${id} not found`)
    );
  }
  return localProjectOk(record.envelope.json);
};

export const saveLocalProjectDraft = async (
  input: SaveLocalProjectInput
): Promise<LocalProjectResult<LocalProjectSummary>> => {
  const trimmedName = input.projectName.trim();
  if (!trimmedName) {
    return localProjectFail(
      localProjectError("INVALID_NAME", "Project name cannot be empty")
    );
  }

  const metadata = { ...input.ctx.metadata, name: trimmedName };
  const project = collectProjectSnapshotV2({ ...input.ctx, metadata });
  const serialized = serializeProjectV2({
    project,
    appVersion: input.appVersion ?? LOCAL_PROJECT_DEFAULT_APP_VERSION,
    options: { includeChecksum: false },
  });

  if (!serialized.ok) {
    return localProjectFail(
      localProjectError(
        "SERIALIZE_FAILED",
        serialized.errors.map((item) => item.message).join("; ")
      )
    );
  }

  const checksum = await computeEnvelopeChecksum(serialized.json);
  const record = buildLocalProjectRecord({
    file: serialized.file,
    json: serialized.json,
    source: "autosave",
    storageState: "DIRTY",
    integrityStatus: "VALID",
    checksum,
    lastAccessedAt: metadata.updatedAt,
  });

  try {
    await input.repo.saveAutosaveDraft(record);
    const summaries = await listLocalProjects(input.repo);
    const summary = summaries.find((item) => item.id === metadata.id);
    return localProjectOk(
      summary ??
        buildSummaryFromRecordParts({
          metadata: buildIndexableMetadataFromFile(serialized.file),
          sizeBytes: new TextEncoder().encode(serialized.json).length,
          integrityStatus: "VALID",
          storageState: "DIRTY",
        })
    );
  } catch (error) {
    return localProjectFail(
      localProjectError("TRANSACTION_FAILED", "Failed to save draft", error)
    );
  }
};

export { sortSummaries };
