import type { ChartScaleSample } from "@/lib/graph/curves/types";

export const clampVisibleXRange = (
  vMin: number,
  vMax: number,
  dataMin: number,
  dataMax: number
): [number, number] => {
  const dataSpan = dataMax - dataMin;
  if (dataSpan <= 0) return [dataMin, dataMax];

  const span = Math.max(0.5, Math.min(dataSpan, vMax - vMin));
  if (span >= dataSpan) return [dataMin, dataMax];

  let min = vMin;
  let max = vMin + span;

  if (min < dataMin) {
    min = dataMin;
    max = dataMin + span;
  }
  if (max > dataMax) {
    max = dataMax;
    min = dataMax - span;
  }

  return [min, max];
};

export const computeWheelZoomVisibleRange = (params: {
  visibleMinX: number;
  visibleMaxX: number;
  minX: number;
  maxX: number;
  pointerRatio: number;
  deltaY: number;
}): [number, number] | null => {
  const { visibleMinX, visibleMaxX, minX, maxX, pointerRatio, deltaY } =
    params;
  const span = visibleMaxX - visibleMinX;
  if (span <= 0) return null;

  const focusX = visibleMinX + pointerRatio * span;
  const zoomFactor = deltaY > 0 ? 1.15 : 1 / 1.15;
  const dataSpan = maxX - minX;
  const newSpan = Math.max(0.5, Math.min(dataSpan, span * zoomFactor));
  const newMin = focusX - pointerRatio * newSpan;
  const newMax = focusX + (1 - pointerRatio) * newSpan;
  return clampVisibleXRange(newMin, newMax, minX, maxX);
};

export const computePanVisibleRange = (params: {
  startMin: number;
  startMax: number;
  minX: number;
  maxX: number;
  deltaPixels: number;
  chartWidthPixels: number;
}): [number, number] => {
  const { startMin, startMax, minX, maxX, deltaPixels, chartWidthPixels } =
    params;
  const span = startMax - startMin;
  const deltaData = (-deltaPixels / chartWidthPixels) * span;
  return clampVisibleXRange(
    startMin + deltaData,
    startMax + deltaData,
    minX,
    maxX
  );
};

export const clampPositiveLogDomain = (
  min: number,
  max: number,
  fallbackMin = 1e-6
): [number, number] | undefined => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= 0) {
    return undefined;
  }

  const safeMin = min > 0 ? min : fallbackMin;
  const safeMax = max > safeMin ? max : safeMin * 10;
  return [safeMin, safeMax];
};

export const adaptYDomainForLogScale = (
  domain: [number, number] | undefined
): [number, number] | undefined => {
  if (!domain) return undefined;
  return clampPositiveLogDomain(domain[0], domain[1]);
};

export const computeXAxisDomainForChart = (
  usesLogX: boolean,
  visibleMinX: number,
  visibleMaxX: number,
  chartScaleSamples: ChartScaleSample[]
): [number, number] => {
  if (!usesLogX) {
    return [visibleMinX, visibleMaxX];
  }

  const clamped = clampPositiveLogDomain(visibleMinX, visibleMaxX);
  if (clamped) return clamped;

  const positiveX = chartScaleSamples
    .filter((sample) => sample.x > 0)
    .map((sample) => sample.x);
  if (positiveX.length === 0) {
    return [1e-6, 1];
  }

  return [Math.min(...positiveX), Math.max(...positiveX)];
};
