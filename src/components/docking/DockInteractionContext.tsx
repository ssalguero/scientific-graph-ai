"use client";

import { createContext, type ReactNode } from "react";

/**
 * D53.2 / D53.4 — Dock interaction state (independent of DockState v1).
 * API Freeze: docs/D53.1-api-freeze.md · D53 → D60.
 * Sessions (D53.4): ephemeral drag/resize payloads; no layout mutation.
 */

export type DockPointerPoint = {
  x: number;
  y: number;
};

/** Frozen ResizeEdge — D53.1 API Freeze. */
export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** Frozen DockDragSession — D53.1 API Freeze. */
export type DockDragSession = {
  dockId: string;
  pointerId: number;
  start: DockPointerPoint;
  current: DockPointerPoint;
};

/** Frozen DockResizeSession — D53.1 API Freeze. */
export type DockResizeSession = {
  dockId: string;
  pointerId: number;
  edge: ResizeEdge;
  start: DockPointerPoint;
  current: DockPointerPoint;
};

export type BeginDragInput = {
  dockId: string;
  pointerId: number;
  x: number;
  y: number;
};

export type UpdateDragInput = {
  x: number;
  y: number;
};

export type BeginResizeInput = {
  dockId: string;
  pointerId: number;
  edge: ResizeEdge;
  x: number;
  y: number;
};

export type UpdateResizeInput = {
  x: number;
  y: number;
};

export type DockInteractionState = {
  focusedDock: string | null;
  activeDock: string | null;
  hoverDock: string | null;
  draggingDock: string | null;
  resizingDock: string | null;
  dragSession: DockDragSession | null;
  resizeSession: DockResizeSession | null;
};

/** Public interaction API — D53.1 freeze; bodies completed in D53.3/D53.4. */
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
  dragSession: null,
  resizeSession: null,
};

export const DockInteractionContext =
  createContext<DockInteractionContextValue | null>(null);

export type DockInteractionProviderProps = {
  children?: ReactNode;
};

export function parseBeginDragInput(
  args: unknown[]
): BeginDragInput | null {
  const raw = args[0];
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.dockId !== "string" ||
    typeof o.pointerId !== "number" ||
    typeof o.x !== "number" ||
    typeof o.y !== "number"
  ) {
    return null;
  }
  return {
    dockId: o.dockId,
    pointerId: o.pointerId,
    x: o.x,
    y: o.y,
  };
}

export function parseUpdatePointInput(
  args: unknown[]
): UpdateDragInput | null {
  const raw = args[0];
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.x !== "number" || typeof o.y !== "number") return null;
  return { x: o.x, y: o.y };
}

const RESIZE_EDGES: ReadonlySet<string> = new Set([
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
]);

export function parseBeginResizeInput(
  args: unknown[]
): BeginResizeInput | null {
  const raw = args[0];
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.dockId !== "string" ||
    typeof o.pointerId !== "number" ||
    typeof o.edge !== "string" ||
    !RESIZE_EDGES.has(o.edge) ||
    typeof o.x !== "number" ||
    typeof o.y !== "number"
  ) {
    return null;
  }
  return {
    dockId: o.dockId,
    pointerId: o.pointerId,
    edge: o.edge as ResizeEdge,
    x: o.x,
    y: o.y,
  };
}
