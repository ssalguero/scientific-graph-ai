/**
 * UX-8.5 — Immutable KeyboardNavigationState snapshot.
 *
 * Stateless Navigation Freeze: ONLY lastDirection.
 * No currentIndex · currentTarget · currentFocus · currentSelection ·
 * navigationStack · history · timestamps · metadata · counters ·
 * keycodes · modifiers.
 *
 * Models navigation intent only — not execution.
 */

import { type KeyboardNavigationDirection } from "./KeyboardNavigationTypes";

export type KeyboardNavigationState = Readonly<{
  readonly lastDirection: KeyboardNavigationDirection | null;
}>;

/** Input shape for createKeyboardNavigationState (freeze-only). */
export type KeyboardNavigationStateInit = Readonly<{
  lastDirection: KeyboardNavigationDirection | null;
}>;

/**
 * Builds an immutable KeyboardNavigationState snapshot.
 * Applies Object.freeze only.
 */
export function createKeyboardNavigationState(
  init: KeyboardNavigationStateInit,
): KeyboardNavigationState {
  return Object.freeze({
    lastDirection: init.lastDirection,
  });
}

/** Empty keyboard-nav snapshot (no intent recorded). */
export const EMPTY_KEYBOARD_NAVIGATION_STATE: KeyboardNavigationState =
  createKeyboardNavigationState({
    lastDirection: null,
  });
