/**
 * ENGINE Domain — Orchestration layer barrel (ENGINE-internal only).
 * Not part of the public Application API — consumers must use `@/engine`.
 * ENGINE-2: Workflow Engine core (registry, lifecycle, pipeline) + pass-through validation.
 * ENGINE-3: Command Orchestrator (business command registry → WorkflowEngine).
 * Visibility frozen — never import this path from UX / DATA / outside ENGINE.
 */

export type {
  WorkflowEngine as WorkflowEngineContract,
  CommandOrchestrator as CommandOrchestratorContract,
  LifecycleCoordinator as LifecycleCoordinatorContract,
  ValidationCoordinator as ValidationCoordinatorContract,
} from "./interfaces";

export type { WorkflowDefinition } from "./definition";
export type { WorkflowExecutionContext } from "./context";
export type { WorkflowPipelineStage } from "./pipeline";
export { WORKFLOW_PIPELINE_STAGES } from "./pipeline";

export {
  WorkflowEngine,
  createWorkflowEngine,
  type WorkflowEngineOptions,
} from "./WorkflowEngine";
export {
  CommandOrchestrator,
  createCommandOrchestrator,
  type CommandOrchestratorOptions,
} from "./CommandOrchestrator";
export {
  LifecycleCoordinator,
  createLifecycleCoordinator,
  type LifecycleCoordinatorOptions,
  type SessionShutdownPort,
} from "./LifecycleCoordinator";
export {
  LIFECYCLE_ERROR_CODES,
  LifecycleFlowError,
} from "./lifecycle-errors";
export {
  ValidationCoordinator,
  createValidationCoordinator,
  type ValidationRule,
} from "./ValidationCoordinator";
