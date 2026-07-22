/**
 * D61.1–D61.8 — Window Tabs Foundation · internal barrel.
 * Authority: docs/D61.0-tabs-discovery.md · Hard Rule: tabs barrel only.
 * Not re-exported from windows/index.ts.
 */

export type { TabId } from "./TabId";
export { createTabId, isTabId } from "./TabId";

export type {
  TabDefinition,
  TabState,
  TabReference,
  TabEntry,
} from "./TabTypes";

export type { TabRegistry, TabRegistryCatalog } from "./TabRegistryTypes";

export type { TabRegistryStore } from "./TabRegistryStore";
export { createTabRegistryStore } from "./TabRegistryStore";

export { createTabRegistry } from "./TabRegistry";

export type { ActiveTab, TabSelectionStore } from "./TabSelectionTypes";

export { createTabSelectionStore } from "./TabSelectionStore";

export type { TabSelectionBridge } from "./TabSelectionBridge";
export { createTabSelectionBridge } from "./TabSelectionBridge";

export type { WindowId, WindowTabsBridge } from "./WindowTabsBridge";
export { createWindowTabsBridge } from "./WindowTabsBridge";
