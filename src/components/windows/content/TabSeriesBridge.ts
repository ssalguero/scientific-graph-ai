/**
 * D63.4 — Lifecycle + Tab ↔ Series Wiring · Tab Series Bridge.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · API Freeze D63.4.
 * Decoupled TabId ↔ SeriesId mapping (1↔1). No Registry mutation. No Selection. No UI.
 *
 * Hard Rules:
 * - HR-tab-series-1to1 — TabId → SeriesId and SeriesId → TabId at most one each
 * - HR-tab-series-mapping-only — no SeriesSelection / TabSelection / WindowSelection /
 *   Activation / Focus
 * - HR-no-scientific — no scientific domain imports
 * - HR-no-workspace-shell — no workspace/ imports
 * - Consume TabId via tabs barrel · SeriesId via series barrel only
 */

import type { TabId } from "../tabs";
import type { SeriesId } from "../series";

/**
 * Frozen Tab↔Series mapping surface.
 * Unique authority for the TabId ↔ SeriesId relationship (1↔1).
 */
export type TabSeriesBridge = {
  bind(tabId: TabId, seriesId: SeriesId): void;
  unbind(tabId: TabId): void;
  hasTab(tabId: TabId): boolean;
  hasSeries(seriesId: SeriesId): boolean;
  getSeriesForTab(tabId: TabId): SeriesId | undefined;
  getTabForSeries(seriesId: SeriesId): TabId | undefined;
  clear(): void;
};

/**
 * Creates an isolated Tab↔Series mapping authority.
 * One-to-one: binding replaces prior links for the same tab or series.
 * Storage backend is an implementation detail — not part of the public freeze.
 * Does not touch SeriesRegistry, TabRegistry, Selection, Activation, or Focus.
 */
export function createTabSeriesBridge(): TabSeriesBridge {
  const tabToSeries = new Map<TabId, SeriesId>();
  const seriesToTab = new Map<SeriesId, TabId>();

  const detachSeries = (seriesId: SeriesId): void => {
    const existingTab = seriesToTab.get(seriesId);
    if (existingTab === undefined) {
      return;
    }
    seriesToTab.delete(seriesId);
    tabToSeries.delete(existingTab);
  };

  const detachTab = (tabId: TabId): void => {
    const existingSeries = tabToSeries.get(tabId);
    if (existingSeries === undefined) {
      return;
    }
    tabToSeries.delete(tabId);
    seriesToTab.delete(existingSeries);
  };

  return {
    bind(tabId: TabId, seriesId: SeriesId): void {
      detachTab(tabId);
      detachSeries(seriesId);
      tabToSeries.set(tabId, seriesId);
      seriesToTab.set(seriesId, tabId);
    },

    unbind(tabId: TabId): void {
      detachTab(tabId);
    },

    hasTab(tabId: TabId): boolean {
      return tabToSeries.has(tabId);
    },

    hasSeries(seriesId: SeriesId): boolean {
      return seriesToTab.has(seriesId);
    },

    getSeriesForTab(tabId: TabId): SeriesId | undefined {
      return tabToSeries.get(tabId);
    },

    getTabForSeries(seriesId: SeriesId): TabId | undefined {
      return seriesToTab.get(seriesId);
    },

    clear(): void {
      tabToSeries.clear();
      seriesToTab.clear();
    },
  };
}
