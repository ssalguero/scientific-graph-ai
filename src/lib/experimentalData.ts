import * as XLSX from "xlsx";

export type ExperimentalSeries = {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  color: string;
};

export type ExperimentalDataSourceId =
  | "csv"
  | "txt"
  | "xlsx"
  | "ods"
  | "json"
  | "tsv"
  | "google-sheets";

export type ExperimentalDataSource = {
  id: ExperimentalDataSourceId;
  label: string;
  enabled: boolean;
  accept?: string;
};

export const EXPERIMENTAL_DATA_SOURCES: ExperimentalDataSource[] = [
  { id: "csv", label: "CSV", enabled: true, accept: ".csv,text/csv" },
  { id: "txt", label: "TXT", enabled: true, accept: ".txt,text/plain" },
  {
    id: "xlsx",
    label: "Excel (.xlsx)",
    enabled: true,
    accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

const parseCsvContent = (text: string): { x: number; y: number }[] | null => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

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

const parseTxtContent = (text: string): { x: number; y: number }[] | null => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

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

const PARSERS: Partial<
  Record<
    ExperimentalDataSourceId,
    (text: string) => { x: number; y: number }[] | null
  >
> = {
  csv: parseCsvContent,
  txt: parseTxtContent,
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

const parseSpreadsheetFile = async (
  file: File
): Promise<{ x: number; y: number }[] | null> => {
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

    return parseSpreadsheetMatrix(matrix);
  } catch {
    return null;
  }
};

export const parseXlsxFile = async (
  file: File
): Promise<{ x: number; y: number }[] | null> => parseSpreadsheetFile(file);

export const parseOdsFile = async (
  file: File
): Promise<{ x: number; y: number }[] | null> => parseSpreadsheetFile(file);

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

export const importExperimentalDataFile = async (
  sourceId: ExperimentalDataSourceId,
  file: File
): Promise<ExperimentalSeries | null> => {
  const source = getExperimentalDataSource(sourceId);
  if (!source?.enabled) return null;

  let points: { x: number; y: number }[] | null = null;

  if (sourceId === "xlsx") {
    points = await parseXlsxFile(file);
  } else if (sourceId === "ods") {
    points = await parseOdsFile(file);
  } else {
    const parser = PARSERS[sourceId];
    if (!parser) return null;
    const text = await file.text();
    points = parser(text);
  }

  if (!points) return null;

  return createExperimentalSeries(sourceId, points, file.name);
};

export const parseExperimentalDataFile = (
  sourceId: ExperimentalDataSourceId,
  text: string,
  fileName: string
): ExperimentalSeries | null => {
  const source = getExperimentalDataSource(sourceId);
  if (!source?.enabled) return null;

  const parser = PARSERS[sourceId];
  if (!parser) return null;

  const points = parser(text);
  if (!points) return null;

  return createExperimentalSeries(sourceId, points, fileName);
};
