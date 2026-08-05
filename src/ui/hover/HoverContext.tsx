/**
 * UX-8.4 — Private HoverContext (registry ownership surface).
 *
 * Declares HoverContextValue and HoverContext only.
 * Does not own state or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { HoverRegistryApi } from "./HoverRegistry";

/**
 * Private context value: HoverRegistryApi SSOT view.
 * Mutations go only through HoverRegistry (sole authority).
 */
export type HoverContextValue = Readonly<{
  registry: HoverRegistryApi;
}>;

export const HoverContext = createContext<HoverContextValue | null>(null);
