"use client";

import { useDockInteraction } from "./useDockInteraction";
import type {
  BeginDragInput,
  DockDragSession,
  UpdateDragInput,
} from "./DockInteractionContext";

/** Minimal pointer fields for session lifecycle — callers attach; no global listeners. */
export type DockPointerLike = {
  pointerId: number;
  clientX: number;
  clientY: number;
};

export type UseDockDragResult = {
  draggingDock: string | null;
  dragSession: DockDragSession | null;
  beginDrag: (input: BeginDragInput) => void;
  updateDrag: (input: UpdateDragInput) => void;
  endDrag: () => void;
  /** pointerdown → beginDrag (no listener registration). */
  onPointerDown: (dockId: string, pointer: DockPointerLike) => void;
  /** pointermove → updateDrag (no listener registration). */
  onPointerMove: (pointer: Pick<DockPointerLike, "clientX" | "clientY">) => void;
  /** pointerup → endDrag (no listener registration). */
  onPointerUp: () => void;
};

/**
 * D53.4 — Drag session infrastructure.
 * Uses DockInteractionProvider state only. No own state. No layout mutation.
 * Pointer helpers prepare the lifecycle; callers wire events — no global listeners.
 */
export function useDockDrag(): UseDockDragResult {
  const {
    draggingDock,
    dragSession,
    beginDrag,
    updateDrag,
    endDrag,
  } = useDockInteraction();

  return {
    draggingDock,
    dragSession,
    beginDrag: (input) => beginDrag(input),
    updateDrag: (input) => updateDrag(input),
    endDrag: () => endDrag(),
    onPointerDown: (dockId, pointer) => {
      beginDrag({
        dockId,
        pointerId: pointer.pointerId,
        x: pointer.clientX,
        y: pointer.clientY,
      });
    },
    onPointerMove: (pointer) => {
      updateDrag({ x: pointer.clientX, y: pointer.clientY });
    },
    onPointerUp: () => {
      endDrag();
    },
  };
}
