/**
 * ENGINE Domain — Diagnostics types (ENGINE-internal).
 * OWNERSHIP: ENGINE owns workflow tracing / execution report shapes.
 * Not part of the consumer Application API — do not re-export from `@/engine`.
 * ENGINE-2: Recording hooks for lifecycle / stage transitions.
 * ENGINE-10: Failure codes, history helpers, compensation tracing.
 */

import type { WorkflowLifecycleState } from "../contracts/workflow";

/** Operation lifecycle states — alias of the canonical contract union. */
export type WorkflowOperationState = WorkflowLifecycleState;

/** Single workflow diagnostic report entry. */
export interface WorkflowDiagnosticReport {
  readonly operationId: string;
  readonly workflowId?: string;
  readonly state: WorkflowOperationState;
  readonly stage?: string;
  readonly message?: string;
  /** Machine-readable failure / event code when applicable. */
  readonly code?: string;
  readonly timestamp?: string;
  readonly diagnosticsRef?: string;
}

/**
 * Workflow diagnostics reporter contract (internal tracing).
 * UX never imports this — consumers see diagnostics refs via EngineResult / notifications.
 */
export interface WorkflowDiagnostics {
  record(report: WorkflowDiagnosticReport): void;
  getLast(operationId: string): WorkflowDiagnosticReport | undefined;
  /** Ordered reports for one operation (state / stage transitions). */
  getHistory(operationId: string): readonly WorkflowDiagnosticReport[];
  /** Flat ordered history across all operations (ENGINE-10). */
  getAllHistory(): readonly WorkflowDiagnosticReport[];
  /** Clear recorded history (tests / isolation). */
  clear(): void;
}
