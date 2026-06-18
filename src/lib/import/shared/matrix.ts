import { cellToNumber, cellToText, isEmptyCell } from "./cell";

export const getNonEmptyRows = (matrix: unknown[][]): unknown[][] =>
  matrix
    .filter((row): row is unknown[] => Array.isArray(row))
    .filter((row) => row.some((cell) => cellToText(cell) !== ""));

export const getMatrixBounds = (matrix: unknown[][]) => {
  let maxRow = 0;
  let maxCol = 0;

  matrix.forEach((row, rowIndex) => {
    if (!Array.isArray(row)) return;
    row.forEach((cell, colIndex) => {
      if (cellToText(cell) === "") return;
      maxRow = Math.max(maxRow, rowIndex);
      maxCol = Math.max(maxCol, colIndex);
    });
  });

  return { maxRow, maxCol };
};

export const trimMatrixToBounds = (matrix: unknown[][]): unknown[][] => {
  const { maxRow, maxCol } = getMatrixBounds(matrix);
  return matrix.slice(0, maxRow + 1).map((row) =>
    Array.isArray(row) ? row.slice(0, maxCol + 1) : []
  );
};

export const countNonEmptyCells = (matrix: unknown[][]): number => {
  let count = 0;
  for (const row of matrix) {
    if (!Array.isArray(row)) continue;
    for (const cell of row) {
      if (cellToText(cell) !== "") count += 1;
    }
  }
  return count;
};

export const rowNumericRatio = (row: unknown[]): number => {
  const populated = row.filter((cell) => cellToText(cell) !== "");
  if (populated.length === 0) return 0;
  const numeric = populated.filter((cell) => cellToNumber(cell) !== null).length;
  return numeric / populated.length;
};

export const columnNumericRatio = (
  matrix: unknown[][],
  colIndex: number,
  startRow: number,
  endRow: number
): number => {
  let populated = 0;
  let numeric = 0;

  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row)) continue;
    const cell = row[colIndex];
    if (cellToText(cell) === "") continue;
    populated += 1;
    if (cellToNumber(cell) !== null) numeric += 1;
  }

  return populated === 0 ? 0 : numeric / populated;
};
