import * as XLSX from "xlsx";

import type {
  ColumnMapping,
  ImportAuxiliaryColumn,
  ImportBuildRequest,
  ImportReport,
} from "@/lib/import/types";
import type { ProjectImportedDatasetInfo } from "@/lib/project";
import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import type { SessionDataset, SessionDatasetPayload } from "@/lib/sessionDatasetRegistry";
import { buildImportPreview, validateImportPreview } from "@/lib/import/validate";

import type {
  ExperimentalDataLayout,
  ExperimentalDataSource,
  ExperimentalDataSourceId,
  ExperimentalSeries,
} from "./types";
import { cloneExperimentalSeries, computeDatasetMetrics } from "./transforms";

export const EXPERIMENTAL_DATA_SOURCES: ExperimentalDataSource[] = [
  { id: "csv", label: "CSV", enabled: true, accept: ".csv,text/csv" },
  { id: "txt", label: "TXT", enabled: true, accept: ".txt,text/plain" },
  {
    id: "xlsx",
    label: "Excel (.xlsx, .xls)",
    enabled: true,
    accept:
      ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
  },
  {
    id: "ods",
    label: "LibreOffice (.ods)",
    enabled: true,
    accept: ".ods,application/vnd.oasis.opendocument.spreadsheet",
  },
  { id: "json", label: "JSON", enabled: false },
  { id: "tsv", label: "TSV", enabled: false },
  { id: "google-sheets", label: "Google Sheets", enabled: false },
];

const ENABLED_DATA_SOURCE_IDS = EXPERIMENTAL_DATA_SOURCES.filter(
  (source) => source.enabled
).map((source) => source.id);

export const DEFAULT_EXPERIMENTAL_DATA_SOURCE_ID =
  ENABLED_DATA_SOURCE_IDS[0] ?? "csv";

const KNOWN_HEADER_PAIRS: [string, string][] = [
  ["x", "y"],
  ["tiempo", "concentración"],
  ["tiempo", "concentracion"],
  ["time", "concentration"],
];

type ParsedMultiSeries = {
  series: { name: string; points: { x: number; y: number }[] }[];
};

const stripBom = (text: string): string => text.replace(/^\uFEFF/, "");

const splitDelimitedLine = (line: string): string[] =>
  line.split(",").map((part) => part.trim());

const getNonEmptyLines = (text: string): string[] =>
  stripBom(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const parseNumericPair = (parts: string[]): { x: number; y: number } | null => {
  if (parts.length < 2) return null;

  const x = Number(parts[0].trim());
  const y = Number(parts[1].trim());

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return { x, y };
};

const isCsvHeaderRow = (line: string): boolean => {
  const parts = line.split(",").map((part) => part.trim().toLowerCase());
  return parts.length >= 2 && parts[0] === "x" && parts[1] === "y";
};

const isMultiSeriesDelimitedHeader = (parts: string[]): boolean => {
  if (parts.length < 3) return false;

  const headers = parts.map((part) => part.trim());
  if (headers.some((header) => header.length === 0)) return false;

  const allNumeric = headers.every((header) => Number.isFinite(Number(header)));
  if (allNumeric) return false;

  return true;
};

export const detectExperimentalDataLayout = (
  input: string | unknown[][]
): ExperimentalDataLayout | null => {
  if (typeof input === "string") {
    const lines = getNonEmptyLines(input);
    if (lines.length === 0) return null;

    const firstParts = splitDelimitedLine(lines[0]);
    if (firstParts.length < 2) return null;
    if (firstParts.length === 2) return "single-series";
    if (isMultiSeriesDelimitedHeader(firstParts)) return "multi-series";

    return null;
  }

  const rows = input
    .filter((row): row is unknown[] => Array.isArray(row))
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));

  if (rows.length === 0) return null;

  const columnCount = Math.max(...rows.map((row) => row.length), 0);
  if (columnCount < 2) return null;
  if (columnCount === 2) return "single-series";
  if (isMultiSeriesSpreadsheetHeader(rows[0])) return "multi-series";

  return null;
};

const parseCsvContent = (text: string): { x: number; y: number }[] | null => {
  const lines = getNonEmptyLines(text);

  if (lines.length === 0) return null;

  const startIndex = isCsvHeaderRow(lines[0]) ? 1 : 0;
  const points: { x: number; y: number }[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const pair = parseNumericPair(lines[i].split(","));
    if (!pair) return null;
    points.push(pair);
  }

  return points.length > 0 ? points : null;
};

