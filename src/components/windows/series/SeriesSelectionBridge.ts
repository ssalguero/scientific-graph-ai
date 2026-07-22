/**
 * D60.3 — Series Alignment Foundation · Series Selection Bridge.
 * Authority: docs/D60.0-series-discovery.md · API Freeze D60.
 * Authorized write path to SeriesSelectionState. No WindowManager. No UI.
 * Prepared for composition with WindowSeriesBridge in D60.4+.
 */

import type { SeriesId } from "./SeriesId";
import type {
  SeriesSelectionBridge,
  SeriesSelectionState,
} from "./SeriesSelectionTypes";

/**
 * Creates a selection bridge bound to a SelectionState authority.
 * Bridge never owns selection storage — State remains the unique authority.
 */
export function createSeriesSelectionBridge(
  state: SeriesSelectionState
): SeriesSelectionBridge {
  return {
    select(id: SeriesId | undefined): void {
      state.setSelectedSeries(id);
    },

    activate(id: SeriesId | undefined): void {
      state.setActiveSeries(id);
    },

    focus(id: SeriesId | undefined): void {
      state.setFocusedSeries(id);
    },

    clear(): void {
      state.clear();
    },

    getSnapshot() {
      return state.getSnapshot();
    },
  };
}
