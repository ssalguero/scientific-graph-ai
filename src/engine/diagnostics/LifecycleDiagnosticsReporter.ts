/**
 * ENGINE Domain — Lifecycle diagnostics reporter.
 * OWNERSHIP: ENGINE owns application lifecycle transition tracing.
 * ENGINE-7: In-memory recording of phase transitions.
 * ENGINE-10: Failure code stamping on diagnostics refs.
 */

import type {
  LifecycleDiagnosticReport,
  LifecycleDiagnostics,
} from "./lifecycle-types";

/** In-memory lifecycle diagnostics reporter. */
export class LifecycleDiagnosticsReporter implements LifecycleDiagnostics {
  private readonly history: LifecycleDiagnosticReport[] = [];

  record(
    report: Omit<LifecycleDiagnosticReport, "timestamp" | "diagnosticsRef"> & {
      readonly timestamp?: string;
      readonly diagnosticsRef?: string;
    },
  ): void {
    const stamped: LifecycleDiagnosticReport = {
      operation: report.operation,
      phase: report.phase,
      message: report.message,
      code: report.code,
      timestamp: report.timestamp ?? new Date().toISOString(),
      diagnosticsRef:
        report.diagnosticsRef ??
        `engine.lifecycle.${report.operation}.${report.phase}${
          report.code ? `.${report.code}` : ""
        }`,
    };
    this.history.push(stamped);
  }

  getHistory(): readonly LifecycleDiagnosticReport[] {
    return [...this.history];
  }

  getLast(): LifecycleDiagnosticReport | undefined {
    if (this.history.length === 0) return undefined;
    return this.history[this.history.length - 1];
  }

  clear(): void {
    this.history.length = 0;
  }
}

export function createLifecycleDiagnosticsReporter(): LifecycleDiagnostics {
  return new LifecycleDiagnosticsReporter();
}
