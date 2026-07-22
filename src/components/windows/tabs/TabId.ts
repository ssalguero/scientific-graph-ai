/**
 * D61.1 — Window Tabs Foundation · Tab identity.
 * Authority: docs/D61.0-tabs-discovery.md · API Freeze D61.
 * Opaque string alias — same pattern as SeriesId / WindowId.
 * No React. No UI. No domain imports.
 */

/** Opaque tab identity — branded string alias (repo pattern). Representation LOCKED. */
export type TabId = string;

const TAB_ID_PREFIX = "tab:" as const;

let tabIdSeq = 0;

/**
 * Creates a new opaque TabId.
 * Format: `tab:` + monotonic sequence (stable string representation).
 */
export function createTabId(): TabId {
  tabIdSeq += 1;
  return `${TAB_ID_PREFIX}${tabIdSeq}`;
}

/**
 * Type guard — true when value is a non-empty string TabId produced by this domain
 * (prefix `tab:`). Accepts any string starting with the frozen prefix.
 */
export function isTabId(value: unknown): value is TabId {
  return typeof value === "string" && value.startsWith(TAB_ID_PREFIX) && value.length > TAB_ID_PREFIX.length;
}
