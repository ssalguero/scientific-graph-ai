"use client";

import { useEffect, useState, type ReactNode } from "react";

import { load, save } from "../persistence/PanelPersistence";
import { PanelContext, type PanelContextValue } from "./PanelContext";
import {
  DEFAULT_PANEL_STATE,
  PANEL_MIN_SIZE,
  type PanelState,
} from "./PanelState";

export type PanelProviderProps = {
  children?: ReactNode;
  /** UX-2.10 — Optional initial layout (e.g. PlanningMode.apply()). */
  initialState?: PanelState;
};

/**
 * UX-2.7 / UX-2.8 — Owns panel collapsed + size state.
 * Setters clamp with Math.max(PANEL_MIN_SIZE, value). No max.
 * UX-2.8 — Restores from / persists via PanelPersistence facade.
 * UX-2.10 — Optional initialState from Workspace Mode (additive only).
 */
export function PanelProvider({
  children,
  initialState,
}: PanelProviderProps) {
  const [state, setState] = useState<PanelState>(() => ({
    ...(initialState ?? DEFAULT_PANEL_STATE),
  }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = load();
    /**
     * CRP-6.2.1 — E0 layout fidelity.
     * PlanningMode / DEFAULT_PANEL_STATE set commercial L/R/B collapsed, but
     * UX-2.8 hydration previously replaced that with pre-E0 persisted
     * fully-expanded scaffold (Explorer/Inspector/Console open), squeezing
     * the workspace. Migrate that legacy signature once: keep sizes, apply
     * commercial collapse. Selective expand still persists afterward.
     */
    const commercialCollapsedIntent =
      initialState != null &&
      initialState.leftCollapsed &&
      initialState.rightCollapsed &&
      initialState.bottomCollapsed;
    const preCommercialFullyExpanded =
      !stored.leftCollapsed &&
      !stored.rightCollapsed &&
      !stored.bottomCollapsed;

    if (commercialCollapsedIntent && preCommercialFullyExpanded) {
      setState({
        ...stored,
        leftCollapsed: true,
        rightCollapsed: true,
        bottomCollapsed: true,
      });
    } else {
      setState(stored);
    }
    setHydrated(true);
    // initialState is PlanningMode commercial seed; read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    save(state);
  }, [state, hydrated]);

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
