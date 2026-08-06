/**
 * ENGINE Domain — Project Product Flow unit cases (ENGINE-4).
 * Create / open / save / close via WorkflowEngine + CommandOrchestrator + in-memory adapter.
 */

import { createAssertCase, type CaseResult } from "./run-assertions";

import { PROJECT_ERROR_CODES } from "../business/project/errors";
import {
  buildEmptyProjectCollectContext,
  createLocalProjectAdapter,
} from "../coordination/project";
import {
  PROJECT_CLOSE_COMMAND_ID,
  PROJECT_CREATE_COMMAND_ID,
  PROJECT_OPEN_COMMAND_ID,
  PROJECT_SAVE_COMMAND_ID,
} from "../flows/register-project-flows";
import {
  composeEngine,
  setDefaultCompositionForTests,
} from "../internal/compose";
import {
  closeProject,
  createProject,
  openProject,
  saveProject,
} from "../public/workflows";
import { executeCommand } from "../public/commands";

const EXPECTED_LIFECYCLE_SUCCESS = [
  "Requested",
  "Validated",
  "Prepared",
  "Executing",
  "Completed",
] as const;

export const runProjectProductFlowsCaseSuite = async (): Promise<
  CaseResult[]
> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  // Isolate public facade composition for this suite.
  const facadeComposition = composeEngine();
  setDefaultCompositionForTests(facadeComposition);

  try {
    // —— Register + has ——
    {
      const { workflowEngine, commandOrchestrator } = composeEngine();
      assertCase(
        "register.workflows",
        workflowEngine.has("createProject") &&
          workflowEngine.has("openProject") &&
          workflowEngine.has("saveProject") &&
          workflowEngine.has("closeProject"),
      );
      assertCase(
        "register.commands",
        commandOrchestrator.has?.(PROJECT_CREATE_COMMAND_ID) === true &&
          commandOrchestrator.has?.(PROJECT_OPEN_COMMAND_ID) === true &&
          commandOrchestrator.has?.(PROJECT_SAVE_COMMAND_ID) === true &&
          commandOrchestrator.has?.(PROJECT_CLOSE_COMMAND_ID) === true,
      );
    }

    // —— Create → Open → Save → Close round-trip (WorkflowEngine) ——
    {
      const { workflowEngine, projectEngine } = composeEngine();

      const created = await workflowEngine.run({
        workflowId: "createProject",
        payload: { name: "ENGINE-4 Alpha" },
      });
      assertCase("roundTrip.create.ok", created.ok === true, created.error?.message);
      assertCase(
        "roundTrip.create.state",
        created.state === "Completed",
        created.state,
      );
      assertCase(
        "roundTrip.create.lifecycle",
        Array.isArray(created.stateHistory) &&
          EXPECTED_LIFECYCLE_SUCCESS.every(
            (s, i) => created.stateHistory?.[i] === s,
          ),
        JSON.stringify(created.stateHistory),
      );

      const createResult = created.result as
        | { id: string; name: string }
        | undefined;
      assertCase(
        "roundTrip.create.result",
        !!createResult?.id && createResult.name === "ENGINE-4 Alpha",
        JSON.stringify(createResult),
      );
      assertCase(
        "roundTrip.create.active",
        projectEngine.getActiveProjectId() === createResult?.id,
        projectEngine.getActiveProjectId() ?? undefined,
      );

      const opened = await workflowEngine.run({
        workflowId: "openProject",
        payload: { id: createResult!.id },
      });
      assertCase("roundTrip.open.ok", opened.ok === true, opened.error?.message);
      const openResult = opened.result as
        | { id: string; name: string; patch: unknown }
        | undefined;
      assertCase(
        "roundTrip.open.result",
        openResult?.id === createResult!.id &&
          openResult?.name === "ENGINE-4 Alpha" &&
          openResult.patch != null,
        JSON.stringify(openResult),
      );

      const ctx = buildEmptyProjectCollectContext({
        id: createResult!.id,
        name: "ENGINE-4 Alpha Saved",
      });
      const saved = await workflowEngine.run({
        workflowId: "saveProject",
        payload: { projectName: "ENGINE-4 Alpha Saved", ctx },
      });
      assertCase("roundTrip.save.ok", saved.ok === true, saved.error?.message);
      const saveResult = saved.result as
        | { id: string; name: string }
        | undefined;
      assertCase(
        "roundTrip.save.result",
        saveResult?.id === createResult!.id &&
          saveResult?.name === "ENGINE-4 Alpha Saved",
        JSON.stringify(saveResult),
      );

      const closed = await workflowEngine.run({
        workflowId: "closeProject",
        payload: {},
      });
      assertCase("roundTrip.close.ok", closed.ok === true, closed.error?.message);
      const closeResult = closed.result as
        | { closedId: string | null }
        | undefined;
      assertCase(
        "roundTrip.close.result",
        closeResult?.closedId === createResult!.id,
        JSON.stringify(closeResult),
      );
      assertCase(
        "roundTrip.close.activeCleared",
        projectEngine.getActiveProjectId() === null,
      );
    }

    // —— Commands dispatch to flows ——
    {
      const { commandOrchestrator, projectEngine } = composeEngine();
      const created = await commandOrchestrator.execute(
        PROJECT_CREATE_COMMAND_ID,
        { name: "Cmd Project" },
      );
      assertCase("command.create.ok", created.ok === true, created.error);
      assertCase(
        "command.create.workflowId",
        created.workflowId === "createProject",
        created.workflowId,
      );
      const createResult = created.result as { id: string } | undefined;
      assertCase(
        "command.create.result",
        typeof createResult?.id === "string",
        JSON.stringify(createResult),
      );

      const opened = await commandOrchestrator.execute(PROJECT_OPEN_COMMAND_ID, {
        id: createResult!.id,
      });
      assertCase("command.open.ok", opened.ok === true, opened.error);
      assertCase(
        "command.open.workflowId",
        opened.workflowId === "openProject",
        opened.workflowId,
      );

      const closed = await commandOrchestrator.execute(
        PROJECT_CLOSE_COMMAND_ID,
        {},
      );
      assertCase("command.close.ok", closed.ok === true, closed.error);
      assertCase(
        "command.close.activeCleared",
        projectEngine.getActiveProjectId() === null,
      );
    }

    // —— Public facades ——
    {
      const created = await createProject({ name: "Facade Project" });
      assertCase("facade.create.ok", created.ok === true, created.error?.message);
      const id = (created.result as { id: string } | undefined)?.id;
      assertCase("facade.create.id", typeof id === "string", id);

      const opened = await openProject({ id });
      assertCase("facade.open.ok", opened.ok === true, opened.error?.message);

      const ctx = buildEmptyProjectCollectContext({
        id: id!,
        name: "Facade Project",
      });
      const saved = await saveProject({
        projectName: "Facade Project",
        ctx,
      });
      assertCase("facade.save.ok", saved.ok === true, saved.error?.message);

      const closed = await closeProject({});
      assertCase("facade.close.ok", closed.ok === true, closed.error?.message);

      const cmd = await executeCommand(PROJECT_CREATE_COMMAND_ID, {
        name: "Facade Cmd",
      });
      assertCase("facade.command.ok", cmd.ok === true, cmd.error);
    }

    // —— Fail paths ——
    {
      const { workflowEngine, commandOrchestrator } = composeEngine();

      const openMissing = await workflowEngine.run({
        workflowId: "openProject",
        payload: { id: "00000000-0000-4000-8000-000000000099" },
      });
      assertCase("fail.open.ok", openMissing.ok === false);
      assertCase(
        "fail.open.code",
        openMissing.error?.code === PROJECT_ERROR_CODES.NOT_FOUND,
        openMissing.error?.code,
      );

      const openBadPayload = await workflowEngine.run({
        workflowId: "openProject",
        payload: {},
      });
      assertCase("fail.open.payload.ok", openBadPayload.ok === false);
      assertCase(
        "fail.open.payload.code",
        openBadPayload.error?.code === PROJECT_ERROR_CODES.INVALID_PAYLOAD,
        openBadPayload.error?.code,
      );

      const saveBad = await workflowEngine.run({
        workflowId: "saveProject",
        payload: { projectName: "x" },
      });
      assertCase("fail.save.payload.ok", saveBad.ok === false);
      assertCase(
        "fail.save.payload.code",
        saveBad.error?.code === PROJECT_ERROR_CODES.INVALID_PAYLOAD,
        saveBad.error?.code,
      );

      const saveEmptyName = await workflowEngine.run({
        workflowId: "saveProject",
        payload: {
          projectName: "   ",
          ctx: buildEmptyProjectCollectContext(),
        },
      });
      assertCase("fail.save.emptyName.ok", saveEmptyName.ok === false);
      assertCase(
        "fail.save.emptyName.code",
        saveEmptyName.error?.code === PROJECT_ERROR_CODES.INVALID_PAYLOAD,
        saveEmptyName.error?.code,
      );

      // Mismatched close id
      const created = await workflowEngine.run({
        workflowId: "createProject",
        payload: { name: "Close Mismatch" },
      });
      assertCase("fail.close.setup.ok", created.ok === true, created.error?.message);
      const mismatch = await workflowEngine.run({
        workflowId: "closeProject",
        payload: { id: "other-id" },
      });
      assertCase("fail.close.mismatch.ok", mismatch.ok === false);
      assertCase(
        "fail.close.mismatch.code",
        mismatch.error?.code === PROJECT_ERROR_CODES.NO_ACTIVE,
        mismatch.error?.code,
      );

      const cmdFail = await commandOrchestrator.execute(
        PROJECT_OPEN_COMMAND_ID,
        { id: "missing-project-id" },
      );
      assertCase("fail.command.open.ok", cmdFail.ok === false);
      assertCase(
        "fail.command.open.code",
        cmdFail.errorCode === PROJECT_ERROR_CODES.NOT_FOUND,
        cmdFail.errorCode,
      );
    }

    // —— Idempotent close with no active project ——
    {
      const { workflowEngine, projectEngine } = composeEngine();
      const closed = await workflowEngine.run({
        workflowId: "closeProject",
        payload: {},
      });
      assertCase("close.idle.ok", closed.ok === true, closed.error?.message);
      assertCase(
        "close.idle.result",
        (closed.result as { closedId: string | null } | undefined)?.closedId ===
          null,
      );
      assertCase(
        "close.idle.active",
        projectEngine.getActiveProjectId() === null,
      );
    }

    // —— Shared adapter repo across create/open ——
    {
      const adapter = createLocalProjectAdapter();
      const composed = composeEngine({
        adapterOptions: { repo: adapter.getRepository() },
      });
      const created = await composed.workflowEngine.run({
        workflowId: "createProject",
        payload: { name: "Shared Repo" },
      });
      const id = (created.result as { id: string }).id;
      const composed2 = composeEngine({
        adapterOptions: { repo: adapter.getRepository() },
      });
      const opened = await composed2.workflowEngine.run({
        workflowId: "openProject",
        payload: { id },
      });
      assertCase(
        "sharedRepo.open.ok",
        opened.ok === true &&
          (opened.result as { name: string } | undefined)?.name ===
            "Shared Repo",
        opened.error?.message,
      );
    }
  } finally {
    setDefaultCompositionForTests(null);
  }

  return results;
};
