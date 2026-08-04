/**
 * UX-6.6 — MenuProvider (sole owner of opaque tree via useRef).
 *
 * Builds MenuTree from MENU_CATALOG once.
 * Context exposes `{ tree }` only — no internal structures.
 * No production mount in UX-6.6.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { MenuContext } from "./MenuContext";
import { buildMenuTree } from "./MenuTreeBuilder";

export type MenuProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Menu infrastructure collection.
 * No useState · no useReducer · no setters · no product wiring · no UI.
 */
export function MenuProvider({ children }: MenuProviderProps) {
  const treeRef = useRef(buildMenuTree());

  const value = Object.freeze({
    tree: treeRef.current,
  });

  return (
    <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
  );
}
