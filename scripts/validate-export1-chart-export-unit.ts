/**
 * EXPORT-1 unit checks for chart export surface (D42.1).
 * Does not touch GRAPH barrels.
 */
import assert from "node:assert/strict";
import {
  buildChartExportSeriesPoints,
  DEFAULT_CHART_EXPORT_PIXEL_RATIO,
  DEFAULT_EXPORT_SAMPLE_STEP,
  DEFAULT_LIVE_CHART_SAMPLE_STEP,
  getChartCapturePngOptions,
  getChartExportFileName,
  MIN_CHART_EXPORT_PIXEL_RATIO,
  resolveChartExportPixelRatio,
  resolveChartExportSampleStep,
} from "../src/app/chartExport";

let passed = 0;

const check = (name: string, condition: boolean) => {
  assert.equal(condition, true, name);
  passed += 1;
  console.log(`PASS ${name}`);
};

check(
  "pixelRatio default ≥ 2",
  DEFAULT_CHART_EXPORT_PIXEL_RATIO >= MIN_CHART_EXPORT_PIXEL_RATIO
);
check(
  "resolveChartExportPixelRatio clamps below min",
  resolveChartExportPixelRatio(1) === DEFAULT_CHART_EXPORT_PIXEL_RATIO
);
check(
  "resolveChartExportPixelRatio accepts 3",
  resolveChartExportPixelRatio(3) === 3
);
check(
  "getChartCapturePngOptions uses requested ratio",
  getChartCapturePngOptions(3).pixelRatio === 3
);
check(
  "getChartCapturePngOptions default ≥ 2",
  getChartCapturePngOptions().pixelRatio >= 2
);
check(
  "sampleStep default matches live baseline",
  DEFAULT_EXPORT_SAMPLE_STEP === DEFAULT_LIVE_CHART_SAMPLE_STEP
);
check(
  "resolveChartExportSampleStep rejects non-positive",
  resolveChartExportSampleStep(0) === DEFAULT_EXPORT_SAMPLE_STEP &&
    resolveChartExportSampleStep(-1) === DEFAULT_EXPORT_SAMPLE_STEP
);
check(
  "resolveChartExportSampleStep accepts 0.25",
  resolveChartExportSampleStep(0.25) === 0.25
);

const points = buildChartExportSeriesPoints(
  [{ idx: 0, expression: "x" }],
  0,
  1,
  0.5,
  (expression, x) => (expression === "x" ? x : undefined)
);
check("buildChartExportSeriesPoints length @0.5", points.length === 3);
check(
  "buildChartExportSeriesPoints denser @0.25",
  buildChartExportSeriesPoints(
    [{ idx: 0, expression: "x" }],
    0,
    1,
    0.25,
    (expression, x) => (expression === "x" ? x : undefined)
  ).length > points.length
);

check(
  "getChartExportFileName png",
  getChartExportFileName("Demo Chart", "png") === "grafico-Demo-Chart.png"
);

console.log(`\nvalidate-export1-chart-export-unit: ${passed} checks PASS`);