export const parseMultiSeriesCsvContent = (
  text: string
): ParsedMultiSeries | null => {
  const lines = getNonEmptyLines(text);
  if (lines.length < 2) return null;

  const headerParts = splitDelimitedLine(lines[0]);
  if (!isMultiSeriesDelimitedHeader(headerParts)) return null;

  const seriesNames = headerParts.slice(1);
  const pointsBySeries = seriesNames.map(() => [] as { x: number; y: number }[]);

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const parts = splitDelimitedLine(lines[rowIndex]);
    if (parts.length === 0) continue;

    const x = Number(parts[0]);
    if (!Number.isFinite(x)) return null;

    for (let seriesIndex = 0; seriesIndex < seriesNames.length; seriesIndex += 1) {
      const rawValue = parts[seriesIndex + 1] ?? "";
      if (!rawValue.trim()) continue;

      const y = Number(rawValue);
      if (!Number.isFinite(y)) return null;

      pointsBySeries[seriesIndex].push({ x, y });
    }
  }

  const series = seriesNames
    .map((name, index) => ({
      name,
      points: pointsBySeries[index],
    }))
    .filter((item) => item.points.length > 0);

  if (series.length === 0) return null;

  return { series };
};

const parseTxtContent = (text: string): { x: number; y: number }[] | null => {
  const lines = getNonEmptyLines(text);

  if (lines.length === 0) return null;

  const points: { x: number; y: number }[] = [];

  for (const line of lines) {
    const parts = line.includes(",") ? line.split(",") : line.split(/\s+/);
    const pair = parseNumericPair(parts);
    if (!pair) return null;
    points.push(pair);
  }

  return points.length > 0 ? points : null;
};

const parseDelimitedTextToCollection = (
  text: string
): ParsedMultiSeries | { single: { x: number; y: number }[] } | null => {
  const layout = detectExperimentalDataLayout(text);
  if (!layout) return null;

  if (layout === "multi-series") {
    const multi = parseMultiSeriesCsvContent(text);
    return multi ? { series: multi.series } : null;
  }

  const points = parseCsvContent(text);
  return points ? { single: points } : null;
};

const parseTxtToCollection = (
  text: string
): ParsedMultiSeries | { single: { x: number; y: number }[] } | null => {
  const layout = detectExperimentalDataLayout(text);
  if (layout === "multi-series") {
    const multi = parseMultiSeriesCsvContent(text);
    return multi ? { series: multi.series } : null;
  }

  const points = parseTxtContent(text);
  return points ? { single: points } : null;
};

const normalizeCell = (cell: unknown): string =>
  String(cell ?? "")
    .trim()
    .toLowerCase();

const cellToNumber = (cell: unknown): number | null => {
  if (typeof cell === "number" && Number.isFinite(cell)) return cell;
  if (typeof cell === "string") {
    const trimmed = cell.trim();
    if (!trimmed) return null;
    const value = Number(trimmed);
    return Number.isFinite(value) ? value : null;
  }
  return null;
};

const isKnownHeaderPair = (first: string, second: string): boolean =>
  KNOWN_HEADER_PAIRS.some(([a, b]) => first === a && second === b);

const isSpreadsheetHeaderRow = (row: unknown[]): boolean => {
  if (row.length < 2) return false;

  const first = normalizeCell(row[0]);
  const second = normalizeCell(row[1]);

  if (isKnownHeaderPair(first, second)) return true;

  const x = cellToNumber(row[0]);
  const y = cellToNumber(row[1]);
  return x === null || y === null;
};

const isMultiSeriesSpreadsheetHeader = (row: unknown[]): boolean => {
  const headers = row.map((cell) => String(cell ?? "").trim());
  if (headers.length < 3) return false;
  if (headers.some((header) => header.length === 0)) return false;

  const allNumeric = headers.every((header) => cellToNumber(header) !== null);
  if (allNumeric) return false;

  return true;
};

const findNumericColumnPair = (
  rows: unknown[][],
  columnCount: number
): [number, number] | null => {
  for (let colX = 0; colX < columnCount - 1; colX++) {
    for (let colY = colX + 1; colY < columnCount; colY++) {
      let valid = true;

      for (const row of rows) {
        if (!Array.isArray(row)) {
          valid = false;
          break;
        }
        const x = cellToNumber(row[colX]);
        const y = cellToNumber(row[colY]);
        if (x === null || y === null) {
          valid = false;
          break;
        }
      }

      if (valid) return [colX, colY];
    }
  }

  return null;
};

