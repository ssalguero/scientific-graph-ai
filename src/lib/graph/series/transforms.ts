import type {
  ErrorBarMode,
  ErrorBarSeries,
  ExperimentalSeries,
  ExperimentalStatistics,
} from "./types";

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

export const getSeriesYValues = (series: ExperimentalSeries): number[] =>
  series.points
    .map((point) => point.y)
    .filter((value) => Number.isFinite(value));

const getStandardError = (stats: ExperimentalStatistics): number =>
  stats.count > 0 ? stats.stdDevY / Math.sqrt(stats.count) : 0;

const getCi95Margin = (stats: ExperimentalStatistics): number =>
  1.96 * getStandardError(stats);

export const calculateExperimentalStatistics = (
  series: ExperimentalSeries[]
): ExperimentalStatistics[] =>
  series.map((item) => {
    const values = item.points
      .map((point) => point.y)
      .filter((y) => Number.isFinite(y));
    const xValues = item.points
      .map((point) => point.x)
      .filter((x) => Number.isFinite(x));
    const count = values.length;

    if (count === 0) {
      return {
        seriesId: item.id,
        seriesName: item.name,
        count: 0,
        meanX: 0,
        meanY: 0,
        medianY: 0,
        minY: 0,
        maxY: 0,
        rangeY: 0,
        varianceY: 0,
        stdDevY: 0,
        coefficientOfVariation: null,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const meanY = values.reduce((sum, value) => sum + value, 0) / count;
    const meanX =
      xValues.length > 0
        ? xValues.reduce((sum, value) => sum + value, 0) / xValues.length
        : 0;
    const medianY =
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];
    const minY = sorted[0];
    const maxY = sorted[count - 1];
    const rangeY = maxY - minY;
    const varianceY =
      count > 1
        ? values.reduce((sum, value) => sum + (value - meanY) ** 2, 0) /
          (count - 1)
        : 0;
    const stdDevY = Math.sqrt(varianceY);
    const coefficientOfVariation =
      meanY === 0 ? null : (stdDevY / meanY) * 100;

    return {
      seriesId: item.id,
      seriesName: item.name,
      count,
      meanX,
      meanY,
      medianY,
      minY,
      maxY,
      rangeY,
      varianceY,
      stdDevY,
      coefficientOfVariation,
    };
  });

export const buildErrorBarSeries = (
  stats: ExperimentalStatistics[],
  series: ExperimentalSeries[],
  mode: ErrorBarMode
): ErrorBarSeries[] => {
  const colorById = new Map(series.map((item) => [item.id, item.color]));

  return stats.map((stat) => {
    const semY = getStandardError(stat);
    const ci95Y = getCi95Margin(stat);
    const margin =
      mode === "sd" ? stat.stdDevY : mode === "sem" ? semY : ci95Y;

    return {
      seriesId: stat.seriesId,
      seriesName: stat.seriesName,
      meanX: stat.meanX,
      meanY: stat.meanY,
      lower: stat.meanY - margin,
      upper: stat.meanY + margin,
      mode,
      stdDevY: stat.stdDevY,
      semY,
      ci95Y,
      color: colorById.get(stat.seriesId) ?? "#64748b",
    };
  });
};
