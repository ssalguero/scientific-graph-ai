/**
 * ENGINE Domain — Business layer barrel (ENGINE-internal only).
 * External consumers must NOT import this path — use `@/engine` only.
 * ENGINE-0: Visibility frozen.
 * ENGINE-4: Project Engine executable.
 * ENGINE-7: Document Engine executable.
 */

export {
  PROJECT_ENGINE_OWNERSHIP,
  createProjectEngine,
  ProjectEngine,
  PROJECT_ERROR_CODES,
  ProjectFlowError,
} from "./project";
export {
  DOCUMENT_ENGINE_OWNERSHIP,
  createDocumentEngine,
  DocumentEngine,
  DOCUMENT_ERROR_CODES,
  DocumentFlowError,
} from "./document";
export { BUSINESS_POLICIES_OWNERSHIP } from "./policies";
