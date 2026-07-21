"use client";

import { createContext, type ReactNode } from "react";

/**
 * D53.2 — Dock interaction state (independent of DockState v1).
 * API Freeze: docs/D53.1-api-freeze.md · D53 → D60.
 */

export type DockInteractionState = {
  focusedDock: string | null;
  activeDock: string | null;
  hoverDock: string | null;
  draggingDock: string | null;
  resizingDock: string | null;
};

/** Public interaction API — stubs allowed for drag/resize until D53.4. */
export type DockInteractionApi = {
  focus(id: string): void;
  blur(): void;
  activate(id: string): void;
  deactivate(): void;
  beginDrag(...args: unknown[]): void;
  updateDrag(...args: unknown[]): void;
  endDrag(): void;
  beginResize(...args: unknown[]): void;
  updateResize(...args: unknown[]): void;
  endResize(): void;
};

export type DockInteractionContextValue = DockInteractionState & DockInteractionApi;

export const DEFAULT_DOCK_INTERACTION_STATE: DockInteractionState = {
  focusedDock: null,
  activeDock: null,
  hoverDock: null,
  draggingDock: null,
  resizingDock: null,
};

export const DockInteractionContext =
  createContext<DockInteractionContextValue | null>(null);

export type DockInteractionProviderProps = {
  children?: ReactNode;
};
