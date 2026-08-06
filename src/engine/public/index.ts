/**
 * ENGINE Domain — Public Application API facades barrel.
 * Consumers should prefer `@/engine` root barrel.
 * ENGINE-0: Facade export set frozen (workflows / lifecycle / commands).
 * INTERNAL: Do not re-export orchestration/business/coordination from here.
 */

export {
  createProject,
  openProject,
  closeProject,
  saveProject,
  importDataset,
  exportProject,
} from "./workflows";

export {
  initializeApplication,
  activateWorkspace,
  activateDocument,
  shutdownApplication,
} from "./lifecycle";

export { executeCommand } from "./commands";

export {
  configureEngine,
  type ConfigureEngineOptions,
} from "./composition";
