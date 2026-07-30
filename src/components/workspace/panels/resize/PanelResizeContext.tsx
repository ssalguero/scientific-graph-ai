"use client";

import { createContext } from "react";

import type { ResizeAxis, ResizeSession } from "./ResizeTypes";

/**
 * UX-2.9 — Frozen resize session API (primitives only — no PointerEvent).
 */
export interface PanelResizeContextValue {
  session: ResizeSession | null;
  beginResize(pointerId: number, axis: ResizeAxis, client: number): void;
  updateResize(client: number): void;
  endResize(): void;
}

export const PanelResizeContext =
  createContext<PanelResizeContextValue | null>(null);
