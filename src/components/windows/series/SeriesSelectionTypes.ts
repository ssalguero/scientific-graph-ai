/**
 * D60.3 — Series Alignment Foundation · selection contracts.
 * Authority: docs/D60.0-series-discovery.md · API Freeze D60.
 * Types only — no runtime logic, no UI.
 */

import type { SeriesId } from "./SeriesId";

/** Frozen selection snapshot — selected / active / focused. */
export type SeriesSelectionSnapshot = {
  selectedSeries: SeriesId | undefined;
  activeSeries: SeriesId | undefined;
  focusedSeries: SeriesId | undefined;
};

export type SeriesSelectionListener = () => void;

/**
 * Frozen selection authority surface.
 * Unique owner of selectedSeries / activeSeries / focusedSeries.
 * Independent of SeriesRegistry.
 */
export type SeriesSelectionState = {
  getSnapshot(): SeriesSelectionSnapshot;
  getSelectedSeries(): SeriesId | undefined;
  getActiveSeries(): SeriesId | undefined;
  getFocusedSeries(): SeriesId | undefined;
  setSelectedSeries(id: SeriesId | undefined): void;
  setActiveSeries(id: SeriesId | undefined): void;
  setFocusedSeries(id: SeriesId | undefined): void;
  clear(): void;
  subscribe(listener: SeriesSelectionListener): () => void;
};

/**
 * Frozen selection bridge surface — authorized write path to SelectionState.
 * No WindowManager / Registry / UI coupling.
 */
export type SeriesSelectionBridge = {
  select(id: SeriesId | undefined): void;
  activate(id: SeriesId | undefined): void;
  focus(id: SeriesId | undefined): void;
  clear(): void;
  getSnapshot(): SeriesSelectionSnapshot;
};
