"use client";

/**
 * D57.4 — Window Drag System · Window Position context shell.
 * Exposes Position Store + revision tick for FloatingWindowBridge mapping.
 * Coordinates remain owned only by WindowPositionStore (no duplicated position state).
 * Not barrel-exported. Separate from WindowContext / WindowDragContext.
 * Authority: D57.0 Discovery · D57.1 Position Store · D55/D56 public API Freeze intact.
 */

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { WindowPositionStore } from "./WindowPositionStore";

export type WindowPositionContextValue = {
  store: WindowPositionStore;
  /** Monotonic tick — not position data. Triggers Bridge re-render on store mutation. */
  revision: number;
};

const NOOP_STORE: WindowPositionStore = {
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

export const DEFAULT_WINDOW_POSITION_CONTEXT: WindowPositionContextValue =
  Object.freeze({
    store: NOOP_STORE,
    revision: 0,
  });

export const WindowPositionContext =
  createContext<WindowPositionContextValue>(DEFAULT_WINDOW_POSITION_CONTEXT);

export type WindowPositionProviderProps = {
  children?: ReactNode;
  value?: WindowPositionContextValue;
};

export function WindowPositionProvider({
  children,
  value,
}: WindowPositionProviderProps) {
  return (
    <WindowPositionContext.Provider
      value={value ?? DEFAULT_WINDOW_POSITION_CONTEXT}
    >
      {children}
    </WindowPositionContext.Provider>
  );
}

/** Bridge-only reader for Position Store mapping (D57.4). */
export function useWindowPosition(): WindowPositionContextValue {
  return useContext(WindowPositionContext);
}
