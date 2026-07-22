/**
 * D61.4 — Window Tabs Foundation · Tab Registry Store.
 * Authority: docs/D61.0-tabs-discovery.md · API Freeze D61.
 * Internal catalog SSOT only — no Registry business rules, no Selection, no UI.
 */

import type { TabId } from "./TabId";
import type { TabEntry } from "./TabTypes";
import type { TabRegistryCatalog } from "./TabRegistryTypes";

/**
 * Internal storage surface for the tab catalog.
 * Raw Map access — no register semantics, no clone-on-read, no Selection coupling.
 * Registry façade (D61.5) owns business rules.
 */
export type TabRegistryStore = {
  get(id: TabId): TabEntry | undefined;
  set(id: TabId, entry: TabEntry): void;
  delete(id: TabId): boolean;
  has(id: TabId): boolean;
  clear(): void;
  /** Insertion-order values (Map iteration order). Live refs — no clone. */
  values(): readonly TabEntry[];
  size(): number;
};

/**
 * Creates an isolated in-memory catalog store.
 * Storage backend = TabRegistryCatalog (Map). Insertion order preserved.
 */
export function createTabRegistryStore(): TabRegistryStore {
  const catalog: TabRegistryCatalog = new Map();

  return {
    get(id: TabId): TabEntry | undefined {
      return catalog.get(id);
    },

    set(id: TabId, entry: TabEntry): void {
      catalog.set(id, entry);
    },

    delete(id: TabId): boolean {
      return catalog.delete(id);
    },

    has(id: TabId): boolean {
      return catalog.has(id);
    },

    clear(): void {
      catalog.clear();
    },

    values(): readonly TabEntry[] {
      return Array.from(catalog.values());
    },

    size(): number {
      return catalog.size;
    },
  };
}
