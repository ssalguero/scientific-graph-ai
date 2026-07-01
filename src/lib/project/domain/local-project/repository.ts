import type {
  LocalProjectId,
  LocalProjectListOptions,
  LocalProjectRecord,
  LocalProjectSummary,
} from "./types";

/**
 * Persistence port for local IndexedDB storage.
 * Implementations live in adapters/indexeddb/ or test fakes.
 *
 * Batch extensions reserved for future use (B5 out of scope):
 * - batchDelete(ids)
 * - batchExport(ids)
 * - batchDuplicate(ids)
 */
export interface LocalProjectRepository {
  listSummaries(options?: LocalProjectListOptions): Promise<LocalProjectSummary[]>;
  getById(id: LocalProjectId): Promise<LocalProjectRecord | null>;
  getAutosaveDraft(id: LocalProjectId): Promise<LocalProjectRecord | null>;
  save(record: LocalProjectRecord): Promise<void>;
  saveAutosaveDraft(record: LocalProjectRecord): Promise<void>;
  rename(id: LocalProjectId, newName: string): Promise<LocalProjectSummary>;
  delete(id: LocalProjectId): Promise<void>;
  deleteAutosaveDraft(id: LocalProjectId): Promise<void>;
  exists(id: LocalProjectId): Promise<boolean>;
  touchLastAccessed(id: LocalProjectId): Promise<void>;
}
