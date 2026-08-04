/**
 * UX-7.3 — Shortcut hint factory.
 * Normalize (trim) · validate · Object.freeze.
 * Title = exact copy after trim (no abbreviate / truncate / casing / i18n).
 * Shortcut Freeze = raw value after trim (no format / platform / aliases).
 */

import type { ShortcutHint, ShortcutHintInit } from "./ShortcutHint";
import { asVisibilityId } from "../visibility/VisibilityTypes";

/**
 * Builds an immutable ShortcutHint.
 * Trims all string fields; requires non-empty id / title.
 * shortcut may be "".
 */
export function createShortcutHint(init: ShortcutHintInit): ShortcutHint {
  const id = init.id.trim();
  const title = init.title.trim();
  const shortcut = init.shortcut.trim();

  if (id.length === 0) {
    throw new Error("ShortcutHint id must be a non-empty string");
  }
  if (title.length === 0) {
    throw new Error("ShortcutHint title must be a non-empty string");
  }

  return Object.freeze({
    id: asVisibilityId(id),
    title,
    shortcut,
  });
}
