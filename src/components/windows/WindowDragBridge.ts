/**
 * D57.2 — Window Drag System · WindowDragBridge.
 * Internal contract: session ops → WindowPositionStore mutations.
 * Sole authorized path to mutate coordinates (bridge-required).
 * No React. No Pointer Events. No UI. Not part of WindowAPI / public barrel.
 * Authority: D57.0 Discovery · D57.1 Position Store · D55/D56 API Freeze intact.
 */

import {
  ensureDefaultPosition,
  type WindowPosition,
  type WindowPositionStore,
} from "./WindowPositionStore";

/** Pointer sample in absolute layer coordinates (D57 Coordinate Space Freeze). */
export type WindowDragPointer = {
  x: number;
  y: number;
};

/**
 * Active session payload.
 * origin — window position + pointer sample at beginDrag
 * pointer — latest pointer sample
 */
export type WindowDragSession = {
  id: string;
  origin: {
    position: WindowPosition;
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

function clonePosition(position: WindowPosition): WindowPosition {
  return { x: position.x, y: position.y };
}

function cloneState(state: WindowDragState): WindowDragState {
  if (state.status === "idle") {
    return { status: "idle" };
  }
  return {
    status: "dragging",
    id: state.id,
    origin: {
      position: clonePosition(state.origin.position),
      pointer: clonePointer(state.origin.pointer),
    },
    pointer: clonePointer(state.pointer),
  };
}

/**
 * Creates a WindowDragBridge bound to a Position Store.
 * Validates active session; translates ops into store.set for x/y only.
 */
export function createWindowDragBridge(
  positionStore: WindowPositionStore
): WindowDragAPI & { getState(): WindowDragState } {
  let state: WindowDragState = { status: "idle" };

  return {
    /**
     * beginDrag — opens a session for id at pointer (x, y).
     * Replaces any prior session. Seeds default position if missing.
     */
    beginDrag(id: string, x: number, y: number): void {
      ensureDefaultPosition(positionStore, id);
      const position = positionStore.get(id);
      if (position === undefined) {
        return;
      }
      const pointer = { x, y };
      state = {
        status: "dragging",
        id,
        origin: {
          position: clonePosition(position),
          pointer: clonePointer(pointer),
        },
        pointer: clonePointer(pointer),
      };
    },

    /**
     * updateDrag — moves the active window by delta from origin pointer.
     * No-op when idle. Writes only via Position Store.
     */
    updateDrag(x: number, y: number): void {
      if (state.status !== "dragging") {
        return;
      }
      const dx = x - state.origin.pointer.x;
      const dy = y - state.origin.pointer.y;
      positionStore.set(state.id, {
        x: state.origin.position.x + dx,
        y: state.origin.position.y + dy,
      });
      state = {
        ...state,
        pointer: { x, y },
      };
    },

    /**
     * endDrag — closes the active session. No-op when idle.
     * Final coordinates already live in the Position Store.
     */
    endDrag(): void {
      if (state.status !== "dragging") {
        return;
      }
      state = { status: "idle" };
    },

    /** Read-only session snapshot for host cleanup (not a mutation API). */
    getState(): WindowDragState {
      return cloneState(state);
    },
  };
}
