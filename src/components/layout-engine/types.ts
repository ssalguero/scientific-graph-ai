/**
 * D54.2 — Layout Engine public types (API Freeze D54 → D56).
 * Only frozen public types. No additional public type surface.
 */
import type { LayoutRegion } from "./LayoutRegions";
import type { LayoutVisibility } from "./LayoutVisibility";

export type { LayoutRegion } from "./LayoutRegions";
export type { LayoutVisibility } from "./LayoutVisibility";

/** Frozen public API — D54.1 Layout Engine API Freeze. */
export type LayoutNodeId = string;

/** Frozen public API — D54.1 Layout Engine API Freeze. */
export type LayoutNodeType =
  | "ROOT"
  | "SIDEBAR"
  | "WORKSPACE"
  | "TOOLBAR"
  | "DOCK"
  | "INSPECTOR"
  | "FLOATING_LAYERS"
  | "OVERLAYS";

/** Frozen public API — D54.1 Layout Engine API Freeze. */
export type LayoutConstraints = {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  collapsed: boolean;
  locked: boolean;
};

/** Frozen public API — D54.1 Layout Engine API Freeze. */
export type LayoutNode = {
  id: LayoutNodeId;
  type: LayoutNodeType;
  parent: LayoutNodeId | null;
  children: LayoutNodeId[];
  visibility: LayoutVisibility;
  size: {
    width?: number;
    height?: number;
  };
  constraints: LayoutConstraints;
  region: LayoutRegion;
};

/** Frozen public API — D54.1 Layout Engine API Freeze. */
export type LayoutTree = {
  rootId: LayoutNodeId;
  nodes: Record<LayoutNodeId, LayoutNode>;
};

/** Frozen public API — D54.1 Layout Engine API Freeze. */
export type LayoutEngineProps = {
  tree?: LayoutTree;
};
