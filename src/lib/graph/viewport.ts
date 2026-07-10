import type { ExperimentalSeries } from "@/lib/experimentalData";

export const VIEWPORT_PADDING_RATIO = 0.1;

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

export type YViewportRange = {
  minY: number;
  maxY: number;
  visibleMinY: number;
  visibleMaxY: number;
};

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

export const collectExperimentalYExtent = (
  series: Pick<ExperimentalSeries, "points">[]
): { min: number; max: number } | null => {
  const yValues = series
    .flatMap((item) => item.points.map((point) => point.y))
    .filter((y) => Number.isFinite(y));

  if (yValues.length === 0) return null;

  return {
    min: Math.min(...yValues),
    max: Math.max(...yValues),
  };
};

export const computePaddedDomain = (
  min: number,
  max: number,
  paddingRatio = VIEWPORT_PADDING_RATIO
): [number, number] => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [-10, 10];
  }

  if (min === max) {
    const margin = Math.abs(min) * paddingRatio || 1;
    return [min - margin, max + margin];
  }

  const span = max - min;
  const padding = span * paddingRatio;
  return [min - padding, max + padding];
};

export const computeYViewportWithPadding = (
  min: number,
  max: number,
  paddingRatio = VIEWPORT_PADDING_RATIO
): YViewportRange => {
  const [paddedMin, paddedMax] = computePaddedDomain(min, max, paddingRatio);
  return {
    minY: paddedMin,
    maxY: paddedMax,
    visibleMinY: paddedMin,
    visibleMaxY: paddedMax,
  };
};

export const fitYViewportToExperimentalSeries = (
  series: Pick<ExperimentalSeries, "points">[]
): YViewportRange | null => {
  const extent = collectExperimentalYExtent(series);
  if (!extent) return null;
  return computeYViewportWithPadding(extent.min, extent.max);
};

export const computeYAxisDomainFromValues = (
  values: number[]
): [number, number] | undefined => {
  const finiteValues = values.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) return undefined;

  const min = Math.min(...finiteValues);
  const max = Math.max(...finiteValues);
  return computePaddedDomain(min, max);
};
