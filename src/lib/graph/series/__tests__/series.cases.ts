import {
  buildExperimentalSeriesCollection,
  detectExperimentalDataLayout,
  parseMultiSeriesCsvContent,
} from "../builders";
import {
  buildErrorBarSeries,
  calculateExperimentalStatistics,
  cloneExperimentalSeries,
  computeDatasetMetrics,
  getSeriesYValues,
} from "../transforms";
import type { ExperimentalSeries } from "../types";
import {
  hasMinimumSeriesPoints,
  validateExperimentalSeriesStructure,
} from "../validation";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const sampleSeries = (): ExperimentalSeries[] => [
  {
    id: "s1",
    name: "Control",
    color: "#3b82f6",
    points: [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 3 },
    ],
  },
  {
    id: "s2",
    name: "Treatment",
    color: "#ef4444",
    points: [
      { x: 0, y: 2 },
      { x: 1, y: 4 },
      { x: 2, y: 6 },
    ],
  },
];

export const runSeriesCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const series = sampleSeries();

  assertCase(
    "types.experimentalSeries.shape",
    validateExperimentalSeriesStructure(series[0])
  );

  assertCase(
    "transforms.clone.deepEquality",
    JSON.stringify(cloneExperimentalSeries(series)) === JSON.stringify(series) &&
      cloneExperimentalSeries(series) !== series &&
      cloneExperimentalSeries(series)[0] !== series[0]
  );

  assertCase(
    "transforms.metrics.counts",
    computeDatasetMetrics(series).seriesCount === 2 &&
      computeDatasetMetrics(series).observationCount === 6
  );

  assertCase(
    "transforms.getSeriesYValues.finite",
    getSeriesYValues(series[0]).join(",") === "1,2,3"
  );

  const stats = calculateExperimentalStatistics(series);
  assertCase(
    "transforms.statistics.meanY",
    stats[0]?.meanY === 2 && stats[1]?.meanY === 4
  );

  const errorBars = buildErrorBarSeries(stats, series, "sd");
  assertCase(
    "transforms.errorBars.lowerUpper",
    errorBars[0]?.lower === stats[0]!.meanY - stats[0]!.stdDevY &&
      errorBars[0]?.upper === stats[0]!.meanY + stats[0]!.stdDevY
  );

  assertCase(
    "validation.minimumPoints.pass",
    hasMinimumSeriesPoints(series, 2)
  );

  assertCase(
    "validation.minimumPoints.fail",
    !hasMinimumSeriesPoints(
      [{ id: "empty", name: "Empty", color: "", points: [{ x: 0, y: 1 }] }],
      2
    )
  );

  assertCase(
    "builders.detectLayout.single",
    detectExperimentalDataLayout("0,1\n1,2\n2,3") === "single-series"
  );

  assertCase(
    "builders.detectLayout.multi",
    detectExperimentalDataLayout("X,A,B\n0,1,2\n1,3,4") === "multi-series"
  );

  const multi = parseMultiSeriesCsvContent("X,A,B\n0,1,2\n1,3,4");
  assertCase(
    "builders.parseMultiSeriesCsv",
    multi?.series.length === 2 &&
      multi.series[0]?.points.length === 2 &&
      multi.series[1]?.points[1]?.y === 4
  );

  const built = buildExperimentalSeriesCollection(
    "csv",
    { series: [{ name: "A", points: [{ x: 0, y: 1 }] }] },
    "sample.csv"
  );
  assertCase(
    "builders.buildCollection",
    built.length === 1 && built[0]?.name === "A" && built[0]?.points.length === 1
  );

  return results;
};
