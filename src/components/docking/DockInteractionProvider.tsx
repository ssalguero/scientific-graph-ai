"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_DOCK_INTERACTION_STATE,
  DockInteractionContext,
  parseBeginDragInput,
  parseBeginResizeInput,
  parseUpdatePointInput,
  type DockDragSession,
  type DockInteractionApi,
  type DockInteractionContextValue,
  type DockInteractionProviderProps,
  type DockInteractionState,
  type DockResizeSession,
} from "./DockInteractionContext";

/**
 * D53.2–D53.4 — Interaction state provider.
 * Owns DockInteractionState only. Does not import DockProvider (one-way nesting).
 * Focus & Activation (D53.3): single activeDock; activate implies focus.
 * Drag & Resize sessions (D53.4): ephemeral only — no DockState / layout / sizes mutation.
 * Zero UX: no global listeners, no visual drag/resize behavior.
 */

export function DockInteractionProvider({
  children,
}: DockInteractionProviderProps) {
  const [state, setState] = useState<DockInteractionState>(
    DEFAULT_DOCK_INTERACTION_STATE
  );

  const api = useMemo<DockInteractionApi>(
    () => ({
      /** Sets focusedDock only. Does not change activeDock or hoverDock. */
      focus(id: string) {
        setState((prev) => ({ ...prev, focusedDock: id }));
      },
      /** Clears focusedDock only. Does not change activeDock. */
      blur() {
        setState((prev) => ({ ...prev, focusedDock: null }));
      },
      /**
       * Unique activeDock invariant: replaces any previous active.
       * Activation implies focus (activeDock + focusedDock = id).
       */
      activate(id: string) {
        setState((prev) => ({
          ...prev,
          activeDock: id,
          focusedDock: id,
        }));
      },
      /** Clears activeDock only. Does not change focusedDock. */
      deactivate() {
        setState((prev) => ({ ...prev, activeDock: null }));
      },

      beginDrag(...args: unknown[]) {
        const input = parseBeginDragInput(args);
        if (!input) return;
        const session: DockDragSession = {
          dockId: input.dockId,
          pointerId: input.pointerId,
          start: { x: input.x, y: input.y },
          current: { x: input.x, y: input.y },
        };
        setState((prev) => ({
          ...prev,
          draggingDock: input.dockId,
          dragSession: session,
        }));
      },

      updateDrag(...args: unknown[]) {
        const point = parseUpdatePointInput(args);
        if (!point) return;
        setState((prev) => {
          if (!prev.dragSession) return prev;
          return {
            ...prev,
            dragSession: {
              ...prev.dragSession,
              current: { x: point.x, y: point.y },
            },
          };
        });
      },

      endDrag() {
        setState((prev) => ({
          ...prev,
          draggingDock: null,
          dragSession: null,
        }));
      },

      beginResize(...args: unknown[]) {
        const input = parseBeginResizeInput(args);
        if (!input) return;
        const session: DockResizeSession = {
          dockId: input.dockId,
          pointerId: input.pointerId,
          edge: input.edge,
          start: { x: input.x, y: input.y },
          current: { x: input.x, y: input.y },
        };
        setState((prev) => ({
          ...prev,
          resizingDock: input.dockId,
          resizeSession: session,
        }));
      },

      updateResize(...args: unknown[]) {
        const point = parseUpdatePointInput(args);
        if (!point) return;
        setState((prev) => {
          if (!prev.resizeSession) return prev;
          return {
            ...prev,
            resizeSession: {
              ...prev.resizeSession,
              current: { x: point.x, y: point.y },
            },
          };
        });
      },

      endResize() {
        setState((prev) => ({
          ...prev,
          resizingDock: null,
          resizeSession: null,
        }));
      },
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
