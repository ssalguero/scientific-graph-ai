"use client";

import { useState, type ReactNode } from "react";

import type { PanelState } from "../panels/state/PanelState";

import { PlanningMode } from "./PlanningMode";
import type { WorkspaceMode, WorkspaceModeId } from "./WorkspaceMode";
import {
  WorkspaceModeContext,
  type WorkspaceModeContextValue,
} from "./WorkspaceModeContext";

/** Private static registry — not exported; no dynamic registration. */
const registry: Record<WorkspaceModeId, WorkspaceMode> = {
  planning: PlanningMode,
};

export type WorkspaceModeProviderProps = {
  children?: ReactNode;
};

/**
 * UX-2.10 — Owns currentMode only.
 * applyMode(id) returns registry[id].apply() immediately (not React state timing).
 */
export function WorkspaceModeProvider({ children }: WorkspaceModeProviderProps) {
  const [currentMode, setCurrentMode] = useState<WorkspaceMode>(PlanningMode);

  const setMode = (id: WorkspaceModeId): void => {
    setCurrentMode(registry[id]);
  };

  const applyMode = (id?: WorkspaceModeId): PanelState => {
    if (id === undefined) {
      return currentMode.apply();
    }
    const mode = registry[id];
    setCurrentMode(mode);
    return mode.apply();
  };

  const value: WorkspaceModeContextValue = {
    currentMode,
    setMode,
    applyMode,
  };

  return (
    <WorkspaceModeContext.Provider value={value}>
      {children}
    </WorkspaceModeContext.Provider>
  );
}
