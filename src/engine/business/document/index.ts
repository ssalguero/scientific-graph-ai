/**
 * ENGINE Domain — Document Engine barrel (business layer).
 * OWNERSHIP: ENGINE owns document lifecycle business rules (register/activate/deactivate).
 * Consumes Workspace / Windows via notification ports — does not own WindowRegistry.
 */

export { DOCUMENT_ERROR_CODES, DocumentFlowError } from "./errors";
export type { DocumentNotificationPort } from "./ports";
export {
  createDocumentEngine,
  DocumentEngine,
  type DocumentEngineOptions,
} from "./DocumentEngine";
export type {
  ActivateDocumentInput,
  ActivateDocumentResult,
  DeactivateDocumentInput,
  DeactivateDocumentResult,
  DocumentRecord,
  RegisterDocumentInput,
  RegisterDocumentResult,
} from "./types";

export const DOCUMENT_ENGINE_OWNERSHIP =
  "ENGINE owns Document Engine business rules; Platform owns document / window infrastructure.";
