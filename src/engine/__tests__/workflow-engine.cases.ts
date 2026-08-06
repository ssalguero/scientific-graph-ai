/**
 * ENGINE Domain — Workflow Engine unit cases (ENGINE-2).
 * Empty workflow registration / execution, unregistered failure, lifecycle observability.
 */

import { createAssertCase, type CaseResult } from "./run-assertions";

import { createWorkflowDiagnosticsReporter } from "../diagnostics";
import {
  createWorkflowEngine,
  WORKFLOW_PIPELINE_STAGES,
} from "../orchestration/WorkflowEngine";

const EXPECTED_LIFECYCLE_SUCCESS = [
  "Requested",
  "Validated",
  "Prepared",
  "Executing",
  "Completed",
] as const;

export const runWorkflowEngineCaseSuite = async (): Promise<CaseResult[]> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  // —— Empty registered workflow → Completed ——
  {
    const diagnostics = createWorkflowDiagnosticsReporter();
    const engine = createWorkflowEngine({ diagnostics });
    engine.register({ id: "createProject" });

    const response = await engine.run({
      workflowId: "createProject",
      payload: { empty: true },
    });

    assertCase(
      "empty.register.has",
      engine.has("createProject") === true,
      "registered id is present",
    );
    assertCase(
      "empty.run.ok",
      response.ok === true,
      `ok=${String(response.ok)}`,
    );
    assertCase(
      "empty.run.state",
      response.state === "Completed",
      `state=${String(response.state)}`,
    );
    assertCase(
      "empty.run.workflowId",
      response.workflowId === "createProject",
      response.workflowId,
    );
    assertCase(
      "empty.run.noError",
      response.error === undefined,
      response.error?.message,
    );
    assertCase(
      "empty.run.stages",
      Array.isArray(response.stagesCompleted) &&
        response.stagesCompleted.length === WORKFLOW_PIPELINE_STAGES.length &&
        WORKFLOW_PIPELINE_STAGES.every(
          (stage, i) => response.stagesCompleted?.[i] === stage,
        ),
      JSON.stringify(response.stagesCompleted),
    );
    assertCase(
      "empty.run.stateHistory",
      Array.isArray(response.stateHistory) &&
        EXPECTED_LIFECYCLE_SUCCESS.every(
          (state, i) => response.stateHistory?.[i] === state,
        ) &&
        response.stateHistory.length === EXPECTED_LIFECYCLE_SUCCESS.length,
      JSON.stringify(response.stateHistory),
    );

    const history = diagnostics.getHistory(response.operationId ?? "");
    const diagStates = history.map((r) => r.state);
    assertCase(
      "empty.diagnostics.completed",
      diagnostics.getLast(response.operationId ?? "")?.state === "Completed",
      diagnostics.getLast(response.operationId ?? "")?.state,
    );
    assertCase(
      "empty.diagnostics.stateTransitions",
      EXPECTED_LIFECYCLE_SUCCESS.every((s) => diagStates.includes(s)),
      JSON.stringify(diagStates),
    );
  }

  // —— Empty with explicit no-op execute → Completed ——
  {
    let executed = false as boolean;
    const engine = createWorkflowEngine();
    engine.register({
      id: "openProject",
      execute: () => {
        executed = true;
      },
    });
    const response = await engine.run({ workflowId: "openProject" });
    assertCase("noop.execute.called", executed === true);
    assertCase("noop.execute.ok", response.ok === true && response.state === "Completed");
  }

  // —— Unregistered workflow → Failed ——
  {
    const diagnostics = createWorkflowDiagnosticsReporter();
    const engine = createWorkflowEngine({ diagnostics });
    const response = await engine.run({ workflowId: "saveProject" });

    assertCase("unregistered.ok", response.ok === false);
    assertCase("unregistered.state", response.state === "Failed");
    assertCase(
      "unregistered.errorCode",
      response.error?.code === "ENGINE_WORKFLOW_NOT_REGISTERED",
      response.error?.code,
    );
    assertCase(
      "unregistered.errorMessage",
      typeof response.error?.message === "string" &&
        response.error.message.includes("saveProject"),
      response.error?.message,
    );
    assertCase(
      "unregistered.stateHistory",
      response.stateHistory?.[0] === "Requested" &&
        response.stateHistory?.[response.stateHistory.length - 1] === "Failed",
      JSON.stringify(response.stateHistory),
    );
    assertCase(
      "unregistered.diagnostics.failed",
      diagnostics.getLast(response.operationId ?? "")?.state === "Failed",
    );
    assertCase("unregistered.has", engine.has("saveProject") === false);
    assertCase("unregistered.get", engine.get("saveProject") === undefined);
  }

  // —— Execute throw → Failed ——
  {
    const engine = createWorkflowEngine();
    engine.register({
      id: "closeProject",
      execute: () => {
        throw new Error("simulated execute failure");
      },
    });
    const response = await engine.run({ workflowId: "closeProject" });
    assertCase("executeThrow.ok", response.ok === false);
    assertCase("executeThrow.state", response.state === "Failed");
    assertCase(
      "executeThrow.code",
      response.error?.code === "ENGINE_WORKFLOW_EXECUTION_FAILED",
      response.error?.code,
    );
    assertCase(
      "executeThrow.message",
      response.error?.message === "simulated execute failure",
      response.error?.message,
    );
  }

  return results;
};
