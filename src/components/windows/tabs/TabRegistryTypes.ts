/**
 * D61.3 — Window Tabs Foundation · registry contracts.
 * D62.1 — Additive public mutator `setState` (API Freeze D62.1).
 * Authority: docs/D61.0-tabs-discovery.md · docs/D62.0-tabs-ui-discovery.md.
 * Internal registry types only — no runtime logic, no storage, no UI.
 */

import type { TabId } from "./TabId";
import type { TabDefinition, TabEntry, TabState } from "./TabTypes";

/**
 * Internal catalog map shape — storage contract for TabRegistryStore (D61.4).
 * Key = TabId · Value = TabEntry (Definition + State companion).
 * Insertion order of Map keys = list() order (LOCKED).
 */
export type TabRegistryCatalog = Map<TabId, TabEntry>;

/**
 * Registry surface — unique SSOT authority for registered tabs.
 * D61: register / unregister / get / has / list / clear.
 * D62.1 additive: setState (companion TabState only — not activation SSOT).
 * Does not know Window or Series. Does not touch Selection.
 */
export type TabRegistry = {
  register(definition: TabDefinition): void;
  unregister(id: TabId): void;
  get(id: TabId): TabEntry | undefined;
  has(id: TabId): boolean;
  list(): readonly TabEntry[];
  clear(): void;
  /**
   * Additive mutator (D62.1 LOCKED).
   * Updates companion TabState only — never mutates TabDefinition.
   * No-op if id is not registered. Does not touch Selection / Policy / UI.
   * Not the activation SSOT (`HR-activeTab-ssot-only` — use TabSelectionStore).
   */
  setState(id: TabId, state: TabState): void;
};
