import type { TableRegion } from "@/lib/import";
import { cellToNumber, cellToText } from "@/lib/import/shared/cell";
import { getMatrixBounds, rowNumericRatio } from "@/lib/import/shared/matrix";

export type ConfidenceLevel = "Alta" | "Media" | "Baja";

export type RegionSummary = {
  rowRange: string;
  metadataRowCount: number;
  dataRowCount: number;
  columnRange: string;
};

export type RowKind = "metadata" | "header" | "data";

export const columnIndexToLetter = (index: number): string => {
  let value = index + 1;
  let letters = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    value = Math.floor((value - 1) / 26);
  }
  return letters;
};

export const formatRegionSummary = (region: TableRegion): RegionSummary => {
  const dataRowCount = Math.max(0, region.endRow - region.headerRowIndex);
  const startRowDisplay = region.startRow + 1;
  const endRowDisplay = region.endRow + 1;

  return {
    rowRange: `${startRowDisplay}–${endRowDisplay}`,
    metadataRowCount: region.metadataRowCount,
    dataRowCount,
    columnRange: `${columnIndexToLetter(region.startCol)}–${columnIndexToLetter(region.endCol)}`,
  };
};

export const getConfidenceLevel = (confidence: number): ConfidenceLevel => {
  if (confidence >= 0.75) return "Alta";
  if (confidence >= 0.55) return "Media";
  return "Baja";
};

const isHeaderLikeRow = (row: unknown[] | undefined): boolean => {
  if (!Array.isArray(row)) return false;
  const labels = row
    .map((cell) => cellToText(cell))
    .filter((text) => text.length > 0);
  if (labels.length < 2) return false;
  const textLabels = labels.filter((label) => cellToNumber(label) === null);
  return textLabels.length >= Math.max(2, Math.ceil(labels.length * 0.4));
};

export const getConfidenceReasons = (
  matrix: unknown[][],
  region: TableRegion
): string[] => {
  const reasons: string[] = [];
  const headerRow = matrix[region.headerRowIndex];

  if (isHeaderLikeRow(headerRow)) {
    reasons.push("Encabezados detectados");
  }

  const dataRows = matrix.slice(
    region.headerRowIndex + 1,
    region.endRow + 1
  );
  if (dataRows.length > 0) {
    const numericCoverage =
      dataRows.reduce((sum, row) => sum + rowNumericRatio(row), 0) /
      dataRows.length;
    if (numericCoverage >= 0.5) {
      reasons.push("Alta densidad numérica");
    } else if (numericCoverage >= 0.25) {
      reasons.push("Densidad numérica moderada");
    }
  }

  const { maxRow } = getMatrixBounds(matrix);
  if (region.endRow < maxRow) {
    reasons.push("Fin de tabla identificado");
  }

  if (region.metadataRowCount > 0) {
    reasons.push(`${region.metadataRowCount} fila${region.metadataRowCount === 1 ? "" : "s"} de metadatos`);
  }

  if (reasons.length === 0) {
    reasons.push("Región tabular inferida con señales limitadas");
  }

  return reasons;
};

export const classifyRegionRow = (
  rowIndex: number,
  region: TableRegion
): RowKind => {
  if (rowIndex < region.headerRowIndex) return "metadata";
  if (rowIndex === region.headerRowIndex) return "header";
  return "data";
};

export const sliceRegionMatrix = (
  matrix: unknown[][],
  region: TableRegion
): { rowIndex: number; cells: unknown[] }[] => {
  const rows: { rowIndex: number; cells: unknown[] }[] = [];
  for (let rowIndex = region.startRow; rowIndex <= region.endRow; rowIndex += 1) {
    const row = matrix[rowIndex];
    const cells: unknown[] = [];
    for (let col = region.startCol; col <= region.endCol; col += 1) {
      cells.push(Array.isArray(row) ? row[col] : "");
    }
    rows.push({ rowIndex, cells });
  }
  return rows;
};

export const confidenceLevelClass: Record<ConfidenceLevel, string> = {
  Alta: "text-[var(--app-success-text,#15803d)]",
  Media: "text-[var(--app-warning-text)]",
  Baja: "text-[var(--app-danger-text)]",
};

export const rowKindClass: Record<RowKind, string> = {
  metadata:
    "bg-[var(--app-surface-muted)]/80 text-[var(--app-text-muted)] italic",
  header:
    "bg-[var(--app-accent-soft)] font-semibold text-[var(--app-heading)]",
  data: "bg-[var(--app-surface)] text-[var(--app-text)]",
};
