"use client";

import { useContext } from "react";

import {
  PanelResizeContext,
  type PanelResizeContextValue,
} from "./PanelResizeContext";

/** UX-2.9 — Access PanelResizeContext; throws outside PanelResizeProvider. */
export function usePanelResize(): PanelResizeContextValue {
  const value = useContext(PanelResizeContext);
  if (value == null) {
    throw new Error("usePanelResize must be used within PanelResizeProvider");
  }
  return value;
}
