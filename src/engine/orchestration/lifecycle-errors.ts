/**
 * ENGINE Domain — Lifecycle Flow errors.
 * Thrown from LifecycleCoordinator; WorkflowEngine maps `code` onto EngineFailure.
 */

export class LifecycleFlowError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "LifecycleFlowError";
    this.code = code;
  }
}

export const LIFECYCLE_ERROR_CODES = {
  INVALID_PAYLOAD: "ENGINE_LIFECYCLE_INVALID_PAYLOAD",
  INVALID_PHASE: "ENGINE_LIFECYCLE_INVALID_PHASE",
  NOT_READY: "ENGINE_LIFECYCLE_NOT_READY",
  ALREADY_INITIALIZED: "ENGINE_LIFECYCLE_ALREADY_INITIALIZED",
  ALREADY_SHUTDOWN: "ENGINE_LIFECYCLE_ALREADY_SHUTDOWN",
  INIT_FAILED: "ENGINE_LIFECYCLE_INIT_FAILED",
  SHUTDOWN_FAILED: "ENGINE_LIFECYCLE_SHUTDOWN_FAILED",
  WORKSPACE_ACTIVATE_FAILED: "ENGINE_LIFECYCLE_WORKSPACE_ACTIVATE_FAILED",
} as const;
