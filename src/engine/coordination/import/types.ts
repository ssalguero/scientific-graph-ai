/**
 * ENGINE Domain — Import Dataset coordination types (orchestration DTOs).
 * OWNERSHIP: ENGINE defines shapes; `@/lib/import` remains authoritative for import science.
 * Wizard UI stays in UX — ENGINE returns wizard-required outcomes only.
 */

/** Opaque file handle — browser `File` or test fake with a `name`. */
export type ImportFileHandle = {
  readonly name: string;
};

export type ImportDatasetInput = {
  readonly sourceId: string;
  readonly file: ImportFileHandle;
};

/**
 * Orchestration result for Import Dataset.
 * `series` / `analysis` / `report` are opaque payloads for UX hydrate (dual-path).
 */
export type ImportDatasetResult =
  | {
      readonly kind: "success";
      readonly seriesCount: number;
      readonly fileName?: string;
      readonly series?: unknown;
      readonly report?: unknown;
    }
  | {
      readonly kind: "wizard";
      readonly reason: string;
      readonly sheetCount: number;
      readonly recommendedSheetName: string | null;
      /** Opaque workbook analysis for WorkbookImportWizard (UX-owned). */
      readonly analysis?: unknown;
    }
  | {
      readonly kind: "error";
      readonly message: string;
    };

/** Finalize wizard import after UX completes mapping (optional second seam). */
export type FinalizeWizardImportInput = {
  readonly sourceId: string;
  /** Opaque WizardImportState from `@/lib/import` — ENGINE does not own wizard UI. */
  readonly state: unknown;
};

export type ImportExecutionContext = {
  readonly operationId?: string;
  readonly flowId?: string;
  readonly reason?: string;
};
