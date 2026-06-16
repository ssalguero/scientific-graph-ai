import type { ExperimentalSeries } from "../../../lib/experimentalData";

export const getSeriesYValues = (series: ExperimentalSeries): number[] =>
  series.points
    .map((point) => point.y)
    .filter((value) => Number.isFinite(value));
