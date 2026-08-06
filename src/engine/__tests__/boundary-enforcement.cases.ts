/**
 * ENGINE Domain — Boundary enforcement unit cases (ENGINE-8).
 * Policy inventory + composition root + certified Product Flow registration.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

import { createAssertCase, type CaseResult } from "./run-assertions";

import {
  CERTIFIED_BUSINESS_COMMAND_IDS,
  CERTIFIED_INTERNAL_WORKFLOW_IDS,
  CERTIFIED_PUBLIC_LIFECYCLE_IDS,
  CERTIFIED_PUBLIC_WORKFLOW_IDS,
  FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS,
  LEGACY_ORCHESTRATION_ALLOWLIST,
} from "../internal/boundary-policy";
import {
  composeEngine,
  setDefaultCompositionForTests,
} from "../internal/compose";
import {
  APP_INITIALIZE_COMMAND_ID,
  APP_SHUTDOWN_COMMAND_ID,
  DOCUMENT_ACTIVATE_COMMAND_ID,
  WORKSPACE_ACTIVATE_COMMAND_ID,
} from "../flows/register-lifecycle-flows";
import {
  DATASET_IMPORT_COMMAND_ID,
  PROJECT_EXPORT_COMMAND_ID,
} from "../flows/register-import-export-flows";
import {
  PROJECT_CLOSE_COMMAND_ID,
  PROJECT_CREATE_COMMAND_ID,
  PROJECT_OPEN_COMMAND_ID,
  PROJECT_SAVE_COMMAND_ID,
} from "../flows/register-project-flows";
import {
  SESSION_AUTOSAVE_FLUSH_COMMAND_ID,
  SESSION_RESTORE_COMMAND_ID,
} from "../flows/register-session-flows";

const repoRoot = process.cwd();

export const runBoundaryEnforcementCaseSuite = async (): Promise<
  CaseResult[]
> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  setDefaultCompositionForTests(null);

  try {
    assertCase(
      "policy.workflows.count",
      CERTIFIED_PUBLIC_WORKFLOW_IDS.length === 6,
    );
    assertCase(
      "policy.lifecycle.count",
      CERTIFIED_PUBLIC_LIFECYCLE_IDS.length === 4,
    );
    assertCase(
      "policy.commands.count",
      CERTIFIED_BUSINESS_COMMAND_IDS.length === 12,
    );
    assertCase(
      "policy.forbiddenSymbols",
      FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS.includes("saveLocalProject") &&
        FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS.includes(
          "attemptExperimentalImport",
        ),
    );
    assertCase(
      "policy.allowlist.emptyAfterEngine9",
      LEGACY_ORCHESTRATION_ALLOWLIST.length === 0,
    );
    assertCase(
      "policy.allowlist.excludesPage",
      !(LEGACY_ORCHESTRATION_ALLOWLIST as readonly string[]).includes(
        "src/app/page.tsx",
      ),
    );
    assertCase(
      "policy.allowlist.excludesLocalActions",
      !(LEGACY_ORCHESTRATION_ALLOWLIST as readonly string[]).includes(
        "src/app/localProjectActions.ts",
      ),
    );

    for (const rel of LEGACY_ORCHESTRATION_ALLOWLIST as readonly string[]) {
      assertCase(
        `policy.allowlist.exists.${rel.replace(/[^\w]+/g, "_")}`,
        existsSync(join(repoRoot, rel)),
      );
    }

    assertCase(
      "policy.doc.exists",
      existsSync(join(repoRoot, "src/engine/BOUNDARY_ENFORCEMENT.md")),
    );

    const { workflowEngine, commandOrchestrator, lifecycleCoordinator } =
      composeEngine();

    for (const id of CERTIFIED_PUBLIC_WORKFLOW_IDS) {
      assertCase(`compose.hasWorkflow.${id}`, workflowEngine.has(id) === true);
    }

    for (const id of [
      "restoreSession",
      "sessionAutosaveFlush",
      "exportResults",
      ...CERTIFIED_PUBLIC_LIFECYCLE_IDS,
    ] as const) {
      assertCase(
        `compose.hasInternalWorkflow.${id}`,
        workflowEngine.has(id) === true,
      );
    }

    const expectedCommands = [
      PROJECT_CREATE_COMMAND_ID,
      PROJECT_OPEN_COMMAND_ID,
      PROJECT_SAVE_COMMAND_ID,
      PROJECT_CLOSE_COMMAND_ID,
      SESSION_RESTORE_COMMAND_ID,
      SESSION_AUTOSAVE_FLUSH_COMMAND_ID,
      DATASET_IMPORT_COMMAND_ID,
      PROJECT_EXPORT_COMMAND_ID,
      APP_INITIALIZE_COMMAND_ID,
      WORKSPACE_ACTIVATE_COMMAND_ID,
      DOCUMENT_ACTIVATE_COMMAND_ID,
      APP_SHUTDOWN_COMMAND_ID,
    ] as const;

    for (const id of expectedCommands) {
      assertCase(
        `compose.hasCommand.${id}`,
        commandOrchestrator.has?.(id) === true,
      );
    }

    assertCase(
      "compose.lifecycleCoordinator.present",
      typeof lifecycleCoordinator.initializeApplication === "function" &&
        typeof lifecycleCoordinator.shutdownApplication === "function",
    );

    assertCase(
      "policy.internalWorkflowIds.documented",
      CERTIFIED_INTERNAL_WORKFLOW_IDS.includes("restoreSession") &&
        CERTIFIED_INTERNAL_WORKFLOW_IDS.includes("initializeApplication"),
    );

    assertCase(
      "policy.commands.matchInventory",
      expectedCommands.every((id) =>
        (CERTIFIED_BUSINESS_COMMAND_IDS as readonly string[]).includes(id),
      ),
    );
  } finally {
    setDefaultCompositionForTests(null);
  }

  return results;
};
