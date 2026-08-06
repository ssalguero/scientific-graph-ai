/**
 * ENGINE Domain — Workflow diagnostics reporter.
 * OWNERSHIP: ENGINE owns workflow tracing handles.
 * ENGINE-2: In-memory recording of lifecycle / stage transitions.
 * ENGINE-10: Cross-operation history, clear, stable diagnosticsRef stamping.
 */

import type {
  WorkflowDiagnosticReport,
  WorkflowDiagnostics,
} from "./types";

/** In-memory diagnostics reporter — records state/stage transitions per operation. */
export class WorkflowDiagnosticsReporter implements WorkflowDiagnostics {
  private readonly byOperation = new Map<string, WorkflowDiagnosticReport[]>();
  private readonly all: WorkflowDiagnosticReport[] = [];

  record(report: WorkflowDiagnosticReport): void {
    const stamped: WorkflowDiagnosticReport = {
      ...report,
      timestamp: report.timestamp ?? new Date().toISOString(),
      diagnosticsRef:
        report.diagnosticsRef ??
        `engine.workflow.${report.operationId}.${report.state}${
          report.code ? `.${report.code}` : ""
        }`,
    };
    const existing = this.byOperation.get(report.operationId);
    if (existing) {
      existing.push(stamped);
    } else {
      this.byOperation.set(report.operationId, [stamped]);
    }
    this.all.push(stamped);
  }

  getLast(operationId: string): WorkflowDiagnosticReport | undefined {
    const history = this.byOperation.get(operationId);
    if (!history || history.length === 0) return undefined;
    return history[history.length - 1];
  }

  getHistory(operationId: string): readonly WorkflowDiagnosticReport[] {
    return this.byOperation.get(operationId) ?? [];
  }

  getAllHistory(): readonly WorkflowDiagnosticReport[] {
    return [...this.all];
  }

  clear(): void {
    this.byOperation.clear();
    this.all.length = 0;
  }
}

/** Factory — constructs an in-memory diagnostics reporter. */
export function createWorkflowDiagnosticsReporter(): WorkflowDiagnostics {
  return new WorkflowDiagnosticsReporter();
}
