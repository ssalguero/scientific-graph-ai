/**
 * ENGINE Domain — Import Dataset ports (injectable; no React).
 * OWNERSHIP: ENGINE defines ports; `@/lib/import` fulfills via adapters / fakes.
 */

import type {
  FinalizeWizardImportInput,
  ImportDatasetInput,
  ImportDatasetResult,
} from "./types";

/** Import Dataset port — maps to attemptExperimentalImport / runWizardImport (or fake). */
export type ImportPort = {
  attemptImport(
    input: ImportDatasetInput,
  ): Promise<ImportDatasetResult>;

  /**
   * Optional wizard finalize — maps to runWizardImport.
   * Wizard step UI remains UX; ENGINE only orchestrates the finalize call.
   */
  finalizeWizardImport?(
    input: FinalizeWizardImportInput,
  ): Promise<ImportDatasetResult>;
};
