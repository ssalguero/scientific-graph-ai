/**
 * D61.7 — Window Tabs Foundation · Tab Selection Store.
 * Authority: docs/D61.0-tabs-discovery.md · API Freeze D61.
 * Unique authority for activeTab. No Registry. No Bridges. No auto-select. No UI.
 */

import type { ActiveTab, TabSelectionStore } from "./TabSelectionTypes";

/**
 * Creates an isolated in-memory selection authority.
 * Initial activeTab = undefined (unset). Mutations only via setActive / clear.
 * No Window / Registry / Series coupling. No events / observers / next-tab policy.
 */
export function createTabSelectionStore(): TabSelectionStore {
  let activeTab: ActiveTab = undefined;

  return {
    get(): ActiveTab {
      return activeTab;
    },

    setActive(id: ActiveTab): void {
      activeTab = id;
    },

    clear(): void {
      activeTab = undefined;
    },
  };
}
