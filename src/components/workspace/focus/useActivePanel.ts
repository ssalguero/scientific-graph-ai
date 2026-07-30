"use client";

import { useContext } from "react";

import {
  PanelFocusContext,
  type PanelFocusContextValue,
} from "./PanelFocusContext";

/**
 * UX-2.13 — Public hook for UI-only active panel focus.
 * Must be used under ActivePanelProvider.
 */
export function useActivePanel(): PanelFocusContextValue {
  const value = useContext(PanelFocusContext);
  if (value == null) {
    throw new Error("useActivePanel must be used within an ActivePanelProvider");
  }
  return value;
}
