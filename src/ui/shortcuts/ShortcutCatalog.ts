/**
 * UX-6.4 — Official Shortcut Catalog (seed).
 *
 * Sole place that grows as new shortcuts are declared in later phases.
 * No registration logic · no registry construction · no React · no browser.
 */

import { asCommandId } from "../commands/CommandTypes";
import { createShortcutDefinition } from "./ShortcutDefinition";
import type { ShortcutDefinition } from "./ShortcutDefinition";
import { asShortcutId, asShortcutKey } from "./ShortcutTypes";

/** Official identity-only shortcut seed for UX-6.4 (system probes only). */
export const SHORTCUT_CATALOG: readonly ShortcutDefinition[] = Object.freeze([
  createShortcutDefinition({
    id: asShortcutId("shortcut.system.catalog"),
    key: asShortcutKey("Ctrl+Shift+P"),
    commandId: asCommandId("system.catalog"),
  }),
  createShortcutDefinition({
    id: asShortcutId("shortcut.system.diagnostics"),
    key: asShortcutKey("Ctrl+Alt+D"),
    commandId: asCommandId("system.diagnostics"),
  }),
  createShortcutDefinition({
    id: asShortcutId("shortcut.system.ping"),
    key: asShortcutKey("Ctrl+Alt+P"),
    commandId: asCommandId("system.ping"),
  }),
]);
