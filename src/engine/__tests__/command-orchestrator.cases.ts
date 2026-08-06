/**
 * ENGINE Domain — Command Orchestrator unit cases (ENGINE-3).
 * Business command → WorkflowEngine empty workflow round-trip;
 * unregistered → Failed; context / diagnostics propagation; UX intention bridge.
 */

import { createAssertCase, type CaseResult } from "./run-assertions";

import { createWorkflowDiagnosticsReporter } from "../diagnostics";
import {
  bridgeUxCommandIntention,
  toEngineCommandRequest,
} from "../internal/ux-command-bridge";
import { createCommandOrchestrator } from "../orchestration/CommandOrchestrator";
import { createWorkflowEngine } from "../orchestration/WorkflowEngine";
import { executeCommand } from "../public/commands";

/** Demo / test-only empty business command (not a Product Flow). */
const DEMO_COMMAND_ID = "engine.test.empty";
/** Demo / test-only empty workflow id (not a public Product Flow). */
const DEMO_WORKFLOW_ID = "engine.test.empty";

export const runCommandOrchestratorCaseSuite = async (): Promise<
  CaseResult[]
> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  // —— Registered business command → empty workflow → Completed ——
  {
    const diagnostics = createWorkflowDiagnosticsReporter();
    const workflowEngine = createWorkflowEngine({ diagnostics });
    workflowEngine.register({ id: DEMO_WORKFLOW_ID });

    const orchestrator = createCommandOrchestrator({
      workflowEngine,
      diagnostics,
    });
    orchestrator.registerHandler({
      id: DEMO_COMMAND_ID,
      workflowId: DEMO_WORKFLOW_ID,
    });

    const result = await orchestrator.execute(DEMO_COMMAND_ID, {
      empty: true,
    });

    assertCase(
      "registered.has",
      orchestrator.has?.(DEMO_COMMAND_ID) === true,
      "demo command is registered",
    );
    assertCase(
      "registered.ok",
      result.ok === true,
      `ok=${String(result.ok)}`,
    );
    assertCase(
      "registered.commandId",
      result.commandId === DEMO_COMMAND_ID,
      result.commandId,
    );
    assertCase(
      "registered.workflowId",
      result.workflowId === DEMO_WORKFLOW_ID,
      result.workflowId,
    );
    assertCase(
      "registered.noError",
      result.error === undefined,
      result.error,
    );
    assertCase(
      "registered.operationId",
      typeof result.operationId === "string" && result.operationId.length > 0,
      result.operationId,
    );

    const history = diagnostics.getHistory(result.operationId ?? "");
    assertCase(
      "registered.diagnostics.workflowCompleted",
      history.some((r) => r.state === "Completed"),
      JSON.stringify(history.map((r) => r.state)),
    );
  }

  // —— UX-style intention DTO → bridge → CommandOrchestrator → Completed ——
  {
    const workflowEngine = createWorkflowEngine();
    workflowEngine.register({ id: DEMO_WORKFLOW_ID });
    const orchestrator = createCommandOrchestrator({ workflowEngine });
    orchestrator.registerHandler({
      id: DEMO_COMMAND_ID,
      workflowId: DEMO_WORKFLOW_ID,
    });

    const intention = {
      commandId: DEMO_COMMAND_ID,
      payload: { via: "ux-intention" },
      source: "ux-6-test",
      correlationId: "corr-engine-3",
    };

    const mapped = toEngineCommandRequest(intention);
    assertCase(
      "bridge.map.commandId",
      mapped.commandId === DEMO_COMMAND_ID,
      mapped.commandId,
    );
    assertCase(
      "bridge.map.context",
      mapped.context?.source === "ux-6-test" &&
        mapped.context?.correlationId === "corr-engine-3",
      JSON.stringify(mapped.context),
    );

    const result = await bridgeUxCommandIntention(intention, (id, payload, ctx) =>
      orchestrator.execute(id, payload, ctx),
    );

    assertCase("bridge.roundTrip.ok", result.ok === true);
    assertCase(
      "bridge.roundTrip.workflowId",
      result.workflowId === DEMO_WORKFLOW_ID,
      result.workflowId,
    );
  }

  // —— Unregistered command → Failed ——
  {
    const diagnostics = createWorkflowDiagnosticsReporter();
    const orchestrator = createCommandOrchestrator({ diagnostics });
    const result = await orchestrator.execute("engine.unknown.command");

    assertCase("unregistered.ok", result.ok === false);
    assertCase(
      "unregistered.errorCode",
      result.errorCode === "ENGINE_COMMAND_NOT_REGISTERED",
      result.errorCode,
    );
    assertCase(
      "unregistered.errorMessage",
      typeof result.error === "string" &&
        result.error.includes("engine.unknown.command"),
      result.error,
    );
    assertCase(
      "unregistered.diagnosticsRef",
      typeof result.diagnosticsRef === "string" &&
        result.diagnosticsRef.length > 0,
      result.diagnosticsRef,
    );
    assertCase(
      "unregistered.has",
      orchestrator.has?.("engine.unknown.command") === false,
    );
  }

  // —— Public executeCommand facade: unregistered → Failed (no throw) ——
  {
    let threw = false;
    let result: Awaited<ReturnType<typeof executeCommand>> | undefined;
    try {
      result = await executeCommand("engine.public.unregistered");
    } catch {
      threw = true;
    }
    assertCase("public.facade.noThrow", threw === false);
    assertCase("public.facade.ok", result?.ok === false);
    assertCase(
      "public.facade.errorCode",
      result?.errorCode === "ENGINE_COMMAND_NOT_REGISTERED",
      result?.errorCode,
    );
  }

  // —— Context / correlation propagation via custom handler ——
  {
    const orchestrator = createCommandOrchestrator();
    let seenSource: string | undefined;
    let seenCorrelation: string | undefined;

    orchestrator.registerHandler("engine.noop", async (id, _payload, ctx) => {
      seenSource = ctx?.source;
      seenCorrelation = ctx?.correlationId;
      return {
        commandId: id,
        ok: true,
        operationId: "noop-op-1",
        diagnosticsRef: "noop-diag-1",
      };
    });

    const result = await orchestrator.execute(
      "engine.noop",
      { n: 1 },
      { source: "palette", correlationId: "c-42" },
    );

    assertCase("context.handler.ok", result.ok === true);
    assertCase("context.handler.source", seenSource === "palette", seenSource);
    assertCase(
      "context.handler.correlationId",
      seenCorrelation === "c-42",
      seenCorrelation,
    );
    assertCase(
      "context.handler.diagnosticsRef",
      result.diagnosticsRef === "noop-diag-1",
      result.diagnosticsRef,
    );
  }

  // —— Misconfigured registration (no handler / workflowId) → Failed ——
  {
    const orchestrator = createCommandOrchestrator();
    orchestrator.registerHandler({ id: "engine.misconfigured" });
    const result = await orchestrator.execute("engine.misconfigured");
    assertCase("misconfigured.ok", result.ok === false);
    assertCase(
      "misconfigured.errorCode",
      result.errorCode === "ENGINE_COMMAND_MISCONFIGURED",
      result.errorCode,
    );
  }

  // —— Workflow failure surfaces on command result ——
  {
    const workflowEngine = createWorkflowEngine();
    // Do not register DEMO_WORKFLOW_ID — command routes to missing workflow
    const orchestrator = createCommandOrchestrator({ workflowEngine });
    orchestrator.registerHandler({
      id: DEMO_COMMAND_ID,
      workflowId: DEMO_WORKFLOW_ID,
    });
    const result = await orchestrator.execute(DEMO_COMMAND_ID);
    assertCase("workflowFail.ok", result.ok === false);
    assertCase(
      "workflowFail.errorCode",
      result.errorCode === "ENGINE_WORKFLOW_NOT_REGISTERED",
      result.errorCode,
    );
  }

  return results;
};
