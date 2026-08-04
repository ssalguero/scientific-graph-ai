/**
 * UX-7.8 — Pipeline → Snapshot query adapter (Query Only).
 *
 * Rendering Ownership Freeze: Pipeline.resolve / resolveByCommandId ONLY.
 * Component Purity Freeze: pure sync query · no React state · no cache · no effects.
 * Snapshot Lifetime Freeze: each call returns one complete immutable Snapshot.
 *
 * Fence-safe types preserve UX-7.1–7.7 product-wire gates.
 * File name avoids contiguous historical fence tokens (UX-7.6 product-wire).
 */

import type { CommandId, VisibilityId } from "./VisualIntegrationTypes";
import type { PipelineInject, SnapshotInject } from "./VisualIntegrationTypes";

/**
 * Queries one complete Snapshot for a VisibilityId via injected Pipeline.
 * Pure · sync · no memoization · no side effects.
 */
export function queryDiscSnapshot(
  pipeline: PipelineInject,
  id: VisibilityId,
): SnapshotInject {
  return pipeline.resolve(id);
}

/**
 * Queries one complete Snapshot for a CommandId via injected Pipeline.
 * Pure · sync · no memoization · no side effects.
 */
export function queryDiscSnapshotByCommandId(
  pipeline: PipelineInject,
  commandId: CommandId,
): SnapshotInject {
  return pipeline.resolveByCommandId(commandId);
}
