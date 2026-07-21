/**
 * D54.2 — Layout Engine public barrel (API Freeze D54 → D56).
 * Exports only the frozen public API surface.
 *
 * LayoutRegion / LayoutVisibility are const+type merges; a single re-export
 * exposes both the value and the type under isolatedModules.
 */
export { LayoutEngine } from "./LayoutEngine";
export { LayoutRegion } from "./LayoutRegions";
export { LayoutVisibility } from "./LayoutVisibility";

export type {
  LayoutNode,
  LayoutTree,
  LayoutConstraints,
  LayoutNodeType,
  LayoutNodeId,
  LayoutEngineProps,
} from "./types";
