/**
 * UX-8.4 — Hover Hooks (read-only Context access layer).
 *
 * Consumes HoverContext only. Does not own or create registry.
 * Mutations remain on HoverRegistryApi (sole authority).
 * No mutation helpers on the hook — use registry.* only.
 */

"use client";

import { useContext } from "react";
import { HoverContext, type HoverContextValue } from "./HoverContext";

/**
 * Returns the exact Provider-owned HoverContextValue reference.
 * Reference identity of registry is part of the UX-8.4 API Freeze.
 */
export function useHover(): HoverContextValue {
  const context = useContext(HoverContext);
  if (context === null) {
    throw new Error("Hover hooks must be used inside HoverProvider.");
  }
  return context;
}
