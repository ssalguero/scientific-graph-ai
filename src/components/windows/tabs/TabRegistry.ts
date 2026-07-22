/**
 * D61.5 — Window Tabs Foundation · Tab Registry façade.
 * D62.1 — Additive public mutator `setState` (API Freeze D62.1).
 * Authority: docs/D61.0-tabs-discovery.md · docs/D62.0-tabs-ui-discovery.md.
 * Public Freeze surface — delegates storage to TabRegistryStore. No Selection. No UI.
 */

import type { TabId } from "./TabId";
import type { TabDefinition, TabEntry, TabState } from "./TabTypes";
import type { TabRegistry } from "./TabRegistryTypes";
import {
  createTabRegistryStore,
  type TabRegistryStore,
} from "./TabRegistryStore";

function cloneDefinition(definition: TabDefinition): TabDefinition {
  const next: TabDefinition = { id: definition.id };
  if (definition.title !== undefined) {
    next.title = definition.title;
  }
  return next;
}

function cloneEntry(entry: TabEntry): TabEntry {
  return {
    definition: cloneDefinition(entry.definition),
    state: entry.state,
  };
}

/**
 * Creates a TabRegistry bound to a TabRegistryStore.
 * Duplicate register is a no-op. unregister/clear are safe for missing ids.
 * get / list return clones — callers never receive live store refs.
 * list() preserves insertion order from the store Map.
 * setState (D62.1): companion TabState only; no-op if missing; clone-on-write;
 * does not touch Selection / Policy / Definition.
 * Does not touch Selection.
 */
export function createTabRegistry(
  store: TabRegistryStore = createTabRegistryStore()
): TabRegistry {
  return {
    register(definition: TabDefinition): void {
      if (store.has(definition.id)) {
        return;
      }
      store.set(definition.id, {
        definition: cloneDefinition(definition),
        state: "inactive",
      });
    },

    unregister(id: TabId): void {
      store.delete(id);
    },

    get(id: TabId): TabEntry | undefined {
      const entry = store.get(id);
      return entry === undefined ? undefined : cloneEntry(entry);
    },

    has(id: TabId): boolean {
      return store.has(id);
    },

    list(): readonly TabEntry[] {
      return store.values().map(cloneEntry);
    },

    clear(): void {
      store.clear();
    },

    setState(id: TabId, state: TabState): void {
      const entry = store.get(id);
      if (entry === undefined) {
        return;
      }
      store.set(id, {
        definition: cloneDefinition(entry.definition),
        state,
      });
    },
  };
}

export type { TabRegistry } from "./TabRegistryTypes";
