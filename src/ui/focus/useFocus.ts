/**
 * UX-8.1 — Focus Hooks (read-only Context access layer).
 *
 * Consumes FocusContext only. Does not own or create registry.
 * Mutations remain on FocusRegistryApi (sole authority).
 */

"use client";

import { useContext } from "react";
import { FocusContext, type FocusContextValue } from "./FocusContext";

/**
 * Returns the exact Provider-owned FocusContextValue reference.
 * Reference identity of registry is part of the UX-8.1 API Freeze.
 */
export function useFocus(): FocusContextValue {
  const context = useContext(FocusContext);
  if (context === null) {
    throw new Error("Focus hooks must be used inside FocusProvider.");
  }
  return context;
}
