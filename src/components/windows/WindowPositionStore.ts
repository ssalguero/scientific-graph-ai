/**
 * D57.1 — Window Position Store (historical).
 * D58.1 — SUPERSEDED by WindowGeometryState.
 * This module remains as a compatibility re-export surface for D57 naming
 * (WindowPosition projection). Do not use for new geometry authority.
 * Authority: D58.1 Resize Architecture · D57 gates supersession.
 */

export type {
  WindowPosition,
  WindowGeometry,
} from "./WindowGeometryState";

export {
  cloneGeometry,
  createWindowGeometryState,
  ensureDefaultGeometry,
} from "./WindowGeometryState";

/** @deprecated D58.1 — use createWindowGeometryState / WindowGeometryState. */
export { createWindowGeometryState as createWindowPositionStore } from "./WindowGeometryState";

/** @deprecated D58.1 — use ensureDefaultGeometry. */
export { ensureDefaultGeometry as ensureDefaultPosition } from "./WindowGeometryState";
