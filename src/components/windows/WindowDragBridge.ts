/**
 * D57.2 — Window Drag System · WindowDragBridge.
 * D58.1 — Writes x/y via WindowGeometryState (preserves width/height; immutable set).
 * D59.2 — Drag Snap Wiring: candidate → providers.collect → applyMagneticSnap → set.
 * Sole authorized path for pure position moves (drag-bridge-required).
 * Engine remains decoupled — Bridge composes; Engine never knows Drag.
 * No React. No Pointer Events. No UI. Not part of WindowAPI / public barrel.
 * Authority: D57.0 · D58.1 · D59.0 Discovery · D59.2 Drag Snap Wiring.
 */

import type { WorkspaceConstraints } from "./WindowGeometryConstraints";
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

/**
 * Optional snap composition for D59.2+.
 * Absent → drag write path identical to D58 (no snap).
 */
export type WindowDragBridgeSnapOptions = {
  config: SnapConfig;
  providers: readonly SnapTargetProvider[];
  workspace: WorkspaceConstraints;
  /** Geometries eligible as snap sources (composer excludes minimized). */
  getGeometries: () => ReadonlyMap<string, WindowGeometry>;
};

export type WindowDragBridgeOptions = {
  snap?: WindowDragBridgeSnapOptions;
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

function collectSnapTargets(
  providers: readonly SnapTargetProvider[],
  candidateId: string,
  candidate: WindowGeometry,
  snap: WindowDragBridgeSnapOptions
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

/**
 * Creates a WindowDragBridge bound to GeometryState.
 * Mutates only x/y (via snap-adjusted candidate); width/height from origin.
 */
export function createWindowDragBridge(
  geometryState: WindowGeometryState,
  options?: WindowDragBridgeOptions
): WindowDragAPI & { getState(): WindowDragState } {
  let state: WindowDragState = { status: "idle" };
  const snap = options?.snap;

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
      const candidate: WindowGeometry = {
        x: state.origin.geometry.x + dx,
        y: state.origin.geometry.y + dy,
        width: state.origin.geometry.width,
        height: state.origin.geometry.height,
      };

      let nextGeometry = candidate;
      if (snap !== undefined && snap.config.enabled) {
        const targets = collectSnapTargets(
          snap.providers,
          state.id,
          candidate,
          snap
        );
        nextGeometry = applyMagneticSnap(candidate, targets, snap.config);
      }

      geometryState.set(state.id, nextGeometry);
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
