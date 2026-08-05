/**
 * UX-8.2 — Immutable SelectionState snapshot.
 *
 * Only selectedWindowId + selectedContentId + selectedSeriesId.
 * Independence Freeze: axes are completely independent — no hierarchy,
 * no automatic sync. Mixed nulls are valid.
 *
 * No arrays · no Set · no Map · no metadata · no timestamps · no ownership.
 */

import type {
  SelectionContentId,
  SelectionSeriesId,
  SelectionWindowId,
} from "./SelectionTypes";

export type SelectionState = Readonly<{
  readonly selectedWindowId: SelectionWindowId | null;
  readonly selectedContentId: SelectionContentId | null;
  readonly selectedSeriesId: SelectionSeriesId | null;
}>;

/** Input shape for createSelectionState (freeze-only). */
export type SelectionStateInit = Readonly<{
  selectedWindowId: SelectionWindowId | null;
  selectedContentId: SelectionContentId | null;
  selectedSeriesId: SelectionSeriesId | null;
}>;

/**
 * Builds an immutable SelectionState snapshot.
 * Applies Object.freeze only — no collections.
 */
export function createSelectionState(init: SelectionStateInit): SelectionState {
  return Object.freeze({
    selectedWindowId: init.selectedWindowId,
    selectedContentId: init.selectedContentId,
    selectedSeriesId: init.selectedSeriesId,
  });
}

/** Empty selection snapshot (nothing selected on any axis). */
export const EMPTY_SELECTION_STATE: SelectionState = createSelectionState({
  selectedWindowId: null,
  selectedContentId: null,
  selectedSeriesId: null,
});
