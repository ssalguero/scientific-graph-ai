export {
  LOCAL_PROJECT_DEFAULT_APP_VERSION,
  LOCAL_PROJECT_STORAGE_FORMAT_VERSION,
  DEFAULT_LOCAL_PROFILE_ID,
} from "./constants";

export {
  buildIndexableMetadataFromFile,
  buildLocalProjectRecord,
  buildStorageMeta,
  buildSummaryFromRecordParts,
  sortSummaries,
} from "./record-builder";

export {
  patchEnvelopeMetadataName,
  patchEnvelopeProjectId,
} from "./envelope-metadata-patch";

export {
  computeEnvelopeChecksum,
  computeEnvelopeChecksumNode,
  verifyEnvelopeChecksum,
} from "./checksum";

export { duplicateEnvelopeForNewProject } from "./duplicate-project";

export { InMemoryLocalProjectRepository } from "./in-memory-repository";

export {
  deleteLocalProject,
  detectRecoverableDraft,
  duplicateLocalProject,
  exportLocalProjectToSgproj,
  listLocalProjects,
  openLocalProject,
  openLocalProjectDraft,
  renameLocalProject,
  saveLocalProject,
  saveLocalProjectDraft,
  updateLocalProject,
  type DuplicateLocalProjectResult,
  type OpenLocalProjectResult,
  type SaveLocalProjectInput,
  type UpdateLocalProjectInput,
} from "./use-cases";
