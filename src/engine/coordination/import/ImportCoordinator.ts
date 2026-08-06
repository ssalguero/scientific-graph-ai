/**
 * ENGINE Domain — Import Coordinator.
 * OWNERSHIP: ENGINE orchestrates Import Dataset Product Flow.
 * `@/lib/import` remains authoritative for workbook / experimental import science.
 * Wizard UI (WorkbookImportWizard) stays in UX — dual-path until ENGINE-8/9.
 */

import { IMPORT_ERROR_CODES, ImportFlowError } from "./errors";
import type { ImportPort } from "./ports";
import type {
  FinalizeWizardImportInput,
  ImportDatasetInput,
  ImportDatasetResult,
  ImportExecutionContext,
  ImportFileHandle,
} from "./types";

export type ImportCoordinatorOptions = {
  readonly port: ImportPort;
};

function isFileHandle(value: unknown): value is ImportFileHandle {
  return (
    value != null &&
    typeof value === "object" &&
    typeof (value as ImportFileHandle).name === "string"
  );
}

/**
 * Coordinates Import Dataset via ImportPort (lib adapter or fake).
 */
export class ImportCoordinator {
  private readonly port: ImportPort;

  constructor(options: ImportCoordinatorOptions) {
    this.port = options.port;
  }

  /** Import Dataset — delegates to ImportPort.attemptImport. */
  async importDataset(
    input: ImportDatasetInput,
    _ctx?: ImportExecutionContext,
  ): Promise<ImportDatasetResult> {
    if (typeof input.sourceId !== "string" || !input.sourceId.trim()) {
      throw new ImportFlowError(
        IMPORT_ERROR_CODES.INVALID_PAYLOAD,
        "importDataset requires sourceId: non-empty string",
      );
    }
    if (!isFileHandle(input.file)) {
      throw new ImportFlowError(
        IMPORT_ERROR_CODES.INVALID_PAYLOAD,
        "importDataset requires file with name: string",
      );
    }

    const result = await this.port.attemptImport({
      sourceId: input.sourceId.trim(),
      file: input.file,
    });

    if (result.kind === "error") {
      // Business outcome (unsupported format, etc.) — complete with error kind.
      // Invalid orchestration payloads throw above; port hard failures may throw.
      return result;
    }

    return result;
  }

  /**
   * Finalize wizard import after UX completes sheet/mapping steps.
   * Optional — only when ImportPort implements finalizeWizardImport.
   */
  async finalizeWizardImport(
    input: FinalizeWizardImportInput,
    _ctx?: ImportExecutionContext,
  ): Promise<ImportDatasetResult> {
    if (typeof input.sourceId !== "string" || !input.sourceId.trim()) {
      throw new ImportFlowError(
        IMPORT_ERROR_CODES.INVALID_PAYLOAD,
        "finalizeWizardImport requires sourceId: non-empty string",
      );
    }
    if (input.state == null || typeof input.state !== "object") {
      throw new ImportFlowError(
        IMPORT_ERROR_CODES.INVALID_PAYLOAD,
        "finalizeWizardImport requires state: object",
      );
    }
    if (typeof this.port.finalizeWizardImport !== "function") {
      throw new ImportFlowError(
        IMPORT_ERROR_CODES.NOT_WIRED,
        "Import port does not support finalizeWizardImport",
      );
    }

    const result = await this.port.finalizeWizardImport({
      sourceId: input.sourceId.trim(),
      state: input.state,
    });

    if (result.kind === "error") {
      throw new ImportFlowError(
        IMPORT_ERROR_CODES.WIZARD_FINALIZE_FAILED,
        result.message,
      );
    }

    return result;
  }
}

export function createImportCoordinator(
  options: ImportCoordinatorOptions,
): ImportCoordinator {
  return new ImportCoordinator(options);
}
