/**
 * ENGINE Domain — Project coordination adapters.
 * OWNERSHIP: ENGINE coordinates local project persistence; does not own storage.
 * Temporary bridge to `@/lib/project/application/local-project` until DATA public contracts.
 */

export {
  buildEmptyProjectCollectContext,
  ENGINE_DEFAULT_PROJECT_NAME,
  type EmptyCollectContextOptions,
} from "./empty-collect-context";
export {
  createLocalProjectAdapter,
  LocalProjectAdapter,
  type LocalProjectAdapterOptions,
} from "./LocalProjectAdapter";

export const PROJECT_COORDINATION_OWNERSHIP =
  "ENGINE coordinates local project persistence via adapters; lib/project owns storage mechanics.";
