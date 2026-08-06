/**
 * ENGINE Domain — Diagnostics barrel (ENGINE-internal only).
 * OWNERSHIP: ENGINE owns workflow tracing / execution reports.
 * ENGINE-2: In-memory reporter records lifecycle / stage transitions.
 * ENGINE-7: Lifecycle diagnostics reporter for application phase transitions.
 * ENGINE-10: Failure codes, compensation tracing, cross-operation history.
 * Not part of the consumer Application API.
 */

export type {
  WorkflowOperationState,
  WorkflowDiagnosticReport,
  WorkflowDiagnostics,
} from "./types";

export type {
  LifecycleDiagnosticReport,
  LifecycleDiagnostics,
} from "./lifecycle-types";

export {
  WorkflowDiagnosticsReporter,
  createWorkflowDiagnosticsReporter,
} from "./WorkflowDiagnosticsReporter";

export {
  LifecycleDiagnosticsReporter,
  createLifecycleDiagnosticsReporter,
} from "./LifecycleDiagnosticsReporter";

export const DIAGNOSTICS_OWNERSHIP =
  "ENGINE owns workflow diagnostics handles; UX presents notifications only.";
