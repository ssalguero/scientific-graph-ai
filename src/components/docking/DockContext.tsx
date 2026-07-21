"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createDockRegistrationApi } from "./dockRegistration";
import { DOCK_FEATURES } from "./dockFeatures";
import { DEFAULT_DOCK_LAYOUT } from "./dockLayout";
import { createDockRegistry } from "./DockRegistry";
import { DOCK_TOKENS } from "./DockTokens";
import { createDockVisibilityApi } from "./dockVisibility";
import type { DockContextValue, DockState } from "./types";

/**
 * D52.2 — Dock context with additive model APIs.
 * Layout is a stable reference to DEFAULT_DOCK_LAYOUT (Provider does not own a clone).
 * Zero UX: flags default false; hosts remain transparent; page wiring unchanged.
 */

const DEFAULT_DOCK_STATE: DockState = {
  activePanelIds: [],
  sizes: {
    right: { width: DOCK_TOKENS.rightWidth },
  },
};

const defaultStore = createDockRegistry();

const DEFAULT_DOCK_CONTEXT: DockContextValue = {
  state: DEFAULT_DOCK_STATE,
  registry: defaultStore.query,
  registration: createDockRegistrationApi(
    defaultStore.mutator,
    (id) => defaultStore.query.has(id)
  ),
  visibility: createDockVisibilityApi(
    () => DEFAULT_DOCK_STATE,
    () => {
      /* no-op outside provider */
    }
  ),
  layout: DEFAULT_DOCK_LAYOUT,
  features: DOCK_FEATURES,
};

const DockReactContext = createContext<DockContextValue>(DEFAULT_DOCK_CONTEXT);

export type DockProviderProps = {
  children?: ReactNode;
};

export function DockProvider({ children }: DockProviderProps) {
  const storeRef = useRef(createDockRegistry());
  const store = storeRef.current;

  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);

  const [state, setState] = useState<DockState>(DEFAULT_DOCK_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  const registration = useMemo(
    () =>
      createDockRegistrationApi(store.mutator, (id) => store.query.has(id)),
    [store]
  );

  const visibility = useMemo(
    () =>
      createDockVisibilityApi(
        () => stateRef.current,
        (activePanelIds) => {
          setState((prev) => ({ ...prev, activePanelIds }));
        }
      ),
    []
  );

  const value = useMemo<DockContextValue>(
    () => ({
      state,
      registry: store.query,
      registration,
      visibility,
      layout: DEFAULT_DOCK_LAYOUT,
      features: DOCK_FEATURES,
    }),
    [state, store, registration, visibility]
  );

  return (
    <DockReactContext.Provider value={value}>{children}</DockReactContext.Provider>
  );
}

export function useDockContext(): DockContextValue {
  return useContext(DockReactContext);
}
