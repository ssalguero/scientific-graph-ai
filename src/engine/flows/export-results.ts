/**
 * Product Flow — Export Results (public / registry id: `exportProject`).
 * OWNERSHIP: ENGINE
 * Orchestrates ExportCoordinator.exportProject via WorkflowEngine execution stage.
 * Durable .sgproj export via project use-cases; chart DOM capture deferred to ENG-8/9.
 *
 * Naming:
 * - Product Flow name: Export Results
 * - Frozen Workflow API / primary flow id: exportProject
 * - Legacy placeholder alias id: exportResults (registered as alias)
 */

import {
  EXPORT_ERROR_CODES,
  ExportFlowError,
} from "../coordination/export/errors";
import type { ExportCoordinator } from "../coordination/export/ExportCoordinator";
import type { ExportProjectInput } from "../coordination/export/types";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

/** Frozen public Workflow API id — prefer this. */
export const FLOW_ID = "exportProject" as const;

/**
 * Product Flow catalog / historical placeholder id.
 * Registered as an alias of `exportProject` (same execute).
 */
export const EXPORT_RESULTS_ALIAS_ID = "exportResults" as const;

/** Human Product Flow name (docs / diagnostics). */
export const PRODUCT_FLOW_NAME = "Export Results" as const;

export const PROJECT_EXPORT_COMMAND_ID = "project.export" as const;

function parseExportPayload(payload: unknown): ExportProjectInput {
  if (payload == null || typeof payload !== "object") {
    throw new ExportFlowError(
      EXPORT_ERROR_CODES.INVALID_PAYLOAD,
      "exportProject requires payload { projectId } or { mode: 'payload', json }",
    );
  }
  const record = payload as Record<string, unknown>;

  if (record.mode === "payload") {
    if (typeof record.json !== "string" || !record.json.trim()) {
      throw new ExportFlowError(
        EXPORT_ERROR_CODES.INVALID_PAYLOAD,
        "exportProject payload mode requires json: non-empty string",
      );
    }
    return {
      mode: "payload",
      json: record.json,
      projectId:
        typeof record.projectId === "string" ? record.projectId : undefined,
    };
  }

  if (typeof record.projectId !== "string" || !record.projectId.trim()) {
    throw new ExportFlowError(
      EXPORT_ERROR_CODES.INVALID_PAYLOAD,
      "exportProject requires payload.projectId: non-empty string",
    );
  }

  return {
    mode: "sgproj",
    projectId: record.projectId.trim(),
  };
}

function buildExecute(exportCoordinator: ExportCoordinator) {
  return async (ctx: WorkflowExecutionContext) => {
    const input = parseExportPayload(ctx.payload);
    const label =
      "mode" in input && input.mode === "payload"
        ? `payload bytes=${input.json.length}`
        : `projectId=${input.projectId}`;
    ctx.diagnostics.record({
      operationId: ctx.operationId,
      workflowId: FLOW_ID,
      state: ctx.state,
      stage: "execution",
      message: `exportProject (${PRODUCT_FLOW_NAME}) ${label}`,
    });
    const result = await exportCoordinator.exportProject(input, {
      operationId: ctx.operationId,
      flowId: FLOW_ID,
      reason: "product-flow",
    });
    ctx.result = result;
  };
}

/** Build a WorkflowDefinition bound to an ExportCoordinator (id = exportProject). */
export function createExportProjectFlow(
  exportCoordinator: ExportCoordinator,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: buildExecute(exportCoordinator),
  };
}

/**
 * Alias definition for historical / catalog id `exportResults`.
 * Same execute as exportProject — do not invent a separate public facade.
 */
export function createExportResultsAliasFlow(
  exportCoordinator: ExportCoordinator,
): WorkflowDefinition {
  return {
    id: EXPORT_RESULTS_ALIAS_ID,
    execute: buildExecute(exportCoordinator),
  };
}
