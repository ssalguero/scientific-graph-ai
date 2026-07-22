/**
 * D63.1–D63.7 — Lifecycle + Tab ↔ Series Wiring · public barrel (LOCKED D63.7).
 * Authority: docs/D63.0-content-lifecycle-discovery.md.
 * Hard Rules: HR-content-barrel-only · HR-no-windows-barrel-leak.
 * Sole public export path for content/**. Not re-exported from windows/index.ts.
 * Deep imports into content/* from outside content/ are prohibited.
 */

/* —— D63.1 · Types —— */

export type { ContentDefinition, ContentHostProps } from "./ContentTypes";

/* —— D63.2 · Registry —— */

export type { ContentRegistry } from "./ContentRegistry";
export { createContentRegistry } from "./ContentRegistry";

/* —— D63.3 · Slots —— */

export type { ContentSlot, ContentSlots } from "./ContentSlots";

/* —— D63.4 · Tab ↔ Series mapping —— */

export type { TabSeriesBridge } from "./TabSeriesBridge";
export { createTabSeriesBridge } from "./TabSeriesBridge";

/* —— D63.5 · Content Bridge —— */

export type { ContentBridge } from "./ContentBridge";
export { createContentBridge } from "./ContentBridge";

/* —— D63.6 · Presentational Host —— */

export { ContentHost } from "./ContentHost";
