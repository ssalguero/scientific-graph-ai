import type {
  ColumnDescriptor,
  ImportPreview,
  ImportReport,
  ImportValidation,
  ColumnMapping,
  ImportMode,
  SelectedColumns,
} from "../types";

type ImportReportInput = {
  fileName: string;
  sheetName: string;
  mode: ImportMode;
  mapping: ColumnMapping;
  preview: ImportPreview;
  validation: ImportValidation;
  unimportedSheetCount: number;
  columnDescriptors?: ColumnDescriptor[];
};

const buildSelectedColumns = (
  mapping: ColumnMapping,
  columnDescriptors?: ColumnDescriptor[]
): SelectedColumns => {
  const xDescriptor = columnDescriptors?.find(
    (item) => item.index === mapping.xColumnIndex
  );
  const yDescriptor = columnDescriptors?.find(
    (item) => item.index === mapping.yColumnIndex
  );

  return {
    xIndex: mapping.xColumnIndex,
    yIndex: mapping.yColumnIndex,
    xLabel: mapping.xLabel,
    yLabel: mapping.yLabel,
    xNumericRatio: xDescriptor?.numericRatio ?? 1,
    yNumericRatio: yDescriptor?.numericRatio ?? 1,
  };
};

export const buildImportReport = (input: ImportReportInput): ImportReport => ({
  fileName: input.fileName,
  sheetName: input.sheetName,
  selectedSheet: input.sheetName,
  mode: input.mode,
  importMode: input.mode,
  mapping: input.mapping,
  selectedColumns: buildSelectedColumns(input.mapping, input.columnDescriptors),
  importedPointCount: input.preview.stats.importablePointCount,
  discardedPointCount: input.preview.stats.skippedRowCount,
  skippedRowCount: input.preview.stats.skippedRowCount,
  warningCount: input.validation.warnings.length,
  errorCount: input.validation.errors.length,
  unimportedSheetCount: input.unimportedSheetCount,
  coverageRatio: input.preview.stats.coverageRatio,
  warnings: input.validation.warnings,
  errors: input.validation.errors,
  stats: input.preview.stats,
  validation: input.validation,
});

/** @deprecated Use buildImportReport */
export const buildMinimalImportReport = buildImportReport;

const severityLabel: Record<string, string> = {
  error: "Error",
  warning: "Aviso",
  info: "Info",
};

export const formatImportReportLines = (report: ImportReport): string[] => {
  const lines = [
    `Archivo: ${report.fileName}`,
    `Hoja seleccionada: ${report.selectedSheet}`,
    `Modo de importación: ${report.importMode === "fast-path" ? "Importación directa" : "Asistente"}`,
    `Columna X: ${report.selectedColumns.xLabel} (col ${report.selectedColumns.xIndex + 1})`,
    `Columna Y: ${report.selectedColumns.yLabel} (col ${report.selectedColumns.yIndex + 1})`,
    `Puntos importados: ${report.importedPointCount}`,
    `Filas descartadas: ${report.discardedPointCount}`,
    `Cobertura: ${Math.round(report.coverageRatio * 100)}%`,
  ];

  if (report.stats.xMin !== null && report.stats.xMax !== null) {
    lines.push(`Rango X: ${report.stats.xMin} → ${report.stats.xMax}`);
  }
  if (report.stats.yMin !== null && report.stats.yMax !== null) {
    lines.push(`Rango Y: ${report.stats.yMin} → ${report.stats.yMax}`);
  }
  if (report.unimportedSheetCount > 0) {
    lines.push(`Hojas no importadas: ${report.unimportedSheetCount}`);
  }
  if (report.warningCount > 0) {
    lines.push(`Advertencias: ${report.warningCount}`);
  }

  for (const warning of report.warnings) {
    lines.push(
      `${severityLabel[warning.severity] ?? warning.severity} [${warning.code}]: ${warning.message}`
    );
  }
  for (const error of report.errors) {
    lines.push(
      `${severityLabel[error.severity] ?? error.severity} [${error.code}]: ${error.message}`
    );
  }

  return lines;
};

export const formatImportReportSummary = formatImportReportLines;

export const getImportReportIssues = (
  report: ImportReport
): ImportReport["warnings"] => [...report.errors, ...report.warnings];
