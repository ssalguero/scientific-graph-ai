/**
 * UX-8.5 — Keyboard Navigation Hooks (read-only Context access layer).
 *
 * Consumes KeyboardNavigationContext only. Does not own or create registry.
 * Mutations remain on KeyboardNavigationRegistryApi (sole authority).
 * No mutation helpers on the hook — use registry.* only.
 */

"use client";

import { useContext } from "react";
import {
  KeyboardNavigationContext,
  type KeyboardNavigationContextValue,
} from "./KeyboardNavigationContext";

/**
 * Returns the exact Provider-owned KeyboardNavigationContextValue reference.
 * Reference identity of registry is part of the UX-8.5 API Freeze.
 */
export function useKeyboardNavigation(): KeyboardNavigationContextValue {
  const context = useContext(KeyboardNavigationContext);
  if (context === null) {
    throw new Error(
      "Keyboard navigation hooks must be used inside KeyboardNavigationProvider.",
    );
  }
  return context;
}
