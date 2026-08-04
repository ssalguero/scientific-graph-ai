/**
 * UX-6.6 — Menu Hooks (read-only Context access layer).
 *
 * Consumes MenuContext only. Does not own, create, or mutate state.
 * No execution · no UI chrome.
 */

"use client";

import { useContext } from "react";
import { MenuContext, type MenuContextValue } from "./MenuContext";

/**
 * Returns the exact Provider-owned MenuContextValue reference.
 * Reference identity of tree is part of the UX-6.6 API Freeze.
 */
export function useMenus(): MenuContextValue {
  const context = useContext(MenuContext);
  if (context === null) {
    throw new Error("Menu hooks must be used inside MenuProvider.");
  }
  return context;
}
