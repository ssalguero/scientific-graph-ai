"use client";

/**
 * D55.2 — Multi-Window Foundation · Window Context (shell).
 * Exposes WindowState + WindowAPI. No presentation. No wiring.
 * Default values are safe no-ops (DockInteractionContext pattern).
 * Authority: docs/D55.1-multi-window-discovery.md
 */

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  createEmptyWindowState,
  type WindowAPI,
  type WindowState,
} from "./WindowTypes";

/** Context value — state + frozen WindowAPI. Not barrel-exported. */
export type WindowContextValue = {
  state: WindowState;
  api: WindowAPI;
};

const NOOP_WINDOW_API: WindowAPI = {
  create(definition) {
    return { id: definition.id };
  },
  register() {
    /* no-op outside provider */
  },
  unregister() {
    /* no-op outside provider */
  },
  activate() {
    /* no-op outside provider */
  },
  focus() {
    /* no-op outside provider */
  },
  minimize() {
    /* no-op outside provider */
  },
  restore() {
    /* no-op outside provider */
  },
  close() {
    /* no-op outside provider */
  },
  get() {
    return undefined;
  },
  getAll() {
    return [];
  },
};

export const DEFAULT_WINDOW_CONTEXT: WindowContextValue = {
  state: createEmptyWindowState(),
  api: NOOP_WINDOW_API,
};

export const WindowContext =
  createContext<WindowContextValue>(DEFAULT_WINDOW_CONTEXT);

export type WindowProviderProps = {
  children?: ReactNode;
  /** Optional override; defaults to safe no-op context. */
  value?: WindowContextValue;
};

/**
 * Context shell Provider. Does not own lifecycle state.
 * WindowManager supplies a live `value`; unwired usage stays no-op.
 */
export function WindowProvider({ children, value }: WindowProviderProps) {
  return (
    <WindowContext.Provider value={value ?? DEFAULT_WINDOW_CONTEXT}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindowContext(): WindowContextValue {
  return useContext(WindowContext);
}
