/**
 * UX-6.8 — ContextMenuProvider (sole owner of opaque contextMenus via useRef).
 *
 * Builds ContextMenus from CONTEXT_MENU_CATALOG once.
 * Context exposes `{ contextMenus }` only — no internal structures.
 * No production mount in UX-6.8.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { ContextMenuContext } from "./ContextMenuContext";
import { buildContextMenus } from "./ContextMenuBuilder";

export type ContextMenuProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the ContextMenus infrastructure collection.
 * No useState · no useReducer · no setters · no product wiring · no UI.
 */
export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
  const contextMenusRef = useRef(buildContextMenus());

  const value = Object.freeze({
    contextMenus: contextMenusRef.current,
  });

  return (
    <ContextMenuContext.Provider value={value}>
      {children}
    </ContextMenuContext.Provider>
  );
}
