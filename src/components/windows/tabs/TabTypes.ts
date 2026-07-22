/**
 * D61.2 — Window Tabs Foundation · public type contracts.
 * Authority: docs/D61.0-tabs-discovery.md · API Freeze D61.
 * Types only — no runtime logic, no storage, no UI.
 */

import type { TabId } from "./TabId";

/**
 * Stable tab metadata — immutable after register (clone-on-write).
 * Must not embed TabState, windowId, or seriesId.
 */
export type TabDefinition = {
  id: TabId;
  title?: string;
};

/**
 * Mutable tab state — never embedded in TabDefinition.
 * Runtime selection authority remains TabSelectionStore (D61.6+).
 */
export type TabState = "active" | "inactive";

/**
 * Minimal tab handle — Freeze: only tabId.
 */
export type TabReference = {
  tabId: TabId;
};

/**
 * Companion composition — Definition (stable) + State (mutable).
 * Types only; no logic.
 */
export type TabEntry = {
  definition: TabDefinition;
  state: TabState;
};
