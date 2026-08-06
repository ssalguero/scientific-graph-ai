/**
 * Product Flow — Import Dataset.
 * OWNERSHIP: ENGINE
 * Orchestrates ImportCoordinator.importDataset via WorkflowEngine execution stage.
 * Importers (`@/lib/import`) remain authoritative; wizard UI stays in UX (dual-path).
 */

import {
  IMPORT_ERROR_CODES,
  ImportFlowError,
} from "../coordination/import/errors";
import type { ImportCoordinator } from "../coordination/import/ImportCoordinator";
import type {
  ImportDatasetInput,
  ImportFileHandle,
} from "../coordination/import/types";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "importDataset" as const;

export const DATASET_IMPORT_COMMAND_ID = "dataset.import" as const;

function parseImportPayload(payload: unknown): ImportDatasetInput {
  if (payload == null || typeof payload !== "object") {
    throw new ImportFlowError(
      IMPORT_ERROR_CODES.INVALID_PAYLOAD,
      "importDataset requires payload { sourceId, file }",
    );
  }
  const record = payload as Record<string, unknown>;
  if (typeof record.sourceId !== "string" || !record.sourceId.trim()) {
    throw new ImportFlowError(
      IMPORT_ERROR_CODES.INVALID_PAYLOAD,
      "importDataset requires payload.sourceId: non-empty string",
    );
  }
  const file = record.file as ImportFileHandle | undefined;
  if (file == null || typeof file !== "object" || typeof file.name !== "string") {
    throw new ImportFlowError(
      IMPORT_ERROR_CODES.INVALID_PAYLOAD,
      "importDataset requires payload.file with name: string",
    );
  }
  return {
    sourceId: record.sourceId.trim(),
    file,
  };
}

/** Build a WorkflowDefinition bound to an ImportCoordinator instance. */
export function createImportDatasetFlow(
  importCoordinator: ImportCoordinator,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      const input = parseImportPayload(ctx.payload);
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: `importDataset sourceId=${input.sourceId} file=${input.file.name}`,
      });
      const result = await importCoordinator.importDataset(input, {
        operationId: ctx.operationId,
        flowId: FLOW_ID,
        reason: "product-flow",
      });
      ctx.result = result;
    },
  };
}
