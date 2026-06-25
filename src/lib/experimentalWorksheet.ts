import type { ExperimentalSeries } from "./experimentalData";
import type { ImportAuxiliaryColumn } from "./import/types";
import { evaluateWorksheetFormula } from "./worksheetFormulaBuilder";

export type WorksheetColumnType = "numeric" | "text" | "category" | "date";

export type WorksheetTransformKind =
  | "log"
  | "power"
  | "scale"
  | "normalize"
  | "zscore"
  | "formula";

export type WorksheetColumnTransform = {
  kind: WorksheetTransformKind;
  enabled: boolean;
  params?: Record<string, number>;
  /** Columna origen — trazabilidad para transformaciones de una columna (DATA-2A). */
  sourceSeriesId?: string;
  /** Expresión matemática (DATA-2B). */
  expression?: string;
  /** Marca temporal ISO — auditoría (DATA-2B). */
  createdAt?: string;
  /** Columnas referenciadas en la fórmula (DATA-2B). */
  sourceSeriesIds?: string[];
};

export type WorksheetColumnMetadata = {
  columnType: WorksheetColumnType;
  transforms: WorksheetColumnTransform[];
};

export type WorksheetColumnRegistry = Record<string, WorksheetColumnMetadata>;

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

export type WorksheetPasteAnchor = {
  rowKey: string;
  column: "x" | string;
  kind?: "header" | "cell";
};

export type WorksheetPasteResult = {
  model: WorksheetModel;
  changed: boolean;
};

export type WorksheetSelection = {
  rowKeys: string[];
  columns: Array<"x" | string>;
};

export const DEFAULT_COLUMN_METADATA: WorksheetColumnMetadata = {
  columnType: "numeric",
  transforms: [],
};

export function createDefaultColumnRegistry(
  columns: WorksheetColumn[],
  previous: WorksheetColumnRegistry = {}
): WorksheetColumnRegistry {
  const next: WorksheetColumnRegistry = {};

  for (const column of columns) {
    next[column.seriesId] = previous[column.seriesId] ?? {
      ...DEFAULT_COLUMN_METADATA,
      transforms: [],
    };
  }

  return next;
}

export function buildColumnRegistryFromImportAuxiliary(
  columns: WorksheetColumn[],
  auxiliaryColumns: ImportAuxiliaryColumn[] | undefined,
  previous: WorksheetColumnRegistry = {}
): WorksheetColumnRegistry {
  const registry = createDefaultColumnRegistry(columns, previous);

  for (const aux of auxiliaryColumns ?? []) {
    registry[aux.id] = {
      columnType: "category",
      transforms: [],
    };
  }

  return registry;
}

export function cloneColumnMetadata(
  metadata: WorksheetColumnMetadata
): WorksheetColumnMetadata {
  return {
    columnType: metadata.columnType,
    transforms: metadata.transforms.map((transform) => ({
      ...transform,
      params: transform.params ? { ...transform.params } : undefined,
      sourceSeriesIds: transform.sourceSeriesIds
        ? [...transform.sourceSeriesIds]
        : undefined,
    })),
  };
}

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

