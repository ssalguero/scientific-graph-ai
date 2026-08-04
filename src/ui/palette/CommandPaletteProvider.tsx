/**
 * UX-6.5 — CommandPaletteProvider (sole owner of opaque index via useRef).
 *
 * Builds catalog + index from commandRegistry once.
 * Context exposes `{ index }` only — no internal structures.
 * No production mount in UX-6.5.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { commandRegistry } from "../commands/CommandRegistry";
import { createCommandPaletteCatalog } from "./CommandPaletteCatalog";
import { CommandPaletteContext } from "./CommandPaletteContext";
import { createCommandPaletteIndex } from "./CommandPaletteIndex";

export type CommandPaletteProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Command Palette infrastructure collection.
 * No useState · no useReducer · no setters · no product wiring · no UI.
 */
export function CommandPaletteProvider({
  children,
}: CommandPaletteProviderProps) {
  const indexRef = useRef(
    createCommandPaletteIndex(createCommandPaletteCatalog(commandRegistry)),
  );

  const value = Object.freeze({
    index: indexRef.current,
  });

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}
