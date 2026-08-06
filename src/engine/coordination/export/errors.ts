/**
 * ENGINE Domain — Export Results / exportProject Product Flow errors.
 * Thrown from Product Flow execute handlers; WorkflowEngine maps `code` onto EngineFailure.
 */

export class ExportFlowError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ExportFlowError";
    this.code = code;
  }
}

export const EXPORT_ERROR_CODES = {
  INVALID_PAYLOAD: "ENGINE_EXPORT_INVALID_PAYLOAD",
  NOT_FOUND: "ENGINE_EXPORT_NOT_FOUND",
  EXPORT_FAILED: "ENGINE_EXPORT_FAILED",
  NOT_WIRED: "ENGINE_EXPORT_NOT_WIRED",
  UNSUPPORTED_MODE: "ENGINE_EXPORT_UNSUPPORTED_MODE",
} as const;
