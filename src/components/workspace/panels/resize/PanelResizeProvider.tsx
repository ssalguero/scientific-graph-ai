"use client";

import { useRef, useState, type ReactNode } from "react";

import { usePanelState } from "../state";
import {
  PanelResizeContext,
  type PanelResizeContextValue,
} from "./PanelResizeContext";
import { RESIZE_CONSTRAINTS } from "./ResizeConstraints";
import { computeNextSize } from "./ResizeMath";
import type { ResizeAxis, ResizeSession } from "./ResizeTypes";

export type PanelResizeProviderProps = {
  children?: ReactNode;
};

/**
 * UX-2.9 — Drag-session orchestrator only (not a size store).
 * Snapshots startSize once in beginResize; updateResize uses startSize + delta.
 * Writes sizes via PanelProvider setters → UX-2.8 persistence.
 */
export function PanelResizeProvider({ children }: PanelResizeProviderProps) {
  const { state, setLeftWidth, setRightWidth, setBottomHeight } =
    usePanelState();
  const [session, setSession] = useState<ResizeSession | null>(null);
  const sessionRef = useRef<ResizeSession | null>(null);

  const beginResize = (
    pointerId: number,
    axis: ResizeAxis,
    client: number
  ): void => {
    const startSize =
      axis === "left"
        ? state.leftWidth
        : axis === "right"
          ? state.rightWidth
          : state.bottomHeight;
    const next: ResizeSession = {
      axis,
      pointerId,
      startClient: client,
      startSize,
    };
    sessionRef.current = next;
    setSession(next);
  };

  const updateResize = (client: number): void => {
    const active = sessionRef.current;
    if (active == null) return;

    const nextSize = computeNextSize(
      active.startSize,
      active.startClient,
      client,
      active.axis,
      RESIZE_CONSTRAINTS
    );

    if (active.axis === "left") {
      setLeftWidth(nextSize);
    } else if (active.axis === "right") {
      setRightWidth(nextSize);
    } else {
      setBottomHeight(nextSize);
    }
  };

  const endResize = (): void => {
    sessionRef.current = null;
    setSession(null);
  };

  const value: PanelResizeContextValue = {
    session,
    beginResize,
    updateResize,
    endResize,
  };

  return (
    <PanelResizeContext.Provider value={value}>
      {children}
    </PanelResizeContext.Provider>
  );
}
