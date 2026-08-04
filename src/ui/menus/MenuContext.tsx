/**
 * UX-6.6 — Private MenuContext (opaque tree ownership surface).
 *
 * Declares MenuContextValue and MenuContext only.
 * Does not own maps, build trees, or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { MenuTree } from "./MenuTree";

/**
 * Private context value: opaque tree only.
 * No setters · no mutators · no execution · no UI chrome.
 */
export type MenuContextValue = Readonly<{
  tree: MenuTree;
}>;

export const MenuContext = createContext<MenuContextValue | null>(null);
