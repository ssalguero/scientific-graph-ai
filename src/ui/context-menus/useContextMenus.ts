/**
 * UX-6.8 — Context Menu Hooks (read-only Context access layer).
 *
 * Consumes ContextMenuContext only. Does not own, create, or mutate state.
 * No execution · no UI chrome.
 */

"use client";

import { useContext } from "react";
import {
  ContextMenuContext,
  type ContextMenuContextValue,
} from "./ContextMenuContext";

/**
 * Returns the exact Provider-owned ContextMenuContextValue reference.
 * Reference identity of contextMenus is part of the UX-6.8 API Freeze.
 */
export function useContextMenus(): ContextMenuContextValue {
  const context = useContext(ContextMenuContext);
  if (context === null) {
    throw new Error(
      "Context menu hooks must be used inside ContextMenuProvider.",
    );
  }
  return context;
}
