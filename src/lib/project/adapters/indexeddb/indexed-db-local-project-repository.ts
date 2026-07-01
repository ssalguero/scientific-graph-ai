import type {
  LocalProjectId,
  LocalProjectListOptions,
  LocalProjectRecord,
  LocalProjectRepository,
  LocalProjectSummary,
} from "../../domain/local-project";
import { localProjectError } from "../../domain/local-project";
import { sortSummaries } from "../../application/local-project/record-builder";
import {
  DEFAULT_LOCAL_PROFILE_ID,
  LOCAL_PROJECT_STORAGE_FORMAT_VERSION,
} from "../../application/local-project/constants";
import { enrichSummaryWithDraftFlag, recordToWire, wireToRecord } from "./mapper";
import { openLocalProjectDatabase } from "./schema";
import {
  idbGet,
  idbGetAll,
  runAtomicDelete,
  runAtomicWrite,
} from "./transaction";
import {
  LOCAL_IDB_APP_META_KEY,
  LOCAL_IDB_STORE_APP_META,
  LOCAL_IDB_STORE_DRAFTS,
  LOCAL_IDB_STORE_PROJECTS,
} from "./constants";
import type { LocalProjectAppMetaWire, LocalProjectWireRecord } from "./types";

const matchesProfile = (
  wire: LocalProjectWireRecord,
  profileId: string | undefined
): boolean => {
  const recordProfile = wire.storageMeta.profileId ?? DEFAULT_LOCAL_PROFILE_ID;
  return recordProfile === (profileId ?? DEFAULT_LOCAL_PROFILE_ID);
};

const pushRecent = (
  recent: string[],
  projectId: string
): string[] => [projectId, ...recent.filter((id) => id !== projectId)].slice(0, 20);

export class IndexedDbLocalProjectRepository implements LocalProjectRepository {
  private dbPromise: Promise<IDBDatabase>;

  constructor(idbFactory?: IDBFactory) {
    this.dbPromise = openLocalProjectDatabase(idbFactory);
  }

