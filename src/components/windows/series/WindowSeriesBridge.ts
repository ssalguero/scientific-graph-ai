/**
 * D60.4 — Series Alignment Foundation · Window Series Bridge.
 * Authority: docs/D60.0-series-discovery.md · API Freeze D60.
 * Decoupled WindowId ↔ SeriesId mapping. No WindowAPI. No Registry. No Selection. No UI.
 */

import type { SeriesId } from "./SeriesId";

/** Window identity alias — matches WindowDefinition.id without importing Window types. */
export type WindowId = string;

/**
 * Frozen Window↔Series mapping surface.
 * Unique authority for the WindowId → SeriesId relationship.
 */
export type WindowSeriesBridge = {
  bind(windowId: WindowId, seriesId: SeriesId): void;
  unbind(windowId: WindowId): void;
  hasWindow(windowId: WindowId): boolean;
  hasSeries(seriesId: SeriesId): boolean;
  getSeriesForWindow(windowId: WindowId): SeriesId | undefined;
  getWindowForSeries(seriesId: SeriesId): WindowId | undefined;
  clear(): void;
};

/**
 * Creates an isolated Window↔Series mapping authority.
 * One-to-one: binding replaces prior links for the same window or series.
 * Storage backend is an implementation detail — not part of the public freeze.
 */
export function createWindowSeriesBridge(): WindowSeriesBridge {
  const windowToSeries = new Map<WindowId, SeriesId>();
  const seriesToWindow = new Map<SeriesId, WindowId>();

  const detachSeries = (seriesId: SeriesId): void => {
    const existingWindow = seriesToWindow.get(seriesId);
    if (existingWindow === undefined) {
      return;
    }
    seriesToWindow.delete(seriesId);
    windowToSeries.delete(existingWindow);
  };

  const detachWindow = (windowId: WindowId): void => {
    const existingSeries = windowToSeries.get(windowId);
    if (existingSeries === undefined) {
      return;
    }
    windowToSeries.delete(windowId);
    seriesToWindow.delete(existingSeries);
  };

  return {
    bind(windowId: WindowId, seriesId: SeriesId): void {
      detachWindow(windowId);
      detachSeries(seriesId);
      windowToSeries.set(windowId, seriesId);
      seriesToWindow.set(seriesId, windowId);
    },

    unbind(windowId: WindowId): void {
      detachWindow(windowId);
    },

    hasWindow(windowId: WindowId): boolean {
      return windowToSeries.has(windowId);
    },

    hasSeries(seriesId: SeriesId): boolean {
      return seriesToWindow.has(seriesId);
    },

    getSeriesForWindow(windowId: WindowId): SeriesId | undefined {
      return windowToSeries.get(windowId);
    },

    getWindowForSeries(seriesId: SeriesId): WindowId | undefined {
      return seriesToWindow.get(seriesId);
    },

    clear(): void {
      windowToSeries.clear();
      seriesToWindow.clear();
    },
  };
}
