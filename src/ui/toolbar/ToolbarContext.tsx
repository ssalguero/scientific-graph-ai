/**
 * UX-6.7 — Private ToolbarContext (opaque toolbar ownership surface).
 *
 * Declares ToolbarContextValue and ToolbarContext only.
 * Does not own maps, build toolbars, or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { Toolbar } from "./Toolbar";

/**
 * Private context value: opaque toolbar only.
 * No setters · no mutators · no execution · no UI chrome.
 */
export type ToolbarContextValue = Readonly<{
  toolbar: Toolbar;
}>;

export const ToolbarContext = createContext<ToolbarContextValue | null>(null);
