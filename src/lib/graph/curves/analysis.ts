import {
  CRITICAL_POINT_DEDUP_X,
  INTERSECTION_DEDUP_X,
  ROOT_DEDUP_X,
} from "./constants";
import { expressionsAreEquivalent } from "./expression";
import type {
  CriticalPoint,
  CurveIntersection,
  CurveIntersectionInput,
  CurveRoot,
} from "./types";

const getChartYValue = (
  point: Record<string, number>,
  curveIdx: number
): number | undefined => {
  const y = point[`y${curveIdx + 1}`];
  return typeof y === "number" && Number.isFinite(y) ? y : undefined;
};

const interpolateIntersectionX = (
  x0: number,
  d0: number,
  x1: number,
  d1: number
): number | null => {
  if (d0 === 0 && d1 === 0) return null;
  if (d0 === 0) return x0;
  if (d1 === 0) return x1;
  if (d0 * d1 > 0) return null;
  const denominator = d0 - d1;
  if (denominator === 0) return null;
  const t = d0 / denominator;
  return x0 + t * (x1 - x0);
};

const dedupeIntersections = (items: CurveIntersection[]): CurveIntersection[] => {
  const deduped: CurveIntersection[] = [];

  for (const item of items) {
    const isDuplicate = deduped.some(
      (existing) => Math.abs(existing.x - item.x) < INTERSECTION_DEDUP_X
    );
    if (!isDuplicate) {
      deduped.push(item);
    }
  }

  return deduped.sort((a, b) => a.x - b.x);
};

export const calculateCurveIntersections = (
  chartData: Record<string, number>[],
  curves: CurveIntersectionInput[],
  visibleMinX: number,
  visibleMaxX: number
): { intersections: CurveIntersection[]; identicalPairMessage: string | null } => {
  const visiblePoints = chartData.filter(
    (point) => point.x >= visibleMinX && point.x <= visibleMaxX
  );

  if (curves.length < 2 || visiblePoints.length < 2) {
    return { intersections: [], identicalPairMessage: null };
  }

  const intersections: CurveIntersection[] = [];
  let identicalPairMessage: string | null = null;

  for (let ai = 0; ai < curves.length; ai++) {
    for (let bi = ai + 1; bi < curves.length; bi++) {
      const curveA = curves[ai];
      const curveB = curves[bi];

      if (expressionsAreEquivalent(curveA.expression, curveB.expression)) {
        identicalPairMessage =
          "No se detectan intersecciones discretas entre curvas idénticas.";
        continue;
      }

      for (let i = 0; i < visiblePoints.length - 1; i++) {
        const p0 = visiblePoints[i];
        const p1 = visiblePoints[i + 1];
        const yA0 = getChartYValue(p0, curveA.idx);
        const yA1 = getChartYValue(p1, curveA.idx);
        const yB0 = getChartYValue(p0, curveB.idx);
        const yB1 = getChartYValue(p1, curveB.idx);

        if (
          yA0 === undefined ||
          yA1 === undefined ||
          yB0 === undefined ||
          yB1 === undefined
        ) {
          continue;
        }

        const d0 = yA0 - yB0;
        const d1 = yA1 - yB1;

        if (d0 === 0 && d1 === 0) {
          continue;
        }

        if (d0 * d1 <= 0) {
          const xIntersection = interpolateIntersectionX(p0.x, d0, p1.x, d1);
          if (xIntersection === null) continue;
          if (
            xIntersection < visibleMinX - 1e-9 ||
            xIntersection > visibleMaxX + 1e-9
          ) {
            continue;
          }

          const span = p1.x - p0.x;
          const t = span === 0 ? 0 : (xIntersection - p0.x) / span;
          const yIntersection = yA0 + t * (yA1 - yA0);

          intersections.push({
            id: `${curveA.idx}-${curveB.idx}-${xIntersection.toFixed(6)}`,
            curveA: curveA.expression,
            curveB: curveB.expression,
            x: xIntersection,
            y: yIntersection,
          });
        }
      }
    }
  }

  return {
    intersections: dedupeIntersections(intersections),
    identicalPairMessage,
  };
};

