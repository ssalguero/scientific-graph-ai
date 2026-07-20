"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DOCK_REGISTRY } from "./DockRegistry";
import { DOCK_TOKENS } from "./DockTokens";
import type { DockContextValue, DockState } from "./types";

/**
 * D51.2 — Read-only dock context.
 * Exposes { state, registry } only. No dispatch / reducer / register / persistence.
 */

const DEFAULT_DOCK_STATE: DockState = {
  activePanelIds: [],
  sizes: {
    right: { width: DOCK_TOKENS.rightWidth },
  },
};

const DEFAULT_DOCK_CONTEXT: DockContextValue = {
  state: DEFAULT_DOCK_STATE,
  registry: DOCK_REGISTRY,
};

const DockReactContext = createContext<DockContextValue>(DEFAULT_DOCK_CONTEXT);

export type DockProviderProps = {
  children?: ReactNode;
};

export function DockProvider({ children }: DockProviderProps) {
  return (
    <DockReactContext.Provider value={DEFAULT_DOCK_CONTEXT}>
      {children}
    </DockReactContext.Provider>
  );
}

export function useDockContext(): DockContextValue {
  return useContext(DockReactContext);
}
