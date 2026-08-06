/**
 * ENGINE Domain — Workflow definition (ENGINE-internal registration shape).
 * OWNERSHIP: ENGINE owns flow registration for the Workflow Engine.
 * ENGINE-2: id + optional execute hook. Empty definitions (no execute) are valid.
 * ENGINE-10: optional compensate / cleanup hook on Failed paths after execution starts.
 * Not part of the consumer Application API.
 */

import type { EngineFailure } from "../contracts/results";
import type { WorkflowExecutionContext } from "./context";

/**
 * Registered workflow definition.
 * Empty workflows omit `execute` (or provide a no-op) and complete successfully
 * when run through the pipeline skeleton.
 * `id` is a string so ENGINE-3 test / internal empty workflows may register
 * without widening the public Product Flow `WorkflowId` union.
 */
export interface WorkflowDefinition {
  readonly id: string;
  /**
   * Optional execution body invoked during the Execution pipeline stage.
   * Omitted / undefined = empty workflow (no side effects).
   */
  readonly execute?: (
    ctx: WorkflowExecutionContext,
  ) => void | Promise<void>;
  /**
   * Optional compensating / cleanup hook (ENGINE-10).
   * Invoked when the run fails after the Execution stage has started.
   * Errors thrown here are recorded in diagnostics and do not replace the
   * original EngineFailure. Aligns with CoordinationApi.requestRollback intent
   * without expanding the public Application API.
   */
  readonly compensate?: (
    ctx: WorkflowExecutionContext,
    failure: EngineFailure,
  ) => void | Promise<void>;
}
