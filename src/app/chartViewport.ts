import type { ExperimentalSeries } from "@/lib/experimentalData";

export type XViewportRange = {
  minX: number;
  maxX: number;
  visibleMinX: number;
  visibleMaxX: number;
};

export type XViewportSetters = {
  setMinX: (value: number) => void;
  setMaxX: (value: number) => void;
  setVisibleMinX: (value: number) => void;
  setVisibleMaxX: (value: number) => void;
};

const VIEWPORT_PADDING_RATIO = 0.1;

export const collectExperimentalXExtent = (
  series: Pick<ExperimentalSeries, "points">[]
): { min: number; max: number } | null => {
  const xValues = series
    .flatMap((item) => item.points.map((point) => point.x))
    .filter((x) => Number.isFinite(x));

  if (xValues.length === 0) return null;

  return {
    min: Math.min(...xValues),
    max: Math.max(...xValues),
  };
};

export const computeXViewportWithPadding = (
  min: number,
  max: number,
  paddingRatio = VIEWPORT_PADDING_RATIO
): XViewportRange => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { minX: -10, maxX: 10, visibleMinX: -10, visibleMaxX: 10 };
  }

  if (min === max) {
    const margin = Math.abs(min) * paddingRatio || 1;
    const paddedMin = min - margin;
    const paddedMax = max + margin;
    return {
      minX: paddedMin,
      maxX: paddedMax,
      visibleMinX: paddedMin,
      visibleMaxX: paddedMax,
    };
  }

  const span = max - min;
  const padding = span * paddingRatio;

  return {
    minX: min - padding,
    maxX: max + padding,
    visibleMinX: min - padding,
    visibleMaxX: max + padding,
  };
};

export const fitXViewportToExperimentalSeries = (
  series: Pick<ExperimentalSeries, "points">[]
): XViewportRange | null => {
  const extent = collectExperimentalXExtent(series);
  if (!extent) return null;
  return computeXViewportWithPadding(extent.min, extent.max);
};

export const applyXViewportRange = (
  range: XViewportRange,
  setters: XViewportSetters
) => {
  setters.setMinX(range.minX);
  setters.setMaxX(range.maxX);
  setters.setVisibleMinX(range.visibleMinX);
  setters.setVisibleMaxX(range.visibleMaxX);
};

export const applyExperimentalXViewportFit = (
  series: Pick<ExperimentalSeries, "points">[],
  setters: XViewportSetters
): boolean => {
  const range = fitXViewportToExperimentalSeries(series);
  if (!range) return false;
  applyXViewportRange(range, setters);
  return true;
};
