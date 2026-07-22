/**
 * D61.8 — Window Tabs Foundation · Window Tabs Bridge.
 * Authority: docs/D61.0-tabs-discovery.md · API Freeze D61.
 * Decoupled WindowId → TabId[] mapping. No WindowAPI. No Registry. No Selection. No UI.
 */

import type { TabId } from "./TabId";

/** Window identity alias — matches WindowDefinition.id without importing Window types. */
export type WindowId = string;

/**
 * Frozen Window↔Tabs mapping surface.
 * Unique adaptation for WindowId → TabId[] (1:N).
 * Does not invoke TabRegistry. Does not modify TabSelection.
 */
export type WindowTabsBridge = {
  attach(windowId: WindowId, tabId: TabId): void;
  detach(tabId: TabId): void;
  listTabs(windowId: WindowId): readonly TabId[];
  getWindow(tabId: TabId): WindowId | undefined;
  hasWindow(windowId: WindowId): boolean;
  hasTab(tabId: TabId): boolean;
  clear(): void;
};

/**
 * Creates an isolated Window↔Tabs mapping adapter.
 * One tab belongs to at most one window; re-attach moves the tab.
 * listTabs preserves attach insertion order.
 * Mapping Maps are an implementation detail — not domain Selection/Registry state.
 */
export function createWindowTabsBridge(): WindowTabsBridge {
  const windowToTabs = new Map<WindowId, TabId[]>();
  const tabToWindow = new Map<TabId, WindowId>();

  const removeTabFromWindow = (windowId: WindowId, tabId: TabId): void => {
    const tabs = windowToTabs.get(windowId);
    if (tabs === undefined) {
      return;
    }
    const next = tabs.filter((id) => id !== tabId);
    if (next.length === 0) {
      windowToTabs.delete(windowId);
    } else {
      windowToTabs.set(windowId, next);
    }
  };

  const detachTab = (tabId: TabId): void => {
    const existingWindow = tabToWindow.get(tabId);
    if (existingWindow === undefined) {
      return;
    }
    tabToWindow.delete(tabId);
    removeTabFromWindow(existingWindow, tabId);
  };

  return {
    attach(windowId: WindowId, tabId: TabId): void {
      detachTab(tabId);
      const tabs = windowToTabs.get(windowId);
      if (tabs === undefined) {
        windowToTabs.set(windowId, [tabId]);
      } else {
        tabs.push(tabId);
      }
      tabToWindow.set(tabId, windowId);
    },

    detach(tabId: TabId): void {
      detachTab(tabId);
    },

    listTabs(windowId: WindowId): readonly TabId[] {
      const tabs = windowToTabs.get(windowId);
      return tabs === undefined ? [] : tabs.slice();
    },

    getWindow(tabId: TabId): WindowId | undefined {
      return tabToWindow.get(tabId);
    },

    hasWindow(windowId: WindowId): boolean {
      return windowToTabs.has(windowId);
    },

    hasTab(tabId: TabId): boolean {
      return tabToWindow.has(tabId);
    },

    clear(): void {
      windowToTabs.clear();
      tabToWindow.clear();
    },
  };
}
