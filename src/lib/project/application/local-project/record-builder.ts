import type { DomainScientificProjectFile } from "../../domain/scientific-project";
import type {
  LocalProjectIndexableMetadata,
  LocalProjectIntegrityStatus,
  LocalProjectRecord,
  LocalProjectStorageMeta,
  LocalProjectStorageSource,
  LocalProjectStorageState,
  LocalProjectSummary,
  LocalProjectSummaryOrderBy,
} from "../../domain/local-project";
import {
  DEFAULT_LOCAL_PROFILE_ID,
  LOCAL_PROJECT_STORAGE_FORMAT_VERSION,
} from "./constants";

export const buildIndexableMetadataFromFile = (
  file: DomainScientificProjectFile
): LocalProjectIndexableMetadata => ({
  ...file.project.metadata,
  schemaVersion: file.schemaVersion,
  appVersion: file.appVersion,
});

export const buildSummaryFromRecordParts = (input: {
  metadata: LocalProjectIndexableMetadata;
  sizeBytes: number;
  integrityStatus: LocalProjectIntegrityStatus;
  storageState: LocalProjectStorageState;
  lastAccessedAt?: string;
  hasAutosaveDraft?: boolean;
}): LocalProjectSummary => {
  const lastAccessed =
    input.lastAccessedAt ?? input.metadata.updatedAt ?? input.metadata.createdAt;
  return {
    id: input.metadata.id,
    name: input.metadata.name,
    createdAt: input.metadata.createdAt,
    updatedAt: input.metadata.updatedAt,
    lastAccessedAt: lastAccessed,
    schemaVersion: input.metadata.schemaVersion,
    appVersion: input.metadata.appVersion,
    sizeBytes: input.sizeBytes,
    hasAutosaveDraft: input.hasAutosaveDraft,
    integrityStatus: input.integrityStatus,
    storageState: input.storageState,
  };
};

export const buildStorageMeta = (input: {
  source: LocalProjectStorageSource;
  storageState: LocalProjectStorageState;
  integrityStatus: LocalProjectIntegrityStatus;
  checksum?: string;
  savedAt?: string;
  profileId?: string;
}): LocalProjectStorageMeta => ({
  storageFormatVersion: LOCAL_PROJECT_STORAGE_FORMAT_VERSION,
  savedAt: input.savedAt ?? new Date().toISOString(),
  source: input.source,
  storageState: input.storageState,
  integrityStatus: input.integrityStatus,
  checksum: input.checksum,
  profileId: input.profileId ?? DEFAULT_LOCAL_PROFILE_ID,
});

export const buildLocalProjectRecord = (input: {
  file: DomainScientificProjectFile;
  json: string;
  source: LocalProjectStorageSource;
  storageState: LocalProjectStorageState;
  integrityStatus: LocalProjectIntegrityStatus;
  checksum?: string;
  lastAccessedAt?: string;
  hasAutosaveDraft?: boolean;
  profileId?: string;
}): LocalProjectRecord => {
  const metadata = buildIndexableMetadataFromFile(input.file);
  const sizeBytes = new TextEncoder().encode(input.json).length;
  const storageMeta = buildStorageMeta({
    source: input.source,
    storageState: input.storageState,
    integrityStatus: input.integrityStatus,
    checksum: input.checksum,
    profileId: input.profileId,
  });
  const summary = buildSummaryFromRecordParts({
    metadata,
    sizeBytes,
    integrityStatus: input.integrityStatus,
    storageState: input.storageState,
    lastAccessedAt: input.lastAccessedAt,
    hasAutosaveDraft: input.hasAutosaveDraft,
  });
  return {
    summary,
    metadata,
    envelope: { file: input.file, json: input.json },
    storageMeta,
  };
};

export const sortSummaries = (
  summaries: LocalProjectSummary[],
  orderBy: LocalProjectSummaryOrderBy = "lastAccessedAt"
): LocalProjectSummary[] => {
  const sorted = [...summaries];
  const compareString = (a: string, b: string) => a.localeCompare(b);
  sorted.sort((left, right) => {
    switch (orderBy) {
      case "name":
        return compareString(left.name, right.name);
      case "createdAt":
        return compareString(right.createdAt, left.createdAt);
      case "updatedAt":
        return compareString(right.updatedAt, left.updatedAt);
      case "lastAccessedAt":
      default:
        return compareString(right.lastAccessedAt, left.lastAccessedAt);
    }
  });
  return sorted;
};
