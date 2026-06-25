import type {
  ColumnDescriptor,
  ImportPreview,
  ImportReport,
  ImportValidation,
  ColumnMapping,
  ImportMode,
  SelectedColumns,
  ImportSeveritySummary,
} from "../types";
import { getImportValidationRuleCatalog, IMPORT_RULE_CATALOG_VERSION } from "../validate/rules";

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

const summarizeIssues = (validation: ImportValidation): ImportSeveritySummary =>
  validation.issueSummary ?? {
    error: validation.errors.length,
    warning: validation.warnings.filter((issue) => issue.severity === "warning")
      .length,
    info: validation.warnings.filter((issue) => issue.severity === "info").length,
  };

const buildExecutiveSummary = (
  input: ImportReportInput,
  issueSummary: ImportSeveritySummary
): string => {
  const imported = input.preview.stats.importablePointCount;
  const discarded = input.preview.stats.skippedRowCount;
  const coverage = Math.round(input.preview.stats.coverageRatio * 100);
  const status =
    issueSummary.error > 0
      ? "requiere corrección antes de importar"
      : issueSummary.warning > 0
        ? "importable con advertencias"
        : "importable sin advertencias bloqueantes";

  return `${status}: ${imported} puntos importables, ${discarded} filas descartadas, cobertura ${coverage}%.`;
};

export const buildImportReport = (input: ImportReportInput): ImportReport => {
  const selectedColumns = buildSelectedColumns(
    input.mapping,
    input.columnDescriptors
  );
  const issueSummary = summarizeIssues(input.validation);

  return {
    version: "v2",
    fileName: input.fileName,
    sheetName: input.sheetName,
    selectedSheet: input.sheetName,
    mode: input.mode,
    importMode: input.mode,
    mapping: input.mapping,
    selectedColumns,
    importedPointCount: input.preview.stats.importablePointCount,
    discardedPointCount: input.preview.stats.skippedRowCount,
    skippedRowCount: input.preview.stats.skippedRowCount,
    warningCount: issueSummary.warning,
    errorCount: issueSummary.error,
    unimportedSheetCount: input.unimportedSheetCount,
    coverageRatio: input.preview.stats.coverageRatio,
    warnings: input.validation.warnings,
    errors: input.validation.errors,
    stats: input.preview.stats,
    validation: input.validation,
    executiveSummary: buildExecutiveSummary(input, issueSummary),
    audit: input.preview.audit,
    samplePolicy: input.preview.samplePolicy,
    ruleCatalog: getImportValidationRuleCatalog(),
    ruleCatalogVersion: IMPORT_RULE_CATALOG_VERSION,
    auditPartial: input.preview.auditPartial,
    issueSummary,
    reproducibility: {
      fileName: input.fileName,
      sheetName: input.sheetName,
      importMode: input.mode,
      mapping: input.mapping,
      selectedColumns,
      totalSheetCount: input.unimportedSheetCount + 1,
      unimportedSheetCount: input.unimportedSheetCount,
      reportVersion: "v2",
    },
  };
};

/** @deprecated Use buildImportReport */
export const buildMinimalImportReport = buildImportReport;

const severityLabel: Record<string, string> = {
  error: "Error",
  warning: "Aviso",
  info: "Info",
};

export const formatImportReportLines = (report: ImportReport): string[] => {
  const lines = [
    report.executiveSummary ?? "Resumen ejecutivo no disponible",
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
  if (report.issueSummary && report.issueSummary.info > 0) {
    lines.push(`Informativos: ${report.issueSummary.info}`);
  }
  if (report.audit && report.audit.reasonCounts.length > 0) {
    lines.push(
      `Razones de descarte: ${report.audit.reasonCounts
        .map((item) => `${item.label} (${item.count})`)
        .join("; ")}`
    );
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
