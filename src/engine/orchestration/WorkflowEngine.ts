/**
 * ENGINE Domain — Workflow Engine (orchestration core).
 * OWNERSHIP: ENGINE owns Product Flow execution pipeline, states, and registry.
 * ENGINE-2: Registration, lifecycle state machine, pipeline skeleton, diagnostics hooks.
 * ENGINE-10: Stable error codes, Failed-path diagnostics, optional compensate hooks.
 * No Product Flow business logic — empty registered workflows complete successfully.
 */

import { DocumentFlowError } from "../business/document/errors";
import { ProjectFlowError } from "../business/project/errors";
import { ExportFlowError } from "../coordination/export/errors";
import { ImportFlowError } from "../coordination/import/errors";
import { SessionFlowError } from "../coordination/session/errors";
import type { EngineFailure } from "../contracts/results";
import type {
  WorkflowId,
  WorkflowLifecycleState,
  WorkflowRequest,
  WorkflowResponse,
} from "../contracts/workflow";
import {
  createWorkflowDiagnosticsReporter,
  type WorkflowDiagnostics,
} from "../diagnostics";
import type { WorkflowOperationState } from "../diagnostics/types";
import { WORKFLOW_ERROR_CODES } from "../internal/error-codes";
import type { WorkflowExecutionContext } from "./context";
import type { WorkflowDefinition } from "./definition";
import type {
  ValidationCoordinator,
  WorkflowEngine as WorkflowEngineContract,
} from "./interfaces";
import {
  LifecycleFlowError,
} from "./lifecycle-errors";
import type { WorkflowPipelineStage } from "./pipeline";
import { createValidationCoordinator } from "./ValidationCoordinator";

export type { WorkflowDefinition } from "./definition";
export type { WorkflowExecutionContext } from "./context";
export type { WorkflowPipelineStage } from "./pipeline";
export { WORKFLOW_PIPELINE_STAGES } from "./pipeline";

/** Optional dependencies for WorkflowEngine construction. */
export interface WorkflowEngineOptions {
  readonly diagnostics?: WorkflowDiagnostics;
  readonly validation?: ValidationCoordinator;
}

let operationCounter = 0;

function nextOperationId(): string {
  operationCounter += 1;
  return `wf-op-${Date.now()}-${operationCounter}`;
}

/**
 * Workflow Engine — registry + lifecycle + ordered pipeline skeleton.
 * Empty definitions (no `execute`) run all stages as no-ops and complete.
 */
export class WorkflowEngine implements WorkflowEngineContract {
  private readonly registry = new Map<string, WorkflowDefinition>();
  private readonly diagnostics: WorkflowDiagnostics;
  private readonly validation: ValidationCoordinator;

  constructor(options: WorkflowEngineOptions = {}) {
    this.diagnostics =
      options.diagnostics ?? createWorkflowDiagnosticsReporter();
    this.validation = options.validation ?? createValidationCoordinator();
  }

  /** Shared diagnostics reporter (ENGINE-10 — composition / tests). */
  getDiagnostics(): WorkflowDiagnostics {
    return this.diagnostics;
  }

  register(definition: WorkflowDefinition): void {
    this.registry.set(definition.id, definition);
  }

  get(workflowId: WorkflowId | string): WorkflowDefinition | undefined {
    return this.registry.get(workflowId);
  }

  has(workflowId: WorkflowId | string): boolean {
    return this.registry.has(workflowId);
  }

