import {
  adaptYDomainForLogScale,
  alignVisibleRangeToDataRange,
  clampPositiveLogDomain,
  clampVisibleXRange,
  computePanVisibleRange,
  computeWheelZoomVisibleRange,
  computeXAxisDomainForChart,
  getAxisScaleModeLabel,
  getAxisScaleViolations,
  getAxisScaleWarnings,
  getChartTheme,
  usesLogXScale,
  usesLogYScale,
} from "@/lib/graph/axes";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const approx = (value: number, expected: number, tolerance = 1e-9) =>
  Math.abs(value - expected) <= tolerance;

export const runAxesCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const clamped = clampVisibleXRange(2, 8, 0, 10);
  assertCase(
    "ranges.clampVisibleXRange.withinBounds",
    approx(clamped[0], 2) && approx(clamped[1], 8)
  );

  const clampedToData = clampVisibleXRange(-5, 15, 0, 10);
  assertCase(
    "ranges.clampVisibleXRange.clampsToDataSpan",
    approx(clampedToData[0], 0) && approx(clampedToData[1], 10)
  );

  const zeroDataSpan = clampVisibleXRange(1, 5, 3, 3);
  assertCase(
    "ranges.clampVisibleXRange.zeroDataSpan",
    approx(zeroDataSpan[0], 3) && approx(zeroDataSpan[1], 3)
  );

  const zoomIn = computeWheelZoomVisibleRange({
    visibleMinX: 0,
    visibleMaxX: 10,
    minX: 0,
    maxX: 10,
    pointerRatio: 0.5,
    deltaY: -100,
  });
  assertCase(
    "ranges.computeWheelZoomVisibleRange.zoomIn",
    zoomIn !== null &&
      zoomIn[1] - zoomIn[0] < 10 &&
      zoomIn[0] >= 0 &&
      zoomIn[1] <= 10
  );

  const zoomOut = computeWheelZoomVisibleRange({
    visibleMinX: 2,
    visibleMaxX: 8,
    minX: 0,
    maxX: 10,
    pointerRatio: 0.5,
    deltaY: 100,
  });
  assertCase(
    "ranges.computeWheelZoomVisibleRange.zoomOut",
    zoomOut !== null && zoomOut[1] - zoomOut[0] > 6
  );

  const invalidZoom = computeWheelZoomVisibleRange({
    visibleMinX: 5,
    visibleMaxX: 5,
    minX: 0,
    maxX: 10,
    pointerRatio: 0.5,
    deltaY: -100,
  });
  assertCase("ranges.computeWheelZoomVisibleRange.zeroSpan", invalidZoom === null);

  const panned = computePanVisibleRange({
    startMin: 2,
    startMax: 8,
    minX: 0,
    maxX: 10,
    deltaPixels: 50,
    chartWidthPixels: 200,
  });
  assertCase(
    "ranges.computePanVisibleRange.panWithinBounds",
    approx(panned[0], 0.5) && approx(panned[1], 6.5)
  );

  const positiveLog = clampPositiveLogDomain(1, 100);
  assertCase(
    "ranges.clampPositiveLogDomain.positive",
    positiveLog !== undefined &&
      positiveLog[0] === 1 &&
      positiveLog[1] === 100
  );

  const nonPositiveLog = clampPositiveLogDomain(-1, 10);
  assertCase(
    "ranges.clampPositiveLogDomain.nonPositiveMin",
    nonPositiveLog !== undefined && nonPositiveLog[0] === 1e-6
  );

  const invalidLog = clampPositiveLogDomain(1, 0);
  assertCase("ranges.clampPositiveLogDomain.invalidMax", invalidLog === undefined);

  const adaptedY = adaptYDomainForLogScale([0, 10]);
  assertCase(
    "ranges.adaptYDomainForLogScale.adapts",
    adaptedY !== undefined && adaptedY[0] === 1e-6
  );
  assertCase(
    "ranges.adaptYDomainForLogScale.undefined",
    adaptYDomainForLogScale(undefined) === undefined
  );

  const linearDomain = computeXAxisDomainForChart(false, 1, 9, []);
  assertCase(
    "ranges.computeXAxisDomainForChart.linear",
    linearDomain[0] === 1 && linearDomain[1] === 9
  );

  const logDomain = computeXAxisDomainForChart(true, 2, 8, []);
  assertCase(
    "ranges.computeXAxisDomainForChart.logPositive",
    logDomain[0] === 2 && logDomain[1] === 8
  );

  const logFallback = computeXAxisDomainForChart(true, -1, -0.5, [
    { x: 2, y: 1 },
    { x: 5, y: 2 },
  ]);
  assertCase(
    "ranges.computeXAxisDomainForChart.logFallbackFromSamples",
    logFallback[0] === 2 && logFallback[1] === 5
  );

  const logEmpty = computeXAxisDomainForChart(true, -1, -0.5, [
    { x: -2, y: 1 },
  ]);
  assertCase(
    "ranges.computeXAxisDomainForChart.logEmptyPositive",
    logEmpty[0] === 1e-6 && logEmpty[1] === 1
  );

  assertCase(
    "scales.getAxisScaleModeLabel.linear",
    getAxisScaleModeLabel("linear") === "Lineal"
  );
  assertCase(
    "scales.getAxisScaleModeLabel.logX",
    getAxisScaleModeLabel("logX") === "Semilog X"
  );
  assertCase(
    "scales.getAxisScaleModeLabel.logY",
    getAxisScaleModeLabel("logY") === "Semilog Y"
  );
  assertCase(
    "scales.getAxisScaleModeLabel.logLog",
    getAxisScaleModeLabel("logLog") === "Log-Log"
  );

  assertCase("scales.usesLogXScale.linear", usesLogXScale("linear") === false);
  assertCase("scales.usesLogXScale.logX", usesLogXScale("logX") === true);
  assertCase("scales.usesLogYScale.logY", usesLogYScale("logY") === true);
  assertCase("scales.usesLogYScale.logLog", usesLogYScale("logLog") === true);

  const violations = getAxisScaleViolations(
    [
      { x: -1, y: 2 },
      { x: 3, y: 0 },
    ],
    "logLog"
  );
  assertCase(
    "scales.getAxisScaleViolations.logLog",
    violations.hasNonPositiveX && violations.hasNonPositiveY
  );

  const warningsBoth = getAxisScaleWarnings("logLog", {
    hasNonPositiveX: true,
    hasNonPositiveY: true,
  });
  assertCase(
    "scales.getAxisScaleWarnings.both",
    warningsBoth.length === 1 &&
      warningsBoth[0].includes("X o Y")
  );

  const warningsX = getAxisScaleWarnings("logX", {
    hasNonPositiveX: true,
    hasNonPositiveY: false,
  });
  assertCase(
    "scales.getAxisScaleWarnings.xOnly",
    warningsX.length === 1 && warningsX[0].includes("valores X")
  );

  const darkTheme = getChartTheme("dark");
  assertCase(
    "grid.getChartTheme.dark",
    darkTheme.grid === "#334155" && darkTheme.axis === "#94a3b8"
  );

  const lightTheme = getChartTheme("light");
  assertCase(
    "grid.getChartTheme.light",
    lightTheme.grid === "#e2e8f0" && lightTheme.tooltipBg === "#ffffff"
  );

  const aligned = alignVisibleRangeToDataRange(3, 7);
  assertCase(
    "synchronization.alignVisibleRangeToDataRange",
    aligned.visibleMinX === 3 && aligned.visibleMaxX === 7
  );

  return results;
};
