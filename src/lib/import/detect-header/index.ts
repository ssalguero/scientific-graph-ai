import type { ColumnDescriptor, TableRegion } from "../types";
import { cellToNumber, cellToText } from "../shared/cell";
import { columnNumericRatio } from "../shared/matrix";

export const extractColumnLabels = (
  matrix: unknown[][],
  region: TableRegion
): string[] => {
  const headerRow = matrix[region.headerRowIndex] ?? [];
  const labels: string[] = [];

  for (let col = region.startCol; col <= region.endCol; col += 1) {
    const label = cellToText(headerRow[col]);
    labels.push(label || `Columna ${col + 1}`);
  }

  return labels;
};

export const buildColumnDescriptors = (
  matrix: unknown[][],
  region: TableRegion
): ColumnDescriptor[] => {
  const labels = extractColumnLabels(matrix, region);
  const descriptors: ColumnDescriptor[] = [];

  labels.forEach((label, offset) => {
    const index = region.startCol + offset;
    const sampleValues: unknown[] = [];

    for (
      let rowIndex = region.headerRowIndex + 1;
      rowIndex <= Math.min(region.endRow, region.headerRowIndex + 8);
      rowIndex += 1
    ) {
      const row = matrix[rowIndex];
      if (!Array.isArray(row)) continue;
      const value = row[index];
      if (cellToText(value) !== "") sampleValues.push(value);
    }

    descriptors.push({
      index,
      label,
      sampleValues,
      numericRatio: columnNumericRatio(
        matrix,
        index,
        region.headerRowIndex + 1,
        region.endRow
      ),
    });
  });

  return descriptors;
};

export const detectHeaderRow = (
  matrix: unknown[][],
  region: TableRegion
): number => region.headerRowIndex;
