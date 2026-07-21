/**
 * D58.1 — Window Resize System · WindowResizeBridge.
 * D58.2 — Edge math for eight directions → GeometryState.
 * D58.3 — Constraint pipeline: Math → GeometryConstraints → WorkspaceConstraints → State.
 * Sole authorized path for size mutations (resize-bridge-required).
 * No Pointer Events. No snap / dock / viewport transforms.
 * Not part of WindowAPI / public barrel.
 * Authority: D58.0 Discovery · D58.3 Geometry Constraints.
 */

import {
  applyConstraintPipeline,
  DEFAULT_GEOMETRY_CONSTRAINTS,
  DEFAULT_WORKSPACE_CONSTRAINTS,
  type GeometryConstraints,
  type WorkspaceConstraints,
} from "./WindowGeometryConstraints";
import {
  cloneGeometry,
  ensureDefaultGeometry,
  type WindowGeometry,
  type WindowGeometryState,
} from "./WindowGeometryState";

/** Eight-edge resize identity. */
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
 * Frozen Resize Origin — beginResize snapshot for edge math.
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

export type WindowResizeBridgeOptions = {
  geometryConstraints?: GeometryConstraints;
  workspaceConstraints?: WorkspaceConstraints;
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
 * Pure edge math from frozen origin + current pointer.
 * Returns a new WindowGeometry (geometry-immutable-input).
 */
export function computeResizedGeometry(
  edge: WindowResizeEdge,
  origin: WindowResizeOrigin,
  pointerX: number,
  pointerY: number
): WindowGeometry {
  const g = origin.geometry;
  const dx = pointerX - origin.pointerX;
  const dy = pointerY - origin.pointerY;

  let x = g.x;
  let y = g.y;
  let width = g.width;
  let height = g.height;

  if (edge.includes("e")) {
    width = g.width + dx;
  }
  if (edge.includes("w")) {
    width = g.width - dx;
    x = g.x + dx;
  }
  if (edge.includes("s")) {
    height = g.height + dy;
  }
  if (edge.includes("n")) {
    height = g.height - dy;
    y = g.y + dy;
  }

  return { x, y, width, height };
}

/**
 * Creates a WindowResizeBridge bound to GeometryState + constraints.
 */
export function createWindowResizeBridge(
  geometryState: WindowGeometryState,
  options: WindowResizeBridgeOptions = {}
): WindowResizeAPI & { getState(): WindowResizeState } {
  const geometryConstraints =
    options.geometryConstraints ?? DEFAULT_GEOMETRY_CONSTRAINTS;
  const workspaceConstraints =
    options.workspaceConstraints ?? DEFAULT_WORKSPACE_CONSTRAINTS;

  let state: WindowResizeState = { status: "idle" };

  return {
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

    updateResize(pointerX: number, pointerY: number): void {
      if (state.status !== "resizing") {
        return;
      }
      const raw = computeResizedGeometry(
        state.edge,
        state.origin,
        pointerX,
        pointerY
      );
      const constrained = applyConstraintPipeline(
        raw,
        state.edge,
        state.origin.geometry,
        geometryConstraints,
        workspaceConstraints
      );
      geometryState.set(state.id, constrained);
      state = {
        ...state,
        pointer: { x: pointerX, y: pointerY },
      };
    },

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
