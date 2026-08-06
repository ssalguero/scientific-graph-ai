/**
 * ENGINE Domain — Project Flow / Project Engine errors.
 * Thrown from Product Flow execute handlers; WorkflowEngine maps `code` onto EngineFailure.
 */

export class ProjectFlowError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ProjectFlowError";
    this.code = code;
  }
}

export const PROJECT_ERROR_CODES = {
  INVALID_PAYLOAD: "ENGINE_PROJECT_INVALID_PAYLOAD",
  NOT_FOUND: "ENGINE_PROJECT_NOT_FOUND",
  CREATE_FAILED: "ENGINE_PROJECT_CREATE_FAILED",
  OPEN_FAILED: "ENGINE_PROJECT_OPEN_FAILED",
  SAVE_FAILED: "ENGINE_PROJECT_SAVE_FAILED",
  CLOSE_FAILED: "ENGINE_PROJECT_CLOSE_FAILED",
  NO_ACTIVE: "ENGINE_PROJECT_NO_ACTIVE",
} as const;