  private async db(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  async listSummaries(options?: LocalProjectListOptions): Promise<LocalProjectSummary[]> {
    const db = await this.db();
    const [projects, drafts] = await Promise.all([
      idbGetAll<LocalProjectWireRecord>(db, LOCAL_IDB_STORE_PROJECTS),
      idbGetAll<LocalProjectWireRecord>(db, LOCAL_IDB_STORE_DRAFTS),
    ]);
    const draftIds = new Set(
      drafts
        .filter((item) => matchesProfile(item, options?.profileId))
        .map((item) => item.projectId)
    );
    const summaries = projects
      .filter((item) => matchesProfile(item, options?.profileId))
      .map((item) =>
        enrichSummaryWithDraftFlag(item.summary, draftIds.has(item.projectId))
      );
    return sortSummaries(summaries, options?.orderBy ?? "lastAccessedAt");
  }

  async getById(id: LocalProjectId): Promise<LocalProjectRecord | null> {
    const db = await this.db();
    const wire = await idbGet<LocalProjectWireRecord>(db, LOCAL_IDB_STORE_PROJECTS, id);
    return wire ? wireToRecord(wire) : null;
  }

  async getAutosaveDraft(id: LocalProjectId): Promise<LocalProjectRecord | null> {
    const db = await this.db();
    const wire = await idbGet<LocalProjectWireRecord>(db, LOCAL_IDB_STORE_DRAFTS, id);
    return wire ? wireToRecord(wire) : null;
  }

  async save(record: LocalProjectRecord): Promise<void> {
    const db = await this.db();
    const wire = recordToWire({
      ...record,
      summary: {
        ...record.summary,
        storageState: "NORMAL",
        hasAutosaveDraft: false,
      },
      storageMeta: {
        ...record.storageMeta,
        storageState: "NORMAL",
        source: "user",
      },
    });
    const appMeta = await this.readAppMeta(db);
    await runAtomicWrite({
      db,
      committed: wire,
      deleteDraftId: record.summary.id,
      appMeta: {
        lastOpenedProjectId: record.summary.id,
        recentProjectIds: pushRecent(appMeta.recentProjectIds, record.summary.id),
        storageFormatVersion: LOCAL_PROJECT_STORAGE_FORMAT_VERSION,
      },
    });
  }

  async saveAutosaveDraft(record: LocalProjectRecord): Promise<void> {
    const db = await this.db();
    const draftWire = recordToWire({
      ...record,
      summary: { ...record.summary, storageState: "DIRTY" },
      storageMeta: {
        ...record.storageMeta,
        source: "autosave",
        storageState: "DIRTY",
      },
    });

    const committed = await idbGet<LocalProjectWireRecord>(
      db,
      LOCAL_IDB_STORE_PROJECTS,
      record.summary.id
    );
    const committedWire =
      committed != null
        ? {
            ...committed,
            summary: {
              ...committed.summary,
              storageState: "RECOVERABLE" as const,
              hasAutosaveDraft: true,
            },
            storageMeta: {
              ...committed.storageMeta,
              storageState: "RECOVERABLE" as const,
            },
          }
        : undefined;

    await runAtomicWrite({
      db,
      committed: committedWire,
      draft: draftWire,
    });
  }

  async rename(id: LocalProjectId, newName: string): Promise<LocalProjectSummary> {
    const trimmed = newName.trim();
    if (!trimmed) {
      throw localProjectError("INVALID_NAME", "Project name cannot be empty");
    }
    const db = await this.db();
    const existing = await idbGet<LocalProjectWireRecord>(db, LOCAL_IDB_STORE_PROJECTS, id);
    if (!existing) {
      throw localProjectError("NOT_FOUND", `Project ${id} not found`);
    }
    const updatedAt = new Date().toISOString();
    const parsed = JSON.parse(existing.envelopeJson) as {
      exportedAt?: string;
      project?: { metadata?: Record<string, unknown> };
    };
    if (parsed.project?.metadata) {
      parsed.project.metadata.name = trimmed;
      parsed.project.metadata.updatedAt = updatedAt;
    }
    parsed.exportedAt = updatedAt;
    const envelopeJson = JSON.stringify(parsed);
    const wire: LocalProjectWireRecord = {
      ...existing,
      summary: {
        ...existing.summary,
        name: trimmed,
        updatedAt,
      },
      metadata: {
        ...existing.metadata,
        name: trimmed,
        updatedAt,
      },
      envelopeJson,
    };
    await runAtomicWrite({ db, committed: wire });
    return wire.summary;
  }

  async delete(id: LocalProjectId): Promise<void> {
    const db = await this.db();
    const appMeta = await this.readAppMeta(db);
    await runAtomicDelete(db, id, {
      recentProjectIds: appMeta.recentProjectIds.filter((item) => item !== id),
      lastOpenedProjectId:
        appMeta.lastOpenedProjectId === id ? undefined : appMeta.lastOpenedProjectId,
    });
  }

  async deleteAutosaveDraft(id: LocalProjectId): Promise<void> {
    const db = await this.db();
    const committed = await idbGet<LocalProjectWireRecord>(db, LOCAL_IDB_STORE_PROJECTS, id);
    const committedWire =
      committed != null
        ? {
            ...committed,
            summary: {
              ...committed.summary,
              storageState: "NORMAL" as const,
              hasAutosaveDraft: false,
            },
            storageMeta: {
              ...committed.storageMeta,
              storageState: "NORMAL" as const,
            },
          }
        : undefined;
    await runAtomicWrite({
      db,
      committed: committedWire,
      draft: null,
      deleteDraftId: id,
    });
  }

  async exists(id: LocalProjectId): Promise<boolean> {
    const record = await this.getById(id);
    return record != null;
  }

  async touchLastAccessed(id: LocalProjectId): Promise<void> {
    const db = await this.db();
    const existing = await idbGet<LocalProjectWireRecord>(db, LOCAL_IDB_STORE_PROJECTS, id);
    if (!existing) {
      throw localProjectError("NOT_FOUND", `Project ${id} not found`);
    }
    const now = new Date().toISOString();
    const wire: LocalProjectWireRecord = {
      ...existing,
      summary: { ...existing.summary, lastAccessedAt: now },
    };
    const appMeta = await this.readAppMeta(db);
    await runAtomicWrite({
      db,
      committed: wire,
      appMeta: {
        lastOpenedProjectId: id,
        recentProjectIds: pushRecent(appMeta.recentProjectIds, id),
      },
    });
  }

  private async readAppMeta(db: IDBDatabase): Promise<LocalProjectAppMetaWire> {
    const current = await idbGet<LocalProjectAppMetaWire>(
      db,
      LOCAL_IDB_STORE_APP_META,
      LOCAL_IDB_APP_META_KEY
    );
    return (
      current ?? {
        key: LOCAL_IDB_APP_META_KEY,
        recentProjectIds: [],
        storageFormatVersion: LOCAL_PROJECT_STORAGE_FORMAT_VERSION,
        activeProfileId: DEFAULT_LOCAL_PROFILE_ID,
      }
    );
  }
}
