/**
 * UX-6.8 — Private ContextMenuContext (opaque contextMenus ownership surface).
 *
 * Declares ContextMenuContextValue and ContextMenuContext only.
 * Does not own maps, build context menus, or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { ContextMenus } from "./ContextMenus";

/**
 * Private context value: opaque contextMenus only.
 * No setters · no mutators · no execution · no UI chrome.
 */
export type ContextMenuContextValue = Readonly<{
  contextMenus: ContextMenus;
}>;

export const ContextMenuContext =
  createContext<ContextMenuContextValue | null>(null);
