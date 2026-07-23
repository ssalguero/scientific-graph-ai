/**
 * D66.4 — Session Persistence Foundation · Session Storage Adapter.
 * Authority: D66.0 Architecture Freeze · D66.1 API Freeze · HR-adapter-sole-io ·
 * HR-adapter-replace-no-merge · HR-adapter-api-freeze.
 * Sole IndexedDB owner for Session persistence — no domain, Registry, Bridge,
 * Serializer, Deserializer, React, or UI.
 */

import type {
  SessionPersistenceRecord,
  SessionStorageAdapter,
} from "./SessionPersistenceTypes";

/** Dedicated Session DB — never reuse project / graph local stores. */
const SESSION_IDB_NAME = "ScientificGraphAI" as const;
const SESSION_IDB_VERSION = 1 as const;
const SESSION_IDB_STORE = "sessions" as const;

function getIdbFactory(): IDBFactory {
  const factory =
    typeof globalThis !== "undefined"
      ? (globalThis as { indexedDB?: IDBFactory }).indexedDB
      : undefined;
  if (factory === undefined) {
    throw new Error("SessionStorageAdapter: IndexedDB is not available");
  }
  return factory;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () =>
      reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function openSessionDatabase(
  idbFactory: IDBFactory = getIdbFactory()
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = idbFactory.open(SESSION_IDB_NAME, SESSION_IDB_VERSION);

    request.onerror = () =>
      reject(request.error ?? new Error("Session IndexedDB open failed"));

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSION_IDB_STORE)) {
        db.createObjectStore(SESSION_IDB_STORE, {
          keyPath: "definition.id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

function normalizeRecords(
  record: SessionPersistenceRecord | SessionPersistenceRecord[]
): SessionPersistenceRecord[] {
  return Array.isArray(record) ? record : [record];
}

/**
 * Factory — returns the frozen SessionStorageAdapter port.
 * save replaces by definition.id (put). Never merges.
 * load returns stored records only — no deserialize, no register, no restore.
 * clear empties the sessions store.
 */
export function createSessionStorageAdapter(): SessionStorageAdapter {
  return {
    async save(
      record: SessionPersistenceRecord | SessionPersistenceRecord[]
    ): Promise<void> {
      const records = normalizeRecords(record);
      const db = await openSessionDatabase();
      try {
        const tx = db.transaction(SESSION_IDB_STORE, "readwrite");
        const store = tx.objectStore(SESSION_IDB_STORE);
        for (const item of records) {
          store.put(item);
        }
        await transactionDone(tx);
      } finally {
        db.close();
      }
    },

    async load(): Promise<SessionPersistenceRecord[]> {
      const db = await openSessionDatabase();
      try {
        const tx = db.transaction(SESSION_IDB_STORE, "readonly");
        const store = tx.objectStore(SESSION_IDB_STORE);
        const result = await requestToPromise(store.getAll());
        await transactionDone(tx);
        return result;
      } finally {
        db.close();
      }
    },

    async clear(): Promise<void> {
      const db = await openSessionDatabase();
      try {
        const tx = db.transaction(SESSION_IDB_STORE, "readwrite");
        const store = tx.objectStore(SESSION_IDB_STORE);
        store.clear();
        await transactionDone(tx);
      } finally {
        db.close();
      }
    },
  };
}
