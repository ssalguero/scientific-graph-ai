/**
 * ENGINE Domain — Diagnostics & Hardening cases (ENGINE-10).
 * Integration-style coverage: public API round-trips, failure/compensation,
 * ValidationCoordinator short-circuit, stable error codes, shared diagnostics.
 */

import { createAssertCase, type CaseResult } from "./run-assertions";

import { buildEmptyProjectCollectContext } from "../coordination/project";
import {
  createLifecycleDiagnosticsReporter,
  createWorkflowDiagnosticsReporter,
} from "../diagnostics";
import {
  PROJECT_CREATE_COMMAND_ID,
} from "../flows/register-project-flows";
import {
  COMMAND_ERROR_CODES,
  WORKFLOW_ERROR_CODES,
} from "../internal/error-codes";
import {
  composeEngine,
  setDefaultCompositionForTests,
} from "../internal/compose";
import { createCommandOrchestrator } from "../orchestration/CommandOrchestrator";
import { createValidationCoordinator } from "../orchestration/ValidationCoordinator";
import { createWorkflowEngine } from "../orchestration/WorkflowEngine";
import {
  closeProject,
  createProject,
  importDataset,
  openProject,
  saveProject,
} from "../public/workflows";
import {
  activateWorkspace,
  initializeApplication,
  shutdownApplication,
} from "../public/lifecycle";
import { executeCommand } from "../public/commands";
import type { ImportPort } from "../coordination/import/ports";
import type {
  ImportDatasetInput,
  ImportDatasetResult,
} from "../coordination/import/types";
import {
  LIFECYCLE_ERROR_CODES,
  LifecycleFlowError,
} from "../orchestration/lifecycle-errors";

function createToggleImportPort(): ImportPort & {
  setMode(mode: "error" | "success"): void;
} {
  let mode: "error" | "success" = "error";
  return {
    setMode(next) {
      mode = next;
    },
    async attemptImport(
      _input: ImportDatasetInput,
    ): Promise<ImportDatasetResult> {
      if (mode === "error") {
        return { kind: "error", message: "ENGINE-10 forced import failure" };
      }
      return {
        kind: "success",
        seriesCount: 1,
        fileName: "engine10.csv",
        series: [{ id: "s1", name: "S1", points: [], color: "#111" }],
      };
    },
  };
}

export const runDiagnosticsHardeningCaseSuite = async (): Promise<
  CaseResult[]
> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  setDefaultCompositionForTests(null);

  try {
    // —— Stable unregistered workflow / command codes ——
    {
      const diagnostics = createWorkflowDiagnosticsReporter();
      const engine = createWorkflowEngine({ diagnostics });
      const unknownWf = await engine.run({
        workflowId: "engine.hardening.unknown",
      });
      assertCase("codes.workflow.unregistered.ok", unknownWf.ok === false);
      assertCase(
        "codes.workflow.unregistered.code",
        unknownWf.error?.code === WORKFLOW_ERROR_CODES.NOT_REGISTERED,
        unknownWf.error?.code,
      );
      assertCase(
        "codes.workflow.unregistered.diagnostics",
        typeof unknownWf.error?.diagnosticsRef === "string" &&
          diagnostics.getLast(unknownWf.operationId ?? "")?.state === "Failed",
        unknownWf.error?.diagnosticsRef,
      );
      assertCase(
        "codes.workflow.unregistered.diagCode",
        diagnostics.getLast(unknownWf.operationId ?? "")?.code ===
          WORKFLOW_ERROR_CODES.NOT_REGISTERED,
        diagnostics.getLast(unknownWf.operationId ?? "")?.code,
      );

      const orchestrator = createCommandOrchestrator({ diagnostics });
      const unknownCmd = await orchestrator.execute(
        "engine.hardening.unknown.command",
      );
      assertCase("codes.command.unregistered.ok", unknownCmd.ok === false);
      assertCase(
        "codes.command.unregistered.code",
        unknownCmd.errorCode === COMMAND_ERROR_CODES.NOT_REGISTERED,
        unknownCmd.errorCode,
      );
      assertCase(
        "codes.command.unregistered.diagnosticsRef",
        typeof unknownCmd.diagnosticsRef === "string",
        unknownCmd.diagnosticsRef,
      );
    }

    // —— ValidationCoordinator short-circuits workflow pipeline ——
    {
      const diagnostics = createWorkflowDiagnosticsReporter();
      const validation = createValidationCoordinator(() => ({
        ok: false,
        failures: ["ENGINE-10 injected validation failure"],
      }));
      const engine = createWorkflowEngine({ diagnostics, validation });
      engine.register({
        id: "engine.hardening.validated",
        execute: () => {
          throw new Error("execute must not run when validation fails");
        },
      });

      const response = await engine.run({
        workflowId: "engine.hardening.validated",
        payload: {},
      });
      assertCase("validation.shortCircuit.ok", response.ok === false);
      assertCase(
        "validation.shortCircuit.code",
        response.error?.code === WORKFLOW_ERROR_CODES.VALIDATION_FAILED,
        response.error?.code,
      );
      assertCase(
        "validation.shortCircuit.stages",
        Array.isArray(response.stagesCompleted) &&
          response.stagesCompleted.includes("businessValidation") &&
          !response.stagesCompleted.includes("execution"),
        JSON.stringify(response.stagesCompleted),
      );
      assertCase(
        "validation.shortCircuit.state",
        response.state === "Failed" &&
          response.stateHistory?.[response.stateHistory.length - 1] === "Failed",
        JSON.stringify(response.stateHistory),
      );
    }

    // —— Command validation short-circuit ——
    {
      const validation = createValidationCoordinator(() => ({
        ok: false,
        failures: ["command blocked"],
      }));
      const orchestrator = createCommandOrchestrator({ validation });
      orchestrator.registerHandler({
        id: "engine.hardening.cmd.blocked",
        workflowId: "createProject",
      });
      const result = await orchestrator.execute(
        "engine.hardening.cmd.blocked",
        {},
      );
      assertCase("validation.command.ok", result.ok === false);
      assertCase(
        "validation.command.code",
        result.errorCode === COMMAND_ERROR_CODES.VALIDATION_FAILED,
        result.errorCode,
      );
    }

    // —— Compensation hook on Failed execution ——
    {
      const diagnostics = createWorkflowDiagnosticsReporter();
      let compensated = false as boolean;
      const engine = createWorkflowEngine({ diagnostics });
      engine.register({
        id: "engine.hardening.compensate",
        execute: () => {
          throw new Error("force compensate");
        },
        compensate: async (_ctx, failure) => {
          compensated = failure.code === WORKFLOW_ERROR_CODES.EXECUTION_FAILED;
        },
      });
      const response = await engine.run({
        workflowId: "engine.hardening.compensate",
      });
      assertCase("compensate.ok", response.ok === false);
      assertCase("compensate.invoked", compensated === true);
      const history = diagnostics.getHistory(response.operationId ?? "");
      assertCase(
        "compensate.diagnostics",
        history.some((r) => r.stage === "compensation"),
        JSON.stringify(history.map((r) => r.stage)),
      );
    }

    // —— Compensation not invoked when validation fails (execution never started) ——
    {
      let compensated = false as boolean;
      const engine = createWorkflowEngine({
        validation: createValidationCoordinator(() => ({
          ok: false,
          failures: ["no exec"],
        })),
      });
      engine.register({
        id: "engine.hardening.noCompensate",
        execute: () => undefined,
        compensate: () => {
          compensated = true;
        },
      });
      await engine.run({ workflowId: "engine.hardening.noCompensate" });
      assertCase("compensate.skippedOnValidation", compensated === false);
    }

    // —— Public API create → save → close → open round-trip (in-memory) ——
    {
      const composition = composeEngine();
      setDefaultCompositionForTests(composition);

      const created = await createProject({ name: "ENGINE-10 RoundTrip" });
      assertCase(
        "integration.roundTrip.create.ok",
        created.ok === true,
        created.error?.message,
      );
      const id = (created.result as { id: string } | undefined)?.id;
      assertCase(
        "integration.roundTrip.create.id",
        typeof id === "string" && id.length > 0,
        id,
      );

      const ctx = buildEmptyProjectCollectContext({
        id: id!,
        name: "ENGINE-10 RoundTrip Saved",
      });
      const saved = await saveProject({
        projectName: "ENGINE-10 RoundTrip Saved",
        ctx,
      });
      assertCase(
        "integration.roundTrip.save.ok",
        saved.ok === true,
        saved.error?.message,
      );

      const closed = await closeProject({});
      assertCase(
        "integration.roundTrip.close.ok",
        closed.ok === true,
        closed.error?.message,
      );
      assertCase(
        "integration.roundTrip.close.activeCleared",
        composition.projectEngine.getActiveProjectId() === null,
      );

      const opened = await openProject({ id });
      assertCase(
        "integration.roundTrip.open.ok",
        opened.ok === true,
        opened.error?.message,
      );
      const openResult = opened.result as
        | { id: string; name: string }
        | undefined;
      assertCase(
        "integration.roundTrip.open.name",
        openResult?.id === id &&
          openResult?.name === "ENGINE-10 RoundTrip Saved",
        JSON.stringify(openResult),
      );

      // Shared diagnostics history present for workflow runs
      const all = composition.diagnostics.getAllHistory();
      assertCase(
        "integration.roundTrip.diagnostics.history",
        all.length > 0 &&
          all.some((r) => r.state === "Completed") &&
          all.some((r) => r.workflowId === "createProject"),
        `count=${all.length}`,
      );

      // Command path also writes to shared diagnostics
      const cmd = await executeCommand(PROJECT_CREATE_COMMAND_ID, {
        name: "ENGINE-10 Cmd",
      });
      assertCase("integration.roundTrip.command.ok", cmd.ok === true, cmd.error);
      assertCase(
        "integration.roundTrip.command.diagnostics",
        composition.diagnostics
          .getAllHistory()
          .some((r) => r.message?.includes("command routed to workflow")),
      );
    }

    // —— importDataset business-error then success ——
    {
      const port = createToggleImportPort();
      const composition = composeEngine({
        import: { port },
      });
      setDefaultCompositionForTests(composition);

      port.setMode("error");
      const failed = await importDataset({
        sourceId: "csv",
        file: { name: "bad.csv" },
      });
      // Business error is a Completed workflow with result.kind === "error"
      assertCase(
        "integration.import.fail.ok",
        failed.ok === true && failed.state === "Completed",
        failed.error?.message,
      );
      const failResult = failed.result as
        | { kind: string; message?: string }
        | undefined;
      assertCase(
        "integration.import.fail.kind",
        failResult?.kind === "error" &&
          typeof failResult.message === "string",
        JSON.stringify(failResult),
      );
      assertCase(
        "integration.import.fail.diagnostics",
        typeof failed.operationId === "string" &&
          composition.diagnostics.getHistory(failed.operationId).length > 0,
        failed.operationId,
      );

      port.setMode("success");
      const succeeded = await importDataset({
        sourceId: "csv",
        file: { name: "ok.csv" },
      });
      assertCase(
        "integration.import.success.ok",
        succeeded.ok === true,
        succeeded.error?.message,
      );
      assertCase(
        "integration.import.success.state",
        succeeded.state === "Completed",
        succeeded.state,
      );
      const okResult = succeeded.result as
        | { kind: string; seriesCount?: number }
        | undefined;
      assertCase(
        "integration.import.success.kind",
        okResult?.kind === "success" && okResult.seriesCount === 1,
        JSON.stringify(okResult),
      );
    }

    // —— Lifecycle diagnostics history across transitions ——
    {
      const lifecycleDiagnostics = createLifecycleDiagnosticsReporter();
      const composition = composeEngine({
        lifecycle: { diagnostics: lifecycleDiagnostics },
      });
      setDefaultCompositionForTests(composition);

      await initializeApplication({ appId: "engine-10" });
      assertCase(
        "integration.lifecycle.init.phase",
        composition.lifecycleCoordinator.getPhase() === "ready",
        composition.lifecycleCoordinator.getPhase(),
      );

      await activateWorkspace({ workspaceId: "ws-engine-10" });
      assertCase(
        "integration.lifecycle.workspace.active",
        composition.lifecycleCoordinator.getActiveWorkspaceId() ===
          "ws-engine-10",
        composition.lifecycleCoordinator.getActiveWorkspaceId() ?? undefined,
      );

      // Force a recorded lifecycle failure (public LifecycleApi throws)
      let badWsCode: string | undefined;
      try {
        await activateWorkspace({ workspaceId: "" });
      } catch (err) {
        if (err instanceof LifecycleFlowError) {
          badWsCode = err.code;
        }
      }
      assertCase(
        "integration.lifecycle.badWs.code",
        badWsCode === LIFECYCLE_ERROR_CODES.INVALID_PAYLOAD,
        badWsCode,
      );

      await shutdownApplication({ reason: "engine-10-test" });
      assertCase(
        "integration.lifecycle.shutdown.phase",
        composition.lifecycleCoordinator.getPhase() === "shutdown",
        composition.lifecycleCoordinator.getPhase(),
      );

      const history = composition.lifecycleCoordinator.getDiagnosticsHistory();
      assertCase(
        "integration.lifecycle.diagnostics.present",
        history.length > 0 &&
          history.some((r) => r.operation === "initializeApplication") &&
          history.some((r) => r.operation === "shutdownApplication"),
        `count=${history.length}`,
      );
      assertCase(
        "integration.lifecycle.diagnostics.failureCode",
        history.some(
          (r) =>
            r.operation === "activateWorkspace" &&
            r.code === LIFECYCLE_ERROR_CODES.INVALID_PAYLOAD,
        ),
        JSON.stringify(history.filter((r) => r.code).map((r) => r.code)),
      );

      // Lifecycle Product Flows also leave workflow diagnostics when run via engine
      const wfInit = await composition.workflowEngine.run({
        workflowId: "initializeApplication",
        payload: { appId: "engine-10-wf" },
      });
      assertCase(
        "integration.lifecycle.workflowInit.ok",
        wfInit.ok === true,
        wfInit.error?.message,
      );
      assertCase(
        "integration.lifecycle.workflowDiagnostics",
        composition.diagnostics
          .getAllHistory()
          .some((r) => r.workflowId === "initializeApplication"),
      );
    }

    // —— Contracts consistency smoke (public surface shapes) ——
    {
      const composition = composeEngine();
      setDefaultCompositionForTests(composition);
      const created = await createProject({ name: "Contract Smoke" });
      assertCase(
        "contracts.workflowResponse.shape",
        created.ok === true &&
          typeof created.operationId === "string" &&
          created.state === "Completed" &&
          Array.isArray(created.stateHistory) &&
          Array.isArray(created.stagesCompleted),
      );
      const cmd = await executeCommand(PROJECT_CREATE_COMMAND_ID, {
        name: "Contract Cmd",
      });
      assertCase(
        "contracts.commandResult.shape",
        cmd.ok === true &&
          typeof cmd.operationId === "string" &&
          cmd.workflowId === "createProject" &&
          typeof cmd.diagnosticsRef === "string",
        JSON.stringify({
          operationId: cmd.operationId,
          workflowId: cmd.workflowId,
          diagnosticsRef: cmd.diagnosticsRef,
        }),
      );
    }
  } finally {
    setDefaultCompositionForTests(null);
  }

  return results;
};
