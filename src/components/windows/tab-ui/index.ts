/**
 * D62.6–D62.8 — Tabs UI Foundation · tab-ui barrel.
 * Authority: docs/D62.0-tabs-ui-discovery.md · Hard Rule: tab-ui barrel only.
 * Not re-exported from windows/index.ts.
 */

export type {
  TabUiItem,
  TabUiSelectHandler,
  TabUiCloseHandler,
  TabStripProps,
  TabBarProps,
  TabDocumentHostProps,
} from "./TabUiTypes";

export { TabStrip } from "./TabStrip";
export { TabBar } from "./TabBar";
export { TabDocumentHost } from "./TabDocumentHost";
