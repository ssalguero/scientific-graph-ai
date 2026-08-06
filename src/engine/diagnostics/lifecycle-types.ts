/**
 * ENGINE Domain — Lifecycle diagnostics types (ENGINE-internal).
 * OWNERSHIP: ENGINE owns application lifecycle transition tracing.
 * Not part of the consumer Application API.
 * ENGINE-10: Optional failure code on report entries.
 */

import type { LifecyclePhase } from "../contracts/lifecycle";

/** Single lifecycle diagnostic report entry. */
export interface LifecycleDiagnosticReport {
  readonly operation: string;
  readonly phase: LifecyclePhase;
  readonly message?: string;
  /** Machine-readable failure code when a transition fails. */
  readonly code?: string;
  readonly timestamp: string;
  readonly diagnosticsRef: string;
}

/** Lifecycle diagnostics reporter contract (internal tracing). */
export interface LifecycleDiagnostics {
  record(
    report: Omit<LifecycleDiagnosticReport, "timestamp" | "diagnosticsRef"> & {
      readonly timestamp?: string;
      readonly diagnosticsRef?: string;
    },
  ): void;
  getHistory(): readonly LifecycleDiagnosticReport[];
  getLast(): LifecycleDiagnosticReport | undefined;
  clear(): void;
}
