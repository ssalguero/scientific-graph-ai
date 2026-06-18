import type { TableRegion } from "../types";
import { cellToNumber, cellToText } from "../shared/cell";
import {
  getMatrixBounds,
  getNonEmptyRows,
  rowNumericRatio,
} from "../shared/matrix";

const isHeaderCandidate = (row: unknown[]): boolean => {
  const labels = row
    .map((cell) => cellToText(cell))
    .filter((text) => text.length > 0);
  if (labels.length < 2) return false;

  const textLabels = labels.filter((label) => cellToNumber(label) === null);
  return textLabels.length >= Math.max(2, Math.ceil(labels.length * 0.4));
};

const findHeaderRowIndex = (matrix: unknown[][]): number => {
  const { maxRow } = getMatrixBounds(matrix);
  let bestIndex = 0;
  let bestScore = -1;

  for (let rowIndex = 0; rowIndex <= Math.min(maxRow, 25); rowIndex += 1) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row)) continue;
    if (!isHeaderCandidate(row)) continue;

    const labelCount = row.filter(
      (cell) => cellToText(cell) !== "" && cellToNumber(cell) === null
    ).length;
    const score = labelCount * 10 - rowIndex;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = rowIndex;
    }
  }

  return bestIndex;
};

const findTableEndRow = (
  matrix: unknown[][],
  headerRowIndex: number,
  startCol: number,
  endCol: number
): number => {
  const { maxRow } = getMatrixBounds(matrix);
  let endRow = headerRowIndex;
  let emptyStreak = 0;

  for (let rowIndex = headerRowIndex + 1; rowIndex <= maxRow; rowIndex += 1) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row)) {
      emptyStreak += 1;
      if (emptyStreak >= 3) break;
      continue;
    }

    const populated = row
      .slice(startCol, endCol + 1)
      .some((cell) => cellToText(cell) !== "");
    if (!populated) {
      emptyStreak += 1;
      if (emptyStreak >= 3) break;
      continue;
    }

    emptyStreak = 0;
    endRow = rowIndex;
  }

  return endRow;
};

export const detectTableRegion = (
  matrix: unknown[][],
  headerRowOverride?: number
): TableRegion | null => {
  const trimmed = getNonEmptyRows(matrix);
  if (trimmed.length < 2) return null;

  const bounds = getMatrixBounds(matrix);
  const headerRowIndex =
    headerRowOverride !== undefined ? headerRowOverride : findHeaderRowIndex(matrix);
  const headerRow = matrix[headerRowIndex];
  if (!Array.isArray(headerRow)) return null;

  let startCol = -1;
  let endCol = bounds.maxCol;
  for (let col = 0; col <= bounds.maxCol; col += 1) {
    const hasHeader = matrix
      .slice(headerRowIndex, headerRowIndex + 6)
      .some((row) => Array.isArray(row) && cellToText(row[col]) !== "");
    if (hasHeader && startCol < 0 && cellToText(headerRow[col]) === "") {
      continue;
    }
    if (cellToText(headerRow[col]) !== "" || startCol >= 0) {
      if (startCol < 0 && cellToText(headerRow[col]) !== "") startCol = col;
      if (cellToText(headerRow[col]) !== "" || (startCol >= 0 && col > startCol)) {
        endCol = col;
      }
    }
  }

  if (startCol < 0) startCol = 0;

  const endRow = findTableEndRow(matrix, headerRowIndex, startCol, endCol);
  const dataRows = matrix.slice(headerRowIndex + 1, endRow + 1);
  const numericCoverage =
    dataRows.length === 0
      ? 0
      : dataRows.reduce((sum, row) => sum + rowNumericRatio(row), 0) /
        dataRows.length;

  return {
    startRow: 0,
    endRow,
    startCol,
    endCol,
    headerRowIndex,
    metadataRowCount: headerRowIndex,
    confidence: Math.min(
      0.95,
      0.45 + numericCoverage * 0.4 + (isHeaderCandidate(headerRow) ? 0.15 : 0)
    ),
  };
};

export const getMetadataRows = (
  matrix: unknown[][],
  region: TableRegion
): unknown[][] => matrix.slice(0, region.headerRowIndex);

export const getDataRows = (
  matrix: unknown[][],
  region: TableRegion
): unknown[][] => matrix.slice(region.headerRowIndex + 1, region.endRow + 1);
