/**
 * UX-8.2 — Selection Hooks (read-only Context access layer).
 *
 * Consumes SelectionContext only. Does not own or create registry.
 * Mutations remain on SelectionRegistryApi (sole authority).
 * No mutation helpers on the hook — use registry.* only.
 */

"use client";

import { useContext } from "react";
import {
  SelectionContext,
  type SelectionContextValue,
} from "./SelectionContext";

/**
 * Returns the exact Provider-owned SelectionContextValue reference.
 * Reference identity of registry is part of the UX-8.2 API Freeze.
 */
export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);
  if (context === null) {
    throw new Error("Selection hooks must be used inside SelectionProvider.");
  }
  return context;
}
