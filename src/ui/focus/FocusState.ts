/**
 * UX-8.1 — Immutable FocusState snapshot.
 *
 * Only focusedId + lastFocusedId. No blurred field.
 * isFocused(id) is derived by FocusRegistry (not stored).
 */

import type { FocusTargetId } from "./FocusTypes";

export type FocusState = Readonly<{
  readonly focusedId: FocusTargetId | null;
  readonly lastFocusedId: FocusTargetId | null;
}>;

/** Input shape for createFocusState (freeze-only). */
export type FocusStateInit = Readonly<{
  focusedId: FocusTargetId | null;
  lastFocusedId: FocusTargetId | null;
}>;

/**
 * Builds an immutable FocusState snapshot.
 * Applies Object.freeze only — no collections.
 */
export function createFocusState(init: FocusStateInit): FocusState {
  return Object.freeze({
    focusedId: init.focusedId,
    lastFocusedId: init.lastFocusedId,
  });
}

/** Empty focus snapshot (nothing focused · no history). */
export const EMPTY_FOCUS_STATE: FocusState = createFocusState({
  focusedId: null,
  lastFocusedId: null,
});
