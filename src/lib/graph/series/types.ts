export type SeriesPoint = { x: number; y: number };

export type ExperimentalSeries = {
  id: string;
  name: string;
  points: SeriesPoint[];
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

export type ExperimentalDataLayout = "single-series" | "multi-series";

export type ExperimentalDataSource = {
  id: ExperimentalDataSourceId;
  label: string;
  enabled: boolean;
  accept?: string;
};

export type ExperimentalStatistics = {
  seriesId: string;
  seriesName: string;
  count: number;
  meanX: number;
  meanY: number;
  medianY: number;
  minY: number;
  maxY: number;
  rangeY: number;
  varianceY: number;
  stdDevY: number;
  coefficientOfVariation: number | null;
};

export type ErrorBarMode = "sd" | "sem" | "ci95";

export type ErrorBarSeries = {
  seriesId: string;
  seriesName: string;
  meanX: number;
  meanY: number;
  lower: number;
  upper: number;
  mode: ErrorBarMode;
  stdDevY: number;
  semY: number;
  ci95Y: number;
  color: string;
};
