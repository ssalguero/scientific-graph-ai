import {
  LOCAL_IDB_INDEX_BY_CREATED_AT,
  LOCAL_IDB_INDEX_BY_LAST_ACCESSED_AT,
  LOCAL_IDB_INDEX_BY_NAME,
  LOCAL_IDB_INDEX_BY_PROFILE_ID,
  LOCAL_IDB_INDEX_BY_SCHEMA_VERSION,
  LOCAL_IDB_INDEX_BY_SIZE_BYTES,
  LOCAL_IDB_INDEX_BY_UPDATED_AT,
  LOCAL_IDB_NAME,
  LOCAL_IDB_STORE_APP_META,
  LOCAL_IDB_STORE_DRAFTS,
  LOCAL_IDB_STORE_PROJECTS,
  LOCAL_IDB_VERSION,
  LOCAL_PROJECT_STORAGE_FORMAT_VERSION,
} from "./constants";

const createProjectStoreIndexes = (store: IDBObjectStore) => {
  store.createIndex(LOCAL_IDB_INDEX_BY_NAME, "summary.name", { unique: false });
  store.createIndex(LOCAL_IDB_INDEX_BY_UPDATED_AT, "summary.updatedAt", {
    unique: false,
  });
  store.createIndex(LOCAL_IDB_INDEX_BY_CREATED_AT, "summary.createdAt", {
    unique: false,
  });
  store.createIndex(
    LOCAL_IDB_INDEX_BY_LAST_ACCESSED_AT,
    "summary.lastAccessedAt",
    { unique: false }
  );
  store.createIndex(
    LOCAL_IDB_INDEX_BY_SCHEMA_VERSION,
    "summary.schemaVersion",
    { unique: false }
  );
  store.createIndex(LOCAL_IDB_INDEX_BY_SIZE_BYTES, "summary.sizeBytes", {
    unique: false,
  });
  store.createIndex(LOCAL_IDB_INDEX_BY_PROFILE_ID, "storageMeta.profileId", {
    unique: false,
  });
};

export const upgradeIndexedDbSchema = (db: IDBDatabase, oldVersion: number) => {
  if (oldVersion < 1) {
    const projects = db.createObjectStore(LOCAL_IDB_STORE_PROJECTS, {
      keyPath: "projectId",
    });
    createProjectStoreIndexes(projects);

    const drafts = db.createObjectStore(LOCAL_IDB_STORE_DRAFTS, {
      keyPath: "projectId",
    });
    drafts.createIndex(LOCAL_IDB_INDEX_BY_UPDATED_AT, "summary.updatedAt", {
      unique: false,
    });
    drafts.createIndex(LOCAL_IDB_INDEX_BY_PROFILE_ID, "storageMeta.profileId", {
      unique: false,
    });

    db.createObjectStore(LOCAL_IDB_STORE_APP_META, { keyPath: "key" });
  }
};

export const openLocalProjectDatabase = (
  idbFactory: IDBFactory = indexedDB
): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = idbFactory.open(LOCAL_IDB_NAME, LOCAL_IDB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("IDB open failed"));
    request.onupgradeneeded = (event) => {
      const db = request.result;
      upgradeIndexedDbSchema(db, event.oldVersion);
    };
    request.onsuccess = () => {
      const db = request.result;
      if (db.objectStoreNames.length === 0) {
        db.close();
        reject(new Error("UNSUPPORTED_STORAGE_VERSION"));
        return;
      }
      resolve(db);
    };
  });

export const assertSupportedStorageFormat = (version: number | undefined) => {
  if (version != null && version > LOCAL_PROJECT_STORAGE_FORMAT_VERSION) {
    throw new Error("UNSUPPORTED_STORAGE_VERSION");
  }
};
