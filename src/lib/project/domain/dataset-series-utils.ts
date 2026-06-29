import type { ExperimentalSeries } from "@/lib/experimentalData";

export function cloneExperimentalSeries(
  series: ExperimentalSeries[]
): ExperimentalSeries[] {
  return series.map((item) => ({
    ...item,
    points: item.points.map((point) => ({ ...point })),
  }));
}

export function computeDatasetMetrics(series: ExperimentalSeries[]): {
  seriesCount: number;
  observationCount: number;
} {
  return {
    seriesCount: series.length,
    observationCount: series.reduce(
      (total, item) => total + item.points.length,
      0
    ),
  };
}
