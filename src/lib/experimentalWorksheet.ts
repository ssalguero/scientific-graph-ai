import type { ExperimentalSeries } from "./experimentalData";

export type WorksheetColumn = {
  seriesId: string;
  label: string;
};

export type WorksheetRow = {
  rowKey: string;
  x: number;
  values: Record<string, number | null>;
};

export type WorksheetModel = {
  xColumnLabel: string;
  columns: WorksheetColumn[];
  rows: WorksheetRow[];
};

export type WorksheetSortColumn = "x" | string;
export type WorksheetSortDirection = "asc" | "desc";

export function seriesToWorksheet(series: ExperimentalSeries[]): WorksheetModel {
  if (series.length === 0) {
    return { xColumnLabel: "X", columns: [], rows: [] };
  }

  const xValues = new Set<number>();
  for (const item of series) {
    for (const point of item.points) {
      xValues.add(point.x);
    }
  }

  const sortedX = Array.from(xValues).sort((left, right) => left - right);
  const columns = series.map((item) => ({
    seriesId: item.id,
    label: item.name,
  }));

  const rows = sortedX.map((x, index) => ({
    rowKey: `ws-row-${index}-${x}`,
    x,
    values: Object.fromEntries(
      series.map((item) => {
        const point = item.points.find((candidate) => candidate.x === x);
        return [item.id, point ? point.y : null];
      })
    ),
  }));

  return { xColumnLabel: "X", columns, rows };
}

export function worksheetToSeries(
  model: WorksheetModel,
  previousSeries: ExperimentalSeries[]
): ExperimentalSeries[] {
  return model.columns.map((column, columnIndex) => {
    const previous = previousSeries.find((item) => item.id === column.seriesId);
    const color =
      previous?.color ??
      DEFAULT_WORKSHEET_COLORS[columnIndex % DEFAULT_WORKSHEET_COLORS.length];

    const points = model.rows
      .map((row) => {
        const y = row.values[column.seriesId];
        if (y === null || !Number.isFinite(y) || !Number.isFinite(row.x)) {
          return null;
        }
        return { x: row.x, y };
      })
      .filter((point): point is { x: number; y: number } => point !== null);

    return {
      id: column.seriesId,
      name: column.label.trim() || `Serie ${columnIndex + 1}`,
      color,
      points,
    };
  });
}

const DEFAULT_WORKSHEET_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#14b8a6",
];

export function createWorksheetRowKey(): string {
  return `ws-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sortWorksheetRows(
  rows: WorksheetRow[],
  sortColumn: WorksheetSortColumn,
  direction: WorksheetSortDirection
): WorksheetRow[] {
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftValue =
      sortColumn === "x" ? left.x : (left.values[sortColumn] ?? Number.NaN);
    const rightValue =
      sortColumn === "x" ? right.x : (right.values[sortColumn] ?? Number.NaN);

    if (!Number.isFinite(leftValue) && !Number.isFinite(rightValue)) return 0;
    if (!Number.isFinite(leftValue)) return 1;
    if (!Number.isFinite(rightValue)) return -1;
    if (leftValue === rightValue) return 0;
    return leftValue > rightValue ? factor : -factor;
  });
}

export function getWorksheetDimensions(model: WorksheetModel): {
  rowCount: number;
  columnCount: number;
} {
  return {
    rowCount: model.rows.length,
    columnCount: model.columns.length + 1,
  };
}

export function parseWorksheetNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

export function applyWorksheetModelUpdate(
  previousSeries: ExperimentalSeries[],
  updater: (model: WorksheetModel) => WorksheetModel
): ExperimentalSeries[] {
  const current = seriesToWorksheet(previousSeries);
  const nextModel = updater(current);
  return worksheetToSeries(nextModel, previousSeries);
}
