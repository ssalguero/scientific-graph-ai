"use client";

import { createContext } from "react";

import type { PanelState } from "./PanelState";

/** UX-2.7 — Nested state + mutators (do not flatten state onto the value). */
export interface PanelContextValue {
  state: PanelState;
  collapseLeft(): void;
  expandLeft(): void;
  toggleLeft(): void;
  collapseRight(): void;
  expandRight(): void;
  toggleRight(): void;
  collapseBottom(): void;
  expandBottom(): void;
  toggleBottom(): void;
  setLeftWidth(width: number): void;
  setRightWidth(width: number): void;
  setBottomHeight(height: number): void;
}

export const PanelContext = createContext<PanelContextValue | null>(null);
