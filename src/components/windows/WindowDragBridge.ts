/**
 * D57.2 — Window Drag System · WindowDragBridge.
 * D58.1 — Writes x/y via WindowGeometryState (preserves width/height; immutable set).
 * Sole authorized path for pure position moves (drag-bridge-required).
 * No React. No Pointer Events. No UI. Not part of WindowAPI / public barrel.
 * Authority: D57.0 Discovery · D58.1 GeometryState · D55/D56 API Freeze intact.
 */

import {
  cloneGeometry,
  ensureDefaultGeometry,
  type WindowGeometry,
  type WindowGeometryState,
} from "./WindowGeometryState";

/** Pointer sample in absolute layer coordinates (Coordinate Space Freeze). */
export type WindowDragPointer = {
  x: number;
  y: number;
};

/**
 * Active session payload.
 * origin.geometry — immutable clone at beginDrag
 * pointer — latest pointer sample
 */
export type WindowDragSession = {
  id: string;
  origin: {
    geometry: WindowGeometry;
    pointer: WindowDragPointer;
  };
  pointer: WindowDragPointer;
};

/** Minimal internal session state — idle | dragging. */
export type WindowDragState =
  | { status: "idle" }
  | ({ status: "dragging" } & WindowDragSession);

/**
 * Frozen internal triad — beginDrag / updateDrag / endDrag only.
 * No cancelDrag, moveWindow, setPosition, animate, or inertia.
 */
export type WindowDragAPI = {
  beginDrag(id: string, x: number, y: number): void;
  updateDrag(x: number, y: number): void;
  endDrag(): void;
};

function clonePointer(pointer: WindowDragPointer): WindowDragPointer {
  return { x: pointer.x, y: pointer.y };
}

function cloneState(state: WindowDragState): WindowDragState {
  if (state.status === "idle") {
    return { status: "idle" };
  }
  return {
    status: "dragging",
    id: state.id,
    origin: {
      geometry: cloneGeometry(state.origin.geometry),
      pointer: clonePointer(state.origin.pointer),
    },
    pointer: clonePointer(state.pointer),
  };
}

/**
 * Creates a WindowDragBridge bound to GeometryState.
 * Mutates only x/y; width/height copied from origin (immutable new geometry).
 */
export function createWindowDragBridge(
  geometryState: WindowGeometryState
): WindowDragAPI & { getState(): WindowDragState } {
  let state: WindowDragState = { status: "idle" };

  return {
    beginDrag(id: string, x: number, y: number): void {
      ensureDefaultGeometry(geometryState, id);
      const geometry = geometryState.get(id);
      if (geometry === undefined) {
        return;
      }
      const pointer = { x, y };
      state = {
        status: "dragging",
        id,
        origin: {
          geometry: cloneGeometry(geometry),
          pointer: clonePointer(pointer),
        },
        pointer: clonePointer(pointer),
      };
    },

    updateDrag(x: number, y: number): void {
      if (state.status !== "dragging") {
        return;
      }
      const dx = x - state.origin.pointer.x;
      const dy = y - state.origin.pointer.y;
      geometryState.set(state.id, {
        x: state.origin.geometry.x + dx,
        y: state.origin.geometry.y + dy,
        width: state.origin.geometry.width,
        height: state.origin.geometry.height,
      });
      state = {
        ...state,
        pointer: { x, y },
      };
    },

    endDrag(): void {
      if (state.status !== "dragging") {
        return;
      }
      state = { status: "idle" };
    },

    getState(): WindowDragState {
      return cloneState(state);
    },
  };
}