  async run(
    request: WorkflowRequest | { workflowId: string; payload?: unknown },
  ): Promise<WorkflowResponse> {
    const operationId = nextOperationId();
    const stagesCompleted: WorkflowPipelineStage[] = [];
    const stateHistory: WorkflowOperationState[] = [];

    const ctx: WorkflowExecutionContext = {
      operationId,
      workflowId: request.workflowId,
      payload: request.payload,
      diagnostics: this.diagnostics,
      state: "Requested",
      stagesCompleted,
      stateHistory,
    };

    const transition = (
      state: WorkflowOperationState,
      message?: string,
      stage?: string,
      code?: string,
    ) => {
      ctx.state = state;
      stateHistory.push(state);
      this.diagnostics.record({
        operationId,
        workflowId: request.workflowId,
        state,
        stage,
        message,
        code,
      });
    };

    const markStage = (stage: WorkflowPipelineStage) => {
      stagesCompleted.push(stage);
      this.diagnostics.record({
        operationId,
        workflowId: request.workflowId,
        state: ctx.state,
        stage,
        message: `stage:${stage}`,
      });
    };

    const asWorkflowId = (id: string): WorkflowId => id as WorkflowId;

    const fail = async (
      failure: EngineFailure,
      definition?: WorkflowDefinition,
      executionStarted = false,
    ): Promise<WorkflowResponse> => {
      transition("Failed", failure.message, undefined, failure.code);
      const resolvedFailure: EngineFailure = {
        ...failure,
        diagnosticsRef:
          failure.diagnosticsRef ??
          this.diagnostics.getLast(operationId)?.diagnosticsRef,
      };

      if (definition?.compensate && executionStarted) {
        try {
          await definition.compensate(ctx, resolvedFailure);
          this.diagnostics.record({
            operationId,
            workflowId: request.workflowId,
            state: "Failed",
            stage: "compensation",
            message: "compensate:completed",
            code: resolvedFailure.code,
          });
        } catch (compErr) {
          const compMessage =
            compErr instanceof Error
              ? compErr.message
              : "compensate hook threw";
          this.diagnostics.record({
            operationId,
            workflowId: request.workflowId,
            state: "Failed",
            stage: "compensation",
            message: `compensate:failed: ${compMessage}`,
            code: resolvedFailure.code,
          });
        }
      }

      return {
        workflowId: asWorkflowId(request.workflowId),
        ok: false,
        error: resolvedFailure,
        operationId,
        state: "Failed",
        stateHistory: [...stateHistory] as WorkflowLifecycleState[],
        stagesCompleted: [...stagesCompleted],
      };
    };

    // —— User Request ——
    transition("Requested", "workflow run accepted", "userRequest");
    markStage("userRequest");

    const definition = this.registry.get(request.workflowId);
    if (!definition) {
      return fail({
        code: WORKFLOW_ERROR_CODES.NOT_REGISTERED,
        message: `Unknown workflow id: "${request.workflowId}" — not registered`,
      });
    }

    let executionStarted = false;

    try {
      // —— Business Validation ——
      markStage("businessValidation");
      const outcome = await this.validation.validate(
        operationId,
        request.payload,
      );
      if (!outcome.ok) {
        return fail(
          {
            code: WORKFLOW_ERROR_CODES.VALIDATION_FAILED,
            message:
              outcome.failures?.join("; ") ??
              "Workflow business validation failed",
          },
          definition,
          false,
        );
      }
      transition("Validated", "business validation passed", "businessValidation");

      // —— Workflow Planning ——
      markStage("workflowPlanning");

      // —— Service Coordination ——
      markStage("serviceCoordination");
      transition(
        "Prepared",
        "planning and coordination complete",
        "serviceCoordination",
      );

      // —— Execution ——
      transition("Executing", "entering execution stage", "execution");
      markStage("execution");
      executionStarted = true;
      if (definition.execute) {
        await definition.execute(ctx);
      }

      // —— Verification ——
      markStage("verification");

      // —— Completion ——
      markStage("completion");
      transition("Completed", "workflow completed", "completion");

      return {
        workflowId: asWorkflowId(request.workflowId),
        ok: true,
        operationId,
        state: "Completed",
        stateHistory: [...stateHistory] as WorkflowLifecycleState[],
        stagesCompleted: [...stagesCompleted],
        result: ctx.result,
      };
    } catch (err) {
      if (
        err instanceof ProjectFlowError ||
        err instanceof SessionFlowError ||
        err instanceof ImportFlowError ||
        err instanceof ExportFlowError ||
        err instanceof DocumentFlowError ||
        err instanceof LifecycleFlowError
      ) {
        return fail(
          {
            code: err.code,
            message: err.message,
          },
          definition,
          executionStarted,
        );
      }
      const message =
        err instanceof Error ? err.message : "Workflow execution threw";
      return fail(
        {
          code: WORKFLOW_ERROR_CODES.EXECUTION_FAILED,
          message,
        },
        definition,
        executionStarted,
      );
    }
  }
}

/** Factory — constructs a Workflow Engine with optional diagnostics / validation. */
export function createWorkflowEngine(
  options?: WorkflowEngineOptions,
): WorkflowEngineContract {
  return new WorkflowEngine(options);
}
