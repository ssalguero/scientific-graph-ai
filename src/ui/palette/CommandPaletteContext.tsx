/**
 * UX-6.5 — Private CommandPaletteContext (opaque index ownership surface).
 *
 * Declares CommandPaletteContextValue and CommandPaletteContext only.
 * Does not own maps, build indexes, or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { CommandPaletteIndex } from "./CommandPaletteIndex";

/**
 * Private context value: opaque index only.
 * No setters · no mutators · no execution · no UI chrome.
 */
export type CommandPaletteContextValue = Readonly<{
  index: CommandPaletteIndex;
}>;

export const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);
