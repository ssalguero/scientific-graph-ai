import type { ProjectHistoryEntry, ProjectHistoryStore } from "./types";
import { DEFAULT_MAX_PROJECT_HISTORY_ENTRIES } from "./types";

export const createProjectHistoryStore = (
  maxEntries: number = DEFAULT_MAX_PROJECT_HISTORY_ENTRIES
): ProjectHistoryStore => ({
  entries: [],
  maxEntries,
});

export const appendProjectHistoryEntry = (
  store: ProjectHistoryStore,
  entry: ProjectHistoryEntry
): void => {
  store.entries.push(entry);
  if (store.entries.length > store.maxEntries) {
    store.entries.splice(0, store.entries.length - store.maxEntries);
  }
};

export const listProjectHistoryEntries = (
  store: ProjectHistoryStore
): readonly ProjectHistoryEntry[] => {
  return store.entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const timeCompare = b.entry.occurredAt.localeCompare(a.entry.occurredAt);
      if (timeCompare !== 0) {
        return timeCompare;
      }
      return b.index - a.index;
    })
    .map(({ entry }) => entry);
};

export const clearProjectHistory = (store: ProjectHistoryStore): void => {
  store.entries.length = 0;
};
