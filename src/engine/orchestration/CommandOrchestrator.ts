/**
 * ENGINE Domain — Command Orchestrator (business command routing).
 * OWNERSHIP: ENGINE owns business command routing, validation hooks, and sequencing.
 * Distinct from UX-6 interaction CommandRegistry (palette / shortcuts / enablement).
 * ENGINE-3: Registry + route to WorkflowEngine.run; unregistered → Failed (no throw).
 * ENGINE-10: Stable error codes; Failed paths always record diagnostics.
 *
 * Two-layer model:
 *   UX interaction (UX-6) → ENGINE CommandOrchestrator → WorkflowEngine.run
 */

import type {
  BusinessCommandDefinition,
  BusinessCommandHandler,
  EngineCommandContext,
  EngineCommandId,
  EngineCommandResult,
} from "../contracts/commands";
import type { WorkflowId } from "../contracts/workflow";
import {
  createWorkflowDiagnosticsReporter,
  type WorkflowDiagnostics,
} from "../diagnostics";
import { COMMAND_ERROR_CODES } from "../internal/error-codes";
import type {
  CommandOrchestrator as CommandOrchestratorContract,
  ValidationCoordinator,
  WorkflowEngine,
} from "./interfaces";
import { createValidationCoordinator } from "./ValidationCoordinator";
import { createWorkflowEngine } from "./WorkflowEngine";

/** Optional dependencies for CommandOrchestrator construction. */
export interface CommandOrchestratorOptions {
  readonly workflowEngine?: WorkflowEngine;
  readonly validation?: ValidationCoordinator;
  readonly diagnostics?: WorkflowDiagnostics;
}

let commandDiagCounter = 0;

function nextCommandDiagRef(commandId: EngineCommandId): string {
  commandDiagCounter += 1;
  return `cmd-diag-${commandId}-${Date.now()}-${commandDiagCounter}`;
}

/**
 * Command Orchestrator — business command registry and routing to WorkflowEngine.
 * No Product Flow business logic — empty workflows complete when registered.
 */
export class CommandOrchestrator implements CommandOrchestratorContract {
  private readonly registry = new Map<
    EngineCommandId,
    BusinessCommandDefinition
  >();
  private readonly workflowEngine: WorkflowEngine;
  private readonly validation: ValidationCoordinator;
  private readonly diagnostics: WorkflowDiagnostics;

  constructor(options: CommandOrchestratorOptions = {}) {
    this.workflowEngine =
      options.workflowEngine ?? createWorkflowEngine();
    this.validation = options.validation ?? createValidationCoordinator();
    this.diagnostics =
      options.diagnostics ?? createWorkflowDiagnosticsReporter();
  }

  /** Shared diagnostics reporter (ENGINE-10 — composition / tests). */
  getDiagnostics(): WorkflowDiagnostics {
    return this.diagnostics;
  }

  /**
   * Register a business command.
   * Prefer `registerHandler(definition)` or `registerHandler(id, { workflowId })`.
   * Legacy shape `registerHandler(id, handlerFn)` remains supported.
   */
  registerHandler(
    commandIdOrDefinition: EngineCommandId | BusinessCommandDefinition,
    handlerOrPartial?: BusinessCommandHandler | Omit<BusinessCommandDefinition, "id">,
  ): void {
    if (typeof commandIdOrDefinition === "object") {
      this.registry.set(commandIdOrDefinition.id, commandIdOrDefinition);
      return;
    }

    const commandId = commandIdOrDefinition;

    if (typeof handlerOrPartial === "function") {
      this.registry.set(commandId, {
        id: commandId,
        handler: handlerOrPartial,
      });
      return;
    }

    if (handlerOrPartial && typeof handlerOrPartial === "object") {
      this.registry.set(commandId, {
        id: commandId,
        ...handlerOrPartial,
      });
      return;
    }

    this.registry.set(commandId, { id: commandId });
  }

  /** Whether a business command id is registered. */
  has(commandId: EngineCommandId): boolean {
    return this.registry.has(commandId);
  }

  /** Lookup a registered business command definition. */
  get(commandId: EngineCommandId): BusinessCommandDefinition | undefined {
    return this.registry.get(commandId);
  }

