/**
 * UX-6.7 — Toolbar Hooks (read-only Context access layer).
 *
 * Consumes ToolbarContext only. Does not own, create, or mutate state.
 * No execution · no UI chrome.
 */

"use client";

import { useContext } from "react";
import { ToolbarContext, type ToolbarContextValue } from "./ToolbarContext";

/**
 * Returns the exact Provider-owned ToolbarContextValue reference.
 * Reference identity of toolbar is part of the UX-6.7 API Freeze.
 */
export function useToolbar(): ToolbarContextValue {
  const context = useContext(ToolbarContext);
  if (context === null) {
    throw new Error("Toolbar hooks must be used inside ToolbarProvider.");
  }
  return context;
}
