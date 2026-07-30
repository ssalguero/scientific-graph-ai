"use client";

import { createContext } from "react";

import type { PanelState } from "../panels/state/PanelState";

import type { WorkspaceMode, WorkspaceModeId } from "./WorkspaceMode";

/** UX-2.10 — Frozen mode context API (no extra state beyond currentMode). */
export interface WorkspaceModeContextValue {
  currentMode: WorkspaceMode;
  setMode(id: WorkspaceModeId): void;
  applyMode(id?: WorkspaceModeId): PanelState;
}

export const WorkspaceModeContext =
  createContext<WorkspaceModeContextValue | null>(null);
