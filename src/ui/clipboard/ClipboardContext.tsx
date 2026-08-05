/**
 * UX-8.6 — Private ClipboardContext (registry ownership surface).
 *
 * Declares ClipboardContextValue and ClipboardContext only.
 * Does not own state or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { ClipboardRegistryApi } from "./ClipboardRegistry";

/**
 * Private context value: ClipboardRegistryApi SSOT view.
 * Mutations go only through ClipboardRegistry (sole authority).
 */
export type ClipboardContextValue = Readonly<{
  registry: ClipboardRegistryApi;
}>;

export const ClipboardContext =
  createContext<ClipboardContextValue | null>(null);