const dedupeCriticalPoints = (items: CriticalPoint[]): CriticalPoint[] => {
  const deduped: CriticalPoint[] = [];

  for (const item of items) {
    const isDuplicate = deduped.some(
      (existing) =>
        existing.curve === item.curve &&
        existing.type === item.type &&
        Math.abs(existing.x - item.x) < CRITICAL_POINT_DEDUP_X
    );
    if (!isDuplicate) {
      deduped.push(item);
    }
  }

  return deduped.sort((a, b) => a.x - b.x);
};

export const calculateCriticalPoints = (
  chartData: Record<string, number>[],
  curves: CurveIntersectionInput[],
  visibleMinX: number,
  visibleMaxX: number
): CriticalPoint[] => {
  const visiblePoints = chartData.filter(
    (point) => point.x >= visibleMinX && point.x <= visibleMaxX
  );

  if (curves.length === 0 || visiblePoints.length < 3) {
    return [];
  }

  const criticalPoints: CriticalPoint[] = [];

  for (const curve of curves) {
    for (let i = 1; i < visiblePoints.length - 1; i++) {
      const pPrev = visiblePoints[i - 1];
      const pCenter = visiblePoints[i];
      const pNext = visiblePoints[i + 1];

      const yPrev = getChartYValue(pPrev, curve.idx);
      const yCenter = getChartYValue(pCenter, curve.idx);
      const yNext = getChartYValue(pNext, curve.idx);

      if (yPrev === undefined || yCenter === undefined || yNext === undefined) {
        continue;
      }

      const slopeBefore = yCenter - yPrev;
      const slopeAfter = yNext - yCenter;

      if (slopeBefore === 0 && slopeAfter === 0) {
        continue;
      }

      let type: CriticalPoint["type"] | null = null;
      if (slopeBefore > 0 && slopeAfter < 0) {
        type = "maximum";
      } else if (slopeBefore < 0 && slopeAfter > 0) {
        type = "minimum";
      }

      if (!type) continue;

      criticalPoints.push({
        id: `${curve.idx}-${type}-${pCenter.x.toFixed(6)}`,
        curve: curve.expression,
        type,
        x: pCenter.x,
        y: yCenter,
      });
    }
  }

  return dedupeCriticalPoints(criticalPoints);
};

const interpolateRootX = (
  x0: number,
  y0: number,
  x1: number,
  y1: number
): number | null => {
  if (y0 === 0 && y1 === 0) return null;
  if (y0 === 0) return x0;
  if (y1 === 0) return x1;
  if (y0 * y1 > 0) return null;
  const denominator = y1 - y0;
  if (denominator === 0) return null;
  return x0 - (y0 * (x1 - x0)) / denominator;
};

const dedupeRoots = (items: CurveRoot[]): CurveRoot[] => {
  const deduped: CurveRoot[] = [];

  for (const item of items) {
    const isDuplicate = deduped.some(
      (existing) =>
        existing.curve === item.curve &&
        Math.abs(existing.x - item.x) < ROOT_DEDUP_X
    );
    if (!isDuplicate) {
      deduped.push(item);
    }
  }

  return deduped.sort((a, b) => a.x - b.x);
};

export const calculateCurveRoots = (
  chartData: Record<string, number>[],
  curves: CurveIntersectionInput[],
  visibleMinX: number,
  visibleMaxX: number
): CurveRoot[] => {
  const visiblePoints = chartData.filter(
    (point) => point.x >= visibleMinX && point.x <= visibleMaxX
  );

  if (curves.length === 0 || visiblePoints.length < 2) {
    return [];
  }

  const roots: CurveRoot[] = [];

  for (const curve of curves) {
    for (let i = 0; i < visiblePoints.length - 1; i++) {
      const p0 = visiblePoints[i];
      const p1 = visiblePoints[i + 1];
      const y0 = getChartYValue(p0, curve.idx);
      const y1 = getChartYValue(p1, curve.idx);

      if (y0 === undefined || y1 === undefined) {
        continue;
      }

      if (y0 * y1 <= 0) {
        const xRoot = interpolateRootX(p0.x, y0, p1.x, y1);
        if (xRoot === null) continue;
        if (xRoot < visibleMinX - 1e-9 || xRoot > visibleMaxX + 1e-9) {
          continue;
        }

        roots.push({
          id: `${curve.idx}-root-${xRoot.toFixed(6)}`,
          curve: curve.expression,
          x: xRoot,
          y: 0,
        });
      }
    }
  }

  return dedupeRoots(roots);
};
