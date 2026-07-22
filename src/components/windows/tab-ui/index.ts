/**
 * D62.6–D62.9 — Tabs UI Foundation · tab-ui public barrel (LOCKED D62.9).
 * Authority: docs/D62.0-tabs-ui-discovery.md.
 * Hard Rules: tab-ui barrel only · HR-no-windows-barrel-leak.
 * Sole public export path for tab-ui/**. Not re-exported from windows/index.ts.
 * Consumes tabs/** only via ../tabs barrel (no deep imports).
 */

/* —— Types (D62.6) —— */

export type {
  TabUiItem,
  TabUiSelectHandler,
  TabUiCloseHandler,
  TabStripProps,
  TabBarProps,
  TabDocumentHostProps,
} from "./TabUiTypes";

/* —— Presentational components (D62.7–D62.8) —— */

export { TabStrip } from "./TabStrip";
export { TabBar } from "./TabBar";
export { TabDocumentHost } from "./TabDocumentHost";
