/**
 * ENGINE Domain — Command contracts (Application API).
 * OWNERSHIP: ENGINE owns business command execution (distinct from UX-6 interaction commands).
 * ENGINE-0: CommandApi / request / result shapes frozen; command id registry in ENGINE-3+.
 * ENGINE-3: Business command definition + enriched result observability fields (optional).
 */

/** Business command identifier — registry populated in ENGINE-3+. */
export type EngineCommandId = string;

/** Business command execution context. */
export interface EngineCommandContext {
  readonly source?: string;
  readonly correlationId?: string;
}

/** Business command execution request. */
export interface EngineCommandRequest {
  readonly commandId: EngineCommandId;
  readonly payload?: unknown;
  readonly context?: EngineCommandContext;
}

/**
 * Business command execution result.
 * Optional fields carry workflow / diagnostics correlation when routed through WorkflowEngine.
 */
export interface EngineCommandResult {
  readonly commandId: EngineCommandId;
  readonly ok: boolean;
  readonly error?: string;
  /** Machine-readable failure code when `ok` is false. */
  readonly errorCode?: string;
  /** Workflow id when the command routed through WorkflowEngine. */
  readonly workflowId?: string;
  /** Correlation id from the underlying workflow run. */
  readonly operationId?: string;
  /** Diagnostics handle from the underlying workflow / command path. */
  readonly diagnosticsRef?: string;
  /** Optional Product Flow result when command routed through WorkflowEngine (ENGINE-4+). */
  readonly result?: unknown;
}

/**
 * Custom business command handler (ENGINE-internal registration).
 * Prefer `workflowId` routing when the command maps 1:1 to a Product Flow / empty workflow.
 */
export type BusinessCommandHandler = (
  commandId: EngineCommandId,
  payload: unknown | undefined,
  context: EngineCommandContext | undefined,
) => Promise<EngineCommandResult>;

/**
 * Business command registration shape.
 * Default path: `workflowId` → `WorkflowEngine.run`. Optional `handler` overrides routing.
 */
export interface BusinessCommandDefinition {
  readonly id: EngineCommandId;
  /** When set (and no handler), CommandOrchestrator runs this workflow id. */
  readonly workflowId?: string;
  /** Optional custom handler — when set, takes precedence over `workflowId`. */
  readonly handler?: BusinessCommandHandler;
}

/** Command API surface (type-level Application API). */
export interface CommandApi {
  executeCommand(
    commandId: EngineCommandId,
    payload?: unknown,
    context?: EngineCommandContext,
  ): Promise<EngineCommandResult>;
}
