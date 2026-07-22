/**
 * D61.8 — Window Tabs Foundation · Tab Selection Bridge.
 * Authority: docs/D61.0-tabs-discovery.md · API Freeze D61.
 * Authorized write path to TabSelectionStore. No Window. No Registry. No UI.
 */

import type { ActiveTab, TabSelectionStore } from "./TabSelectionTypes";

/**
 * Frozen selection bridge surface — authorized write path to SelectionStore.
 * Bridge never owns selection storage — Store remains the unique authority.
 * No auto-select policy. No Window / Series coupling.
 */
export type TabSelectionBridge = {
  get(): ActiveTab;
  setActive(id: ActiveTab): void;
  clear(): void;
};

/**
 * Creates a selection bridge bound to a TabSelectionStore authority.
 */
export function createTabSelectionBridge(
  store: TabSelectionStore
): TabSelectionBridge {
  return {
    get(): ActiveTab {
      return store.get();
    },

    setActive(id: ActiveTab): void {
      store.setActive(id);
    },

    clear(): void {
      store.clear();
    },
  };
}
