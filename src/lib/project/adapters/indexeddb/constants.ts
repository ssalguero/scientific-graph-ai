export const LOCAL_IDB_NAME = "scientific-graph-ai-local" as const;

export const LOCAL_IDB_VERSION = 1 as const;

export const LOCAL_IDB_STORE_PROJECTS = "projects" as const;

export const LOCAL_IDB_STORE_DRAFTS = "drafts" as const;

export const LOCAL_IDB_STORE_APP_META = "appMeta" as const;

export const LOCAL_IDB_APP_META_KEY = "singleton" as const;

export {
  DEFAULT_LOCAL_PROFILE_ID,
  LOCAL_PROJECT_STORAGE_FORMAT_VERSION,
} from "../../application/local-project/constants";

export const LOCAL_IDB_INDEX_BY_NAME = "byName" as const;

export const LOCAL_IDB_INDEX_BY_UPDATED_AT = "byUpdatedAt" as const;

export const LOCAL_IDB_INDEX_BY_CREATED_AT = "byCreatedAt" as const;

export const LOCAL_IDB_INDEX_BY_LAST_ACCESSED_AT = "byLastAccessedAt" as const;

export const LOCAL_IDB_INDEX_BY_SCHEMA_VERSION = "bySchemaVersion" as const;

export const LOCAL_IDB_INDEX_BY_SIZE_BYTES = "bySizeBytes" as const;

export const LOCAL_IDB_INDEX_BY_PROFILE_ID = "byProfileId" as const;
