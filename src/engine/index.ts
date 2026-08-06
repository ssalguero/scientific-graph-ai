/**
 * ENGINE Domain — Public Application API barrel.
 *
 * OWNERSHIP: ENGINE is the sole application orchestration layer.
 * Consumers (UX, COLLABORATION, PLUGINS) may import ONLY from `@/engine`
 * (and optionally `@/engine/contracts`). Do not import business/, coordination/,
 * orchestration/, flows/, diagnostics/, or internal/ from outside ENGINE.
 *
 * Hard constraints: never render UI; never perform scientific calculations;
 * never implement persistence; never replace Runtime; never depend on UX.
 *
 * ENGINE-4: Project Product Flows (create/open/save/close) registered on the
 * default composition.
 * ENGINE-7: Lifecycle facades delegate to composed LifecycleCoordinator.
 * ENGINE-8: Boundary enforcement — consumers may import `@/engine` /
 * `@/engine/contracts` only.
 * ENGINE-9: Certified Product Flows route through this barrel; call
 * `configureEngine` at app bootstrap (IndexedDB / ports). See
 * BOUNDARY_ENFORCEMENT.md. Do not add parallel certified-flow orchestration.
 *
 * @packageDocumentation
 */

// --- Contracts (types) ---
export type {
  WorkflowId,
  WorkflowLifecycleState,
  WorkflowRequest,
  WorkflowResponse,
  WorkflowApi,
  LifecycleApi,
  LifecyclePhase,
  EngineCommandId,
  EngineCommandContext,
  EngineCommandRequest,
  EngineCommandResult,
  BusinessCommandHandler,
  BusinessCommandDefinition,
  CommandApi,
  ValidationOutcome,
  CompletionReport,
  RollbackRequest,
  CoordinationApi,
  EngineResult,
  EngineFailure,
  EngineNotificationPayload,
} from "./contracts";

// --- Public Workflow API ---
export {
  createProject,
  openProject,
  closeProject,
  saveProject,
  importDataset,
  exportProject,
} from "./public/workflows";

// --- Public Lifecycle API ---
export {
  initializeApplication,
  activateWorkspace,
  activateDocument,
  shutdownApplication,
} from "./public/lifecycle";

// --- Public Command API ---
export { executeCommand } from "./public/commands";

// --- Composition bootstrap (ENGINE-9) ---
export {
  configureEngine,
  type ConfigureEngineOptions,
} from "./public/composition";
