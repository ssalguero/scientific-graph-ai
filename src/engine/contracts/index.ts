/**
 * ENGINE Domain — Public contracts barrel.
 * UX / COLLABORATION / PLUGINS may import contracts; never internals.
 * ENGINE-0: Contract family names and exports frozen.
 */

export type {
  WorkflowId,
  WorkflowLifecycleState,
  WorkflowRequest,
  WorkflowResponse,
  WorkflowApi,
} from "./workflow";

export type {
  LifecycleApi,
  LifecyclePhase,
} from "./lifecycle";

export type {
  EngineCommandId,
  EngineCommandContext,
  EngineCommandRequest,
  EngineCommandResult,
  BusinessCommandHandler,
  BusinessCommandDefinition,
  CommandApi,
} from "./commands";

export type {
  ValidationOutcome,
  CompletionReport,
  RollbackRequest,
  CoordinationApi,
} from "./coordination";

export type {
  EngineResult,
  EngineFailure,
  EngineNotificationPayload,
} from "./results";
