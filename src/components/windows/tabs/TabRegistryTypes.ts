/**
 * D61.3 — Window Tabs Foundation · registry contracts.
 * Authority: docs/D61.0-tabs-discovery.md · API Freeze D61.
 * Internal registry types only — no runtime logic, no storage, no UI.
 */

import type { TabId } from "./TabId";
import type { TabDefinition, TabEntry } from "./TabTypes";

/**
 * Internal catalog map shape — storage contract for TabRegistryStore (D61.4).
 * Key = TabId · Value = TabEntry (Definition + State companion).
 * Insertion order of Map keys = list() order (LOCKED).
 */
export type TabRegistryCatalog = Map<TabId, TabEntry>;

/**
 * Frozen registry surface — unique SSOT authority for registered tabs.
 * Operations: register / unregister / get / has / list / clear.
 * Does not know Window or Series. Does not touch Selection.
 */
export type TabRegistry = {
  register(definition: TabDefinition): void;
  unregister(id: TabId): void;
  get(id: TabId): TabEntry | undefined;
  has(id: TabId): boolean;
  list(): readonly TabEntry[];
  clear(): void;
};
