"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_DOCK_INTERACTION_STATE,
  DockInteractionContext,
  type DockInteractionApi,
  type DockInteractionContextValue,
  type DockInteractionProviderProps,
  type DockInteractionState,
} from "./DockInteractionContext";

/**
 * D53.2 — Interaction state provider.
 * Owns DockInteractionState only. Does not import DockProvider (one-way nesting).
 * Zero UX: no listeners, DOM, effects, pointer, keyboard, drag, or resize behavior.
 */

const noop = (..._args: unknown[]): void => {
  /* D53.2 stub — drag/resize session infra in D53.4 */
};

export function DockInteractionProvider({
  children,
}: DockInteractionProviderProps) {
  const [state, setState] = useState<DockInteractionState>(
    DEFAULT_DOCK_INTERACTION_STATE
  );

  const api = useMemo<DockInteractionApi>(
    () => ({
      focus(id: string) {
        setState((prev) => ({ ...prev, focusedDock: id }));
      },
      blur() {
        setState((prev) => ({ ...prev, focusedDock: null }));
      },
      activate(id: string) {
        setState((prev) => ({
          ...prev,
          activeDock: id,
          focusedDock: id,
        }));
      },
      deactivate() {
        setState((prev) => ({ ...prev, activeDock: null }));
      },
      beginDrag: noop,
      updateDrag: noop,
      endDrag: noop,
      beginResize: noop,
      updateResize: noop,
      endResize: noop,
    }),
    []
  );

  const value = useMemo<DockInteractionContextValue>(
    () => ({
      ...state,
      ...api,
    }),
    [state, api]
  );

  return (
    <DockInteractionContext.Provider value={value}>
      {children}
    </DockInteractionContext.Provider>
  );
}
