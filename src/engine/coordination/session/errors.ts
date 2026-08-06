/**
 * ENGINE Domain — Session Flow / Session Coordinator errors.
 * Thrown from Product Flow execute handlers; WorkflowEngine maps `code` onto EngineFailure.
 */

export class SessionFlowError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SessionFlowError";
    this.code = code;
  }
}

export const SESSION_ERROR_CODES = {
  INVALID_PAYLOAD: "ENGINE_SESSION_INVALID_PAYLOAD",
  RESTORE_FAILED: "ENGINE_SESSION_RESTORE_FAILED",
  SAVE_COORDINATION_FAILED: "ENGINE_SESSION_SAVE_COORDINATION_FAILED",
  AUTOSAVE_FLUSH_FAILED: "ENGINE_SESSION_AUTOSAVE_FLUSH_FAILED",
  AUTOSAVE_UNAVAILABLE: "ENGINE_SESSION_AUTOSAVE_UNAVAILABLE",
} as const;
