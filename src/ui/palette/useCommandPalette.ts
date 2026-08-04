/**
 * UX-6.5 — Command Palette Hooks (read-only Context access layer).
 *
 * Consumes CommandPaletteContext only. Does not own, create, or mutate state.
 * No execution · no UI chrome · no search side effects.
 */

"use client";

import { useContext } from "react";
import {
  CommandPaletteContext,
  type CommandPaletteContextValue,
} from "./CommandPaletteContext";

/**
 * Returns the exact Provider-owned CommandPaletteContextValue reference.
 * Reference identity of index is part of the UX-6.5 API Freeze.
 */
export function useCommandPalette(): CommandPaletteContextValue {
  const context = useContext(CommandPaletteContext);
  if (context === null) {
    throw new Error(
      "Command Palette hooks must be used inside CommandPaletteProvider.",
    );
  }
  return context;
}
