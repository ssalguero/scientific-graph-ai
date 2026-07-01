import {
  LOCAL_IDB_STORE_APP_META,
  LOCAL_IDB_STORE_DRAFTS,
  LOCAL_IDB_STORE_PROJECTS,
} from "./constants";
import type { LocalProjectAppMetaWire, LocalProjectWireRecord } from "./types";

export type AtomicWriteInput = {
  db: IDBDatabase;
  committed?: LocalProjectWireRecord;
  draft?: LocalProjectWireRecord | null;
  deleteDraftId?: string;
  deleteProjectId?: string;
  appMeta?: Partial<LocalProjectAppMetaWire>;
};

export const runAtomicWrite = (input: AtomicWriteInput): Promise<void> =>
  new Promise((resolve, reject) => {
    const storeNames: string[] = [LOCAL_IDB_STORE_PROJECTS, LOCAL_IDB_STORE_DRAFTS];
    if (input.appMeta) {
      storeNames.push(LOCAL_IDB_STORE_APP_META);
    }
    const tx = input.db.transaction(storeNames, "readwrite");
    tx.onerror = () => reject(tx.error ?? new Error("IDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IDB transaction aborted"));
    tx.oncomplete = () => resolve();

    const projects = tx.objectStore(LOCAL_IDB_STORE_PROJECTS);
    const drafts = tx.objectStore(LOCAL_IDB_STORE_DRAFTS);

    if (input.deleteProjectId) {
      projects.delete(input.deleteProjectId);
    }
    if (input.committed) {
      projects.put(input.committed);
    }
    if (input.deleteDraftId) {
      drafts.delete(input.deleteDraftId);
    }
    if (input.draft === null && input.deleteDraftId) {
      drafts.delete(input.deleteDraftId);
    } else if (input.draft) {
      drafts.put(input.draft);
    }

    if (input.appMeta) {
      const appMetaStore = tx.objectStore(LOCAL_IDB_STORE_APP_META);
      const getReq = appMetaStore.get("singleton");
      getReq.onsuccess = () => {
        const current = (getReq.result ?? {
          key: "singleton",
          recentProjectIds: [],
          storageFormatVersion: 1,
        }) as LocalProjectAppMetaWire;
        appMetaStore.put({
          ...current,
          ...input.appMeta,
          key: "singleton",
        });
      };
      getReq.onerror = () => reject(getReq.error ?? new Error("appMeta read failed"));
    }
  });

export const runAtomicDelete = (
  db: IDBDatabase,
  projectId: string,
  appMeta?: Partial<LocalProjectAppMetaWire>
): Promise<void> =>
  runAtomicWrite({
    db,
    deleteProjectId: projectId,
    deleteDraftId: projectId,
    appMeta,
  });

export const idbGet = <T>(
  db: IDBDatabase,
  storeName: string,
  key: IDBValidKey
): Promise<T | undefined> =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).get(key);
    request.onerror = () => reject(request.error ?? new Error("IDB get failed"));
    request.onsuccess = () => resolve(request.result as T | undefined);
  });

export const idbGetAll = <T>(db: IDBDatabase, storeName: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onerror = () =>
      reject(request.error ?? new Error("IDB getAll failed"));
    request.onsuccess = () => resolve((request.result ?? []) as T[]);
  });
