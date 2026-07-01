import type {
  LocalProjectIndexableMetadata,
  LocalProjectStorageMeta,
  LocalProjectSummary,
} from "../../domain/local-project";

/** Wire record stored in IndexedDB object stores. */
export type LocalProjectWireRecord = {
  projectId: string;
  summary: LocalProjectSummary;
  metadata: LocalProjectIndexableMetadata;
  envelopeJson: string;
  storageMeta: LocalProjectStorageMeta;
};

export type LocalProjectAppMetaWire = {
  key: typeof import("./constants").LOCAL_IDB_APP_META_KEY;
  lastOpenedProjectId?: string;
  recentProjectIds: string[];
  activeProfileId?: string;
  storageFormatVersion: number;
};
