import {
  applyExperimentalXViewportFit,
  collectExperimentalXExtent,
  collectExperimentalYExtent,
  computePaddedDomain,
  computeXViewportWithPadding,
  computeYAxisDomainFromValues,
  computeYViewportWithPadding,
  fitXViewportToExperimentalSeries,
  fitYViewportToExperimentalSeries,
} from "@/lib/graph/viewport";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const approx = (value: number, expected: number, tolerance = 1e-9) =>
  Math.abs(value - expected) <= tolerance;

export const runViewportCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  // --- X regression (mirror validate-chart-viewport.ts) ---

  assertCase("x.extent.empty", collectExperimentalXExtent([]) === null);
  assertCase(
    "x.extent.nullSeries",
    collectExperimentalXExtent([{ points: [] }]) === null
  );

  const xExtent = collectExperimentalXExtent([
    {
      points: [
        { x: 12, y: 1 },
        { x: 48, y: 2 },
        { x: 96, y: 3 },
      ],
    },
  ]);
  assertCase("x.extent.range", xExtent?.min === 12 && xExtent?.max === 96);

  const xPadded = computeXViewportWithPadding(12, 96, 0.1);
  assertCase(
    "x.padding.span",
    approx(xPadded.minX, 3.6) &&
      approx(xPadded.maxX, 104.4) &&
      approx(xPadded.visibleMinX, 3.6) &&
      approx(xPadded.visibleMaxX, 104.4)
  );

  const xSingleValue = computeXViewportWithPadding(5, 5, 0.1);
  assertCase(
    "x.padding.singleValue",
    approx(xSingleValue.minX, 4.5) && approx(xSingleValue.maxX, 5.5)
  );

  const xFitted = fitXViewportToExperimentalSeries([
    { points: [{ x: 1, y: 10 }, { x: 10, y: 11 }] },
  ]);
  assertCase(
    "x.fit.series",
    xFitted !== null && approx(xFitted.minX, 0.1) && approx(xFitted.maxX, 10.9)
  );

  const xSetters = {
    minX: -10,
    maxX: 10,
    visibleMinX: -10,
    visibleMaxX: 10,
    setMinX(value: number) {
      this.minX = value;
    },
    setMaxX(value: number) {
      this.maxX = value;
    },
    setVisibleMinX(value: number) {
      this.visibleMinX = value;
    },
    setVisibleMaxX(value: number) {
      this.visibleMaxX = value;
    },
  };

  const xApplied = applyExperimentalXViewportFit(
    [{ points: [{ x: 20, y: 1 }, { x: 40, y: 2 }] }],
    xSetters
  );
  assertCase("x.apply.success", xApplied === true);
  assertCase(
    "x.apply.updatesViewport",
    approx(xSetters.minX, 18) &&
      approx(xSetters.maxX, 42) &&
      approx(xSetters.visibleMinX, 18) &&
      approx(xSetters.visibleMaxX, 42)
  );
  assertCase(
    "x.apply.emptySeries",
    applyExperimentalXViewportFit([], xSetters) === false
  );

  // --- Y cases ---

  assertCase("y.extent.empty", collectExperimentalYExtent([]) === null);
  assertCase(
    "y.extent.nullSeries",
    collectExperimentalYExtent([{ points: [] }]) === null
  );

  const yExtent = collectExperimentalYExtent([
    {
      points: [
        { x: 1, y: 12 },
        { x: 2, y: 48 },
        { x: 3, y: 96 },
      ],
    },
  ]);
  assertCase("y.extent.range", yExtent?.min === 12 && yExtent?.max === 96);

  const yPadded = computeYViewportWithPadding(12, 96, 0.1);
  assertCase(
    "y.padding.span",
    approx(yPadded.minY, 3.6) &&
      approx(yPadded.maxY, 104.4) &&
      approx(yPadded.visibleMinY, 3.6) &&
      approx(yPadded.visibleMaxY, 104.4)
  );

  const ySingleValue = computeYViewportWithPadding(5, 5, 0.1);
  assertCase(
    "y.padding.singleValue",
    approx(ySingleValue.minY, 4.5) && approx(ySingleValue.maxY, 5.5)
  );

  const yFitted = fitYViewportToExperimentalSeries([
    { points: [{ x: 10, y: 1 }, { x: 11, y: 10 }] },
  ]);
  assertCase(
    "y.fit.series",
    yFitted !== null && approx(yFitted.minY, 0.1) && approx(yFitted.maxY, 10.9)
  );

  const yDomain = computeYAxisDomainFromValues([100, 150, 200]);
  assertCase(
    "y.domain.values",
    yDomain !== undefined &&
      approx(yDomain[0], 90) &&
      approx(yDomain[1], 210)
  );

  assertCase(
    "y.domain.empty",
    computeYAxisDomainFromValues([]) === undefined
  );

  const genericPadded = computePaddedDomain(12, 96, 0.1);
  assertCase(
    "y.padded.generic",
    approx(genericPadded[0], 3.6) && approx(genericPadded[1], 104.4)
  );

  const nonFinitePadded = computePaddedDomain(Number.NaN, 96, 0.1);
  assertCase(
    "y.padded.nonFinite",
    nonFinitePadded[0] === -10 && nonFinitePadded[1] === 10
  );

  return results;
};