const parseSpreadsheetMatrix = (
  matrix: unknown[][]
): { x: number; y: number }[] | null => {
  const rows = matrix
    .filter((row): row is unknown[] => Array.isArray(row))
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));

  if (rows.length < 2) return null;

  const columnCount = Math.max(...rows.map((row) => row.length), 0);
  if (columnCount < 2) return null;

  const startRow = isSpreadsheetHeaderRow(rows[0]) ? 1 : 0;
  const dataRows = rows.slice(startRow);
  if (dataRows.length < 2) return null;

  const columnPair =
    columnCount === 2
      ? ([0, 1] as [number, number])
      : findNumericColumnPair(dataRows, columnCount);
  if (!columnPair) return null;

  const [colX, colY] = columnPair;
  const points: { x: number; y: number }[] = [];

  for (const row of dataRows) {
    if (row.length <= Math.max(colX, colY)) return null;

    const x = cellToNumber(row[colX]);
    const y = cellToNumber(row[colY]);
    if (x === null || y === null) return null;

    points.push({ x, y });
  }

  return points.length >= 2 ? points : null;
};

export const parseMultiSeriesSpreadsheet = (
  matrix: unknown[][]
): ParsedMultiSeries | null => {
  const rows = matrix
    .filter((row): row is unknown[] => Array.isArray(row))
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));

  if (rows.length < 2) return null;

  const headerRow = rows[0];
  if (!isMultiSeriesSpreadsheetHeader(headerRow)) return null;

  const columnCount = headerRow.length;
  const trimmedSeriesNames = headerRow.slice(1).map((cell) => String(cell ?? "").trim());
  if (trimmedSeriesNames.some((name) => name.length === 0)) return null;

  const pointsBySeries = trimmedSeriesNames.map(() => [] as { x: number; y: number }[]);

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const x = cellToNumber(row[0]);
    if (x === null) return null;

    for (let seriesIndex = 0; seriesIndex < trimmedSeriesNames.length; seriesIndex += 1) {
      const columnIndex = seriesIndex + 1;
      if (columnIndex >= columnCount) continue;

      const y = cellToNumber(row[columnIndex]);
      if (y === null) continue;

      pointsBySeries[seriesIndex].push({ x, y });
    }
  }

  const series = trimmedSeriesNames
    .map((name, index) => ({
      name,
      points: pointsBySeries[index],
    }))
    .filter((item) => item.points.length > 0);

  if (series.length === 0) return null;

  return { series };
};

const parseSpreadsheetToCollection = (
  matrix: unknown[][]
): ParsedMultiSeries | { single: { x: number; y: number }[] } | null => {
  const layout = detectExperimentalDataLayout(matrix);
  if (!layout) return null;

  if (layout === "multi-series") {
    const multi = parseMultiSeriesSpreadsheet(matrix);
    return multi ? { series: multi.series } : null;
  }

  const points = parseSpreadsheetMatrix(matrix);
  return points ? { single: points } : null;
};

const parseSpreadsheetFile = async (
  file: File
): Promise<ParsedMultiSeries | { single: { x: number; y: number }[] } | null> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return null;

    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
    });

    return parseSpreadsheetToCollection(matrix);
  } catch {
    return null;
  }
};

export const parseXlsxFile = async (
  file: File
): Promise<{ x: number; y: number }[] | null> => {
  const parsed = await parseSpreadsheetFile(file);
  if (!parsed) return null;
  return "single" in parsed ? parsed.single : null;
};

export const parseOdsFile = async (
  file: File
): Promise<{ x: number; y: number }[] | null> => {
  const parsed = await parseSpreadsheetFile(file);
  if (!parsed) return null;
  return "single" in parsed ? parsed.single : null;
};

export const getExperimentalDataSource = (sourceId: ExperimentalDataSourceId) =>
  EXPERIMENTAL_DATA_SOURCES.find((source) => source.id === sourceId);

