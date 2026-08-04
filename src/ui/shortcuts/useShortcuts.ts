/**
 * UX-6.4 — Shortcut Hooks (read-only Context access layer).
 *
 * Consumes ShortcutContext only. Does not own, create, or mutate state.
 * No execution · no registration · no browser events.
 */

"use client";

import { useContext } from "react";
import {
  ShortcutContext,
  type ShortcutContextValue,
} from "./ShortcutContext";

/**
 * Returns the exact Provider-owned ShortcutContextValue reference.
 * Reference identity of registry is part of the UX-6.4 API Freeze.
 */
export function useShortcuts(): ShortcutContextValue {
  const context = useContext(ShortcutContext);
  if (context === null) {
    throw new Error("Shortcut hooks must be used inside ShortcutProvider.");
  }
  return context;
}
