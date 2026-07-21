/**
 * D59.2 — Snap Foundation · SnapTargetProvider implementations.
 * WorkspaceTargetProvider + WindowTargetProvider.
 * DockTargetProvider reserved for D61 — not implemented.
 * Engine does not import or invoke these; callers compose.
 * Authority: D59.0 Discovery · D59.1 contracts · D59.2 Drag Snap Wiring.
 * Not part of WindowAPI / public barrel.
 */

import { toEdges } from "./WindowSnapEngine";
import {
  SNAP_PRIORITY,
  type SnapTarget,
  type SnapTargetContext,
  type SnapTargetProvider,
} from "./WindowSnapTypes";

/** Workspace edge targets — outer bounds only (left/right/top/bottom). */
export function createWorkspaceSnapTargetProvider(): SnapTargetProvider {
  return {
    id: "workspace",
    collect(ctx: SnapTargetContext): readonly SnapTarget[] {
      const { workspace } = ctx;
      const priority = SNAP_PRIORITY.workspace;
      return [
        {
          axis: "x",
          position: workspace.left,
          edge: "left",
          kind: "workspace",
          priority,
        },
        {
          axis: "x",
          position: workspace.right,
          edge: "right",
          kind: "workspace",
          priority,
        },
        {
          axis: "y",
          position: workspace.top,
          edge: "top",
          kind: "workspace",
          priority,
        },
        {
          axis: "y",
          position: workspace.bottom,
          edge: "bottom",
          kind: "workspace",
          priority,
        },
      ];
    },
  };
}

/**
 * Other-window edge targets.
 * Aligns each candidate edge to each source edge on the same axis.
 * Excludes candidateId. Does not emit dock.
 */
export function createWindowSnapTargetProvider(): SnapTargetProvider {
  return {
    id: "window",
    collect(ctx: SnapTargetContext): readonly SnapTarget[] {
      const priority = SNAP_PRIORITY.window;
      const targets: SnapTarget[] = [];

      for (const [sourceId, geometry] of ctx.geometries) {
        if (sourceId === ctx.candidateId) {
          continue;
        }
        const edges = toEdges(geometry);

        targets.push(
          {
            axis: "x",
            position: edges.left,
            edge: "left",
            kind: "window",
            sourceId,
            priority,
          },
          {
            axis: "x",
            position: edges.right,
            edge: "left",
            kind: "window",
            sourceId,
            priority,
          },
          {
            axis: "x",
            position: edges.left,
            edge: "right",
            kind: "window",
            sourceId,
            priority,
          },
          {
            axis: "x",
            position: edges.right,
            edge: "right",
            kind: "window",
            sourceId,
            priority,
          },
          {
            axis: "y",
            position: edges.top,
            edge: "top",
            kind: "window",
            sourceId,
            priority,
          },
          {
            axis: "y",
            position: edges.bottom,
            edge: "top",
            kind: "window",
            sourceId,
            priority,
          },
          {
            axis: "y",
            position: edges.top,
            edge: "bottom",
            kind: "window",
            sourceId,
            priority,
          },
          {
            axis: "y",
            position: edges.bottom,
            edge: "bottom",
            kind: "window",
            sourceId,
            priority,
          }
        );
      }

      return targets;
    },
  };
}