const createExperimentalSeries = (
  sourceId: ExperimentalDataSourceId,
  points: { x: number; y: number }[],
  fileName: string
): ExperimentalSeries => {
  const baseName = fileName.replace(/\.[^/.]+$/, "").trim();

  return {
    id: `${sourceId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: baseName || fileName,
    points,
    color: "",
  };
};

export const buildExperimentalSeriesCollection = (
  sourceId: ExperimentalDataSourceId,
  parsed:
    | ParsedMultiSeries
    | { single: { x: number; y: number }[] }
    | { series: { name: string; points: { x: number; y: number }[] }[] },
  fileName: string
): ExperimentalSeries[] => {
  if ("single" in parsed) {
    return [createExperimentalSeries(sourceId, parsed.single, fileName)];
  }

  const stamp = Date.now();
  return parsed.series.map((item, index) => ({
    id: `${sourceId}-${stamp}-${index}-${Math.random().toString(36).slice(2, 9)}`,
    name: item.name,
    points: item.points,
    color: "",
  }));
};

const parseTextSourceToCollection = (
  sourceId: "csv" | "txt",
  text: string
): ParsedMultiSeries | { single: { x: number; y: number }[] } | null => {
  if (sourceId === "csv") return parseDelimitedTextToCollection(text);
  return parseTxtToCollection(text);
};

export const importExperimentalDataFile = async (
  sourceId: ExperimentalDataSourceId,
  file: File
): Promise<ExperimentalSeries[] | null> => {
  const source = getExperimentalDataSource(sourceId);
  if (!source?.enabled) return null;

  let parsed: ParsedMultiSeries | { single: { x: number; y: number }[] } | null =
    null;

  if (sourceId === "xlsx" || sourceId === "ods") {
    parsed = await parseSpreadsheetFile(file);
  } else if (sourceId === "csv" || sourceId === "txt") {
    const text = await file.text();
    parsed = parseTextSourceToCollection(sourceId, text);
  } else {
    return null;
  }

  if (!parsed) return null;

  const collection = buildExperimentalSeriesCollection(sourceId, parsed, file.name);
  return collection.length > 0 ? collection : null;
};

export const parseExperimentalDataFile = (
  sourceId: ExperimentalDataSourceId,
  text: string,
  fileName: string
): ExperimentalSeries[] | null => {
  const source = getExperimentalDataSource(sourceId);
  if (!source?.enabled) return null;

  let parsed: ParsedMultiSeries | { single: { x: number; y: number }[] } | null =
    null;

  if (sourceId === "csv" || sourceId === "txt") {
    parsed = parseTextSourceToCollection(sourceId, text);
  }

  if (!parsed) return null;

  const collection = buildExperimentalSeriesCollection(sourceId, parsed, fileName);
  return collection.length > 0 ? collection : null;
};

export function createSessionDatasetId(): string {
  return `session-ds-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSessionDatasetFromImport(
  name: string,
  series: ExperimentalSeries[],
  importReport: ImportReport | null,
  importedAt: string = new Date().toLocaleString(),
  payloadExtras?: Pick<
    SessionDatasetPayload,
    "columnRegistry" | "auxiliaryColumns"
  >
): SessionDataset {
  const clonedSeries = cloneExperimentalSeries(series);
  const metrics = computeDatasetMetrics(clonedSeries);

  return {
    id: createSessionDatasetId(),
    name,
    importedAt,
    seriesCount: metrics.seriesCount,
    observationCount: metrics.observationCount,
    worksheetModified: false,
    datasetPayload: {
      series: clonedSeries,
      importReport: importReport ? { ...importReport } : null,
      columnRegistry: payloadExtras?.columnRegistry
        ? { ...payloadExtras.columnRegistry }
        : undefined,
      auxiliaryColumns: payloadExtras?.auxiliaryColumns
        ? payloadExtras.auxiliaryColumns.map((item) => ({
            ...item,
            valuesByRowIndex: { ...item.valuesByRowIndex },
          }))
        : undefined,
    },
  };
}

export function createSessionDatasetInfo(
  dataset: SessionDataset
): ProjectImportedDatasetInfo {
  return {
    fileName: dataset.name,
    importedAt: dataset.importedAt,
    seriesCount: dataset.seriesCount,
    observationCount: dataset.observationCount,
  };
}

export function updateSessionDatasetPayload(
  dataset: SessionDataset,
  series: ExperimentalSeries[],
  importReport: ImportReport | null,
  worksheetModified: boolean,
  payloadExtras?: Pick<
    SessionDatasetPayload,
    "columnRegistry" | "auxiliaryColumns"
  >
): SessionDataset {
  const clonedSeries = cloneExperimentalSeries(series);
  const metrics = computeDatasetMetrics(clonedSeries);

  return {
    ...dataset,
    seriesCount: metrics.seriesCount,
    observationCount: metrics.observationCount,
    worksheetModified,
    datasetPayload: {
      series: clonedSeries,
      importReport: importReport ? { ...importReport } : null,
      columnRegistry:
        payloadExtras?.columnRegistry ??
        dataset.datasetPayload.columnRegistry,
      auxiliaryColumns:
        payloadExtras?.auxiliaryColumns ??
        dataset.datasetPayload.auxiliaryColumns,
    },
  };
}

export function sessionDatasetIdentityKey(
  name: string,
  importedAt: string
): string {
  return `${name}::${importedAt}`;
}

export function getMostRecentSessionDatasetId(
  datasets: SessionDataset[],
  excludeId?: string
): string | null {
  const candidates = excludeId
    ? datasets.filter((dataset) => dataset.id !== excludeId)
    : datasets;

  if (candidates.length === 0) {
    return null;
  }

  return candidates[candidates.length - 1]?.id ?? null;
}

const createSeriesId = (sourceId: string) =>
  `${sourceId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const buildSeriesFromPreview = (
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
