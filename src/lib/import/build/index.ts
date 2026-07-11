import type { ExperimentalSeries } from "@/lib/graph/series/types";
import type {
  ImportAuxiliaryColumn,
  ImportBuildRequest,
  ImportBuildResult,
  ColumnMapping,
  TableRegion,
} from "../types";
import { buildSeriesFromPreview } from "@/lib/graph/series/builders";
import { cellToText } from "../shared/cell";
import { buildImportPreview, validateImportPreview } from "../validate";
import { buildImportReport } from "../report";

const extractAuxiliaryColumns = (
  matrix: unknown[][],
  region: TableRegion,
  mapping: ColumnMapping
): ImportAuxiliaryColumn[] => {
  const auxiliary: ImportAuxiliaryColumn[] = [];

  const pushAuxiliary = (
    columnIndex: number | undefined,
    label: string | undefined,
    role: ImportAuxiliaryColumn["role"]
  ) => {
    if (columnIndex === undefined || !label) return;
    const valuesByRowIndex: Record<number, string> = {};
    for (
      let rowIndex = region.headerRowIndex + 1;
      rowIndex <= region.endRow;
      rowIndex += 1
    ) {
      const row = matrix[rowIndex];
      if (!Array.isArray(row)) continue;
      const text = cellToText(row[columnIndex]);
      if (text) valuesByRowIndex[rowIndex] = text;
    }
    if (Object.keys(valuesByRowIndex).length === 0) return;
    auxiliary.push({
      id: `import-aux-${role}-${columnIndex}`,
      label,
      role,
      valuesByRowIndex,
    });
  };

  pushAuxiliary(mapping.replicateColumnIndex, mapping.replicateLabel, "replicate");
  pushAuxiliary(mapping.groupColumnIndex, mapping.groupLabel, "group");

  return auxiliary;
};

export const buildExperimentalSeriesFromImport = (
  request: ImportBuildRequest
): ImportBuildResult => {
  const preview = buildImportPreview(request.matrix, request.region, {
    mapping: request.mapping,
    columnDescriptors: request.columnDescriptors,
  });
  const validation = validateImportPreview(
    preview,
    request.columnDescriptors,
    request.mapping
  );

  const series = buildSeriesFromPreview(
    request,
    preview,
    validation,
    request.mapping
  );

  const auxiliaryColumns = extractAuxiliaryColumns(
    request.matrix,
    request.region,
    request.mapping
  );

  const report = buildImportReport({
    fileName: request.fileName,
    sheetName: request.sheetName,
    mode: request.mode,
    mapping: request.mapping,
    preview,
    validation,
    unimportedSheetCount: Math.max(0, (request.totalSheetCount ?? 1) - 1),
    columnDescriptors: request.columnDescriptors,
  });

  return { series, report, preview, validation, auxiliaryColumns };
};

export const buildWizardImportResult = (
  request: ImportBuildRequest & { totalSheetCount: number }
): ImportBuildResult =>
  buildExperimentalSeriesFromImport({
    ...request,
    totalSheetCount: request.totalSheetCount,
  });
