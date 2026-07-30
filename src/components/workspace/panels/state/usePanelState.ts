"use client";

import { useContext } from "react";

import { PanelContext, type PanelContextValue } from "./PanelContext";

/**
 * UX-2.7 — Public hook for panel visual state + API.
 * Must be used under PanelProvider.
 */
export function usePanelState(): PanelContextValue {
  const value = useContext(PanelContext);
  if (value == null) {
    throw new Error("usePanelState must be used within a PanelProvider");
  }
  return value;
}
