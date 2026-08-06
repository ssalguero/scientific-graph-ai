/**
 * ENGINE Domain — Workflow execution context (ENGINE-internal).
 * OWNERSHIP: ENGINE owns per-run execution context for Product Flows.
 * ENGINE-2: Context carries request, lifecycle state, and stage progress.
 * Not part of the consumer Application API.
 */

import type {
  WorkflowDiagnostics,
  WorkflowOperationState,
} from "../diagnostics/types";
import type { WorkflowPipelineStage } from "./pipeline";

/** Per-run execution context passed to optional workflow `execute` handlers. */
export interface WorkflowExecutionContext {
  readonly operationId: string;
  /** Registered workflow id (Product Flow id or internal/test empty workflow id). */
  readonly workflowId: string;
  readonly payload?: unknown;
  readonly diagnostics: WorkflowDiagnostics;
  /** Current lifecycle state (mutated by the engine during the run). */
  state: WorkflowOperationState;
  /** Pipeline stages completed so far (engine-owned progress). */
  readonly stagesCompleted: WorkflowPipelineStage[];
  /** Lifecycle states observed in order (engine-owned progress). */
  readonly stateHistory: WorkflowOperationState[];
  /**
   * Optional Product Flow result set by `execute` handlers (ENGINE-4+).
   * Copied onto WorkflowResponse.result on successful completion.
   */
  result?: unknown;
}
