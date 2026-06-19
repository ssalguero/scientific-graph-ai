import type { ImportPreviewStats, PreviewPoint } from "../types";

const mean = (values: number[]): number | null =>
  values.length === 0
    ? null
    : values.reduce((total, value) => total + value, 0) / values.length;

export const buildPreviewStats = (
  points: PreviewPoint[],
  skippedRowCount: number,
  evaluatedRowCount: number
): ImportPreviewStats => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const uniqueKeys = new Set(points.map((point) => `${point.x}:${point.y}`));

  return {
    importablePointCount: points.length,
    skippedRowCount,
    evaluatedRowCount,
    coverageRatio:
      evaluatedRowCount === 0 ? 0 : points.length / evaluatedRowCount,
    xMin: xs.length > 0 ? Math.min(...xs) : null,
    xMax: xs.length > 0 ? Math.max(...xs) : null,
    yMin: ys.length > 0 ? Math.min(...ys) : null,
    yMax: ys.length > 0 ? Math.max(...ys) : null,
    duplicatePointCount: Math.max(0, points.length - uniqueKeys.size),
    xMean: mean(xs),
    yMean: mean(ys),
    xDistinctCount: new Set(xs).size,
    yDistinctCount: new Set(ys).size,
    discardedRowRatio:
      evaluatedRowCount === 0 ? 0 : skippedRowCount / evaluatedRowCount,
  };
};
