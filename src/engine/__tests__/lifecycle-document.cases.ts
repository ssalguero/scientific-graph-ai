/**
 * ENGINE Domain — Document Engine + Lifecycle Coordinator unit cases (ENGINE-7).
 * Register/activate documents; init → workspace → document → shutdown sequence;
 * commands + public facades; fail paths via fake Platform ports.
 */

import { createAssertCase, type CaseResult } from "./run-assertions";

import {
  DOCUMENT_ERROR_CODES,
  createDocumentEngine,
} from "../business/document";
import {
  APP_INITIALIZE_COMMAND_ID,
  APP_SHUTDOWN_COMMAND_ID,
  DOCUMENT_ACTIVATE_COMMAND_ID,
  WORKSPACE_ACTIVATE_COMMAND_ID,
} from "../flows/register-lifecycle-flows";
import {
  composeEngine,
  setDefaultCompositionForTests,
} from "../internal/compose";
import {
  LIFECYCLE_ERROR_CODES,
} from "../orchestration/lifecycle-errors";
import {
  activateDocument,
  activateWorkspace,
  initializeApplication,
  shutdownApplication,
} from "../public/lifecycle";
import { executeCommand } from "../public/commands";

const EXPECTED_LIFECYCLE_SUCCESS = [
  "Requested",
  "Validated",
  "Prepared",
  "Executing",
  "Completed",
] as const;

