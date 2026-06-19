import type {
  ColumnDescriptor,
  ColumnMapping,
  ImportPreview,
  ImportAuditSummary,
  ImportSamplePolicy,
  ImportValidation,
  SkippedRow,
  TableRegion,
} from "../types";
import { cellToNumber, cellToText } from "../shared/cell";
import { applySupplementalValidationRules } from "./rules";
import { buildPreviewStats } from "./stats";

const DEFAULT_SAMPLE_POLICY: ImportSamplePolicy = {
  discardedRowSampleLimit: 10,
  previewPointSampleLimit: 25,
};

type BuildPreviewOptions = {
  columnDescriptors?: ColumnDescriptor[];
  mapping: ColumnMapping;
  samplePolicy?: Partial<ImportSamplePolicy>;
};

const discardReasonLabels: Record<NonNullable<SkippedRow["reasonCode"]>, string> = {
  EMPTY_SELECTED_CELLS: "Celdas X/Y vacías",
  INVALID_X: "X no numérica",
  INVALID_Y: "Y no numérica",
  INVALID_NUMERIC_PAIR: "Par X/Y no numérico",
};

const resolveSamplePolicy = (
  samplePolicy?: Partial<ImportSamplePolicy>
): ImportSamplePolicy => ({
  ...DEFAULT_SAMPLE_POLICY,
  ...samplePolicy,
});

const buildSkippedRow = (
  rowIndex: number,
  xRawValue: unknown,
  yRawValue: unknown,
  mapping: ColumnMapping
): SkippedRow => {
  const xText = cellToText(xRawValue);
  const yText = cellToText(yRawValue);
  const x = cellToNumber(xRawValue);
  const y = cellToNumber(yRawValue);

  if (!xText && !yText) {
    return {
      rowIndex,
      reason: "Fila descartada: celdas X/Y vacías",
      reasonCode: "EMPTY_SELECTED_CELLS",
      xRawValue,
      yRawValue,
      xColumnIndex: mapping.xColumnIndex,
      yColumnIndex: mapping.yColumnIndex,
    };
  }

  if (x === null && y === null) {
    return {
      rowIndex,
      reason: "Fila descartada: par X/Y no numérico",
      reasonCode: "INVALID_NUMERIC_PAIR",
      xRawValue,
      yRawValue,
      xColumnIndex: mapping.xColumnIndex,
      yColumnIndex: mapping.yColumnIndex,
    };
  }

  if (x === null) {
    return {
      rowIndex,
      reason: "Fila descartada: valor X no numérico",
      reasonCode: "INVALID_X",
      xRawValue,
      yRawValue,
      xColumnIndex: mapping.xColumnIndex,
      yColumnIndex: mapping.yColumnIndex,
    };
  }

  return {
    rowIndex,
    reason: "Fila descartada: valor Y no numérico",
    reasonCode: "INVALID_Y",
    xRawValue,
    yRawValue,
    xColumnIndex: mapping.xColumnIndex,
    yColumnIndex: mapping.yColumnIndex,
  };
};

const buildAuditSummary = (
  skippedRows: SkippedRow[],
  sampleLimit: number
): ImportAuditSummary => {
  const counts = new Map<NonNullable<SkippedRow["reasonCode"]>, number>();
  for (const row of skippedRows) {
    if (!row.reasonCode) continue;
    counts.set(row.reasonCode, (counts.get(row.reasonCode) ?? 0) + 1);
  }

  return {
    totalDiscardedRows: skippedRows.length,
    reasonCounts: [...counts.entries()].map(([code, count]) => ({
      code,
      label: discardReasonLabels[code],
      count,
    })),
    sampledDiscardedRows: skippedRows.slice(0, sampleLimit),
    sampleLimit,
    truncated: skippedRows.length > sampleLimit,
  };
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
  const samplePolicy = resolveSamplePolicy(
    "mapping" in mappingOrOptions ? mappingOrOptions.samplePolicy : undefined
  );

  const skippedRows: ImportPreview["skippedRows"] = [];
  const points: ImportPreview["points"] = [];
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
    const xRawValue = row[mapping.xColumnIndex];
    const yRawValue = row[mapping.yColumnIndex];
    const x = cellToNumber(xRawValue);
    const y = cellToNumber(yRawValue);

    if (x !== null && y !== null) {
      const label =
        mapping.labelColumnIndex !== undefined
          ? cellToText(row[mapping.labelColumnIndex])
          : cellToText(row[region.startCol]);

      points.push({
        x,
        y,
        sourceRowIndex: rowIndex,
        label: label || undefined,
      });
      continue;
    }

    skippedRows.push(buildSkippedRow(rowIndex, xRawValue, yRawValue, mapping));
  }

  const stats = buildPreviewStats(points, skippedRows.length, evaluatedRowCount);
  const audit = buildAuditSummary(
    skippedRows,
    samplePolicy.discardedRowSampleLimit
  );

  const preview: ImportPreview = {
    points,
    skippedRows,
    discardedRows: skippedRows,
    warnings: [],
    stats,
    audit,
    samplePolicy,
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
  const samplePolicy = resolveSamplePolicy();
  const preview: ImportPreview = {
    points,
    skippedRows: [],
    discardedRows: [],
    warnings: [],
    stats: buildPreviewStats(points, 0, points.length),
    audit: buildAuditSummary([], samplePolicy.discardedRowSampleLimit),
    samplePolicy,
  };
  const validation = validateImportPreview(preview, undefined, {
    xColumnIndex: 0,
    yColumnIndex: 1,
  });
  preview.warnings = validation.warnings;
  return preview;
};
