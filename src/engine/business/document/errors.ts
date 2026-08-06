/**
 * ENGINE Domain — Document Engine errors.
 * Thrown from Document Engine / lifecycle document activation; WorkflowEngine maps `code`.
 */

export class DocumentFlowError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DocumentFlowError";
    this.code = code;
  }
}

export const DOCUMENT_ERROR_CODES = {
  INVALID_PAYLOAD: "ENGINE_DOCUMENT_INVALID_PAYLOAD",
  NOT_FOUND: "ENGINE_DOCUMENT_NOT_FOUND",
  ALREADY_REGISTERED: "ENGINE_DOCUMENT_ALREADY_REGISTERED",
  NO_ACTIVE: "ENGINE_DOCUMENT_NO_ACTIVE",
  ACTIVATE_FAILED: "ENGINE_DOCUMENT_ACTIVATE_FAILED",
} as const;