  async execute(
    commandId: EngineCommandId,
    payload?: unknown,
    context?: EngineCommandContext,
  ): Promise<EngineCommandResult> {
    const definition = this.registry.get(commandId);

    if (!definition) {
      const diagnosticsRef = nextCommandDiagRef(commandId);
      this.diagnostics.record({
        operationId: diagnosticsRef,
        state: "Failed",
        message: `Unknown business command: "${commandId}"`,
        code: COMMAND_ERROR_CODES.NOT_REGISTERED,
        diagnosticsRef,
      });
      return {
        commandId,
        ok: false,
        error: `Unknown business command: "${commandId}" — not registered`,
        errorCode: COMMAND_ERROR_CODES.NOT_REGISTERED,
        diagnosticsRef,
      };
    }

    // ValidationCoordinator hook
    const validationOpId = `cmd-val-${commandId}-${Date.now()}`;
    const outcome = await this.validation.validate(validationOpId, payload);
    if (!outcome.ok) {
      const diagnosticsRef = nextCommandDiagRef(commandId);
      const message =
        outcome.failures?.join("; ") ?? "Command business validation failed";
      this.diagnostics.record({
        operationId: diagnosticsRef,
        state: "Failed",
        message,
        code: COMMAND_ERROR_CODES.VALIDATION_FAILED,
        diagnosticsRef,
      });
      return {
        commandId,
        ok: false,
        error: message,
        errorCode: COMMAND_ERROR_CODES.VALIDATION_FAILED,
        diagnosticsRef,
      };
    }

    // Custom handler takes precedence.
    if (definition.handler) {
      try {
        const result = await definition.handler(commandId, payload, context);
        this.diagnostics.record({
          operationId: result.operationId ?? result.diagnosticsRef ?? commandId,
          workflowId: result.workflowId,
          state: result.ok ? "Completed" : "Failed",
          message: result.ok
            ? `command handler completed: ${commandId}`
            : result.error,
          code: result.ok ? undefined : result.errorCode,
          diagnosticsRef: result.diagnosticsRef,
        });
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Command handler threw";
        const diagnosticsRef = nextCommandDiagRef(commandId);
        this.diagnostics.record({
          operationId: diagnosticsRef,
          state: "Failed",
          message,
          code: COMMAND_ERROR_CODES.HANDLER_FAILED,
          diagnosticsRef,
        });
        return {
          commandId,
          ok: false,
          error: message,
          errorCode: COMMAND_ERROR_CODES.HANDLER_FAILED,
          diagnosticsRef,
        };
      }
    }

    // Default path: registered workflowId → WorkflowEngine.run
    if (definition.workflowId) {
      const response = await this.workflowEngine.run({
        workflowId: definition.workflowId as WorkflowId,
        payload,
      });

      const diagnosticsRef =
        response.error?.diagnosticsRef ??
        (response.operationId
          ? this.diagnostics.getLast(response.operationId)?.diagnosticsRef
          : undefined) ??
        nextCommandDiagRef(commandId);

      this.diagnostics.record({
        operationId: response.operationId ?? diagnosticsRef,
        workflowId: definition.workflowId,
        state: response.ok ? "Completed" : "Failed",
        message: response.ok
          ? `command routed to workflow: ${definition.workflowId}`
          : response.error?.message,
        code: response.ok ? undefined : response.error?.code,
        diagnosticsRef,
      });

      return {
        commandId,
        ok: response.ok,
        error: response.error?.message,
        errorCode: response.error?.code,
        workflowId: response.workflowId,
        operationId: response.operationId,
        diagnosticsRef,
        result: response.result,
      };
    }

    const diagnosticsRef = nextCommandDiagRef(commandId);
    this.diagnostics.record({
      operationId: diagnosticsRef,
      state: "Failed",
      message: `Command "${commandId}" has no handler or workflowId`,
      code: COMMAND_ERROR_CODES.MISCONFIGURED,
      diagnosticsRef,
    });
    return {
      commandId,
      ok: false,
      error: `Command "${commandId}" registered without handler or workflowId`,
      errorCode: COMMAND_ERROR_CODES.MISCONFIGURED,
      diagnosticsRef,
    };
  }
}

/** Factory — constructs a Command Orchestrator with optional workflow / validation. */
export function createCommandOrchestrator(
  options?: CommandOrchestratorOptions,
): CommandOrchestratorContract {
  return new CommandOrchestrator(options);
}
