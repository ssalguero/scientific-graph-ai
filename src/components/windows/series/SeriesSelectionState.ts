/**
 * D60.3 — Series Alignment Foundation · Series Selection State.
 * Authority: docs/D60.0-series-discovery.md · API Freeze D60.
 * Pure factory — unique authority for selection. No UI. No Registry dependency.
 */

import type { SeriesId } from "./SeriesId";
import type {
  SeriesSelectionListener,
  SeriesSelectionSnapshot,
  SeriesSelectionState,
} from "./SeriesSelectionTypes";

function cloneSnapshot(snapshot: SeriesSelectionSnapshot): SeriesSelectionSnapshot {
  return {
    selectedSeries: snapshot.selectedSeries,
    activeSeries: snapshot.activeSeries,
    focusedSeries: snapshot.focusedSeries,
  };
}

/**
 * Creates an isolated in-memory selection authority.
 * Storage backend is an implementation detail — not part of the public freeze.
 */
export function createSeriesSelectionState(): SeriesSelectionState {
  let selectedSeries: SeriesId | undefined;
  let activeSeries: SeriesId | undefined;
  let focusedSeries: SeriesId | undefined;
  const listeners = new Set<SeriesSelectionListener>();

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  const readSnapshot = (): SeriesSelectionSnapshot =>
    cloneSnapshot({
      selectedSeries,
      activeSeries,
      focusedSeries,
    });

  return {
    getSnapshot(): SeriesSelectionSnapshot {
      return readSnapshot();
    },

    getSelectedSeries(): SeriesId | undefined {
      return selectedSeries;
    },

    getActiveSeries(): SeriesId | undefined {
      return activeSeries;
    },

    getFocusedSeries(): SeriesId | undefined {
      return focusedSeries;
    },

    setSelectedSeries(id: SeriesId | undefined): void {
      if (selectedSeries === id) {
        return;
      }
      selectedSeries = id;
      notify();
    },

    setActiveSeries(id: SeriesId | undefined): void {
      if (activeSeries === id) {
        return;
      }
      activeSeries = id;
      notify();
    },

    setFocusedSeries(id: SeriesId | undefined): void {
      if (focusedSeries === id) {
        return;
      }
      focusedSeries = id;
      notify();
    },

    clear(): void {
      if (
        selectedSeries === undefined &&
        activeSeries === undefined &&
        focusedSeries === undefined
      ) {
        return;
      }
      selectedSeries = undefined;
      activeSeries = undefined;
      focusedSeries = undefined;
      notify();
    },

    subscribe(listener: SeriesSelectionListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
