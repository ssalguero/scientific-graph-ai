"use client";

import { useState, type ReactNode } from "react";

import {
  DEFAULT_ACTIVE_PANEL,
  PanelFocusContext,
  type ActivePanelId,
  type PanelFocusContextValue,
} from "./PanelFocusContext";

export type ActivePanelProviderProps = {
  children?: ReactNode;
};

/**
 * UX-2.13 — Owns ephemeral activePanelId only.
 * No persistence, storage, reducer, or panel/resize coupling.
 */
export function ActivePanelProvider({ children }: ActivePanelProviderProps) {
  const [activePanelId, setActivePanelId] =
    useState<ActivePanelId>(DEFAULT_ACTIVE_PANEL);

  const value: PanelFocusContextValue = {
    activePanelId,
    setActivePanel: setActivePanelId,
  };

  return (
    <PanelFocusContext.Provider value={value}>
      {children}
    </PanelFocusContext.Provider>
  );
}
