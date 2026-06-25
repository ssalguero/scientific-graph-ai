import type { ExperimentalSeries } from "@/lib/experimentalData";
import type {
  ImportAuxiliaryColumn,
  ImportBuildRequest,
  ImportBuildResult,
  ColumnMapping,
  TableRegion,
} from "../types";
import { cellToText } from "../shared/cell";
import { buildImportPreview, validateImportPreview } from "../validate";
import { buildImportReport } from "../report";

const createSeriesId = (sourceId: string) =>
  `${sourceId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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

const buildSeriesFromPreview = (
  request: ImportBuildRequest,
  preview: ReturnType<typeof buildImportPreview>,
  validation: ReturnType<typeof validateImportPreview>,
  mapping: ColumnMapping
): ExperimentalSeries[] => {
  if (!validation.ok) return [];

  const yIndices =
    mapping.yColumnIndices && mapping.yColumnIndices.length >= 2
      ? mapping.yColumnIndices
      : [mapping.yColumnIndex];

  if (yIndices.length <= 1) {
    const baseName =
      request.seriesName?.trim() ||
      `${request.sheetName}`.trim() ||
      request.fileName.replace(/\.[^/.]+$/, "").trim();

    return [
      {
        id: createSeriesId(request.sourceId),
        name: baseName,
        points: preview.points.map((point) => ({ x: point.x, y: point.y })),
        color: "",
      },
    ];
  }

  const descriptors = request.columnDescriptors ?? [];
  return yIndices.map((yIndex) => {
    const descriptor = descriptors.find((item) => item.index === yIndex);
    const seriesPreview = buildImportPreview(request.matrix, request.region, {
      mapping: {
        ...mapping,
        yColumnIndex: yIndex,
        yLabel: descriptor?.label ?? mapping.yLabel,
        yColumnIndices: undefined,
      },
      columnDescriptors: request.columnDescriptors,
    });
    const name =
      descriptor?.label?.trim() ||
      `${request.sheetName}`.trim() ||
      request.fileName.replace(/\.[^/.]+$/, "").trim();

    return {
      id: createSeriesId(request.sourceId),
      name,
      points: seriesPreview.points.map((point) => ({ x: point.x, y: point.y })),
      color: "",
    };
  });
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
