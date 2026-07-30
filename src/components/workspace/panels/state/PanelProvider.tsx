"use client";

import { useState, type ReactNode } from "react";

import { PanelContext, type PanelContextValue } from "./PanelContext";
import {
  DEFAULT_PANEL_STATE,
  PANEL_MIN_SIZE,
  type PanelState,
} from "./PanelState";

export type PanelProviderProps = {
  children?: ReactNode;
};

/**
 * UX-2.7 — Owns panel collapsed + size state.
 * Setters clamp with Math.max(PANEL_MIN_SIZE, value). No max. No persistence.
 */
export function PanelProvider({ children }: PanelProviderProps) {
  const [state, setState] = useState<PanelState>(() => ({
    ...DEFAULT_PANEL_STATE,
  }));

  const value: PanelContextValue = {
    state,
    collapseLeft: () =>
      setState((s) => ({ ...s, leftCollapsed: true })),
    expandLeft: () =>
      setState((s) => ({ ...s, leftCollapsed: false })),
    toggleLeft: () =>
      setState((s) => ({ ...s, leftCollapsed: !s.leftCollapsed })),
    collapseRight: () =>
      setState((s) => ({ ...s, rightCollapsed: true })),
    expandRight: () =>
      setState((s) => ({ ...s, rightCollapsed: false })),
    toggleRight: () =>
      setState((s) => ({ ...s, rightCollapsed: !s.rightCollapsed })),
    collapseBottom: () =>
      setState((s) => ({ ...s, bottomCollapsed: true })),
    expandBottom: () =>
      setState((s) => ({ ...s, bottomCollapsed: false })),
    toggleBottom: () =>
      setState((s) => ({ ...s, bottomCollapsed: !s.bottomCollapsed })),
    setLeftWidth: (width) =>
      setState((s) => ({
        ...s,
        leftWidth: Math.max(PANEL_MIN_SIZE, width),
      })),
    setRightWidth: (width) =>
      setState((s) => ({
        ...s,
        rightWidth: Math.max(PANEL_MIN_SIZE, width),
      })),
    setBottomHeight: (height) =>
      setState((s) => ({
        ...s,
        bottomHeight: Math.max(PANEL_MIN_SIZE, height),
      })),
  };

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}
