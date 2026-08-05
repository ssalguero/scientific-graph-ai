/**
 * UX-8.2 — Mutable Selection Registry (SSOT · sole selection authority).
 *
 * Contract: SelectionRegistryApi (Registry Freeze)
 * Singleton: selectionRegistry (empty by design — no production selection)
 *
 * Official methods only: selectWindow / selectContent / selectSeries /
 * clear / get / getState.
 * factory → private state → API Freeze → clone-on-read.
 * No React · no WindowRegistry · no Focus · no cross-registry mutation.
 *
 * Independence Freeze: select* mutates only its own axis.
 *
 * API Stability Freeze: get() and getState() are intentionally equivalent.
 * Both remain frozen for API stability; consumers must not assume differences.
 *
 * Singleton Freeze: selectionRegistry exists ONLY for infrastructure and
 * testing. React consumers MUST use SelectionProvider + useSelection().
 */

import { createSelectionState, type SelectionState } from "./SelectionState";
import type {
  SelectionContentId,
  SelectionSeriesId,
  SelectionWindowId,
} from "./SelectionTypes";

/**
 * Mutable registry contract — Registry Freeze UX-8.2.
 * Named SelectionRegistryApi to avoid type/value name collision with the singleton.
 */
export interface SelectionRegistryApi {
  selectWindow(id: SelectionWindowId): void;
  selectContent(id: SelectionContentId): void;
  selectSeries(id: SelectionSeriesId): void;
  clear(): void;
  get(): SelectionState;
  getState(): SelectionState;
}

/**
 * Creates an isolated in-memory selection registry.
 * - Private SelectionState (three independent nullable axes)
 * - get / getState return a defensive frozen clone (equivalent)
 * - select* mutates only its axis (Independence Freeze)
 */
export function createSelectionRegistry(): SelectionRegistryApi {
  let selectedWindowId: SelectionWindowId | null = null;
  let selectedContentId: SelectionContentId | null = null;
  let selectedSeriesId: SelectionSeriesId | null = null;

  function snapshot(): SelectionState {
    return createSelectionState({
      selectedWindowId,
      selectedContentId,
      selectedSeriesId,
    });
  }

  return Object.freeze({
    selectWindow(id: SelectionWindowId): void {
      if (selectedWindowId === id) {
        return;
      }
      selectedWindowId = id;
    },

    selectContent(id: SelectionContentId): void {
      if (selectedContentId === id) {
        return;
      }
      selectedContentId = id;
    },

    selectSeries(id: SelectionSeriesId): void {
      if (selectedSeriesId === id) {
        return;
      }
      selectedSeriesId = id;
    },

    clear(): void {
      selectedWindowId = null;
      selectedContentId = null;
      selectedSeriesId = null;
    },

    get(): SelectionState {
      return snapshot();
    },

    getState(): SelectionState {
      return snapshot();
    },
  });
}

/**
 * Empty singleton SSOT for UX-8.2 bootstrap (empty by design).
 * Singleton Freeze: infrastructure / testing only.
 * React consumers MUST use SelectionProvider + useSelection().
 */
export const selectionRegistry: SelectionRegistryApi = createSelectionRegistry();
