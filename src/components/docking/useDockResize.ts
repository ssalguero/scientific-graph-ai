"use client";

import { useDockInteraction } from "./useDockInteraction";
import type {
  BeginResizeInput,
  DockResizeSession,
  ResizeEdge,
  UpdateResizeInput,
} from "./DockInteractionContext";
import type { DockPointerLike } from "./useDockDrag";

export type UseDockResizeResult = {
  resizingDock: string | null;
  resizeSession: DockResizeSession | null;
  beginResize: (input: BeginResizeInput) => void;
  updateResize: (input: UpdateResizeInput) => void;
  endResize: () => void;
  /** pointerdown → beginResize (no listener registration). */
  onPointerDown: (
    dockId: string,
    edge: ResizeEdge,
    pointer: DockPointerLike
  ) => void;
  /** pointermove → updateResize (no listener registration). */
  onPointerMove: (pointer: Pick<DockPointerLike, "clientX" | "clientY">) => void;
  /** pointerup → endResize (no listener registration). */
  onPointerUp: () => void;
};

/**
 * D53.4 — Resize session infrastructure.
 * Uses DockInteractionProvider state only. No own state. No layout / sizes mutation.
 * Pointer helpers prepare the lifecycle; callers wire events — no global listeners.
 */
export function useDockResize(): UseDockResizeResult {
  const {
    resizingDock,
    resizeSession,
    beginResize,
    updateResize,
    endResize,
  } = useDockInteraction();

  return {
    resizingDock,
    resizeSession,
    beginResize: (input) => beginResize(input),
    updateResize: (input) => updateResize(input),
    endResize: () => endResize(),
    onPointerDown: (dockId, edge, pointer) => {
      beginResize({
        dockId,
        pointerId: pointer.pointerId,
        edge,
        x: pointer.clientX,
        y: pointer.clientY,
      });
    },
    onPointerMove: (pointer) => {
      updateResize({ x: pointer.clientX, y: pointer.clientY });
    },
    onPointerUp: () => {
      endResize();
    },
  };
}
