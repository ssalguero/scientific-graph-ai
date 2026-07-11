import type { ExperimentalSeries } from "./types";

export const validateExperimentalSeriesStructure = (
  series: unknown
): series is ExperimentalSeries => {
  if (typeof series !== "object" || series === null) {
    return false;
  }

  const candidate = series as Record<string, unknown>;

  if (typeof candidate.id !== "string" || candidate.id.trim() === "") {
    return false;
  }

  if (typeof candidate.name !== "string") {
    return false;
  }

  if (typeof candidate.color !== "string") {
    return false;
  }

  if (!Array.isArray(candidate.points)) {
    return false;
  }

  return candidate.points.every((point) => {
    if (typeof point !== "object" || point === null) {
      return false;
    }
    const p = point as Record<string, unknown>;
    return Number.isFinite(p.x) && Number.isFinite(p.y);
  });
};

export const hasMinimumSeriesPoints = (
  series: ExperimentalSeries[],
  minimum = 2
): boolean => {
  const totalPoints = series.reduce(
    (count, item) =>
      count +
      item.points.filter(
        (point) => Number.isFinite(point.x) && Number.isFinite(point.y)
      ).length,
    0
  );

  return totalPoints >= minimum;
};
