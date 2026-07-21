"use client";

import { useContext } from "react";
import {
  DockInteractionContext,
  type DockInteractionContextValue,
} from "./DockInteractionContext";

/**
 * D53.2 — Public hook for dock interaction state + API.
 * Must be used under DockInteractionProvider (nested under DockProvider via DockRoot).
 */
export function useDockInteraction(): DockInteractionContextValue {
  const value = useContext(DockInteractionContext);
  if (value == null) {
    throw new Error(
      "useDockInteraction must be used within a DockInteractionProvider"
    );
  }
  return value;
}
