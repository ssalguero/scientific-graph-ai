"use client";

import { useCallback, useRef, useState } from "react";

import {
  appendProjectHistoryEntry,
  clearProjectHistory,
  createProjectHistoryStore,
  listProjectHistoryEntries,
  type ProjectHistoryEntry,
  type ProjectHistoryStore,
} from "@/lib/project-history";

export function useProjectHistory() {
  const storeRef = useRef<ProjectHistoryStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createProjectHistoryStore();
  }

  const store = storeRef.current;

  const [entries, setEntries] = useState<readonly ProjectHistoryEntry[]>(() =>
    listProjectHistoryEntries(store)
  );

  const syncEntries = useCallback(() => {
    setEntries(listProjectHistoryEntries(store));
  }, [store]);

  const record = useCallback(
    (entry: ProjectHistoryEntry) => {
      appendProjectHistoryEntry(store, entry);
      syncEntries();
    },
    [store, syncEntries]
  );

  const clear = useCallback(() => {
    clearProjectHistory(store);
    syncEntries();
  }, [store, syncEntries]);

  return {
    entries,
    record,
    clear,
  };
}
