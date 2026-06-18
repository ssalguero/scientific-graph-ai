import type { ExperimentalDataSourceId } from "@/lib/experimentalData";
import {
  buildExperimentalSeriesCollection,
  detectExperimentalDataLayout,
  importExperimentalDataFile,
} from "@/lib/experimentalData";
import { buildWizardImportResult } from "./build";
import { buildColumnDescriptors } from "./detect-header";
import { detectTableRegion } from "./detect-table";
import {
  discoverSheets,
  getRecommendedSheetName,
  rankSheetsForImport,
} from "./discover";
import { suggestAxisMapping, suggestColumnRoles } from "./map";
import {
  detectFileFormat,
  readDelimitedTextFromFile,
  readWorkbookFromFile,
} from "./read";
import { buildImportReport } from "./report";
import {
  buildFastPathPreview,
  buildImportPreview,
  validateImportPreview,
} from "./validate";
import type {
  ImportAttemptResult,
  ImportBuildResult,
  WizardImportState,
  WorkbookAnalysis,
  WorkbookSnapshot,
} from "./types";

const isWorkbookFormat = (format: ReturnType<typeof detectFileFormat>): boolean =>
  format === "xlsx" || format === "xls" || format === "ods";

export const analyzeWorkbookSnapshot = (
  snapshot: WorkbookSnapshot
): WorkbookAnalysis => {
  const sheets = discoverSheets(snapshot.sheets);
  const recommendedSheetName = getRecommendedSheetName(sheets);
  const requiresWizard = snapshot.sheets.length > 1 || sheets.some(
    (sheet) => sheet.kind === "administrative" || sheet.kind === "unknown"
  );

  return {
    snapshot,
    sheets: rankSheetsForImport(sheets),
    recommendedSheetName,
    requiresWizard: true,
    reason: requiresWizard
      ? "Workbook científico detectado; se requiere asistente de importación"
      : "Estructura simple",
  };
};

export const analyzeWorkbookFile = async (
  file: File
): Promise<WorkbookAnalysis> => {
  const snapshot = await readWorkbookFromFile(file);
  return analyzeWorkbookSnapshot(snapshot);
};

const resolveWorkbookSourceId = (
  file: File,
  sourceId: ExperimentalDataSourceId
): ExperimentalDataSourceId => {
  const format = detectFileFormat(file.name);
  if (format === "ods") return "ods";
  if (format === "xlsx" || format === "xls") return "xlsx";
  return sourceId;
};

const tryLegacyWorkbookFastPath = async (
  sourceId: ExperimentalDataSourceId,
  file: File
): Promise<ImportAttemptResult | null> => {
  const effectiveSourceId = resolveWorkbookSourceId(file, sourceId);
  const series = await importExperimentalDataFile(effectiveSourceId, file);
  if (!series || series.length === 0) return null;

  const preview = buildFastPathPreview(
    series[0]?.points.map((point, index) => ({
      x: point.x,
      y: point.y,
      sourceRowIndex: index,
    })) ?? []
  );
  const validation = validateImportPreview(preview, undefined, {
    xColumnIndex: 0,
    yColumnIndex: 1,
  });

  return {
    kind: "success",
    series,
    report: buildImportReport({
      fileName: file.name,
      sheetName: "(primera hoja)",
      mode: "fast-path",
      mapping: {
        xColumnIndex: 0,
        yColumnIndex: 1,
        xLabel: "x",
        yLabel: "y",
        rowFilter: "skip-sparse",
      },
      preview,
      validation,
      unimportedSheetCount: 0,
    }),
  };
};

const tryDelimitedFastPath = async (
  sourceId: ExperimentalDataSourceId,
  file: File
): Promise<ImportAttemptResult> => {
  const series = await importExperimentalDataFile(sourceId, file);
  if (!series || series.length === 0) {
    return {
      kind: "error",
      message:
        "No se pudo importar el archivo. Verifique que tenga columnas numéricas válidas.",
    };
  }

  const preview = buildFastPathPreview(
    series.flatMap((item) =>
      item.points.map((point, index) => ({
        x: point.x,
        y: point.y,
        sourceRowIndex: index,
      }))
    )
  );
  const validation = validateImportPreview(preview, undefined, {
    xColumnIndex: 0,
    yColumnIndex: 1,
  });

  return {
    kind: "success",
    series,
    report: buildImportReport({
      fileName: file.name,
      sheetName: "(texto delimitado)",
      mode: "fast-path",
      mapping: {
        xColumnIndex: 0,
        yColumnIndex: 1,
        xLabel: "x",
        yLabel: "y",
        rowFilter: "skip-sparse",
      },
      preview,
      validation,
      unimportedSheetCount: 0,
    }),
  };
};

