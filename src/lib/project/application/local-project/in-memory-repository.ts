import type {
  LocalProjectId,
  LocalProjectRecord,
  LocalProjectRepository,
  LocalProjectSummary,
  LocalProjectSummaryOrderBy,
} from "../../domain/local-project";
import { localProjectError } from "../../domain/local-project";
import { DEFAULT_LOCAL_PROFILE_ID } from "./constants";
import { sortSummaries } from "./record-builder";

type StoredWire = {
  summary: LocalProjectSummary;
  metadata: LocalProjectRecord["metadata"];
  envelopeJson: string;
  storageMeta: LocalProjectRecord["storageMeta"];
};

const matchesProfile = (
  record: StoredWire,
  profileId: string | undefined
): boolean => {
  const recordProfile = record.storageMeta.profileId ?? DEFAULT_LOCAL_PROFILE_ID;
  const target = profileId ?? DEFAULT_LOCAL_PROFILE_ID;
  return recordProfile === target;
};

/** In-memory repository for unit tests — simulates atomic writes. */
export class InMemoryLocalProjectRepository implements LocalProjectRepository {
  private projects = new Map<LocalProjectId, StoredWire>();

  private drafts = new Map<LocalProjectId, StoredWire>();

  private recentProjectIds: LocalProjectId[] = [];

  listSummaries(options?: {
    orderBy?: LocalProjectSummaryOrderBy;
    profileId?: string;
  }): Promise<LocalProjectSummary[]> {
    const summaries: LocalProjectSummary[] = [];
    for (const [id, wire] of this.projects.entries()) {
      if (!matchesProfile(wire, options?.profileId)) continue;
      summaries.push({
        ...wire.summary,
        hasAutosaveDraft: this.drafts.has(id),
      });
    }
    return Promise.resolve(
      sortSummaries(summaries, options?.orderBy ?? "lastAccessedAt")
    );
  }

  getById(id: LocalProjectId): Promise<LocalProjectRecord | null> {
    const wire = this.projects.get(id);
    if (!wire) return Promise.resolve(null);
    return Promise.resolve(this.toRecord(wire));
  }

  getAutosaveDraft(id: LocalProjectId): Promise<LocalProjectRecord | null> {
    const wire = this.drafts.get(id);
    if (!wire) return Promise.resolve(null);
    return Promise.resolve(this.toRecord(wire));
  }

  async save(record: LocalProjectRecord): Promise<void> {
    const wire = this.toWire(record);
    this.projects.set(record.summary.id, wire);
    this.drafts.delete(record.summary.id);
    this.pushRecent(record.summary.id);
    await this.syncDraftFlag(record.summary.id);
  }

  async saveAutosaveDraft(record: LocalProjectRecord): Promise<void> {
    const draftRecord: LocalProjectRecord = {
      ...record,
      storageMeta: {
        ...record.storageMeta,
        source: "autosave",
        storageState: "DIRTY",
      },
      summary: {
        ...record.summary,
        storageState: "DIRTY",
      },
    };
    this.drafts.set(record.summary.id, this.toWire(draftRecord));
    await this.syncDraftFlag(record.summary.id);
    const committed = this.projects.get(record.summary.id);
    if (committed) {
      committed.summary.storageState = "RECOVERABLE";
      committed.summary.hasAutosaveDraft = true;
      committed.storageMeta.storageState = "RECOVERABLE";
    }
  }

  async rename(id: LocalProjectId, newName: string): Promise<LocalProjectSummary> {
    const wire = this.projects.get(id);
    if (!wire) {
      throw localProjectError("NOT_FOUND", `Project ${id} not found`);
    }
    const trimmed = newName.trim();
    if (!trimmed) {
      throw localProjectError("INVALID_NAME", "Project name cannot be empty");
    }
    const updatedAt = new Date().toISOString();
    wire.summary.name = trimmed;
    wire.summary.updatedAt = updatedAt;
    wire.metadata.name = trimmed;
    wire.metadata.updatedAt = updatedAt;
    const parsed = JSON.parse(wire.envelopeJson) as {
      exportedAt?: string;
      project?: { metadata?: Record<string, unknown> };
    };
    if (parsed.project?.metadata) {
      parsed.project.metadata.name = trimmed;
      parsed.project.metadata.updatedAt = updatedAt;
    }
    parsed.exportedAt = updatedAt;
    wire.envelopeJson = JSON.stringify(parsed);
    return { ...wire.summary };
  }

  async delete(id: LocalProjectId): Promise<void> {
    this.projects.delete(id);
    this.drafts.delete(id);
    this.recentProjectIds = this.recentProjectIds.filter((item) => item !== id);
  }

  deleteAutosaveDraft(id: LocalProjectId): Promise<void> {
    this.drafts.delete(id);
    return this.syncDraftFlag(id);
  }

  exists(id: LocalProjectId): Promise<boolean> {
    return Promise.resolve(this.projects.has(id));
  }

  async touchLastAccessed(id: LocalProjectId): Promise<void> {
    const wire = this.projects.get(id);
    if (!wire) {
      throw localProjectError("NOT_FOUND", `Project ${id} not found`);
    }
    const now = new Date().toISOString();
    wire.summary.lastAccessedAt = now;
    this.pushRecent(id);
  }

  private pushRecent(id: LocalProjectId) {
    this.recentProjectIds = [
      id,
      ...this.recentProjectIds.filter((item) => item !== id),
    ].slice(0, 20);
  }

  private async syncDraftFlag(id: LocalProjectId): Promise<void> {
    const wire = this.projects.get(id);
    if (!wire) return;
    const hasDraft = this.drafts.has(id);
    wire.summary.hasAutosaveDraft = hasDraft;
    if (!hasDraft && wire.storageMeta.storageState === "RECOVERABLE") {
      wire.summary.storageState = "NORMAL";
      wire.storageMeta.storageState = "NORMAL";
    }
  }

  private toWire(record: LocalProjectRecord): StoredWire {
    return {
      summary: record.summary,
      metadata: record.metadata,
      envelopeJson: record.envelope.json,
      storageMeta: record.storageMeta,
    };
  }

  private toRecord(wire: StoredWire): LocalProjectRecord {
    const parsed = JSON.parse(wire.envelopeJson);
    return {
      summary: wire.summary,
      metadata: wire.metadata,
      envelope: { file: parsed, json: wire.envelopeJson },
      storageMeta: wire.storageMeta,
    };
  }
}
