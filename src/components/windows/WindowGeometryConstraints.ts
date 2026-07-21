/**
 * D58.3 — Window Resize System · Geometry + Workspace Constraints.
 * Frozen contracts from D58.0 Discovery. Pure functions — immutable outputs.
 * Pipeline order: Resize Math → GeometryConstraints → WorkspaceConstraints → GeometryState.
 * No snap / dock / viewport / zoom / scroll. Not barrel-exported.
 * Authority: D58.0 Discovery · D58.3 Geometry Constraints.
 */

import {
  cloneGeometry,
  type WindowGeometry,
} from "./WindowGeometryState";
import type { WindowResizeEdge } from "./WindowResizeBridge";

/** Frozen size limits — no extra fields. */
export type GeometryConstraints = {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
};

/** Frozen workspace bounds in absolute layer coordinates. */
export type WorkspaceConstraints = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export const DEFAULT_GEOMETRY_CONSTRAINTS: GeometryConstraints = {
  minWidth: 160,
  minHeight: 100,
};

/** Placeholder workspace until Layout Engine supplies dynamic bounds (D62). */
export const DEFAULT_WORKSPACE_CONSTRAINTS: WorkspaceConstraints = {
  left: 0,
  top: 0,
  right: 1920,
  bottom: 1080,
};

/**
 * Apply min/max size, re-anchoring opposite edges from origin for W/N growth.
 * Returns a new geometry object (geometry-immutable-input).
 */
export function applyGeometryConstraints(
  geometry: WindowGeometry,
  edge: WindowResizeEdge,
  originGeometry: WindowGeometry,
  constraints: GeometryConstraints
): WindowGeometry {
  let width = geometry.width;
  let height = geometry.height;
  let x = geometry.x;
  let y = geometry.y;

  const maxWidth = constraints.maxWidth ?? Number.POSITIVE_INFINITY;
  const maxHeight = constraints.maxHeight ?? Number.POSITIVE_INFINITY;

  width = Math.min(Math.max(width, constraints.minWidth), maxWidth);
  height = Math.min(Math.max(height, constraints.minHeight), maxHeight);

  if (edge.includes("w")) {
    const right = originGeometry.x + originGeometry.width;
    x = right - width;
  }
  if (edge.includes("n")) {
    const bottom = originGeometry.y + originGeometry.height;
    y = bottom - height;
  }

  return { x, y, width, height };
}

/**
 * Clamp geometry into workspace bounds with edge-aware anchoring.
 * Returns a new geometry object.
 */
export function applyWorkspaceConstraints(
  geometry: WindowGeometry,
  edge: WindowResizeEdge,
  originGeometry: WindowGeometry,
  workspace: WorkspaceConstraints
): WindowGeometry {
  let { x, y, width, height } = cloneGeometry(geometry);
  const { left, top, right, bottom } = workspace;

  const originRight = originGeometry.x + originGeometry.width;
  const originBottom = originGeometry.y + originGeometry.height;

  if (edge.includes("e")) {
    const maxWidth = right - x;
    if (width > maxWidth) {
      width = Math.max(0, maxWidth);
    }
  }

  if (edge.includes("w")) {
    if (x < left) {
      x = left;
      width = originRight - x;
    }
    if (x + width > right) {
      width = Math.max(0, right - x);
    }
  }

  if (edge.includes("s")) {
    const maxHeight = bottom - y;
    if (height > maxHeight) {
      height = Math.max(0, maxHeight);
    }
  }

  if (edge.includes("n")) {
    if (y < top) {
      y = top;
      height = originBottom - y;
    }
    if (y + height > bottom) {
      height = Math.max(0, bottom - y);
    }
  }

  // Pure n/s (no e/w): keep horizontal box inside workspace
  if (!edge.includes("e") && !edge.includes("w")) {
    if (x < left) {
      x = left;
    }
    if (x + width > right) {
      x = Math.max(left, right - width);
      width = Math.min(width, right - left);
    }
  }

  // Pure e/w (no n/s): keep vertical box inside workspace
  if (!edge.includes("n") && !edge.includes("s")) {
    if (y < top) {
      y = top;
    }
    if (y + height > bottom) {
      y = Math.max(top, bottom - height);
      height = Math.min(height, bottom - top);
    }
  }

  // Final containment
  if (x < left) {
    x = left;
  }
  if (y < top) {
    y = top;
  }
  if (x + width > right) {
    width = Math.max(0, right - x);
  }
  if (y + height > bottom) {
    height = Math.max(0, bottom - y);
  }

  return { x, y, width, height };
}

/**
 * Certified constraint pipeline after resize math:
 * GeometryConstraints → WorkspaceConstraints.
 */
export function applyConstraintPipeline(
  geometry: WindowGeometry,
  edge: WindowResizeEdge,
  originGeometry: WindowGeometry,
  geometryConstraints: GeometryConstraints,
  workspaceConstraints: WorkspaceConstraints
): WindowGeometry {
  const sized = applyGeometryConstraints(
    geometry,
    edge,
    originGeometry,
    geometryConstraints
  );
  return applyWorkspaceConstraints(
    sized,
    edge,
    originGeometry,
    workspaceConstraints
  );
}
