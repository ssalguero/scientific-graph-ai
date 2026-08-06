/**
 * ENGINE Domain — Stable orchestration error codes (ENGINE-internal).
 * OWNERSHIP: ENGINE owns workflow / command failure code constants.
 * ENGINE-10: Canonical codes for unregistered / validation / execution paths.
 * Domain-specific codes remain in business/* and coordination/* error modules.
 * Not part of the consumer Application API.
 */

/** Workflow Engine failure codes (stable — do not rename without plan revision). */
export const WORKFLOW_ERROR_CODES = {
  NOT_REGISTERED: "ENGINE_WORKFLOW_NOT_REGISTERED",
  VALIDATION_FAILED: "ENGINE_WORKFLOW_VALIDATION_FAILED",
  EXECUTION_FAILED: "ENGINE_WORKFLOW_EXECUTION_FAILED",
} as const;

/** Command Orchestrator failure codes (stable — do not rename without plan revision). */
export const COMMAND_ERROR_CODES = {
  NOT_REGISTERED: "ENGINE_COMMAND_NOT_REGISTERED",
  VALIDATION_FAILED: "ENGINE_COMMAND_VALIDATION_FAILED",
  HANDLER_FAILED: "ENGINE_COMMAND_HANDLER_FAILED",
  MISCONFIGURED: "ENGINE_COMMAND_MISCONFIGURED",
} as const;

export type WorkflowErrorCode =
  (typeof WORKFLOW_ERROR_CODES)[keyof typeof WORKFLOW_ERROR_CODES];

export type CommandErrorCode =
  (typeof COMMAND_ERROR_CODES)[keyof typeof COMMAND_ERROR_CODES];
