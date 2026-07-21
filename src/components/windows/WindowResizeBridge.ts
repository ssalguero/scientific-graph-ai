/**
 * D58.1 — Window Resize System · WindowResizeBridge.
 * Internal contract: resize session ops → GeometryState (D58.2 will apply edge math).
 * Sole authorized path for size mutations (resize-bridge-required).
 * No Pointer Events. No edge math. No constraints. No UI.
 * Not part of WindowAPI / public barrel.
 * Authority: D58.0 Discovery · D58.1 Resize Architecture.
 */

import {
  cloneGeometry,
  ensureDefaultGeometry,
  type WindowGeometry,
  type WindowGeometryState,
} from "./WindowGeometryState";

/** Eight-edge resize identity (handles arrive in D58.2). */
export type WindowResizeEdge =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

/**
 * Frozen Resize Origin — beginResize snapshot for D58.2 math.
 * geometry is an immutable clone at session start.
 */
export type WindowResizeOrigin = {
  pointerX: number;
  pointerY: number;
  geometry: WindowGeometry;
};

export type WindowResizePointer = {
  x: number;
  y: number;
};

export type WindowResizeSession = {
  id: string;
  edge: WindowResizeEdge;
  origin: WindowResizeOrigin;
  pointer: WindowResizePointer;
};

/** Minimal session state — idle | resizing. */
export type WindowResizeState =
  | { status: "idle" }
  | ({ status: "resizing" } & WindowResizeSession);

/**
 * Frozen triad — beginResize / updateResize / endResize.
 * D58.1: session tracking only; no geometry mutation from edge math yet.
 */
export type WindowResizeAPI = {
  beginResize(
    id: string,
    edge: WindowResizeEdge,
    pointerX: number,
    pointerY: number
  ): void;
  updateResize(pointerX: number, pointerY: number): void;
  endResize(): void;
};

function clonePointer(pointer: WindowResizePointer): WindowResizePointer {
  return { x: pointer.x, y: pointer.y };
}

function cloneOrigin(origin: WindowResizeOrigin): WindowResizeOrigin {
  return {
    pointerX: origin.pointerX,
    pointerY: origin.pointerY,
    geometry: cloneGeometry(origin.geometry),
  };
}

function cloneResizeState(state: WindowResizeState): WindowResizeState {
  if (state.status === "idle") {
    return { status: "idle" };
  }
  return {
    status: "resizing",
    id: state.id,
    edge: state.edge,
    origin: cloneOrigin(state.origin),
    pointer: clonePointer(state.pointer),
  };
}

/**
 * Creates a WindowResizeBridge bound to GeometryState.
 * D58.1 stubs: opens/tracks/closes session; does not apply resize deltas.
 */
export function createWindowResizeBridge(
  geometryState: WindowGeometryState
): WindowResizeAPI & { getState(): WindowResizeState } {
  let state: WindowResizeState = { status: "idle" };

  return {
    /**
     * beginResize — opens a session with frozen WindowResizeOrigin.
     * Replaces any prior resize session. Seeds default geometry if missing.
     */
    beginResize(
      id: string,
      edge: WindowResizeEdge,
      pointerX: number,
      pointerY: number
    ): void {
      ensureDefaultGeometry(geometryState, id);
      const geometry = geometryState.get(id);
      if (geometry === undefined) {
        return;
      }
      state = {
        status: "resizing",
        id,
        edge,
        origin: {
          pointerX,
          pointerY,
          geometry: cloneGeometry(geometry),
        },
        pointer: { x: pointerX, y: pointerY },
      };
    },

    /**
     * updateResize — records pointer sample for active session.
     * D58.1: no edge math / no GeometryState writes (reserved for D58.2).
     */
    updateResize(pointerX: number, pointerY: number): void {
      if (state.status !== "resizing") {
        return;
      }
      state = {
        ...state,
        pointer: { x: pointerX, y: pointerY },
      };
    },

    /**
     * endResize — closes the active session. No-op when idle.
     */
    endResize(): void {
      if (state.status !== "resizing") {
        return;
      }
      state = { status: "idle" };
    },

    getState(): WindowResizeState {
      return cloneResizeState(state);
    },
  };
}
