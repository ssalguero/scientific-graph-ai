"use client";

/**
 * D58.1 — Window Resize System · Window Geometry context shell.
 * Exposes GeometryState + revision tick for FloatingWindowBridge mapping.
 * Supersedes D57 WindowPositionContext. Storage remains internal to GeometryState.
 * Not barrel-exported. Separate from WindowContext / WindowDragContext.
 * Authority: D58.0 Discovery · D58.1 Resize Architecture · D55/D56 Freeze intact.
 */

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { WindowGeometryState } from "./WindowGeometryState";

export type WindowGeometryContextValue = {
  geometryState: WindowGeometryState;
  /** Monotonic tick — not geometry data. Triggers Bridge re-render on mutation. */
  revision: number;
};

const NOOP_GEOMETRY_STATE: WindowGeometryState = {
  set() {
    /* no-op */
  },
  get() {
    return undefined;
  },
  has() {
    return false;
  },
  delete() {
    /* no-op */
  },
  clear() {
    /* no-op */
  },
  getAll() {
    return new Map();
  },
  subscribe() {
    return () => {
      /* no-op */
    };
  },
};

export const DEFAULT_WINDOW_GEOMETRY_CONTEXT: WindowGeometryContextValue =
  Object.freeze({
    geometryState: NOOP_GEOMETRY_STATE,
    revision: 0,
  });

export const WindowGeometryContext =
  createContext<WindowGeometryContextValue>(DEFAULT_WINDOW_GEOMETRY_CONTEXT);

export type WindowGeometryProviderProps = {
  children?: ReactNode;
  value?: WindowGeometryContextValue;
};

export function WindowGeometryProvider({
  children,
  value,
}: WindowGeometryProviderProps) {
  return (
    <WindowGeometryContext.Provider
      value={value ?? DEFAULT_WINDOW_GEOMETRY_CONTEXT}
    >
      {children}
    </WindowGeometryContext.Provider>
  );
}

/** Bridge-only reader for GeometryState mapping (D58.1). */
export function useWindowGeometry(): WindowGeometryContextValue {
  return useContext(WindowGeometryContext);
}
