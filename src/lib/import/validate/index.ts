import type {
  ColumnDescriptor,
  ColumnMapping,
  ImportPreview,
  ImportValidation,
  TableRegion,
} from "../types";
import { applyColumnMapping } from "../map";
import { applySupplementalValidationRules } from "./rules";
import { buildPreviewStats } from "./stats";

type BuildPreviewOptions = {
  columnDescriptors?: ColumnDescriptor[];
  mapping: ColumnMapping;
};

export const buildImportPreview = (
  matrix: unknown[][],
  region: TableRegion,
  mappingOrOptions: ColumnMapping | BuildPreviewOptions
): ImportPreview => {
  const mapping =
    "mapping" in mappingOrOptions ? mappingOrOptions.mapping : mappingOrOptions;
  const columnDescriptors =
    "mapping" in mappingOrOptions ? mappingOrOptions.columnDescriptors : undefined;

  const rawPoints = applyColumnMapping(matrix, region, mapping);
  const skippedRows: ImportPreview["skippedRows"] = [];
  let evaluatedRowCount = 0;

  for (
    let rowIndex = region.headerRowIndex + 1;
    rowIndex <= region.endRow;
    rowIndex += 1
  ) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row)) continue;
    const hasAny = row
      .slice(region.startCol, region.endCol + 1)
      .some((cell) => String(cell ?? "").trim() !== "");
    if (!hasAny) continue;

    evaluatedRowCount += 1;
    const imported = rawPoints.some((point) => point.sourceRowIndex === rowIndex);
    if (!imported) {
      skippedRows.push({
        rowIndex,
        reason: "Fila sin par numérico completo en columnas seleccionadas",
      });
    }
  }

  const points = rawPoints.map((point) => ({
    x: point.x,
    y: point.y,
    sourceRowIndex: point.sourceRowIndex,
    label: point.label,
  }));

  const stats = buildPreviewStats(points, skippedRows.length, evaluatedRowCount);

  const preview: ImportPreview = {
    points,
    skippedRows,
    discardedRows: skippedRows,
    warnings: [],
    stats,
  };

  const validation = validateImportPreview(preview, columnDescriptors, mapping);
  preview.warnings = validation.warnings;

  return preview;
};

export const validateImportPreview = (
  preview: ImportPreview,
  columnDescriptors?: ColumnDescriptor[],
  mapping?: Pick<ColumnMapping, "xColumnIndex" | "yColumnIndex">
): ImportValidation =>
  applySupplementalValidationRules(
    preview,
    columnDescriptors,
    mapping?.xColumnIndex ?? 0,
    mapping?.yColumnIndex ?? 1
  );

export const validateMinimumImport = validateImportPreview;

export const buildFastPathPreview = (
  points: ImportPreview["points"]
): ImportPreview => {
  const preview: ImportPreview = {
    points,
    skippedRows: [],
    discardedRows: [],
    warnings: [],
    stats: buildPreviewStats(points, 0, points.length),
  };
  const validation = validateImportPreview(preview, undefined, {
    xColumnIndex: 0,
    yColumnIndex: 1,
  });
  preview.warnings = validation.warnings;
  return preview;
};
