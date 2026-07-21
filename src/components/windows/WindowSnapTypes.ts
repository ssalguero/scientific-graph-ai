/**
 * D59.1 — Snap Foundation · internal type contracts (API Freeze).
 * Authority: D59.0 Snap Discovery.
 * Not part of WindowAPI / public barrel.
 * No React. No Drag. No Resize. No runtime wiring.
 */

import type { WorkspaceConstraints } from "./WindowGeometryConstraints";
import type { WindowGeometry } from "./WindowGeometryState";

/** Axis of a magnetic snap line. */
export type SnapAxis = "x" | "y";

/**
 * Edge of candidate geometry that aligns to a target line.
 * Snap OPERATES ONLY on these four values (edges-only freeze).
 */
export type SnapEdge = "left" | "right" | "top" | "bottom";

/**
 * Derived edge view of WindowGeometry — never stored; never center/rotation/transform/scale.
 */
export type WindowEdges = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

/**
 * Target kind — dock reserved for D61 (providers must not emit dock in D59).
 */
export type SnapTargetKind = "workspace" | "window" | "dock";

/**
 * Priority constants (lower = higher precedence).
 * Frozen: Workspace > Window > Dock (reserved).
 */
export const SNAP_PRIORITY = {
  workspace: 0,
  window: 1,
  dock: 2,
} as const;

export type SnapPriority = (typeof SNAP_PRIORITY)[keyof typeof SNAP_PRIORITY];

/**
 * Stable edge order for tie-break (left < right < top < bottom).
 * Authority: D59.0 §10.
 */
export const SNAP_EDGE_ORDER: Readonly<Record<SnapEdge, number>> = {
  left: 0,
  right: 1,
  top: 2,
  bottom: 3,
};

/**
 * Frozen SnapConfig.
 * Runtime threshold authority: axisThresholdX / axisThresholdY.
 * `threshold` is the seed used when building defaults.
 */
export type SnapConfig = {
  enabled: boolean;
  threshold: number;
  axisThresholdX: number;
  axisThresholdY: number;
};

/** Default seed threshold (px). */
export const DEFAULT_SNAP_THRESHOLD = 8;

/**
 * Build default SnapConfig — axis thresholds seeded from `threshold`.
 */
export function createDefaultSnapConfig(
  threshold: number = DEFAULT_SNAP_THRESHOLD
): SnapConfig {
  return {
    enabled: true,
    threshold,
    axisThresholdX: threshold,
    axisThresholdY: threshold,
  };
}

/**
 * Frozen SnapTarget — a magnetic line in absolute layer coordinates.
 */
export type SnapTarget = {
  axis: SnapAxis;
  position: number;
  edge: SnapEdge;
  kind: SnapTargetKind;
  sourceId?: string;
  priority: number;
};

/**
 * Context for SnapTargetProvider.collect — geometric data only.
 * Engine never receives or invokes providers.
 */
export type SnapTargetContext = {
  candidateId: string;
  candidate: WindowGeometry;
  workspace: WorkspaceConstraints;
  geometries: ReadonlyMap<string, WindowGeometry>;
  config: SnapConfig;
};

/**
 * Abstract target source — implementations live outside the Engine.
 * D59: WorkspaceTargetProvider + WindowTargetProvider (D59.2+ wiring).
 * D61: DockTargetProvider (reserved).
 */
export type SnapTargetProvider = {
  readonly id: string;
  collect(ctx: SnapTargetContext): readonly SnapTarget[];
};
