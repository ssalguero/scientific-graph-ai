import {
  applyExperimentalXViewportFit,
  collectExperimentalXExtent,
  computeXViewportWithPadding,
  fitXViewportToExperimentalSeries,
} from "../src/app/chartViewport";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const results: CaseResult[] = [];

const assertCase = (id: string, condition: boolean, detail?: string) => {
  results.push({ id, pass: condition, detail });
};

const approx = (value: number, expected: number, tolerance = 1e-9) =>
  Math.abs(value - expected) <= tolerance;

assertCase("extent.empty", collectExperimentalXExtent([]) === null);
assertCase(
  "extent.nullSeries",
  collectExperimentalXExtent([{ points: [] }]) === null
);

const extent = collectExperimentalXExtent([
  {
    points: [
      { x: 12, y: 1 },
      { x: 48, y: 2 },
      { x: 96, y: 3 },
    ],
  },
]);
assertCase("extent.range", extent?.min === 12 && extent?.max === 96);

const padded = computeXViewportWithPadding(12, 96, 0.1);
assertCase(
  "padding.span",
  approx(padded.minX, 3.6) &&
    approx(padded.maxX, 104.4) &&
    approx(padded.visibleMinX, 3.6) &&
    approx(padded.visibleMaxX, 104.4)
);

const singleValue = computeXViewportWithPadding(5, 5, 0.1);
assertCase(
  "padding.singleValue",
  approx(singleValue.minX, 4.5) && approx(singleValue.maxX, 5.5)
);

const fitted = fitXViewportToExperimentalSeries([
  { points: [{ x: 1, y: 10 }, { x: 10, y: 11 }] },
]);
assertCase(
  "fit.series",
  fitted !== null && approx(fitted.minX, 0.1) && approx(fitted.maxX, 10.9)
);

const setters = {
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

const applied = applyExperimentalXViewportFit(
  [{ points: [{ x: 20, y: 1 }, { x: 40, y: 2 }] }],
  setters
);
assertCase("apply.success", applied === true);
assertCase(
  "apply.updatesViewport",
  approx(setters.minX, 18) &&
    approx(setters.maxX, 42) &&
    approx(setters.visibleMinX, 18) &&
    approx(setters.visibleMaxX, 42)
);
assertCase(
  "apply.emptySeries",
  applyExperimentalXViewportFit([], setters) === false
);

const summary = {
  phase: "chart-viewport-unit",
  pass: results.every((item) => item.pass),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
