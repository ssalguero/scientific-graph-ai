/**
 * UX-8.3 — Immutable SelectionState snapshot (Compatibility Freeze).
 *
 * Dual fields: singular (UX-8.2) + selected*Ids (UX-8.3).
 * Projection Freeze: singulars ALWAYS derived from Sets in createSelectionState only.
 *   size 0 → null · size 1 → that id · size > 1 → null
 *
 * Independence Freeze: axes are completely independent — no hierarchy,
 * no automatic sync. Mixed nulls / empty sets are valid.
 *
 * No metadata · no timestamps · no ownership.
 */

import {
  createSelectionSet,
  EMPTY_SELECTION_SET,
  type SelectionSet,
} from "./SelectionSet";
import type {
  SelectionContentId,
  SelectionSeriesId,
  SelectionWindowId,
} from "./SelectionTypes";

export type SelectionState = Readonly<{
  readonly selectedWindowId: SelectionWindowId | null;
  readonly selectedContentId: SelectionContentId | null;
  readonly selectedSeriesId: SelectionSeriesId | null;
  readonly selectedWindowIds: SelectionSet<SelectionWindowId>;
  readonly selectedContentIds: SelectionSet<SelectionContentId>;
  readonly selectedSeriesIds: SelectionSet<SelectionSeriesId>;
}>;

/**
 * Input shape for createSelectionState — Sets / iterables only.
 * Singulars are projected inside the factory (Projection Freeze).
 */
export type SelectionStateInit = Readonly<{
  selectedWindowIds: Iterable<SelectionWindowId>;
  selectedContentIds: Iterable<SelectionContentId>;
  selectedSeriesIds: Iterable<SelectionSeriesId>;
}>;

/**
 * Projection Freeze — single place of truth.
 * size 0 → null · size 1 → that id · size > 1 → null
 */
function projectSingular<T>(set: SelectionSet<T>): T | null {
  if (set.size === 0) {
    return null;
  }
  if (set.size === 1) {
    return set.values().next().value as T;
  }
  return null;
}

/**
 * Builds an immutable SelectionState snapshot.
 * Clone-on-read Sets + Projection Freeze + Object.freeze.
 */
export function createSelectionState(init: SelectionStateInit): SelectionState {
  const selectedWindowIds = createSelectionSet(init.selectedWindowIds);
  const selectedContentIds = createSelectionSet(init.selectedContentIds);
  const selectedSeriesIds = createSelectionSet(init.selectedSeriesIds);

  return Object.freeze({
    selectedWindowId: projectSingular(selectedWindowIds),
    selectedContentId: projectSingular(selectedContentIds),
    selectedSeriesId: projectSingular(selectedSeriesIds),
    selectedWindowIds,
    selectedContentIds,
    selectedSeriesIds,
  });
}

/** Empty selection snapshot (nothing selected on any axis). */
export const EMPTY_SELECTION_STATE: SelectionState = createSelectionState({
  selectedWindowIds: EMPTY_SELECTION_SET,
  selectedContentIds: EMPTY_SELECTION_SET,
  selectedSeriesIds: EMPTY_SELECTION_SET,
});
