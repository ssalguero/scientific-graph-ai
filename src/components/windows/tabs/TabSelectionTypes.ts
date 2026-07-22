/**
 * D61.6 — Window Tabs Foundation · selection contracts.
 * Authority: docs/D61.0-tabs-discovery.md · API Freeze D61.
 * Types only — no runtime logic, no store, no bridges, no UI.
 */

import type { TabId } from "./TabId";

/**
 * Sole selection field — which tab is active.
 * No Window / Series references. No auto-select policy.
 */
export type ActiveTab = TabId | undefined;

/**
 * Frozen selection authority surface.
 * Unique owner of activeTab. Independent of TabRegistry.
 * Operations: get / setActive / clear.
 */
export type TabSelectionStore = {
  get(): ActiveTab;
  setActive(id: ActiveTab): void;
  clear(): void;
};
