/**
 * ENGINE Domain — Orchestrator interfaces (ENGINE-internal).
 * OWNERSHIP: Type contracts for orchestration shells.
 * Not part of the consumer Application API — consumers use `@/engine` facades / contracts.
 * ENGINE-1: Interface shapes frozen to match public Workflow/Lifecycle/Command/Coordination names.
 * ENGINE-2: WorkflowEngine.register accepts WorkflowDefinition.
 */

import type {
  BusinessCommandDefinition,
  BusinessCommandHandler,
  EngineCommandContext,
  EngineCommandId,
  EngineCommandResult,
} from "../contracts/commands";
import type { ValidationOutcome } from "../contracts/coordination";
import type { LifecycleApi } from "../contracts/lifecycle";
import type {
  WorkflowId,
  WorkflowRequest,
  WorkflowResponse,
} from "../contracts/workflow";
import type { WorkflowDefinition } from "./definition";

/**
 * Workflow Engine — Product Flow registration and execution (internal).
 * Public consumers call WorkflowApi facades; they never hold this type.
 * Registry ids are strings so test / internal empty workflows may register
 * without widening the public Product Flow WorkflowId union.
 */
export interface WorkflowEngine {
  run(request: WorkflowRequest | { workflowId: string; payload?: unknown }): Promise<WorkflowResponse>;
  register(definition: WorkflowDefinition): void;
  /** Lookup a registered definition by id (undefined if unknown). */
  get(workflowId: WorkflowId | string): WorkflowDefinition | undefined;
  /** Whether a workflow id is registered. */
  has(workflowId: WorkflowId | string): boolean;
}

/**
 * Command Orchestrator — business command routing (internal).
 * Distinct from UX-6 interaction CommandRegistry.
 * ENGINE-3: register → execute → WorkflowEngine.run (default path).
 */
export interface CommandOrchestrator {
  execute(
    commandId: EngineCommandId,
    payload?: unknown,
    context?: EngineCommandContext,
  ): Promise<EngineCommandResult>;
  registerHandler(
    commandIdOrDefinition: EngineCommandId | BusinessCommandDefinition,
    handlerOrPartial?: BusinessCommandHandler | Omit<BusinessCommandDefinition, "id">,
  ): void;
  /** Whether a business command id is registered. */
  has?(commandId: EngineCommandId): boolean;
  /** Lookup a registered business command definition. */
  get?(commandId: EngineCommandId): BusinessCommandDefinition | undefined;
}

/**
 * Lifecycle Coordinator — application lifecycle transitions (internal).
 * Mirrors LifecycleApi; does not own Runtime infrastructure.
 */
export interface LifecycleCoordinator extends LifecycleApi {}

/**
 * Validation Coordinator — business precondition pipelines (internal).
 */
export interface ValidationCoordinator {
  validate(operationId: string, payload?: unknown): Promise<ValidationOutcome>;
}