export function createWorksheetSeriesId(): string {
  return `ws-col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateDefaultColumnName(columns: WorksheetColumn[]): string {
  if (columns.length === 0) {
    return "Nueva variable";
  }

  const used = new Set(columns.map((column) => column.label.trim().toLowerCase()));
  if (!used.has("nueva variable")) {
    return "Nueva variable";
  }

  let index = columns.length + 1;
  while (used.has(`variable ${index}`.toLowerCase())) {
    index += 1;
  }

  return `Variable ${index}`;
}

export function generateDuplicateColumnLabel(
  sourceLabel: string,
  columns: WorksheetColumn[]
): string {
  const base = `${sourceLabel.trim()} (copia)`;
  const used = new Set(columns.map((column) => column.label.trim().toLowerCase()));
  if (!used.has(base.toLowerCase())) {
    return base;
  }

  let index = 2;
  while (used.has(`${sourceLabel.trim()} (copia ${index})`.toLowerCase())) {
    index += 1;
  }

  return `${sourceLabel.trim()} (copia ${index})`;
}

export function renameWorksheetColumn(
  model: WorksheetModel,
  seriesId: string,
  label: string
): WorksheetModel {
  const nextLabel = label.trim();
  if (nextLabel.length === 0) {
    return model;
  }

  return {
    ...model,
    columns: model.columns.map((column) =>
      column.seriesId === seriesId ? { ...column, label: nextLabel } : column
    ),
  };
}

export function insertWorksheetColumn(
  model: WorksheetModel,
  label?: string
): WorksheetModel {
  const seriesId = createWorksheetSeriesId();
  const nextLabel = label?.trim() || generateDefaultColumnName(model.columns);

  return {
    ...model,
    columns: [...model.columns, { seriesId, label: nextLabel }],
    rows: model.rows.map((row) => ({
      ...row,
      values: {
        ...row.values,
        [seriesId]: null,
      },
    })),
  };
}

export function duplicateWorksheetColumn(
  model: WorksheetModel,
  sourceSeriesId: string
): WorksheetModel {
  const sourceIndex = model.columns.findIndex(
    (column) => column.seriesId === sourceSeriesId
  );
  if (sourceIndex < 0) {
    return model;
  }

  const source = model.columns[sourceIndex];
  const seriesId = createWorksheetSeriesId();
  const label = generateDuplicateColumnLabel(source.label, model.columns);
  const columns = [...model.columns];
  columns.splice(sourceIndex + 1, 0, { seriesId, label });

  return {
    ...model,
    columns,
    rows: model.rows.map((row) => ({
      ...row,
      values: {
        ...row.values,
        [seriesId]: row.values[sourceSeriesId] ?? null,
      },
    })),
  };
}

export function deleteWorksheetColumn(
  model: WorksheetModel,
  seriesId: string
): WorksheetModel {
  return {
    ...model,
    columns: model.columns.filter((column) => column.seriesId !== seriesId),
    rows: model.rows.map((row) => {
      const nextValues = { ...row.values };
      delete nextValues[seriesId];
      return { ...row, values: nextValues };
    }),
  };
}

const TRANSFORM_LABEL_SUFFIX: Record<
  Exclude<WorksheetTransformKind, "formula" | "scale" | "power">,
  string
> = {
  log: "Log10",
  zscore: "Z",
  normalize: "Norm",
};

export function generateTransformedColumnLabel(
  sourceLabel: string,
  transform: WorksheetColumnTransform,
  columns: WorksheetColumn[]
): string {
  const trimmed = sourceLabel.trim();
  let base: string;

  if (transform.kind === "scale") {
    const factor = transform.params?.factor ?? 1;
    base = `${trimmed} (×${formatTransformParam(factor)})`;
  } else if (transform.kind === "power") {
    const exponent = transform.params?.exponent ?? 2;
    base = `${trimmed} (^${formatTransformParam(exponent)})`;
  } else if (transform.kind === "formula") {
    base = trimmed;
  } else {
    base = `${trimmed} (${TRANSFORM_LABEL_SUFFIX[transform.kind]})`;
  }

  const used = new Set(columns.map((column) => column.label.trim().toLowerCase()));
  if (!used.has(base.toLowerCase())) {
    return base;
  }

  let index = 2;
  while (used.has(`${base} ${index}`.toLowerCase())) {
    index += 1;
  }

  return `${base} ${index}`;
}

function formatTransformParam(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(value).replace(/\.?0+$/, "");
}

function collectColumnValues(
  rows: WorksheetRow[],
  seriesId: string
): Array<number | null> {
  return rows.map((row) => {
    const value = row.values[seriesId] ?? null;
    return value !== null && Number.isFinite(value) ? value : null;
  });
}

export function transformWorksheetValues(
  values: Array<number | null>,
  transform: WorksheetColumnTransform
): Array<number | null> {
  const finiteValues = values.filter(
    (value): value is number => value !== null && Number.isFinite(value)
  );

  if (finiteValues.length === 0) {
    return values.map(() => null);
  }

  switch (transform.kind) {
    case "log":
      return values.map((value) =>
        value !== null && value > 0 && Number.isFinite(value)
          ? Math.log10(value)
          : null
      );
    case "scale": {
      const factor = transform.params?.factor;
      if (factor === undefined || !Number.isFinite(factor)) {
        return values.map(() => null);
      }
      return values.map((value) =>
        value !== null && Number.isFinite(value) ? value * factor : null
      );
    }
    case "power": {
      const exponent = transform.params?.exponent;
      if (exponent === undefined || !Number.isFinite(exponent)) {
        return values.map(() => null);
      }
      return values.map((value) => {
        if (value === null || !Number.isFinite(value)) return null;
        const result = Math.pow(value, exponent);
        return Number.isFinite(result) ? result : null;
      });
    }
    case "normalize": {
      const min = Math.min(...finiteValues);
      const max = Math.max(...finiteValues);
      const range = max - min;
      if (range === 0) {
        return values.map((value) =>
          value !== null && Number.isFinite(value) ? 0 : null
        );
      }
      return values.map((value) =>
        value !== null && Number.isFinite(value) ? (value - min) / range : null
      );
    }
    case "zscore": {
      const mean =
        finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
      const variance =
        finiteValues.length > 1
          ? finiteValues.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
            (finiteValues.length - 1)
          : 0;
      const stdDev = Math.sqrt(variance);
      if (stdDev === 0) {
        return values.map((value) =>
          value !== null && Number.isFinite(value) ? 0 : null
        );
      }
      return values.map((value) =>
        value !== null && Number.isFinite(value) ? (value - mean) / stdDev : null
      );
    }
    case "formula":
      return values.map(() => null);
    default:
      return values.map(() => null);
  }
}

export function createTransformColumnMetadata(
  sourceSeriesId: string,
  sourceMetadata: WorksheetColumnMetadata,
  transform: WorksheetColumnTransform
): WorksheetColumnMetadata {
  return {
    columnType: "numeric",
    transforms: [
      {
        ...transform,
        enabled: true,
        sourceSeriesId,
      },
    ],
  };
}

export function transformWorksheetColumn(
  model: WorksheetModel,
  sourceSeriesId: string,
  transform: WorksheetColumnTransform
): WorksheetModel | null {
  const sourceIndex = model.columns.findIndex(
    (column) => column.seriesId === sourceSeriesId
  );
  if (sourceIndex < 0) {
    return null;
  }

  const source = model.columns[sourceIndex]!;
  const sourceValues = collectColumnValues(model.rows, sourceSeriesId);
  const transformedValues = transformWorksheetValues(sourceValues, transform);
  const seriesId = createWorksheetSeriesId();
  const label = generateTransformedColumnLabel(source.label, transform, model.columns);
  const columns = [...model.columns];
  columns.splice(sourceIndex + 1, 0, { seriesId, label });

  return {
    ...model,
    columns,
    rows: model.rows.map((row, rowIndex) => ({
      ...row,
      values: {
        ...row.values,
        [seriesId]: transformedValues[rowIndex] ?? null,
      },
    })),
  };
}

export function createFormulaColumnMetadata(
  transform: WorksheetColumnTransform
): WorksheetColumnMetadata {
  return {
    columnType: "numeric",
    transforms: [
      {
        ...transform,
        enabled: true,
      },
    ],
  };
}

export function createFormulaWorksheetColumn(
  model: WorksheetModel,
  columnLabel: string,
  expression: string,
  insertAfterSeriesId: string | null = null
):
  | {
      model: WorksheetModel;
      seriesId: string;
      transform: WorksheetColumnTransform;
    }
  | { error: string } {
  const trimmedLabel = columnLabel.trim();
  if (!trimmedLabel) {
    return { error: "Indique un nombre para la nueva variable." };
  }

  const used = new Set(
    model.columns.map((column) => column.label.trim().toLowerCase())
  );
  if (used.has(trimmedLabel.toLowerCase())) {
    return { error: `Ya existe una variable "${trimmedLabel}".` };
  }

  const evaluation = evaluateWorksheetFormula(model, expression);
  if ("error" in evaluation) {
    return { error: evaluation.error };
  }

  const seriesId = createWorksheetSeriesId();
  let insertIndex = model.columns.length;
  if (insertAfterSeriesId) {
    const sourceIndex = model.columns.findIndex(
      (column) => column.seriesId === insertAfterSeriesId
    );
    if (sourceIndex >= 0) {
      insertIndex = sourceIndex + 1;
    }
  }

  const columns = [...model.columns];
  columns.splice(insertIndex, 0, { seriesId, label: trimmedLabel });

  const transform: WorksheetColumnTransform = {
    kind: "formula",
    enabled: true,
    expression: evaluation.normalizedExpression,
    createdAt: new Date().toISOString(),
    sourceSeriesIds: evaluation.sourceSeriesIds,
  };

  return {
    model: {
      ...model,
      columns,
      rows: model.rows.map((row, rowIndex) => ({
        ...row,
        values: {
          ...row.values,
          [seriesId]: evaluation.values[rowIndex] ?? null,
        },
      })),
    },
    seriesId,
    transform,
  };
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

export function getWorksheetStatusSummary(
  model: WorksheetModel,
  registry: WorksheetColumnRegistry
): {
  rowCount: number;
  columnCount: number;
  numericVariables: number;
  categoricalVariables: number;
} {
  let numericVariables = 0;
  let categoricalVariables = 0;

  for (const column of model.columns) {
    const columnType =
      registry[column.seriesId]?.columnType ?? DEFAULT_COLUMN_METADATA.columnType;
    if (columnType === "numeric" || columnType === "date") {
      numericVariables += 1;
    } else {
      categoricalVariables += 1;
    }
  }

  return {
    rowCount: model.rows.length,
    columnCount: model.columns.length + 1,
    numericVariables,
    categoricalVariables,
  };
}

export function parseWorksheetNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

export function parseTabularClipboard(text: string): string[][] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
  if (normalized.length === 0) {
    return [];
  }

  return normalized
    .split("\n")
    .map((line) => line.split("\t"))
    .filter((row) => row.some((cell) => cell.trim().length > 0));
}

export function rowLooksLikeHeader(cells: string[]): boolean {
  if (cells.length === 0) {
    return false;
  }

  return cells.every((cell) => {
    const trimmed = cell.trim();
    if (trimmed.length === 0) {
      return true;
    }
    return parseWorksheetNumericInput(trimmed) === null;
  });
}

type PasteTarget =
  | { kind: "x" }
  | { kind: "data"; columnIndex: number };

function resolvePasteTarget(
  colOffset: number,
  startColumn: "x" | number
): PasteTarget | null {
  if (startColumn === "x") {
    if (colOffset === 0) {
      return { kind: "x" };
    }
    return { kind: "data", columnIndex: colOffset - 1 };
  }

  const columnIndex = startColumn + colOffset;
  if (columnIndex < 0) {
    return null;
  }

  return { kind: "data", columnIndex };
}

function createEmptyWorksheetRow(
  existingRows: WorksheetRow[],
  columns: WorksheetColumn[]
): WorksheetRow {
  const nextX =
    existingRows.length === 0
      ? 0
      : Math.max(...existingRows.map((row) => row.x)) + 1;

  return {
    rowKey: createWorksheetRowKey(),
    x: nextX,
    values: Object.fromEntries(
      columns.map((column) => [column.seriesId, null])
    ),
  };
}

function ensureWorksheetRowAtIndex(
  rows: WorksheetRow[],
  targetIndex: number,
  columns: WorksheetColumn[]
): WorksheetRow[] {
  const next = rows.map((row) => ({
    ...row,
    values: { ...row.values },
  }));

  while (next.length <= targetIndex) {
    next.push(createEmptyWorksheetRow(next, columns));
  }

  return next;
}

function shouldStripLeadingHeaderRow(
  grid: string[][],
  startColumn: "x" | number,
  startRowIndex: number
): boolean {
  if (grid.length <= 1 || !rowLooksLikeHeader(grid[0])) {
    return false;
  }

  const maxWidth = Math.max(...grid.map((row) => row.length));

  if (maxWidth === 1) {
    return true;
  }

  return startRowIndex === 0 && (startColumn === "x" || startColumn === 0);
}

function resolvePasteStartRowIndex(
  model: WorksheetModel,
  anchor: WorksheetPasteAnchor | null | undefined
): number {
  if (!anchor) {
    return model.rows.length;
  }

  if (anchor.kind === "header") {
    return 0;
  }

  const anchorRowIndex = model.rows.findIndex((row) => row.rowKey === anchor.rowKey);
  return anchorRowIndex >= 0 ? anchorRowIndex : model.rows.length;
}

function resolvePasteStartColumn(
  model: WorksheetModel,
  anchor: WorksheetPasteAnchor | null | undefined,
  maxWidth: number
): "x" | number {
  if (anchor?.column === "x") {
    return "x";
  }

  if (anchor && anchor.column !== "x") {
    const columnIndex = model.columns.findIndex(
      (column) => column.seriesId === anchor.column
    );
    return columnIndex >= 0 ? columnIndex : 0;
  }

  return maxWidth > 1 ? "x" : 0;
}

function worksheetModelDataEqual(
  left: WorksheetModel,
  right: WorksheetModel
): boolean {
  if (left.columns.length !== right.columns.length) {
    return false;
  }

  if (left.rows.length !== right.rows.length) {
    return false;
  }

  for (let index = 0; index < left.columns.length; index += 1) {
    const leftColumn = left.columns[index];
    const rightColumn = right.columns[index];
    if (
      leftColumn.seriesId !== rightColumn.seriesId ||
      leftColumn.label !== rightColumn.label
    ) {
      return false;
    }
  }

  for (let index = 0; index < left.rows.length; index += 1) {
    const leftRow = left.rows[index];
    const rightRow = right.rows[index];

    if (leftRow.x !== rightRow.x) {
      return false;
    }

    for (const column of left.columns) {
      if (
        (leftRow.values[column.seriesId] ?? null) !==
        (rightRow.values[column.seriesId] ?? null)
      ) {
        return false;
      }
    }
  }

  return true;
}

export function pasteTabularDataIntoModel(
  model: WorksheetModel,
  rawGrid: string[][],
  anchor?: WorksheetPasteAnchor | null
): WorksheetPasteResult {
  if (rawGrid.length === 0) {
    return { model, changed: false };
  }

  let grid = rawGrid.map((row) => [...row]);
  let headerLabels: string[] | null = null;

  const startRowIndex = resolvePasteStartRowIndex(model, anchor ?? null);
  const maxWidthBeforeHeader = Math.max(...grid.map((row) => row.length));
  const startColumnBeforeHeader = resolvePasteStartColumn(
    model,
    anchor ?? null,
    maxWidthBeforeHeader
  );

  if (
    shouldStripLeadingHeaderRow(
      grid,
      startColumnBeforeHeader,
      startRowIndex
    )
  ) {
    headerLabels = grid[0].map((cell) => cell.trim());
    grid = grid.slice(1);
  }

  if (grid.length === 0) {
    return { model, changed: false };
  }

  const maxWidth = Math.max(...grid.map((row) => row.length));
  const startColumn = resolvePasteStartColumn(model, anchor ?? null, maxWidth);

  let columns = [...model.columns];
  let maxRequiredDataColumnIndex = columns.length - 1;

  for (const cells of grid) {
    for (let colOffset = 0; colOffset < cells.length; colOffset += 1) {
      const target = resolvePasteTarget(colOffset, startColumn);
      if (target?.kind === "data") {
        maxRequiredDataColumnIndex = Math.max(
          maxRequiredDataColumnIndex,
          target.columnIndex
        );
      }
    }
  }

  while (columns.length <= maxRequiredDataColumnIndex) {
    columns.push({
      seriesId: createWorksheetSeriesId(),
      label: generateDefaultColumnName(columns),
    });
  }

  if (headerLabels) {
    if (headerLabels.length === 1 && typeof startColumn === "number") {
      const label = headerLabels[0];
      if (label.length > 0 && startColumn < columns.length) {
        columns[startColumn] = { ...columns[startColumn], label };
      }
    } else {
      const headerStartIndex = startColumn === "x" ? 1 : startColumn + 1;
      headerLabels.slice(headerStartIndex).forEach((label, offset) => {
        const columnIndex =
          startColumn === "x" ? offset : startColumn + offset + 1;
        if (columnIndex < columns.length && label.length > 0) {
          columns[columnIndex] = { ...columns[columnIndex], label };
        }
      });
    }
  }

  let rows = model.rows.map((row) => ({
    ...row,
    values: { ...row.values },
  }));

  for (let rowOffset = 0; rowOffset < grid.length; rowOffset += 1) {
    const targetRowIndex = startRowIndex + rowOffset;
    rows = ensureWorksheetRowAtIndex(rows, targetRowIndex, columns);

    const cells = grid[rowOffset] ?? [];
    const currentRow = rows[targetRowIndex];
    const nextRow: WorksheetRow = {
      ...currentRow,
      values: { ...currentRow.values },
    };

    for (let colOffset = 0; colOffset < cells.length; colOffset += 1) {
      const target = resolvePasteTarget(colOffset, startColumn);
      if (!target) {
        continue;
      }

      const rawCell = cells[colOffset] ?? "";
      const parsedValue = parseWorksheetNumericInput(rawCell);

      if (target.kind === "x") {
        if (parsedValue !== null) {
          nextRow.x = parsedValue;
        }
        continue;
      }

      const seriesId = columns[target.columnIndex]?.seriesId;
      if (!seriesId) {
        continue;
      }

      if (rawCell.trim() === "") {
        nextRow.values[seriesId] = null;
      } else if (parsedValue !== null) {
        nextRow.values[seriesId] = parsedValue;
      }
    }

    rows[targetRowIndex] = nextRow;
  }

  const nextModel: WorksheetModel = {
    ...model,
    columns,
    rows,
  };

  return {
    model: nextModel,
    changed: !worksheetModelDataEqual(model, nextModel),
  };
}

function formatClipboardCell(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "";
  }
  return String(value);
}

export function formatWorksheetSelectionAsTsv(
  model: WorksheetModel,
  selection: WorksheetSelection
): string {
  const columnOrder =
    selection.columns.length > 0
      ? selection.columns
      : (["x", ...model.columns.map((column) => column.seriesId)] as Array<
          "x" | string
        >);

  const selectedRows =
    selection.rowKeys.length > 0
      ? model.rows.filter((row) => selection.rowKeys.includes(row.rowKey))
      : model.rows;

  return selectedRows
    .map((row) =>
      columnOrder
        .map((column) => {
          if (column === "x") {
            return formatClipboardCell(row.x);
          }
          return formatClipboardCell(row.values[column] ?? null);
        })
        .join("\t")
    )
    .join("\n");
}

export function applyWorksheetModelUpdate(
  previousSeries: ExperimentalSeries[],
  updater: (model: WorksheetModel) => WorksheetModel
): ExperimentalSeries[] {
  const current = seriesToWorksheet(previousSeries);
  const nextModel = updater(current);
  return worksheetToSeries(nextModel, previousSeries);
}

export const WORKSHEET_COLUMN_TYPE_LABELS: Record<WorksheetColumnType, string> =
  {
    numeric: "Numérica",
    text: "Texto",
    category: "Categoría",
    date: "Fecha",
  };

export const WORKSHEET_COLUMN_TYPE_BADGES: Record<WorksheetColumnType, string> =
  {
    numeric: "#",
    text: "T",
    category: "K",
    date: "D",
  };

export type WorksheetPresetTransformKind = Exclude<
  WorksheetTransformKind,
  "formula"
>;

export const WORKSHEET_TRANSFORM_MENU_LABELS: Record<
  WorksheetPresetTransformKind,
  string
> = {
    log: "Log10",
    zscore: "Z-Score",
    normalize: "Normalizar (0-1)",
    scale: "Escalar × factor",
    power: "Potencia (^n)",
  };
