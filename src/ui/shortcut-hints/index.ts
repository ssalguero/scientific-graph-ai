/**
 * UX-7.3 — Shortcut Hint Foundation local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { VisibilityId } from "./ShortcutHintTypes";

export type { ShortcutHint, ShortcutHintInit } from "./ShortcutHint";

export { createShortcutHint } from "./createShortcutHint";

export {
  shortcutHintFromDefinition,
  resolveShortcutHint,
} from "./resolveShortcutHint";
