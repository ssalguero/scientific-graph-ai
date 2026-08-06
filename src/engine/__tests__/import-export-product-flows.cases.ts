/**
 * ENGINE Domain — Import / Export Product Flow unit cases (ENGINE-6).
 * Fake ports + WorkflowEngine / CommandOrchestrator / public facades.
 */

import { createAssertCase, type CaseResult } from "./run-assertions";

import { EXPORT_ERROR_CODES, ExportFlowError } from "../coordination/export/errors";
import type { ExportPort } from "../coordination/export/ports";
import type {
  ExportProjectInput,
  ExportProjectResult,
} from "../coordination/export/types";
import { IMPORT_ERROR_CODES } from "../coordination/import/errors";
import type { ImportPort } from "../coordination/import/ports";
import type {
  ImportDatasetInput,
  ImportDatasetResult,
} from "../coordination/import/types";
import {
  DATASET_IMPORT_COMMAND_ID,
  PROJECT_EXPORT_COMMAND_ID,
} from "../flows/register-import-export-flows";
import {
  composeEngine,
  setDefaultCompositionForTests,
} from "../internal/compose";
import { exportProject, importDataset } from "../public/workflows";
import { executeCommand } from "../public/commands";

const EXPECTED_LIFECYCLE_SUCCESS = [
  "Requested",
  "Validated",
  "Prepared",
  "Executing",
  "Completed",
] as const;

function createFakeImportPort(
  mode: "success" | "wizard" | "error" | "throw" = "success",
): ImportPort {
  return {
    async attemptImport(
      _input: ImportDatasetInput,
    ): Promise<ImportDatasetResult> {
      if (mode === "throw") {
        throw new Error("fake import boom");
      }
      if (mode === "error") {
        return { kind: "error", message: "fake unsupported format" };
      }
      if (mode === "wizard") {
        return {
          kind: "wizard",
          reason: "Workbook requires wizard",
          sheetCount: 2,
          recommendedSheetName: "Data",
          analysis: { sheets: ["Data", "Meta"] },
        };
      }
      return {
        kind: "success",
        seriesCount: 1,
        fileName: "sample.csv",
        series: [{ id: "s1", name: "S1", points: [], color: "#000" }],
      };
    },
  };
}

function createFakeExportPort(
  mode: "success" | "not_found" | "throw" = "success",
): ExportPort {
  return {
    async exportProject(
      input: ExportProjectInput,
    ): Promise<ExportProjectResult> {
      if (mode === "throw") {
        throw new Error("fake export boom");
      }
      if (mode === "not_found") {
        throw new ExportFlowError(
          EXPORT_ERROR_CODES.NOT_FOUND,
          "fake project not found",
        );
      }
      if ("mode" in input && input.mode === "payload") {
        return {
          format: "payload",
          json: input.json,
          projectId: input.projectId,
          byteLength: input.json.length,
        };
      }
      const json = `{"id":"${input.projectId}","kind":"sgproj-fake"}`;
      return {
        format: "sgproj",
        json,
        projectId: input.projectId,
        byteLength: json.length,
      };
    },
  };
}

export const runImportExportProductFlowsCaseSuite = async (): Promise<
  CaseResult[]
> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  setDefaultCompositionForTests(null);

  try {
    // —— Register workflows + commands ——
    {
      const { workflowEngine, commandOrchestrator } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      assertCase(
        "register.workflows",
        workflowEngine.has("importDataset") &&
          workflowEngine.has("exportProject") &&
          workflowEngine.has("exportResults"),
      );
      assertCase(
        "register.commands",
        commandOrchestrator.has?.(DATASET_IMPORT_COMMAND_ID) === true &&
          commandOrchestrator.has?.(PROJECT_EXPORT_COMMAND_ID) === true,
      );
      assertCase(
        "register.prior.project",
        workflowEngine.has("createProject") &&
          workflowEngine.has("saveProject"),
      );
      assertCase(
        "register.prior.session",
        workflowEngine.has("restoreSession"),
      );
    }

    // —— Import success via WorkflowEngine ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      const imported = await workflowEngine.run({
        workflowId: "importDataset",
        payload: { sourceId: "csv", file: { name: "a.csv" } },
      });
      assertCase("import.ok", imported.ok === true, imported.error?.message);
      assertCase("import.state", imported.state === "Completed", imported.state);
      assertCase(
        "import.lifecycle",
        Array.isArray(imported.stateHistory) &&
          EXPECTED_LIFECYCLE_SUCCESS.every(
            (s, i) => imported.stateHistory?.[i] === s,
          ),
        JSON.stringify(imported.stateHistory),
      );
      const result = imported.result as ImportDatasetResult | undefined;
      assertCase(
        "import.result.success",
        result?.kind === "success" && result.seriesCount === 1,
        JSON.stringify(result),
      );
    }

    // —— Import wizard outcome (Completed, not Failed) ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("wizard") },
        export: { port: createFakeExportPort("success") },
      });
      const imported = await workflowEngine.run({
        workflowId: "importDataset",
        payload: { sourceId: "xlsx", file: { name: "book.xlsx" } },
      });
      assertCase("import.wizard.ok", imported.ok === true);
      const result = imported.result as ImportDatasetResult | undefined;
      assertCase(
        "import.wizard.kind",
        result?.kind === "wizard" && result.sheetCount === 2,
        JSON.stringify(result),
      );
    }

    // —— Import business error outcome (Completed with kind=error) ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("error") },
        export: { port: createFakeExportPort("success") },
      });
      const imported = await workflowEngine.run({
        workflowId: "importDataset",
        payload: { sourceId: "csv", file: { name: "bad.bin" } },
      });
      assertCase("import.errorOutcome.ok", imported.ok === true);
      const result = imported.result as ImportDatasetResult | undefined;
      assertCase(
        "import.errorOutcome.kind",
        result?.kind === "error" &&
          typeof result.message === "string" &&
          result.message.length > 0,
        JSON.stringify(result),
      );
    }

    // —— Import invalid payload ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      const missingFile = await workflowEngine.run({
        workflowId: "importDataset",
        payload: { sourceId: "csv" },
      });
      assertCase("import.invalid.ok", missingFile.ok === false);
      assertCase(
        "import.invalid.code",
        missingFile.error?.code === IMPORT_ERROR_CODES.INVALID_PAYLOAD,
        missingFile.error?.code,
      );
    }

    // —— Import via CommandOrchestrator ——
    {
      const { commandOrchestrator } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      const cmd = await commandOrchestrator.execute(DATASET_IMPORT_COMMAND_ID, {
        sourceId: "csv",
        file: { name: "cmd.csv" },
      });
      assertCase("command.import.ok", cmd.ok === true, cmd.error);
      assertCase(
        "command.import.workflowId",
        cmd.workflowId === "importDataset",
        cmd.workflowId,
      );
    }

    // —— Export success via WorkflowEngine ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      const exported = await workflowEngine.run({
        workflowId: "exportProject",
        payload: { projectId: "proj-1" },
      });
      assertCase("export.ok", exported.ok === true, exported.error?.message);
      assertCase("export.state", exported.state === "Completed", exported.state);
      assertCase(
        "export.lifecycle",
        Array.isArray(exported.stateHistory) &&
          EXPECTED_LIFECYCLE_SUCCESS.every(
            (s, i) => exported.stateHistory?.[i] === s,
          ),
        JSON.stringify(exported.stateHistory),
      );
      const result = exported.result as ExportProjectResult | undefined;
      assertCase(
        "export.result",
        result?.format === "sgproj" &&
          result.projectId === "proj-1" &&
          typeof result.json === "string" &&
          result.byteLength > 0,
        JSON.stringify(result),
      );
    }

    // —— Export Results alias (exportResults) ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      const aliased = await workflowEngine.run({
        workflowId: "exportResults",
        payload: { projectId: "proj-alias" },
      });
      assertCase("export.alias.ok", aliased.ok === true, aliased.error?.message);
      const result = aliased.result as ExportProjectResult | undefined;
      assertCase(
        "export.alias.result",
        result?.projectId === "proj-alias",
        JSON.stringify(result),
      );
    }

    // —— Export payload mode ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      const json = '{"hello":"world"}';
      const exported = await workflowEngine.run({
        workflowId: "exportProject",
        payload: { mode: "payload", json, projectId: "p-payload" },
      });
      assertCase("export.payload.ok", exported.ok === true);
      const result = exported.result as ExportProjectResult | undefined;
      assertCase(
        "export.payload.result",
        result?.format === "payload" &&
          result.json === json &&
          result.byteLength === json.length,
        JSON.stringify(result),
      );
    }

    // —— Export not found ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("not_found") },
      });
      const exported = await workflowEngine.run({
        workflowId: "exportProject",
        payload: { projectId: "missing" },
      });
      assertCase("export.notFound.ok", exported.ok === false);
      assertCase(
        "export.notFound.code",
        exported.error?.code === EXPORT_ERROR_CODES.NOT_FOUND,
        exported.error?.code,
      );
    }

    // —— Export invalid payload ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      const missing = await workflowEngine.run({
        workflowId: "exportProject",
        payload: {},
      });
      assertCase("export.invalid.ok", missing.ok === false);
      assertCase(
        "export.invalid.code",
        missing.error?.code === EXPORT_ERROR_CODES.INVALID_PAYLOAD,
        missing.error?.code,
      );
    }

    // —— Export via CommandOrchestrator ——
    {
      const { commandOrchestrator } = composeEngine({
        import: { port: createFakeImportPort("success") },
        export: { port: createFakeExportPort("success") },
      });
      const cmd = await commandOrchestrator.execute(PROJECT_EXPORT_COMMAND_ID, {
        projectId: "cmd-export",
      });
      assertCase("command.export.ok", cmd.ok === true, cmd.error);
      assertCase(
        "command.export.workflowId",
        cmd.workflowId === "exportProject",
        cmd.workflowId,
      );
    }

    // —— Public facades with composed engines ——
    {
      setDefaultCompositionForTests(
        composeEngine({
          import: { port: createFakeImportPort("success") },
          export: { port: createFakeExportPort("success") },
        }),
      );
      const imported = await importDataset({
        sourceId: "csv",
        file: { name: "public.csv" },
      });
      assertCase("public.importDataset.ok", imported.ok === true);
      const exported = await exportProject({ projectId: "public-proj" });
      assertCase("public.exportProject.ok", exported.ok === true);
      const cmdImport = await executeCommand(DATASET_IMPORT_COMMAND_ID, {
        sourceId: "csv",
        file: { name: "pub-cmd.csv" },
      });
      assertCase("public.executeCommand.import.ok", cmdImport.ok === true);
      const cmdExport = await executeCommand(PROJECT_EXPORT_COMMAND_ID, {
        projectId: "pub-cmd-export",
      });
      assertCase("public.executeCommand.export.ok", cmdExport.ok === true);
    }

    // —— Port throw maps to execution failed ——
    {
      const { workflowEngine } = composeEngine({
        import: { port: createFakeImportPort("throw") },
        export: { port: createFakeExportPort("throw") },
      });
      const imported = await workflowEngine.run({
        workflowId: "importDataset",
        payload: { sourceId: "csv", file: { name: "x.csv" } },
      });
      assertCase("import.throw.ok", imported.ok === false);
      assertCase(
        "import.throw.code",
        imported.error?.code === "ENGINE_WORKFLOW_EXECUTION_FAILED",
        imported.error?.code,
      );
      const exported = await workflowEngine.run({
        workflowId: "exportProject",
        payload: { projectId: "x" },
      });
      assertCase("export.throw.ok", exported.ok === false);
      assertCase(
        "export.throw.code",
        exported.error?.code === "ENGINE_WORKFLOW_EXECUTION_FAILED",
        exported.error?.code,
      );
    }
  } finally {
    setDefaultCompositionForTests(null);
  }

  return results;
};
