/**
 * UX-6.7 — ToolbarProvider (sole owner of opaque toolbar via useRef).
 *
 * Builds Toolbar from TOOLBAR_CATALOG once.
 * Context exposes `{ toolbar }` only — no internal structures.
 * No production mount in UX-6.7.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { ToolbarContext } from "./ToolbarContext";
import { buildToolbar } from "./ToolbarBuilder";

export type ToolbarProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Toolbar infrastructure collection.
 * No useState · no useReducer · no setters · no product wiring · no UI.
 */
export function ToolbarProvider({ children }: ToolbarProviderProps) {
  const toolbarRef = useRef(buildToolbar());

  const value = Object.freeze({
    toolbar: toolbarRef.current,
  });

  return (
    <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>
  );
}
