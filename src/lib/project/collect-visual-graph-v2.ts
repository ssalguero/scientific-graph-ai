import { toPrimaryDatasetId } from "@/lib/project/domain";
import type { VisualGraphCollectInput } from "@/lib/project/domain/mappers/visual-graph";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";

const resolveRuntimeSourceDatasetId = (
  ctx: EditorProjectCollectContextV2,
  preparedSessions: readonly SessionDataset[]
): string => {
  if (ctx.activeDatasetId != null && ctx.activeDatasetId.trim() !== "") {
    return ctx.activeDatasetId;
  }

  if (preparedSessions.length > 0) {
    return preparedSessions[0]!.id;
  }

  return toPrimaryDatasetId(ctx.metadata.id);
};

export const resolveVisualGraphCollectInputs = (
  ctx: EditorProjectCollectContextV2,
  preparedSessions: readonly SessionDataset[]
): VisualGraphCollectInput[] | undefined => {
  const entries = ctx.projectVisualGraphEntries;
  if (entries === undefined || entries.length === 0) {
    return undefined;
  }

  const sourceDatasetId = resolveRuntimeSourceDatasetId(ctx, preparedSessions);

  return entries.map((entry) => ({ entry, sourceDatasetId }));
};