export const runLifecycleUnitCaseSuite = async (): Promise<CaseResult[]> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  setDefaultCompositionForTests(null);

  try {
    // —— Document Engine register / activate ——
    {
      const engine = createDocumentEngine();
      const registered = await engine.register({
        id: "doc-1",
        title: "Lab Notebook",
        kind: "notebook",
      });
      assertCase(
        "document.register.creates",
        registered.created === true && registered.document.id === "doc-1",
        registered.document.id,
      );

      const again = await engine.register({ id: "doc-1", title: "Other" });
      assertCase(
        "document.register.idempotent",
        again.created === false && again.document.title === "Lab Notebook",
        again.document.title,
      );

      const activated = await engine.activate({ id: "doc-1" });
      assertCase(
        "document.activate.setsActive",
        engine.getActiveDocumentId() === "doc-1" &&
          activated.previousActiveId === null,
        String(engine.getActiveDocumentId()),
      );

      await engine.activate({
        id: "doc-2",
        registerIfMissing: true,
        title: "Auto",
      });
      assertCase(
        "document.activate.registerIfMissing",
        engine.getActiveDocumentId() === "doc-2" &&
          engine.getDocument("doc-2")?.title === "Auto",
        String(engine.getActiveDocumentId()),
      );

      let missingCode: string | null = null;
      try {
        await engine.activate({ id: "missing", registerIfMissing: false });
      } catch (err) {
        missingCode =
          err instanceof Error && "code" in err
            ? String((err as { code: string }).code)
            : null;
      }
      assertCase(
        "document.activate.notFound",
        missingCode === DOCUMENT_ERROR_CODES.NOT_FOUND,
        missingCode ?? "no-error",
      );

      let invalidCode: string | null = null;
      try {
        await engine.register({ id: "  " });
      } catch (err) {
        invalidCode =
          err instanceof Error && "code" in err
            ? String((err as { code: string }).code)
            : null;
      }
      assertCase(
        "document.register.invalidPayload",
        invalidCode === DOCUMENT_ERROR_CODES.INVALID_PAYLOAD,
        invalidCode ?? "no-error",
      );

      await engine.deactivate({});
      assertCase(
        "document.deactivate.clearsActive",
        engine.getActiveDocumentId() === null,
        String(engine.getActiveDocumentId()),
      );

      engine.clear();
      assertCase(
        "document.clear.emptiesRegistry",
        engine.listDocuments().length === 0,
        String(engine.listDocuments().length),
      );
    }

    // —— Lifecycle registration (workflows + commands) ——
    {
      const { workflowEngine, commandOrchestrator } = composeEngine();
      for (const id of [
        "initializeApplication",
        "activateWorkspace",
        "activateDocument",
        "shutdownApplication",
      ] as const) {
        assertCase(
          `lifecycle.workflow.registered.${id}`,
          workflowEngine.has(id),
          id,
        );
      }
      for (const id of [
        APP_INITIALIZE_COMMAND_ID,
        WORKSPACE_ACTIVATE_COMMAND_ID,
        DOCUMENT_ACTIVATE_COMMAND_ID,
        APP_SHUTDOWN_COMMAND_ID,
      ] as const) {
        assertCase(
          `lifecycle.command.registered.${id}`,
          commandOrchestrator.has?.(id) === true,
          id,
        );
      }
    }

    // —— Full sequence via LifecycleCoordinator + fake ports ——
    {
      const events: string[] = [];
      const composition = composeEngine({
        lifecycle: {
          runtimeHooks: {
            onInitialized: () => {
              events.push("runtime.init");
              return { notified: true };
            },
            onShutdown: () => {
              events.push("runtime.shutdown");
              return { notified: true };
            },
          },
          workspaceHooks: {
            prepare: () => {
              events.push("workspace.prepare");
            },
            activate: (input) => {
              events.push(`workspace.activate:${input.workspaceId}`);
              return { workspaceId: input.workspaceId, activated: true };
            },
            clear: () => {
              events.push("workspace.clear");
            },
          },
          windowsHooks: {
            onDocumentActivated: (input) => {
              events.push(`windows.doc:${input.documentId}`);
              return { notified: true };
            },
            onDocumentDeactivated: (id) => {
              events.push(`windows.deact:${id}`);
              return { notified: true };
            },
          },
          sessionShutdown: {
            prepareShutdown: () => {
              events.push("session.prepareShutdown");
            },
          },
        },
      });

      const lc = composition.lifecycleCoordinator;
      assertCase(
        "lifecycle.phase.startsUninitialized",
        lc.getPhase() === "uninitialized",
        lc.getPhase(),
      );

      await lc.initializeApplication({ appId: "test-app" });
      assertCase(
        "lifecycle.init.ready",
        lc.getPhase() === "ready",
        lc.getPhase(),
      );
      assertCase(
        "lifecycle.init.notifiesRuntimeAndWorkspace",
        events.includes("runtime.init") &&
          events.includes("workspace.prepare"),
        events.join(","),
      );

      await lc.activateWorkspace({ workspaceId: "ws-main" });
      assertCase(
        "lifecycle.workspace.active",
        lc.getActiveWorkspaceId() === "ws-main",
        String(lc.getActiveWorkspaceId()),
      );

      await lc.activateDocument({
        id: "doc-seq",
        title: "Sequence Doc",
        registerIfMissing: true,
      });
      assertCase(
        "lifecycle.document.active",
        composition.documentEngine.getActiveDocumentId() === "doc-seq",
        String(composition.documentEngine.getActiveDocumentId()),
      );
      assertCase(
        "lifecycle.document.notifiesWindows",
        events.includes("windows.doc:doc-seq"),
        events.join(","),
      );

      const diag = lc.getDiagnosticsHistory();
      assertCase(
        "lifecycle.diagnostics.recorded",
        diag.length >= 4 &&
          diag.some((d) => d.operation === "initializeApplication") &&
          diag.some((d) => d.operation === "activateDocument"),
        String(diag.length),
      );

      await lc.shutdownApplication({ reason: "test-done" });
      assertCase(
        "lifecycle.shutdown.phase",
        lc.getPhase() === "shutdown",
        lc.getPhase(),
      );
      assertCase(
        "lifecycle.shutdown.clearsEngineState",
        lc.getActiveWorkspaceId() === null &&
          composition.documentEngine.getActiveDocumentId() === null &&
          composition.documentEngine.listDocuments().length === 0,
        "cleared",
      );
      assertCase(
        "lifecycle.shutdown.notifiesPorts",
        events.includes("runtime.shutdown") &&
          events.includes("workspace.clear") &&
          events.includes("session.prepareShutdown"),
        events.join(","),
      );

      // Idempotent shutdown
      await lc.shutdownApplication();
      assertCase(
        "lifecycle.shutdown.idempotent",
        lc.getPhase() === "shutdown",
        lc.getPhase(),
      );

      // Re-init after shutdown
      await lc.initializeApplication({ appId: "reopen" });
      assertCase(
        "lifecycle.reinit.afterShutdown",
        lc.getPhase() === "ready",
        lc.getPhase(),
      );
      await lc.shutdownApplication();
    }

    // —— WorkflowEngine sequence ——
    {
      const { workflowEngine, lifecycleCoordinator, documentEngine } =
        composeEngine();

      const init = await workflowEngine.run({
        workflowId: "initializeApplication",
        payload: { appId: "wf-app" },
      });
      assertCase(
        "lifecycle.workflow.init.ok",
        init.ok === true &&
          JSON.stringify(init.stateHistory) ===
            JSON.stringify(EXPECTED_LIFECYCLE_SUCCESS),
        init.error?.code,
      );

      const ws = await workflowEngine.run({
        workflowId: "activateWorkspace",
        payload: { workspaceId: "wf-ws" },
      });
      assertCase(
        "lifecycle.workflow.workspace.ok",
        ws.ok === true &&
          lifecycleCoordinator.getActiveWorkspaceId() === "wf-ws",
        ws.error?.code,
      );

      const doc = await workflowEngine.run({
        workflowId: "activateDocument",
        payload: { id: "wf-doc", title: "WF Doc" },
      });
      assertCase(
        "lifecycle.workflow.document.ok",
        doc.ok === true && documentEngine.getActiveDocumentId() === "wf-doc",
        doc.error?.code,
      );

      const shutdown = await workflowEngine.run({
        workflowId: "shutdownApplication",
        payload: { reason: "wf-done" },
      });
      assertCase(
        "lifecycle.workflow.shutdown.ok",
        shutdown.ok === true &&
          lifecycleCoordinator.getPhase() === "shutdown",
        shutdown.error?.code,
      );
    }

    // —— Commands ——
    {
      setDefaultCompositionForTests(null);
      const composition = composeEngine();
      setDefaultCompositionForTests(composition);

      const initCmd = await executeCommand(APP_INITIALIZE_COMMAND_ID, {
        appId: "cmd-app",
      });
      assertCase(
        "lifecycle.command.init.ok",
        initCmd.ok === true && initCmd.workflowId === "initializeApplication",
        initCmd.errorCode,
      );

      const wsCmd = await executeCommand(WORKSPACE_ACTIVATE_COMMAND_ID, {
        workspaceId: "cmd-ws",
      });
      assertCase(
        "lifecycle.command.workspace.ok",
        wsCmd.ok === true,
        wsCmd.errorCode,
      );

      const docCmd = await executeCommand(DOCUMENT_ACTIVATE_COMMAND_ID, {
        documentId: "cmd-doc",
        title: "Cmd Doc",
      });
      assertCase(
        "lifecycle.command.document.ok",
        docCmd.ok === true &&
          composition.documentEngine.getActiveDocumentId() === "cmd-doc",
        docCmd.errorCode,
      );

      const shutCmd = await executeCommand(APP_SHUTDOWN_COMMAND_ID, {
        reason: "cmd-done",
      });
      assertCase(
        "lifecycle.command.shutdown.ok",
        shutCmd.ok === true &&
          composition.lifecycleCoordinator.getPhase() === "shutdown",
        shutCmd.errorCode,
      );

      setDefaultCompositionForTests(null);
    }

    // —— Public facades ——
    {
      setDefaultCompositionForTests(null);
      const composition = composeEngine();
      setDefaultCompositionForTests(composition);

      await initializeApplication({ appId: "public-app" });
      assertCase(
        "lifecycle.public.init",
        composition.lifecycleCoordinator.getPhase() === "ready",
        composition.lifecycleCoordinator.getPhase(),
      );

      await activateWorkspace({ workspaceId: "public-ws" });
      assertCase(
        "lifecycle.public.workspace",
        composition.lifecycleCoordinator.getActiveWorkspaceId() === "public-ws",
        String(composition.lifecycleCoordinator.getActiveWorkspaceId()),
      );

      await activateDocument({ id: "public-doc", title: "Public" });
      assertCase(
        "lifecycle.public.document",
        composition.documentEngine.getActiveDocumentId() === "public-doc",
        String(composition.documentEngine.getActiveDocumentId()),
      );

      await shutdownApplication({ reason: "public-done" });
      assertCase(
        "lifecycle.public.shutdown",
        composition.lifecycleCoordinator.getPhase() === "shutdown",
        composition.lifecycleCoordinator.getPhase(),
      );

      setDefaultCompositionForTests(null);
    }

    // —— Fail paths ——
    {
      const { workflowEngine, lifecycleCoordinator } = composeEngine();

      const beforeInit = await workflowEngine.run({
        workflowId: "activateWorkspace",
        payload: { workspaceId: "too-early" },
      });
      assertCase(
        "lifecycle.fail.activateBeforeInit",
        beforeInit.ok === false &&
          beforeInit.error?.code === LIFECYCLE_ERROR_CODES.NOT_READY,
        beforeInit.error?.code,
      );

      await lifecycleCoordinator.initializeApplication({});
      const doubleInit = await workflowEngine.run({
        workflowId: "initializeApplication",
        payload: {},
      });
      assertCase(
        "lifecycle.fail.doubleInit",
        doubleInit.ok === false &&
          doubleInit.error?.code === LIFECYCLE_ERROR_CODES.ALREADY_INITIALIZED,
        doubleInit.error?.code,
      );

      const badWs = await workflowEngine.run({
        workflowId: "activateWorkspace",
        payload: { workspaceId: "" },
      });
      assertCase(
        "lifecycle.fail.workspaceEmptyId",
        badWs.ok === false &&
          badWs.error?.code === LIFECYCLE_ERROR_CODES.INVALID_PAYLOAD,
        badWs.error?.code,
      );

      const badDoc = await workflowEngine.run({
        workflowId: "activateDocument",
        payload: {},
      });
      assertCase(
        "lifecycle.fail.documentMissingId",
        badDoc.ok === false &&
          badDoc.error?.code === LIFECYCLE_ERROR_CODES.INVALID_PAYLOAD,
        badDoc.error?.code,
      );

      // Document not found when registerIfMissing explicitly false
      const missingDoc = await workflowEngine.run({
        workflowId: "activateDocument",
        payload: { id: "nope", registerIfMissing: false },
      });
      assertCase(
        "lifecycle.fail.documentNotFound",
        missingDoc.ok === false &&
          missingDoc.error?.code === DOCUMENT_ERROR_CODES.NOT_FOUND,
        missingDoc.error?.code,
      );

      // Workspace activate port failure
      const boomComposition = composeEngine({
        lifecycle: {
          workspaceHooks: {
            activate: () => {
              throw new Error("workspace boom");
            },
          },
        },
      });
      await boomComposition.lifecycleCoordinator.initializeApplication({});
      const boomWs = await boomComposition.workflowEngine.run({
        workflowId: "activateWorkspace",
        payload: { workspaceId: "x" },
      });
      assertCase(
        "lifecycle.fail.workspacePortThrows",
        boomWs.ok === false &&
          boomWs.error?.code ===
            LIFECYCLE_ERROR_CODES.WORKSPACE_ACTIVATE_FAILED,
        boomWs.error?.code,
      );

      // Runtime init failure
      const initBoom = composeEngine({
        lifecycle: {
          runtimeHooks: {
            onInitialized: () => {
              throw new Error("runtime boom");
            },
          },
        },
      });
      const initFail = await initBoom.workflowEngine.run({
        workflowId: "initializeApplication",
        payload: {},
      });
      assertCase(
        "lifecycle.fail.runtimeInitThrows",
        initFail.ok === false &&
          initFail.error?.code === LIFECYCLE_ERROR_CODES.INIT_FAILED &&
          initBoom.lifecycleCoordinator.getPhase() === "uninitialized",
        initFail.error?.code,
      );

      // Invalid payload type
      const badPayload = await workflowEngine.run({
        workflowId: "initializeApplication",
        // Already initialized on first composition — use fresh
        payload: "not-an-object",
      });
      // First composition is already ready; use fresh for invalid payload on init
      const fresh = composeEngine();
      const badPayloadFresh = await fresh.workflowEngine.run({
        workflowId: "initializeApplication",
        payload: "not-an-object",
      });
      assertCase(
        "lifecycle.fail.invalidPayloadType",
        badPayloadFresh.ok === false &&
          badPayloadFresh.error?.code === LIFECYCLE_ERROR_CODES.INVALID_PAYLOAD,
        badPayloadFresh.error?.code,
      );
      void badPayload;
    }

    // —— Default composition uses no-op ports (no throw) ——
    {
      const { lifecycleCoordinator } = composeEngine();
      await lifecycleCoordinator.initializeApplication();
      await lifecycleCoordinator.activateWorkspace({ workspaceId: "default-ws" });
      await lifecycleCoordinator.activateDocument({ id: "default-doc" });
      await lifecycleCoordinator.shutdownApplication();
      assertCase(
        "lifecycle.default.noopPortsSequence",
        lifecycleCoordinator.getPhase() === "shutdown",
        lifecycleCoordinator.getPhase(),
      );
    }
  } finally {
    setDefaultCompositionForTests(null);
  }

  return results;
};
