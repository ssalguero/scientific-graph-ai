/**
 * D58.1 — Window Resize System · WindowResizeBridge.
 * D58.2 — Edge math for eight directions → GeometryState.
 * D58.3 — Constraint pipeline: Math → GeometryConstraints → WorkspaceConstraints → State.
 * D59.3 — Resize Snap Wiring: after constraints → providers.collect → applyMagneticSnap → set.
 * Sole authorized path for size mutations (resize-bridge-required).
 * Engine remains decoupled — Bridge composes; Engine never knows Resize.
 * No Pointer Events. No dock / viewport transforms. Not part of WindowAPI / public barrel.
 * Authority: D58.0 · D58.3 · D59.0 Discovery · D59.3 Resize Snap Wiring.
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
import { applyMagneticSnap } from "./WindowSnapEngine";
import type {
  SnapConfig,
  SnapTarget,
  SnapTargetProvider,
} from "./WindowSnapTypes";

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

/**
 * Optional snap composition for D59.3+.
 * Absent → resize write path identical to D58 (constraints only).
 */
export type WindowResizeBridgeSnapOptions = {
  config: SnapConfig;
  providers: readonly SnapTargetProvider[];
  workspace: WorkspaceConstraints;
  /** Geometries eligible as snap sources (composer excludes minimized). */
  getGeometries: () => ReadonlyMap<string, WindowGeometry>;
};

export type WindowResizeBridgeOptions = {
  geometryConstraints?: GeometryConstraints;
  workspaceConstraints?: WorkspaceConstraints;
  snap?: WindowResizeBridgeSnapOptions;
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

function collectSnapTargets(
  providers: readonly SnapTargetProvider[],
  candidateId: string,
  candidate: WindowGeometry,
  snap: WindowResizeBridgeSnapOptions
): SnapTarget[] {
  const ctx = {
    candidateId,
    candidate,
    workspace: snap.workspace,
    geometries: snap.getGeometries(),
    config: snap.config,
  };
  const targets: SnapTarget[] = [];
  for (let i = 0; i < providers.length; i++) {
    const part = providers[i].collect(ctx);
    for (let j = 0; j < part.length; j++) {
      targets.push(part[j]);
    }
  }
  return targets;
}

function satisfiesGeometryConstraints(
  geometry: WindowGeometry,
  constraints: GeometryConstraints
): boolean {
  if (geometry.width < constraints.minWidth) {
    return false;
  }
  if (geometry.height < constraints.minHeight) {
    return false;
  }
  if (
    constraints.maxWidth !== undefined &&
    geometry.width > constraints.maxWidth
  ) {
    return false;
  }
  if (
    constraints.maxHeight !== undefined &&
    geometry.height > constraints.maxHeight
  ) {
    return false;
  }
  return true;
}

function isInsideWorkspace(
  geometry: WindowGeometry,
  workspace: WorkspaceConstraints
): boolean {
  return (
    geometry.x >= workspace.left &&
    geometry.y >= workspace.top &&
    geometry.x + geometry.width <= workspace.right &&
    geometry.y + geometry.height <= workspace.bottom
  );
}

/**
 * Accept snapped axes independently; discard any axis that violates
 * already-applied GeometryConstraints or workspace containment.
 */
function acceptSnapAxes(
  constrained: WindowGeometry,
  snapped: WindowGeometry,
  geometryConstraints: GeometryConstraints,
  workspace: WorkspaceConstraints
): WindowGeometry {
  let result = cloneGeometry(constrained);

  const xCandidate: WindowGeometry = {
    x: snapped.x,
    y: constrained.y,
    width: snapped.width,
    height: constrained.height,
  };
  if (
    satisfiesGeometryConstraints(xCandidate, geometryConstraints) &&
    isInsideWorkspace(xCandidate, workspace)
  ) {
    result = {
      x: snapped.x,
      y: result.y,
      width: snapped.width,
      height: result.height,
    };
  }

  const yCandidate: WindowGeometry = {
    x: result.x,
    y: snapped.y,
    width: result.width,
    height: snapped.height,
  };
  if (
    satisfiesGeometryConstraints(yCandidate, geometryConstraints) &&
    isInsideWorkspace(yCandidate, workspace)
  ) {
    result = {
      x: result.x,
      y: snapped.y,
      width: result.width,
      height: snapped.height,
    };
  }

  return result;
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
 * Creates a WindowResizeBridge bound to GeometryState + constraints (+ optional snap).
 */
export function createWindowResizeBridge(
  geometryState: WindowGeometryState,
  options: WindowResizeBridgeOptions = {}
): WindowResizeAPI & { getState(): WindowResizeState } {
  const geometryConstraints =
    options.geometryConstraints ?? DEFAULT_GEOMETRY_CONSTRAINTS;
  const workspaceConstraints =
    options.workspaceConstraints ?? DEFAULT_WORKSPACE_CONSTRAINTS;
  const snap = options.snap;

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

      let nextGeometry = constrained;
      if (snap !== undefined && snap.config.enabled) {
        const targets = collectSnapTargets(
          snap.providers,
          state.id,
          constrained,
          snap
        );
        const snapped = applyMagneticSnap(constrained, targets, snap.config);
        nextGeometry = acceptSnapAxes(
          constrained,
          snapped,
          geometryConstraints,
          workspaceConstraints
        );
      }

      geometryState.set(state.id, nextGeometry);
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
