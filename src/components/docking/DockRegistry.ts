/**
 * D52.2 — Live dock registry.
 * Seed DOCK_REGISTRY remains Object.freeze (D51).
 * Public query surface: get / list / has only.
 * Mutator is internal (consumed by DockRegistrationApi; not barrel-exported).
 */
import { DOCK_TOKENS } from "./DockTokens";
import { DOCK_PANEL_IDS } from "./types";
import type { DockRegistryEntry, DockRegistryQuery } from "./types";

export const DOCK_REGISTRY = Object.freeze({
  inspector: {
    id: DOCK_PANEL_IDS.inspector,
    location: "right" as const,
    defaultSize: {
      width: DOCK_TOKENS.rightWidth,
    },
  },
});

/** Internal write handle — not part of DockRegistryQuery / barrel. */
export type DockRegistryMutator = {
  put(entry: DockRegistryEntry): void;
  remove(id: string): void;
};

export type DockRegistryStore = {
  query: DockRegistryQuery;
  mutator: DockRegistryMutator;
  subscribe: (listener: () => void) => () => void;
  getVersion: () => number;
};

function hydrateFromSeed(
  seed: typeof DOCK_REGISTRY
): Map<string, DockRegistryEntry> {
  const map = new Map<string, DockRegistryEntry>();
  for (const entry of Object.values(seed)) {
    map.set(entry.id, entry);
  }
  return map;
}

/**
 * Creates a live registry store hydrated from the frozen seed.
 * `mutator` is for DockRegistrationApi only — do not export from barrel.
 */
export function createDockRegistry(
  seed: typeof DOCK_REGISTRY = DOCK_REGISTRY
): DockRegistryStore {
  const entries = hydrateFromSeed(seed);
  let version = 0;
  const listeners = new Set<() => void>();

  const notify = () => {
    version += 1;
    for (const listener of listeners) {
      listener();
    }
  };

  const query: DockRegistryQuery = {
    get(id: string): DockRegistryEntry | undefined {
      return entries.get(id);
    },
    list(): readonly DockRegistryEntry[] {
      return Array.from(entries.values());
    },
    has(id: string): boolean {
      return entries.has(id);
    },
  };

  const mutator: DockRegistryMutator = {
    put(entry: DockRegistryEntry): void {
      if (entries.has(entry.id)) {
        return;
      }
      entries.set(entry.id, entry);
      notify();
    },
    remove(id: string): void {
      if (!entries.has(id)) {
        return;
      }
      entries.delete(id);
      notify();
    },
  };

  return {
    query,
    mutator,
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getVersion(): number {
      return version;
    },
  };
}
