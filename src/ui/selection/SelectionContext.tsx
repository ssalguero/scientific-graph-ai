/**
 * UX-8.2 — Private SelectionContext (registry ownership surface).
 *
 * Declares SelectionContextValue and SelectionContext only.
 * Does not own state or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { SelectionRegistryApi } from "./SelectionRegistry";

/**
 * Private context value: SelectionRegistryApi SSOT view.
 * Mutations go only through SelectionRegistry (sole authority).
 */
export type SelectionContextValue = Readonly<{
  registry: SelectionRegistryApi;
}>;

export const SelectionContext = createContext<SelectionContextValue | null>(
  null,
);
