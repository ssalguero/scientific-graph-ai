import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ExperimentalDataSourceId } from "@/lib/experimentalData";

export type ImportFileFormat = "csv" | "txt" | "xlsx" | "xls" | "ods";

export type SheetKind =
  | "empty"
  | "administrative"
  | "tabular-data"
  | "chart-layout"
  | "unknown";

export type ColumnRole =
  | "independent"
  | "dependent"
  | "label"
  | "replicate"
  | "statistics"
  | "metadata"
  | "unknown";

export type ImportMode = "fast-path" | "wizard";

export type WizardStep = "sheet" | "table" | "columns" | "confirm";

export type SheetSnapshot = {
  name: string;
  matrix: unknown[][];
  ref?: string;
};

export type WorkbookSnapshot = {
  fileName: string;
  format: ImportFileFormat;
  sheets: SheetSnapshot[];
};

export type SheetSummary = {
  name: string;
  rowCount: number;
  colCount: number;
  nonEmptyCells: number;
  kind: SheetKind;
  importScore: number;
  warnings: string[];
  previewRows: unknown[][];
};

export type TableRegion = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  headerRowIndex: number;
  metadataRowCount: number;
  confidence: number;
};

export type ColumnDescriptor = {
  index: number;
  label: string;
  sampleValues: unknown[];
  numericRatio: number;
};

export type ColumnRoleSuggestion = {
  index: number;
  label: string;
  role: ColumnRole;
  confidence: number;
  reason: string;
};

export type ColumnMapping = {
  xColumnIndex: number;
  yColumnIndex: number;
  xLabel: string;
  yLabel: string;
  labelColumnIndex?: number;
  rowFilter: "skip-sparse";
};

export type PreviewPoint = {
  x: number;
  y: number;
  sourceRowIndex: number;
  label?: string;
};

export type SkippedRow = {
  rowIndex: number;
  reason: string;
};

export type ImportIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
};

export type ValidationSeverity = "error" | "warning" | "info";

export type ImportPreviewStats = {
  importablePointCount: number;
  skippedRowCount: number;
  evaluatedRowCount: number;
  coverageRatio: number;
  xMin: number | null;
  xMax: number | null;
  yMin: number | null;
  yMax: number | null;
  duplicatePointCount: number;
};

export type ImportPreview = {
  points: PreviewPoint[];
  skippedRows: SkippedRow[];
  discardedRows: SkippedRow[];
  warnings: ImportIssue[];
  stats: ImportPreviewStats;
};

export type ImportValidation = {
  ok: boolean;
  errors: ImportIssue[];
  warnings: ImportIssue[];
};

export type SelectedColumns = {
  xIndex: number;
  yIndex: number;
  xLabel: string;
  yLabel: string;
  xNumericRatio: number;
  yNumericRatio: number;
};

export type ImportReport = {
  fileName: string;
  sheetName: string;
  selectedSheet: string;
  mode: ImportMode;
  importMode: ImportMode;
  mapping: ColumnMapping;
  selectedColumns: SelectedColumns;
  importedPointCount: number;
  discardedPointCount: number;
  skippedRowCount: number;
  warningCount: number;
  errorCount: number;
  unimportedSheetCount: number;
  coverageRatio: number;
  warnings: ImportIssue[];
  errors: ImportIssue[];
  stats: ImportPreviewStats;
  validation: ImportValidation;
};

export type ImportBuildRequest = {
  sourceId: ExperimentalDataSourceId;
  fileName: string;
  sheetName: string;
  region: TableRegion;
  mapping: ColumnMapping;
  seriesName?: string;
  matrix: unknown[][];
  mode: ImportMode;
  columnDescriptors?: ColumnDescriptor[];
  totalSheetCount?: number;
};

export type ImportBuildResult = {
  series: ExperimentalSeries[];
  report: ImportReport;
  preview: ImportPreview;
  validation: ImportValidation;
};

export type WorkbookAnalysis = {
  snapshot: WorkbookSnapshot;
  sheets: SheetSummary[];
  recommendedSheetName: string | null;
  requiresWizard: boolean;
  reason: string;
};

export type WizardImportState = {
  step: WizardStep;
  snapshot: WorkbookSnapshot;
  selectedSheetName: string;
  region: TableRegion;
  mapping: ColumnMapping;
  seriesName: string;
  preview: ImportPreview;
  validation: ImportValidation;
  columnDescriptors: ColumnDescriptor[];
  suggestions: ColumnRoleSuggestion[];
};

export type ImportAttemptResult =
  | {
      kind: "success";
      series: ExperimentalSeries[];
      report: ImportReport;
    }
  | {
      kind: "wizard";
      analysis: WorkbookAnalysis;
    }
  | {
      kind: "error";
      message: string;
    };
