/**
 * UX-6.4 — Private ShortcutContext (registry ownership surface).
 *
 * Declares ShortcutContextValue and ShortcutContext only.
 * Does not own maps, create resolvers, or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { ShortcutRegistryApi } from "./ShortcutRegistry";

/**
 * Private context value: registry SSOT view only.
 * Resolver is owned privately by Provider — not part of Context.
 * No setters · no mutators · no execution · no browser.
 */
export type ShortcutContextValue = Readonly<{
  registry: ShortcutRegistryApi;
}>;

export const ShortcutContext =
  createContext<ShortcutContextValue | null>(null);
