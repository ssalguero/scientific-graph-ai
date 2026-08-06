/**
 * ENGINE Domain — Register Import Dataset + Export Results Product Flows + business commands.
 * OWNERSHIP: ENGINE composition helper (flows layer).
 */

import type { ExportCoordinator } from "../coordination/export/ExportCoordinator";
import type { ImportCoordinator } from "../coordination/import/ImportCoordinator";
import type { CommandOrchestrator } from "../orchestration/interfaces";
import type { WorkflowEngine } from "../orchestration/interfaces";
import {
  createExportProjectFlow,
  createExportResultsAliasFlow,
  EXPORT_RESULTS_ALIAS_ID,
  FLOW_ID as EXPORT_PROJECT_FLOW_ID,
  PROJECT_EXPORT_COMMAND_ID,
} from "./export-results";
import {
  createImportDatasetFlow,
  DATASET_IMPORT_COMMAND_ID,
  FLOW_ID as IMPORT_DATASET_FLOW_ID,
} from "./import-dataset";

export type RegisterImportExportProductFlowsOptions = {
  readonly workflowEngine: WorkflowEngine;
  readonly commandOrchestrator: CommandOrchestrator;
  readonly importCoordinator: ImportCoordinator;
  readonly exportCoordinator: ExportCoordinator;
};

/**
 * Register Import Dataset + Export Results (exportProject) flows and business commands.
 * Also registers `exportResults` as an alias of `exportProject` (no extra public facade).
 */
export function registerImportExportProductFlows(
  options: RegisterImportExportProductFlowsOptions,
): void {
  const {
    workflowEngine,
    commandOrchestrator,
    importCoordinator,
    exportCoordinator,
  } = options;

  workflowEngine.register(createImportDatasetFlow(importCoordinator));
  workflowEngine.register(createExportProjectFlow(exportCoordinator));
  workflowEngine.register(createExportResultsAliasFlow(exportCoordinator));

  commandOrchestrator.registerHandler({
    id: DATASET_IMPORT_COMMAND_ID,
    workflowId: IMPORT_DATASET_FLOW_ID,
  });
  commandOrchestrator.registerHandler({
    id: PROJECT_EXPORT_COMMAND_ID,
    workflowId: EXPORT_PROJECT_FLOW_ID,
  });
}

export {
  DATASET_IMPORT_COMMAND_ID,
  EXPORT_PROJECT_FLOW_ID,
  EXPORT_RESULTS_ALIAS_ID,
  IMPORT_DATASET_FLOW_ID,
  PROJECT_EXPORT_COMMAND_ID,
};
