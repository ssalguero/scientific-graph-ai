/**
 * UX-8.6 — Immutable ClipboardState snapshot.
 *
 * Stateless Clipboard Freeze: ONLY entry.
 * No history · stack · queue · previousEntry · undo · redo · timestamps ·
 * metadata.
 *
 * Clipboard Contract Freeze: entry holds a logical ClipboardEntry only.
 */

import type { ClipboardEntry } from "./ClipboardTypes";

export type ClipboardState = Readonly<{
  readonly entry: ClipboardEntry | null;
}>;

/** Input shape for createClipboardState (freeze-only). */
export type ClipboardStateInit = Readonly<{
  entry: ClipboardEntry | null;
}>;

/**
 * Builds an immutable ClipboardState snapshot.
 * Applies Object.freeze only.
 */
export function createClipboardState(
  init: ClipboardStateInit,
): ClipboardState {
  return Object.freeze({
    entry: init.entry,
  });
}

/** Empty clipboard snapshot (no entry). */
export const EMPTY_CLIPBOARD_STATE: ClipboardState = createClipboardState({
  entry: null,
});