export const shouldUseWizardPath = (
  file: File,
  sourceId: ExperimentalDataSourceId
): boolean => {
  const format = detectFileFormat(file.name);
  if (!format) return false;
  if (format === "csv" || format === "txt") return false;
  return isWorkbookFormat(format) || sourceId === "xlsx" || sourceId === "ods";
};

export const attemptExperimentalImport = async (
  sourceId: ExperimentalDataSourceId,
  file: File
): Promise<ImportAttemptResult> => {
  const format = detectFileFormat(file.name);
  const effectiveSourceId = resolveWorkbookSourceId(file, sourceId);

  if (!format) {
    return { kind: "error", message: "Formato de archivo no soportado" };
  }

  if (format === "csv" || format === "txt") {
    return tryDelimitedFastPath(effectiveSourceId, file);
  }

  if (isWorkbookFormat(format)) {
    const legacy = await tryLegacyWorkbookFastPath(effectiveSourceId, file);
    if (legacy?.kind === "success") return legacy;

    const analysis = await analyzeWorkbookFile(file);
    return { kind: "wizard", analysis };
  }

  return { kind: "error", message: "Formato de archivo no soportado" };
};

export const buildInitialWizardState = (
  analysis: WorkbookAnalysis,
  sourceId: ExperimentalDataSourceId
): WizardImportState | null => {
  const sheetName =
    analysis.recommendedSheetName ?? analysis.snapshot.sheets[0]?.name;
  if (!sheetName) return null;

  const sheet = analysis.snapshot.sheets.find((item) => item.name === sheetName);
  if (!sheet) return null;

  const region = detectTableRegion(sheet.matrix);
  if (!region) return null;

  const columnDescriptors = buildColumnDescriptors(sheet.matrix, region);
  const suggestions = suggestColumnRoles(columnDescriptors);
  const mapping =
    suggestAxisMapping(sheet.matrix, region, columnDescriptors) ?? {
      xColumnIndex: columnDescriptors[0]?.index ?? region.startCol,
      yColumnIndex:
        columnDescriptors[1]?.index ??
        columnDescriptors[0]?.index ??
        region.startCol + 1,
      xLabel: columnDescriptors[0]?.label ?? "X",
      yLabel: columnDescriptors[1]?.label ?? "Y",
      rowFilter: "skip-sparse" as const,
    };

  const preview = buildImportPreview(sheet.matrix, region, {
    mapping,
    columnDescriptors,
  });
  const validation = validateImportPreview(preview, columnDescriptors, mapping);

  return {
    step: "sheet",
    snapshot: analysis.snapshot,
    selectedSheetName: sheetName,
    region,
    mapping,
    seriesName: sheetName,
    preview,
    validation,
    columnDescriptors,
    suggestions,
  };
};

export const refreshWizardState = (
  state: WizardImportState,
  sourceId: ExperimentalDataSourceId
): WizardImportState => {
  const sheet = state.snapshot.sheets.find(
    (item) => item.name === state.selectedSheetName
  );
  if (!sheet) return state;

  const region = detectTableRegion(sheet.matrix, state.region.headerRowIndex);
  if (!region) return state;

  const columnDescriptors = buildColumnDescriptors(sheet.matrix, region);
  const suggestions = suggestColumnRoles(columnDescriptors);
  const preview = buildImportPreview(sheet.matrix, region, {
    mapping: state.mapping,
    columnDescriptors,
  });
  const validation = validateImportPreview(
    preview,
    columnDescriptors,
    state.mapping
  );

  return {
    ...state,
    region,
    preview,
    validation,
    columnDescriptors,
    suggestions,
  };
};

export const runWizardImport = (
  state: WizardImportState,
  sourceId: ExperimentalDataSourceId
): ImportBuildResult | null => {
  const sheet = state.snapshot.sheets.find(
    (item) => item.name === state.selectedSheetName
  );
  if (!sheet) return null;

  const effectiveSourceId = resolveWorkbookSourceId(
    { name: state.snapshot.fileName } as File,
    sourceId
  );
  const refreshed = refreshWizardState(state, effectiveSourceId);
  if (!refreshed.validation.ok) return null;

  return buildWizardImportResult({
    sourceId: effectiveSourceId,
    fileName: state.snapshot.fileName,
    sheetName: state.selectedSheetName,
    region: refreshed.region,
    mapping: refreshed.mapping,
    seriesName: refreshed.seriesName,
    matrix: sheet.matrix,
    mode: "wizard",
    totalSheetCount: state.snapshot.sheets.length,
    columnDescriptors: refreshed.columnDescriptors,
  });
};

export const canUseDelimitedLayoutFastPath = async (
  file: File
): Promise<boolean> => {
  const { text } = await readDelimitedTextFromFile(file);
  return detectExperimentalDataLayout(text) !== null;
};

export { buildExperimentalSeriesCollection };
