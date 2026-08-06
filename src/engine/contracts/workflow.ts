/**
 * ENGINE Domain — Workflow contracts (Application API).
 * OWNERSHIP: ENGINE owns Product Flow orchestration contracts.
 * ENGINE-0: WorkflowId union and WorkflowApi method names frozen.
 * ENGINE-2: WorkflowResponse gains optional result / observability fields
 * (aligned with EngineFailure) — no new product workflow functions.
 * Payload shapes remain opaque (`unknown`) until flow phases refine DTOs.
 */

import type { EngineFailure } from "./results";

/** Registered Product Flow identifiers exposed on the public Workflow API. */
export type WorkflowId =
  | "createProject"
  | "openProject"
  | "closeProject"
  | "saveProject"
  | "importDataset"
  | "exportProject";

/**
 * Operation lifecycle states (canonical Workflow Engine).
 * Requested → Validated → Prepared → Executing → Completed | Failed
 */
export type WorkflowLifecycleState =
  | "Requested"
  | "Validated"
  | "Prepared"
  | "Executing"
  | "Completed"
  | "Failed";

/** Opaque workflow request context — DTOs refined per flow phase. */
export interface WorkflowRequest {
  readonly workflowId: WorkflowId;
  readonly payload?: unknown;
}

/** Opaque workflow response — DTOs refined per flow phase. */
export interface WorkflowResponse {
  readonly workflowId: WorkflowId;
  readonly ok: boolean;
  /** Present when `ok` is false. */
  readonly error?: EngineFailure;
  /** Correlation id for diagnostics. */
  readonly operationId?: string;
  /** Terminal lifecycle state for this run. */
  readonly state?: WorkflowLifecycleState;
  /** Ordered lifecycle states observed during this run. */
  readonly stateHistory?: readonly WorkflowLifecycleState[];
  /** Ordered pipeline stages completed during this run. */
  readonly stagesCompleted?: readonly string[];
  /** Optional Product Flow result payload (ENGINE-4+). */
  readonly result?: unknown;
}

/** Workflow API surface (type-level Application API). */
export interface WorkflowApi {
  createProject(payload?: unknown): Promise<WorkflowResponse>;
  openProject(payload?: unknown): Promise<WorkflowResponse>;
  closeProject(payload?: unknown): Promise<WorkflowResponse>;
  saveProject(payload?: unknown): Promise<WorkflowResponse>;
  importDataset(payload?: unknown): Promise<WorkflowResponse>;
  exportProject(payload?: unknown): Promise<WorkflowResponse>;
}
