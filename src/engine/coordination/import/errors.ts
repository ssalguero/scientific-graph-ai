/**
 * ENGINE Domain — Import Dataset Product Flow errors.
 * Thrown from Product Flow execute handlers; WorkflowEngine maps `code` onto EngineFailure.
 */

export class ImportFlowError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ImportFlowError";
    this.code = code;
  }
}

export const IMPORT_ERROR_CODES = {
  INVALID_PAYLOAD: "ENGINE_IMPORT_INVALID_PAYLOAD",
  IMPORT_FAILED: "ENGINE_IMPORT_FAILED",
  WIZARD_FINALIZE_FAILED: "ENGINE_IMPORT_WIZARD_FINALIZE_FAILED",
  NOT_WIRED: "ENGINE_IMPORT_NOT_WIRED",
} as const;
