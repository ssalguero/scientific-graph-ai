/**
 * ENGINE Domain — temporary adapter to `@/lib/import` (DATA-bound import pipeline).
 * OWNERSHIP: ENGINE coordination only — does not redesign importers or wizard UI.
 *
 * Parity (ENGINE-6):
 * - Covered: attemptExperimentalImport, runWizardImport (finalize)
 * - Deferred to ENG-8/9: GraphEditor hydrate of series, WorkbookImportWizard cutover
 */

import {
  attemptExperimentalImport,
  runWizardImport,
  type WizardImportState,
} from "@/lib/import";

import type { ImportPort } from "./ports";
import type {
  FinalizeWizardImportInput,
  ImportDatasetInput,
  ImportDatasetResult,
} from "./types";

/** Source id type from `@/lib/import` public API — do not import graph series packages here. */
type ImportSourceId = Parameters<typeof attemptExperimentalImport>[0];

function asSourceId(sourceId: string): ImportSourceId {
  return sourceId as ImportSourceId;
}

function asFile(file: ImportDatasetInput["file"]): File {
  // Browser File or File-compatible handle from UX; Node tests inject fakes instead.
  return file as File;
}

function mapAttemptResult(
  result: Awaited<ReturnType<typeof attemptExperimentalImport>>,
): ImportDatasetResult {
  if (result.kind === "success") {
    return {
      kind: "success",
      seriesCount: result.series.length,
      fileName: result.report?.fileName,
      series: result.series,
      report: result.report,
    };
  }
  if (result.kind === "wizard") {
    return {
      kind: "wizard",
      reason: result.analysis.reason,
      sheetCount: result.analysis.snapshot.sheets.length,
      recommendedSheetName: result.analysis.recommendedSheetName,
      analysis: result.analysis,
    };
  }
  return { kind: "error", message: result.message };
}

/**
 * Temporary ImportPort → `@/lib/import` public pipeline APIs.
 */
export function createLibImportAdapter(): ImportPort {
  return {
    async attemptImport(input: ImportDatasetInput): Promise<ImportDatasetResult> {
      const result = await attemptExperimentalImport(
        asSourceId(input.sourceId),
        asFile(input.file),
      );
      return mapAttemptResult(result);
    },

    async finalizeWizardImport(
      input: FinalizeWizardImportInput,
    ): Promise<ImportDatasetResult> {
      const built = runWizardImport(
        input.state as WizardImportState,
        asSourceId(input.sourceId),
      );
      if (!built) {
        return {
          kind: "error",
          message: "Wizard import finalize failed (validation or sheet missing)",
        };
      }
      return {
        kind: "success",
        seriesCount: built.series?.length ?? 0,
        fileName: built.report?.fileName,
        series: built.series,
        report: built.report,
      };
    },
  };
}
