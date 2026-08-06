/**
 * ENGINE Domain — Coordination contracts (Application API).
 * OWNERSHIP: ENGINE coordinates sequencing/validation/completion/rollback across domains.
 * Does NOT own Sessions, Windows, Workspace, Runtime, or DATA infrastructure.
 * ENGINE-0: Coordination DTO / API names frozen.
 */

/** Validation outcome for a coordinated operation. */
export interface ValidationOutcome {
  readonly ok: boolean;
  readonly failures?: readonly string[];
}

/** Completion report for a coordinated operation. */
export interface CompletionReport {
  readonly operationId: string;
  readonly completed: boolean;
}

/** Rollback / compensating-operation request. */
export interface RollbackRequest {
  readonly operationId: string;
  readonly reason?: string;
}

/**
 * Coordination API surface (type-level; sequencing + validation + rollback).
 * ENGINE-10: WorkflowDefinition.compensate implements compensating cleanup
 * on Failed execution paths without expanding this public Application API.
 */
export interface CoordinationApi {
  validate(operationId: string, payload?: unknown): Promise<ValidationOutcome>;
  reportCompletion(report: CompletionReport): Promise<void>;
  requestRollback(request: RollbackRequest): Promise<void>;
}
