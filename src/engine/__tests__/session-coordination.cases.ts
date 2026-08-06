/**
 * ENGINE Domain — Session coordination unit cases (ENGINE-5).
 * Restore Session / save coordination / autosave flush via fake ports + WorkflowEngine.
 */

import { createAssertCase, type CaseResult } from "./run-assertions";

import { SESSION_ERROR_CODES } from "../coordination/session/errors";
import {
  createInjectableAutosavePort,
  createInjectableRestoreSessionPort,
  createInjectableSessionSavePort,
  createNoOpSessionPorts,
  type InjectableRestoreEngine,
} from "../coordination/session";
import {
  buildEmptyProjectCollectContext,
} from "../coordination/project";
import {
  SESSION_AUTOSAVE_FLUSH_COMMAND_ID,
  SESSION_RESTORE_COMMAND_ID,
} from "../flows/register-session-flows";
import {
  composeEngine,
  setDefaultCompositionForTests,
} from "../internal/compose";

const EXPECTED_LIFECYCLE_SUCCESS = [
  "Requested",
  "Validated",
  "Prepared",
  "Executing",
  "Completed",
] as const;

function createFakeRestoreEngine(
  mode: "success" | "fail" | "partial" = "success",
): InjectableRestoreEngine {
  return {
    restore(request) {
      const requested = request.records.length;
      if (mode === "fail") {
        return {
          status: "failed",
          statistics: {
            requested,
            restored: 0,
            skipped: 0,
            failed: requested || 1,
          },
          restoredIds: [],
          report: {
            errors: [{ kind: "ValidationFailure", message: "fake restore fail" }],
          },
        };
      }
      if (mode === "partial") {
        const restoredIds = ["session-partial-1"];
        for (const id of restoredIds) {
          request.registry.register({ id });
        }
        return {
          status: "partial",
          statistics: {
            requested: Math.max(requested, 2),
            restored: 1,
            skipped: 1,
            failed: 0,
          },
          restoredIds,
        };
      }
      const restoredIds = request.records.map((_, i) => `session-${i + 1}`);
      for (const id of restoredIds) {
        request.registry.register({ id });
      }
      return {
        status: "success",
        statistics: {
          requested,
          restored: restoredIds.length,
          skipped: 0,
          failed: 0,
        },
        restoredIds,
      };
    },
  };
}

function createFakeAutosaveController(options?: {
  readonly fail?: boolean;
}) {
  let flushCount = 0;
  return {
    flushCount: () => flushCount,
    async flush(): Promise<void> {
      if (options?.fail) {
        throw new Error("fake autosave flush boom");
      }
      flushCount += 1;
    },
  };
}

export const runSessionCoordinationCaseSuite = async (): Promise<
  CaseResult[]
> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  setDefaultCompositionForTests(null);

  try {
    // —— Register session workflows + commands ——
    {
      const { workflowEngine, commandOrchestrator } = composeEngine({
        session: { restoreEngine: createFakeRestoreEngine("success") },
      });
      assertCase(
        "register.workflows",
        workflowEngine.has("restoreSession") &&
          workflowEngine.has("sessionAutosaveFlush") &&
          workflowEngine.has("saveProject"),
      );
      assertCase(
        "register.commands",
        commandOrchestrator.has?.(SESSION_RESTORE_COMMAND_ID) === true &&
          commandOrchestrator.has?.(SESSION_AUTOSAVE_FLUSH_COMMAND_ID) ===
            true,
      );
    }

    // —— Restore success via WorkflowEngine ——
    {
      const fakeEngine = createFakeRestoreEngine("success");
      const { workflowEngine } = composeEngine({
        session: { restoreEngine: fakeEngine },
      });
      const registry = {
        registered: [] as unknown[],
        register(entry: unknown): boolean {
          this.registered.push(entry);
          return true;
        },
      };
      const restored = await workflowEngine.run({
        workflowId: "restoreSession",
        payload: {
          records: [{ id: "a" }, { id: "b" }],
          registry,
        },
      });
      assertCase("restore.ok", restored.ok === true, restored.error?.message);
      assertCase(
        "restore.state",
        restored.state === "Completed",
        restored.state,
      );
      assertCase(
        "restore.lifecycle",
        Array.isArray(restored.stateHistory) &&
          EXPECTED_LIFECYCLE_SUCCESS.every(
            (s, i) => restored.stateHistory?.[i] === s,
          ),
        JSON.stringify(restored.stateHistory),
      );
      const result = restored.result as
        | { status: string; restored: number; restoredIds: string[] }
        | undefined;
      assertCase(
        "restore.result",
        result?.status === "success" &&
          result.restored === 2 &&
          result.restoredIds.length === 2,
        JSON.stringify(result),
      );
      assertCase("restore.registryWrites", registry.registered.length === 2);
    }

    // —— Restore via CommandOrchestrator ——
    {
      const { commandOrchestrator } = composeEngine({
        session: { restoreEngine: createFakeRestoreEngine("success") },
      });
      const registry = {
        register(_entry: unknown): boolean {
          return true;
        },
      };
      const cmd = await commandOrchestrator.execute(SESSION_RESTORE_COMMAND_ID, {
        records: [{ id: "x" }],
        registry,
      });
      assertCase("command.restore.ok", cmd.ok === true, cmd.error);
      assertCase(
        "command.restore.workflowId",
        cmd.workflowId === "restoreSession",
        cmd.workflowId,
      );
    }

    // —— Restore fail ——
    {
      const { workflowEngine } = composeEngine({
        session: { restoreEngine: createFakeRestoreEngine("fail") },
      });
      const registry = {
        register(): boolean {
          return true;
        },
      };
      const failed = await workflowEngine.run({
        workflowId: "restoreSession",
        payload: { records: [{ id: "bad" }], registry },
      });
      assertCase("restore.fail.ok", failed.ok === false);
      assertCase(
        "restore.fail.code",
        failed.error?.code === SESSION_ERROR_CODES.RESTORE_FAILED,
        failed.error?.code,
      );
    }

    // —— Restore partial (does not throw) ——
    {
      const { workflowEngine } = composeEngine({
        session: { restoreEngine: createFakeRestoreEngine("partial") },
      });
      const registry = {
        register(): boolean {
          return true;
        },
      };
      const partial = await workflowEngine.run({
        workflowId: "restoreSession",
        payload: { records: [{}, {}], registry },
      });
      assertCase("restore.partial.ok", partial.ok === true, partial.error?.message);
      assertCase(
        "restore.partial.status",
        (partial.result as { status: string } | undefined)?.status === "partial",
      );
    }

    // —— Invalid restore payload ——
    {
      const { workflowEngine } = composeEngine({
        session: { restoreEngine: createFakeRestoreEngine("success") },
      });
      const bad = await workflowEngine.run({
        workflowId: "restoreSession",
        payload: { records: [] },
      });
      assertCase("restore.payload.ok", bad.ok === false);
      assertCase(
        "restore.payload.code",
        bad.error?.code === SESSION_ERROR_CODES.INVALID_PAYLOAD,
        bad.error?.code,
      );
    }

    // —— Autosave flush success ——
    {
      const controller = createFakeAutosaveController();
      const { workflowEngine, sessionCoordinator } = composeEngine({
        session: { autosaveController: controller },
      });
      assertCase(
        "autosave.status.available",
        sessionCoordinator.getAutosaveStatus().available === true,
      );
      const flushed = await workflowEngine.run({
        workflowId: "sessionAutosaveFlush",
        payload: {},
      });
      assertCase("autosave.flush.ok", flushed.ok === true, flushed.error?.message);
      assertCase("autosave.flush.count", controller.flushCount() === 1);
      assertCase(
        "autosave.status.flushCount",
        sessionCoordinator.getAutosaveStatus().flushCount === 1,
      );
    }

    // —— Autosave flush via command ——
    {
      const controller = createFakeAutosaveController();
      const { commandOrchestrator } = composeEngine({
        session: { autosaveController: controller },
      });
      const cmd = await commandOrchestrator.execute(
        SESSION_AUTOSAVE_FLUSH_COMMAND_ID,
        {},
      );
      assertCase("command.autosave.ok", cmd.ok === true, cmd.error);
      assertCase(
        "command.autosave.workflowId",
        cmd.workflowId === "sessionAutosaveFlush",
        cmd.workflowId,
      );
      assertCase("command.autosave.count", controller.flushCount() === 1);
    }

    // —— Autosave unavailable (no-op ports) ——
    {
      const { workflowEngine } = composeEngine();
      const unavailable = await workflowEngine.run({
        workflowId: "sessionAutosaveFlush",
        payload: {},
      });
      assertCase("autosave.unavailable.ok", unavailable.ok === false);
      assertCase(
        "autosave.unavailable.code",
        unavailable.error?.code === SESSION_ERROR_CODES.AUTOSAVE_UNAVAILABLE,
        unavailable.error?.code,
      );
    }

    // —— Autosave flush failure ——
    {
      const controller = createFakeAutosaveController({ fail: true });
      const { workflowEngine } = composeEngine({
        session: { autosaveController: controller },
      });
      const boom = await workflowEngine.run({
        workflowId: "sessionAutosaveFlush",
        payload: {},
      });
      assertCase("autosave.fail.ok", boom.ok === false);
      assertCase(
        "autosave.fail.code",
        boom.error?.code === SESSION_ERROR_CODES.AUTOSAVE_FLUSH_FAILED,
        boom.error?.code,
      );
    }

    // —— Save coordination dual-path (project save + session flush) ——
    {
      const controller = createFakeAutosaveController();
      const { workflowEngine, projectEngine } = composeEngine({
        session: {
          restoreEngine: createFakeRestoreEngine("success"),
          autosaveController: controller,
          enableFlushOnProjectSave: true,
        },
      });
      const created = await workflowEngine.run({
        workflowId: "createProject",
        payload: { name: "Session Save Dual" },
      });
      assertCase("saveCoord.create.ok", created.ok === true, created.error?.message);
      const id = (created.result as { id: string }).id;
      const ctx = buildEmptyProjectCollectContext({
        id,
        name: "Session Save Dual",
      });
      const saved = await workflowEngine.run({
        workflowId: "saveProject",
        payload: { projectName: "Session Save Dual", ctx },
      });
      assertCase("saveCoord.save.ok", saved.ok === true, saved.error?.message);
      const saveResult = saved.result as
        | {
            id: string;
            name: string;
            sessionCoordination?: {
              coordinated: boolean;
              flushedAutosave: boolean;
            };
          }
        | undefined;
      assertCase(
        "saveCoord.save.id",
        saveResult?.id === id && saveResult?.name === "Session Save Dual",
        JSON.stringify(saveResult),
      );
      assertCase(
        "saveCoord.session",
        saveResult?.sessionCoordination?.coordinated === true &&
          saveResult?.sessionCoordination?.flushedAutosave === true,
        JSON.stringify(saveResult?.sessionCoordination),
      );
      assertCase("saveCoord.flush.count", controller.flushCount() === 1);
      assertCase(
        "saveCoord.active",
        projectEngine.getActiveProjectId() === id,
      );
    }

    // —— Save without autosave still succeeds (no-op session save port) ——
    {
      const { workflowEngine } = composeEngine({
        session: { ports: createNoOpSessionPorts() },
      });
      const created = await workflowEngine.run({
        workflowId: "createProject",
        payload: { name: "No Session Flush" },
      });
      const id = (created.result as { id: string }).id;
      const ctx = buildEmptyProjectCollectContext({
        id,
        name: "No Session Flush",
      });
      const saved = await workflowEngine.run({
        workflowId: "saveProject",
        payload: { projectName: "No Session Flush", ctx },
      });
      assertCase("saveNoop.ok", saved.ok === true, saved.error?.message);
      const saveResult = saved.result as
        | {
            sessionCoordination?: {
              coordinated: boolean;
              flushedAutosave: boolean;
            };
          }
        | undefined;
      assertCase(
        "saveNoop.session",
        saveResult?.sessionCoordination?.coordinated === false &&
          saveResult?.sessionCoordination?.flushedAutosave === false,
        JSON.stringify(saveResult?.sessionCoordination),
      );
    }

    // —— Injectable port unit (direct) ——
    {
      const restore = createInjectableRestoreSessionPort(
        createFakeRestoreEngine("success"),
      );
      const registry = {
        register(): boolean {
          return true;
        },
      };
      const out = await restore.restore({
        records: [{}],
        registry,
      });
      assertCase("injectable.restore", out.status === "success" && out.restored === 1);

      const controller = createFakeAutosaveController();
      const autosave = createInjectableAutosavePort(controller);
      await autosave.requestFlush();
      assertCase(
        "injectable.autosave",
        autosave.getStatus().available && autosave.getStatus().flushCount === 1,
      );

      const save = createInjectableSessionSavePort({ autosave });
      const coord = await save.coordinateSave({
        projectName: "x",
        reason: "explicit",
      });
      assertCase(
        "injectable.save",
        coord.coordinated && coord.flushedAutosave && controller.flushCount() === 2,
      );
    }

    // —— Prior project flows still registered on default compose ——
    {
      const { workflowEngine, commandOrchestrator } = composeEngine();
      assertCase(
        "regression.project.workflows",
        workflowEngine.has("createProject") &&
          workflowEngine.has("openProject") &&
          workflowEngine.has("saveProject") &&
          workflowEngine.has("closeProject"),
      );
      assertCase(
        "regression.project.commands",
        commandOrchestrator.has?.("project.create") === true &&
          commandOrchestrator.has?.("project.save") === true,
      );
    }
  } finally {
    setDefaultCompositionForTests(null);
  }

  return results;
};
