import type { ExperimentalSeries } from "@/lib/experimentalData";
import { computeYAxisDomainFromValues } from "@/lib/graph/viewport";
import type { ChartScaleSample, DiscardMetrics, YMetrics } from "./types";

export const computeYMetrics = (
  values: number[],
  perCurveValues: number[][] = []
): YMetrics => ({
  minObservedY: values.length > 0 ? Math.min(...values) : null,
  maxObservedY: values.length > 0 ? Math.max(...values) : null,
  perCurve: perCurveValues.map((curveValues) => ({
    minObservedY: curveValues.length > 0 ? Math.min(...curveValues) : null,
    maxObservedY: curveValues.length > 0 ? Math.max(...curveValues) : null,
  })),
});

export const mergeYMetricsWithExperimental = (
  mathMetrics: YMetrics,
  series: ExperimentalSeries[]
): YMetrics => {
  const expYValues = series.flatMap((item) => item.points.map((p) => p.y));
  const expPerSeries = series.map((item) => item.points.map((p) => p.y));

  const combinedValues = [
    ...(mathMetrics.minObservedY != null ? [mathMetrics.minObservedY] : []),
    ...(mathMetrics.maxObservedY != null ? [mathMetrics.maxObservedY] : []),
    ...expYValues,
  ];

  if (combinedValues.length === 0) {
    return { minObservedY: null, maxObservedY: null, perCurve: [] };
  }

  return {
    minObservedY: Math.min(...combinedValues),
    maxObservedY: Math.max(...combinedValues),
    perCurve: [
      ...mathMetrics.perCurve,
      ...expPerSeries.map((values) => ({
        minObservedY: values.length > 0 ? Math.min(...values) : null,
        maxObservedY: values.length > 0 ? Math.max(...values) : null,
      })),
    ],
  };
};

export const resolveYAxisDomainFromMetrics = (
  yMetrics: YMetrics
): [number, number] | undefined => {
  const { minObservedY, maxObservedY } = yMetrics;
  if (minObservedY == null || maxObservedY == null) {
    return undefined;
  }
  return computeYAxisDomainFromValues([minObservedY, maxObservedY]);
};

export const collectChartScaleSamples = (
  chartData: Record<string, number>[],
  visibleMinX: number,
  visibleMaxX: number,
  curveIndices: number[],
  experimentalSeries: ExperimentalSeries[],
  extraPoints: { x: number; y: number }[]
): ChartScaleSample[] => {
  const samples: ChartScaleSample[] = [];

  for (const point of chartData) {
    if (point.x < visibleMinX || point.x > visibleMaxX) continue;
    if (!Number.isFinite(point.x)) continue;

    for (const idx of curveIndices) {
      const y = point[`y${idx + 1}`];
      if (typeof y === "number" && Number.isFinite(y)) {
        samples.push({ x: point.x, y });
      }
    }
  }

  for (const series of experimentalSeries) {
    for (const point of series.points) {
      if (
        point.x >= visibleMinX &&
        point.x <= visibleMaxX &&
        Number.isFinite(point.x) &&
        Number.isFinite(point.y)
      ) {
        samples.push({ x: point.x, y: point.y });
      }
    }
  }

  for (const point of extraPoints) {
    if (
      point.x >= visibleMinX &&
      point.x <= visibleMaxX &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y)
    ) {
      samples.push({ x: point.x, y: point.y });
    }
  }

  return samples;
};

const formatScaleFactor = (factor: number): string => {
  const rounded = Math.round(factor);
  return rounded < 1000
    ? String(rounded)
    : rounded.toLocaleString("es-ES");
};

export const formatScaleWarning = (yMetrics: YMetrics): string | null => {
  const { minObservedY, maxObservedY, perCurve } = yMetrics;

  if (minObservedY == null || maxObservedY == null || maxObservedY <= 0) {
    return null;
  }

  if (perCurve.length < 2) return null;

  const curveStats = perCurve
    .filter((c) => c.minObservedY != null && c.maxObservedY != null)
    .map((c) => {
      const min = c.minObservedY as number;
      const max = c.maxObservedY as number;
      const maxAbsY = Math.max(Math.abs(min), Math.abs(max));
      const span = max - min;
      const minPositiveSpan = span > 0 ? span : maxAbsY;

      return { maxAbsY, minPositiveSpan };
    })
    .filter((c) => c.minPositiveSpan > 0);

  if (curveStats.length < 2) return null;

  const maxAbsY = Math.max(...curveStats.map((c) => c.maxAbsY));
  const minPositiveSpan = Math.min(...curveStats.map((c) => c.minPositiveSpan));

  if (minPositiveSpan <= 0) return null;

  const factor = maxAbsY / minPositiveSpan;
  if (factor < 100) return null;

  const formattedFactor = formatScaleFactor(factor);
  let message = `⚠ Existe una diferencia de escala de aproximadamente ${formattedFactor}× entre curvas.`;

  if (factor >= 1000) {
    message +=
      "\nConsidere visualizar las curvas por separado o utilizar un rango más acotado.";
  }

  return message;
};

export const logDiscardMetrics = (metrics: DiscardMetrics) => {
  console.log("globalDiscardRate", metrics.globalDiscardRate);
  console.log("maxPerCurveDiscardRate", metrics.maxPerCurveDiscardRate);
  console.log("discardedPerCurve", metrics.discardedPerCurve);
};

export const logYMetrics = (metrics: YMetrics) => {
  console.log("minObservedY", metrics.minObservedY);
  console.log("maxObservedY", metrics.maxObservedY);
};
