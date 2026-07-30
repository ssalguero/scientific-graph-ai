/** UX-2.8 — localStorage adapter for panel layout UX state. No JSON logic. */

export const PANEL_STORAGE_KEY = "scientific-graph-ai.panels" as const;

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Persist a raw JSON string. No-op when storage is unavailable. */
export function save(json: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(PANEL_STORAGE_KEY, json);
  } catch {
    // quota / private mode — ignore
  }
}

/** Load the raw JSON string, or null when missing / unavailable. */
export function load(): string | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    return storage.getItem(PANEL_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Remove the persisted panel layout entry. */
export function clear(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(PANEL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
