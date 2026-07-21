/**
 * D59.1 — Snap Foundation · WindowSnapEngine (pure).
 * Sole surface: applyMagneticSnap(geometry, targets, config) → geometry.
 * Edges-only. Deterministic. Immutable I/O.
 *
 * Engine NEVER knows: Drag, Resize, Pointer, React, Stores, Providers,
 * WindowManager, DOM, sessions.
 *
 * Authority: D59.0 Snap Discovery · D59.1 Snap Engine Foundation.
 * Not part of WindowAPI / public barrel.
 */

import {
  cloneGeometry,
  type WindowGeometry,
} from "./WindowGeometryState";
import {
  SNAP_EDGE_ORDER,
  type SnapConfig,
  type SnapEdge,
  type SnapTarget,
  type WindowEdges,
} from "./WindowSnapTypes";

/** Pure projection — storage remains { x, y, width, height }. */
export function toEdges(geometry: WindowGeometry): WindowEdges {
  return {
    left: geometry.x,
    right: geometry.x + geometry.width,
    top: geometry.y,
    bottom: geometry.y + geometry.height,
  };
}

function edgeValue(edges: WindowEdges, edge: SnapEdge): number {
  return edges[edge];
}

/**
 * Move the named edge to `position`, preserving width/height.
 * Returns a new geometry object.
 */
function applyEdgeSnap(
  geometry: WindowGeometry,
  edge: SnapEdge,
  position: number
): WindowGeometry {
  const { width, height } = geometry;
  switch (edge) {
    case "left":
      return { x: position, y: geometry.y, width, height };
    case "right":
      return { x: position - width, y: geometry.y, width, height };
    case "top":
      return { x: geometry.x, y: position, width, height };
    case "bottom":
      return { x: geometry.x, y: position - height, width, height };
  }
}

type RankedTarget = {
  target: SnapTarget;
  distance: number;
};

/**
 * Tie-break (FROZEN D59.0 §10):
 * nearest → priority (lower wins) → stable lexicographic
 *   kind → sourceId → edge → position
 */
function compareRanked(a: RankedTarget, b: RankedTarget): number {
  if (a.distance !== b.distance) {
    return a.distance - b.distance;
  }
  if (a.target.priority !== b.target.priority) {
    return a.target.priority - b.target.priority;
  }
  const kindCmp = a.target.kind.localeCompare(b.target.kind);
  if (kindCmp !== 0) {
    return kindCmp;
  }
  const idA = a.target.sourceId ?? "";
  const idB = b.target.sourceId ?? "";
  const idCmp = idA.localeCompare(idB);
  if (idCmp !== 0) {
    return idCmp;
  }
  const edgeCmp =
    SNAP_EDGE_ORDER[a.target.edge] - SNAP_EDGE_ORDER[b.target.edge];
  if (edgeCmp !== 0) {
    return edgeCmp;
  }
  if (a.target.position !== b.target.position) {
    return a.target.position - b.target.position;
  }
  return 0;
}

/**
 * Pick the single best target for one axis within threshold.
 * Returns undefined when no candidate is within range.
 */
function pickBestForAxis(
  edges: WindowEdges,
  targets: readonly SnapTarget[],
  axis: "x" | "y",
  threshold: number
): SnapTarget | undefined {
  let best: RankedTarget | undefined;

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    if (target.axis !== axis) {
      continue;
    }
    const distance = Math.abs(edgeValue(edges, target.edge) - target.position);
    if (distance > threshold) {
      continue;
    }
    const ranked: RankedTarget = { target, distance };
    if (best === undefined || compareRanked(ranked, best) < 0) {
      best = ranked;
    }
  }

  return best?.target;
}

/**
 * Pure magnetic snap.
 * - Never mutates geometry, targets, or config.
 * - Always returns a new WindowGeometry object.
 * - Axes resolved independently (x then y) from the input edges snapshot.
 * - Deterministic: same inputs → same output.
 */
export function applyMagneticSnap(
  geometry: WindowGeometry,
  targets: readonly SnapTarget[],
  config: SnapConfig
): WindowGeometry {
  if (!config.enabled) {
    return cloneGeometry(geometry);
  }

  const edges = toEdges(geometry);
  const xWinner = pickBestForAxis(
    edges,
    targets,
    "x",
    config.axisThresholdX
  );
  const yWinner = pickBestForAxis(
    edges,
    targets,
    "y",
    config.axisThresholdY
  );

  let result = cloneGeometry(geometry);

  if (xWinner !== undefined) {
    result = applyEdgeSnap(result, xWinner.edge, xWinner.position);
  }
  if (yWinner !== undefined) {
    result = applyEdgeSnap(result, yWinner.edge, yWinner.position);
  }

  return result;
}
