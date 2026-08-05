/**
 * UX-8.1 — Private FocusContext (registry ownership surface).
 *
 * Declares FocusContextValue and FocusContext only.
 * Does not own state or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { FocusRegistryApi } from "./FocusRegistry";

/**
 * Private context value: FocusRegistryApi SSOT view.
 * Mutations go only through FocusRegistry (sole authority).
 */
export type FocusContextValue = Readonly<{
  registry: FocusRegistryApi;
}>;

export const FocusContext = createContext<FocusContextValue | null>(null);
