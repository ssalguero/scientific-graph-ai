/**
 * UX-8.3 — Mutable Selection Registry (SSOT · sole selection authority).
 *
 * Contract: SelectionRegistryApi (API Freeze — exactly 16 methods)
 * Singleton: selectionRegistry (empty by design — no production selection)
 *
 * Historical: selectWindow / selectContent / selectSeries / clear / get / getState
 * Multi: toggle* / clear*Selection / clearAllSelections / range*
 *
 * Set Ownership Freeze:
 *   Mutable Set (private) → clone → SelectionSet → SelectionState → consumer
 *   Never expose internal mutable Sets.
 *
 * Projection Freeze: singulars derived only in createSelectionState.
 *
 * Independence Freeze: axis ops mutate only their own Set.
 *
 * Historical Semantics: select*(id) replaces axis Set with {id}.
 * clear() ≡ clearAllSelections().
 *
 * API Stability Freeze: get() and getState() are intentionally equivalent.
 *
 * Singleton Freeze: selectionRegistry exists ONLY for infrastructure and
 * testing. React consumers MUST use SelectionProvider + useSelection().
 *
 * No React · no WindowRegistry · no Focus · no cross-registry mutation.
 */

import { createSelectionSet } from "./SelectionSet";
import { createSelectionState, type SelectionState } from "./SelectionState";
import type {
  SelectionContentId,
  SelectionSeriesId,
  SelectionWindowId,
} from "./SelectionTypes";

/**
 * Mutable registry contract — API Freeze UX-8.3 (exactly 16 methods).
 * Named SelectionRegistryApi to avoid type/value name collision with the singleton.
 */
export interface SelectionRegistryApi {
  selectWindow(id: SelectionWindowId): void;
  selectContent(id: SelectionContentId): void;
  selectSeries(id: SelectionSeriesId): void;
  clear(): void;
  get(): SelectionState;
  getState(): SelectionState;
  toggleWindow(id: SelectionWindowId): void;
  toggleContent(id: SelectionContentId): void;
  toggleSeries(id: SelectionSeriesId): void;
  clearWindowSelection(): void;
  clearContentSelection(): void;
  clearSeriesSelection(): void;
  clearAllSelections(): void;
  rangeWindow(
    start: SelectionWindowId,
    end: SelectionWindowId,
    orderedIds: readonly SelectionWindowId[],
  ): void;
  rangeContent(
    start: SelectionContentId,
    end: SelectionContentId,
    orderedIds: readonly SelectionContentId[],
  ): void;
  rangeSeries(
    start: SelectionSeriesId,
    end: SelectionSeriesId,
    orderedIds: readonly SelectionSeriesId[],
  ): void;
}

function rangeSlice<T>(
  start: T,
  end: T,
  orderedIds: readonly T[],
): T[] | null {
  const startIndex = orderedIds.indexOf(start);
  const endIndex = orderedIds.indexOf(end);
  if (startIndex < 0 || endIndex < 0) {
    return null;
  }
  if (startIndex === endIndex) {
    return [start];
  }
  const from = Math.min(startIndex, endIndex);
  const to = Math.max(startIndex, endIndex);
  return orderedIds.slice(from, to + 1);
}

/**
 * Creates an isolated in-memory selection registry.
 * - Private mutable Sets per axis (Set Ownership Freeze)
 * - get / getState return a defensive frozen clone (equivalent)
 * - Axis ops mutate only their own Set (Independence Freeze)
 */
export function createSelectionRegistry(): SelectionRegistryApi {
  const selectedWindowIds = new Set<SelectionWindowId>();
  const selectedContentIds = new Set<SelectionContentId>();
  const selectedSeriesIds = new Set<SelectionSeriesId>();

  function snapshot(): SelectionState {
    // Set Ownership Freeze: clone mutable Sets → SelectionSet → SelectionState
    return createSelectionState({
      selectedWindowIds: createSelectionSet(selectedWindowIds),
      selectedContentIds: createSelectionSet(selectedContentIds),
      selectedSeriesIds: createSelectionSet(selectedSeriesIds),
    });
  }

  function replaceWindow(ids: Iterable<SelectionWindowId>): void {
    selectedWindowIds.clear();
    for (const id of ids) {
      selectedWindowIds.add(id);
    }
  }

  function replaceContent(ids: Iterable<SelectionContentId>): void {
    selectedContentIds.clear();
    for (const id of ids) {
      selectedContentIds.add(id);
    }
  }

  function replaceSeries(ids: Iterable<SelectionSeriesId>): void {
    selectedSeriesIds.clear();
    for (const id of ids) {
      selectedSeriesIds.add(id);
    }
  }

  return Object.freeze({
    selectWindow(id: SelectionWindowId): void {
      if (selectedWindowIds.size === 1 && selectedWindowIds.has(id)) {
        return;
      }
      replaceWindow([id]);
    },

    selectContent(id: SelectionContentId): void {
      if (selectedContentIds.size === 1 && selectedContentIds.has(id)) {
        return;
      }
      replaceContent([id]);
    },

    selectSeries(id: SelectionSeriesId): void {
      if (selectedSeriesIds.size === 1 && selectedSeriesIds.has(id)) {
        return;
      }
      replaceSeries([id]);
    },

    clear(): void {
      selectedWindowIds.clear();
      selectedContentIds.clear();
      selectedSeriesIds.clear();
    },

    get(): SelectionState {
      return snapshot();
    },

    getState(): SelectionState {
      return snapshot();
    },

    toggleWindow(id: SelectionWindowId): void {
      if (selectedWindowIds.has(id)) {
        selectedWindowIds.delete(id);
      } else {
        selectedWindowIds.add(id);
      }
    },

    toggleContent(id: SelectionContentId): void {
      if (selectedContentIds.has(id)) {
        selectedContentIds.delete(id);
      } else {
        selectedContentIds.add(id);
      }
    },

    toggleSeries(id: SelectionSeriesId): void {
      if (selectedSeriesIds.has(id)) {
        selectedSeriesIds.delete(id);
      } else {
        selectedSeriesIds.add(id);
      }
    },

    clearWindowSelection(): void {
      selectedWindowIds.clear();
    },

    clearContentSelection(): void {
      selectedContentIds.clear();
    },

    clearSeriesSelection(): void {
      selectedSeriesIds.clear();
    },

    clearAllSelections(): void {
      selectedWindowIds.clear();
      selectedContentIds.clear();
      selectedSeriesIds.clear();
    },

    rangeWindow(
      start: SelectionWindowId,
      end: SelectionWindowId,
      orderedIds: readonly SelectionWindowId[],
    ): void {
      const slice = rangeSlice(start, end, orderedIds);
      if (slice === null) {
        return;
      }
      replaceWindow(slice);
    },

    rangeContent(
      start: SelectionContentId,
      end: SelectionContentId,
      orderedIds: readonly SelectionContentId[],
    ): void {
      const slice = rangeSlice(start, end, orderedIds);
      if (slice === null) {
        return;
      }
      replaceContent(slice);
    },

    rangeSeries(
      start: SelectionSeriesId,
      end: SelectionSeriesId,
      orderedIds: readonly SelectionSeriesId[],
    ): void {
      const slice = rangeSlice(start, end, orderedIds);
      if (slice === null) {
        return;
      }
      replaceSeries(slice);
    },
  });
}

/**
 * Empty singleton SSOT for UX-8.3 bootstrap (empty by design).
 * Singleton Freeze: infrastructure / testing only.
 * React consumers MUST use SelectionProvider + useSelection().
 */
export const selectionRegistry: SelectionRegistryApi = createSelectionRegistry();
