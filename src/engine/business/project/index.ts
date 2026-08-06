/**
 * ENGINE Domain — Project Engine barrel (business layer).
 * OWNERSHIP: ENGINE owns project lifecycle business rules.
 * Consumes Workspace / Sessions via coordination adapters — does not own persistence.
 */

export { PROJECT_ERROR_CODES, ProjectFlowError } from "./errors";
export type { ProjectPersistencePort } from "./ports";
export {
  createProjectEngine,
  ProjectEngine,
  type ProjectEngineOptions,
} from "./ProjectEngine";
export type {
  CloseProjectInput,
  CloseProjectResult,
  CreateProjectInput,
  CreateProjectResult,
  OpenProjectInput,
  OpenProjectResult,
  ProjectCollectContext,
  SaveProjectInput,
  SaveProjectResult,
} from "./types";

export const PROJECT_ENGINE_OWNERSHIP =
  "ENGINE owns Project Engine business rules; Platform owns persistence mechanisms.";
