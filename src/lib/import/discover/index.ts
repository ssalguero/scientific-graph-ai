import type { SheetKind, SheetSnapshot, SheetSummary } from "../types";
import { cellToNumber, cellToText } from "../shared/cell";
import {
  countNonEmptyCells,
  getMatrixBounds,
  getNonEmptyRows,
  rowNumericRatio,
} from "../shared/matrix";
import { normalizeLabel } from "../shared/text";

const ADMIN_HINTS = [
  "solicitante",
  "codigo (no llenar)",
  "determinacion",
  "sa n",
  "fecha:",
];

const CHART_HINTS = ["grafico", "gráfico", "chart", "plot"];

export const classifySheetHeuristic = (
  sheet: SheetSnapshot
): { kind: SheetKind; warnings: string[] } => {
  const warnings: string[] = [];
  const matrix = sheet.matrix;

  if (matrix.length === 0 || countNonEmptyCells(matrix) === 0) {
    return { kind: "empty", warnings: ["Hoja vacía"] };
  }

  const nonEmptyRows = getNonEmptyRows(matrix);
  const flattened = nonEmptyRows
    .slice(0, 12)
    .flatMap((row) => row.map((cell) => normalizeLabel(cellToText(cell))))
    .filter(Boolean);

  if (flattened.some((text) => ADMIN_HINTS.some((hint) => text.includes(hint)))) {
    return { kind: "administrative", warnings: ["Formulario administrativo detectado"] };
  }

  const name = normalizeLabel(sheet.name);
  if (CHART_HINTS.some((hint) => name.includes(hint))) {
    return { kind: "chart-layout", warnings: ["Posible hoja preparada para gráfico"] };
  }

  const numericCells = matrix
    .flatMap((row) => (Array.isArray(row) ? row : []))
    .filter((cell) => cellToNumber(cell) !== null).length;
  const totalCells = countNonEmptyCells(matrix);
  const numericRatio = totalCells === 0 ? 0 : numericCells / totalCells;

  if (numericRatio >= 0.25 && nonEmptyRows.length >= 3) {
    return { kind: "tabular-data", warnings };
  }

  warnings.push("Estructura no reconocida automáticamente");
  return { kind: "unknown", warnings };
};

export const buildSheetSummary = (sheet: SheetSnapshot): SheetSummary => {
  const { kind, warnings } = classifySheetHeuristic(sheet);
  const nonEmptyRows = getNonEmptyRows(sheet.matrix);
  const { maxCol } = getMatrixBounds(sheet.matrix);
  const nonEmptyCells = countNonEmptyCells(sheet.matrix);

  let importScore = 0;
  switch (kind) {
    case "tabular-data":
      importScore = 100 + Math.min(nonEmptyRows.length, 50);
      break;
    case "chart-layout":
      importScore = 70 + Math.min(nonEmptyRows.length, 20);
      break;
    case "unknown":
      importScore = 40 + Math.min(nonEmptyRows.length, 20);
      break;
    case "administrative":
      importScore = 10;
      break;
    case "empty":
      importScore = 0;
      break;
  }

  if (numericDensity(sheet.matrix) > 0.4) importScore += 15;

  return {
    name: sheet.name,
    rowCount: nonEmptyRows.length,
    colCount: maxCol + 1,
    nonEmptyCells,
    kind,
    importScore,
    warnings,
    previewRows: nonEmptyRows.slice(0, 5).map((row) => row.slice(0, 8)),
  };
};

const numericDensity = (matrix: unknown[][]): number => {
  const rows = getNonEmptyRows(matrix).slice(0, 20);
  if (rows.length === 0) return 0;
  return (
    rows.reduce((sum, row) => sum + rowNumericRatio(row), 0) / rows.length
  );
};

export const discoverSheets = (sheets: SheetSnapshot[]): SheetSummary[] =>
  sheets.map(buildSheetSummary);

export const rankSheetsForImport = (summaries: SheetSummary[]): SheetSummary[] =>
  [...summaries].sort((a, b) => b.importScore - a.importScore);

export const getRecommendedSheetName = (
  summaries: SheetSummary[]
): string | null => {
  const ranked = rankSheetsForImport(summaries).filter(
    (sheet) => sheet.kind !== "empty" && sheet.kind !== "administrative"
  );
  return ranked[0]?.name ?? null;
};
