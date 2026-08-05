/**
 * UX-8.6 — Clipboard Hooks (read-only Context access layer).
 *
 * Consumes ClipboardContext only. Does not own or create registry.
 * Mutations remain on ClipboardRegistryApi (sole authority).
 * No mutation helpers on the hook — use registry.* only.
 */

"use client";

import { useContext } from "react";
import {
  ClipboardContext,
  type ClipboardContextValue,
} from "./ClipboardContext";

/**
 * Returns the exact Provider-owned ClipboardContextValue reference.
 * Reference identity of registry is part of the UX-8.6 API Freeze.
 */
export function useClipboard(): ClipboardContextValue {
  const context = useContext(ClipboardContext);
  if (context === null) {
    throw new Error(
      "Clipboard hooks must be used inside ClipboardProvider.",
    );
  }
  return context;
}
