export type ExperimentalSeries = {
  id: string;
  name: string;
  points: { x: number; y: number }[];
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
  { id: "xlsx", label: "XLSX", enabled: false },
  { id: "ods", label: "ODS", enabled: false },
  { id: "json", label: "JSON", enabled: false },
  { id: "tsv", label: "TSV", enabled: false },
  { id: "google-sheets", label: "Google Sheets", enabled: false },
];

const ENABLED_DATA_SOURCE_IDS = EXPERIMENTAL_DATA_SOURCES.filter(
  (source) => source.enabled
).map((source) => source.id);

export const DEFAULT_EXPERIMENTAL_DATA_SOURCE_ID =
  ENABLED_DATA_SOURCE_IDS[0] ?? "csv";

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

export const getExperimentalDataSource = (sourceId: ExperimentalDataSourceId) =>
  EXPERIMENTAL_DATA_SOURCES.find((source) => source.id === sourceId);

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

  const baseName = fileName.replace(/\.[^/.]+$/, "").trim();

  return {
    id: `${sourceId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: baseName || fileName,
    points,
  };
};
