import type { DomainScientificProjectFile } from "../scientific-project";
import type { ProjectMetadataV2 } from "../types-v2";

/** Branded UUID for local project identity. */
export type LocalProjectId = string;

export type LocalProjectStorageState =
  | "NORMAL"
  | "DIRTY"
  | "RECOVERABLE"
  | "CORRUPTED";

export type LocalProjectIntegrityStatus =
  | "VALID"
  | "CHECKSUM_FAILED"
  | "NOT_VERIFIED";

export type LocalProjectSummaryOrderBy =
  | "name"
  | "updatedAt"
  | "createdAt"
  | "lastAccessedAt";

/** Denormalized list view — fully indexable without parsing envelope. */
export type LocalProjectSummary = {
  id: LocalProjectId;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  schemaVersion: number;
  appVersion: string;
  sizeBytes: number;
  hasAutosaveDraft?: boolean;
  integrityStatus: LocalProjectIntegrityStatus;
  storageState: LocalProjectStorageState;
};

/** Indexable scientific metadata + envelope version fields. */
export type LocalProjectIndexableMetadata = ProjectMetadataV2 & {
  schemaVersion: number;
  appVersion: string;
};

export type LocalProjectEnvelope = {
  file: DomainScientificProjectFile;
  json: string;
};

export type LocalProjectStorageSource = "user" | "autosave";

export type LocalProjectStorageMeta = {
  storageFormatVersion: number;
  savedAt: string;
  source: LocalProjectStorageSource;
  storageState: LocalProjectStorageState;
  integrityStatus: LocalProjectIntegrityStatus;
  checksum?: string;
  profileId?: string;
};

export type LocalProjectRecord = {
  summary: LocalProjectSummary;
  metadata: LocalProjectIndexableMetadata;
  envelope: LocalProjectEnvelope;
  storageMeta: LocalProjectStorageMeta;
};

export type LocalProjectListOptions = {
  orderBy?: LocalProjectSummaryOrderBy;
  profileId?: string;
};
