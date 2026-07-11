import { CURVE_SAMPLE_STEP } from "../constants";
import {
  evaluateExpression,
  expressionsAreEquivalent,
  isValidMathExpression,
  toPlottableY,
} from "../expression";
import { normalizeImportedGraph } from "../import";
import { resolveNaturalLanguageExpression } from "../natural-language";
import {
  calculateCriticalPoints,
  calculateCurveIntersections,
  calculateCurveRoots,
} from "../analysis";
import {
  computeDiscardMetrics,
  countXSteps,
  emptyDiscardMetrics,
  generateMathExpressionPoints,
} from "../sampling";
import {
  calculateAreaUnderCurve,
  computeSymbolicDerivative,
} from "../symbolic";
import {
  computeYMetrics,
  resolveYAxisDomainFromMetrics,
} from "../metrics";
import { formatRangeWarning, getKnownFunctionWarning } from "../warnings";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const approx = (value: number, expected: number, tolerance = 1e-6) =>
  Math.abs(value - expected) <= tolerance;

export const runCurvesCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  // --- expression ---

  assertCase(
    "expression.evaluate.xSquared",
    approx(toPlottableY(evaluateExpression("x^2", { x: 3 })) ?? NaN, 9)
  );

  assertCase(
    "expression.evaluate.sin",
    approx(toPlottableY(evaluateExpression("sin(x)", { x: 0 })) ?? NaN, 0)
  );

  assertCase(
    "expression.lnToLog",
    isValidMathExpression("ln(x)") &&
      toPlottableY(evaluateExpression("ln(1)", { x: 1 })) === 0
  );

  assertCase("expression.toPlottableY.nan", toPlottableY(NaN) === undefined);
  assertCase(
    "expression.toPlottableY.infinity",
    toPlottableY(Infinity) === undefined
  );

  assertCase(
    "expression.equivalent",
    expressionsAreEquivalent("x^2", "X ^ 2")
  );

  // --- natural language ---

  assertCase(
    "nl.resolve.seno",
    resolveNaturalLanguageExpression("seno de x", true) === "sin(x)"
  );

  assertCase(
    "nl.resolve.disabled",
    resolveNaturalLanguageExpression("seno de x", false) === "seno de x"
  );

  assertCase(
    "nl.resolve.invalidKeepsOriginal",
    resolveNaturalLanguageExpression("x +", true) === "x +"
  );

  // --- sampling ---

  assertCase("sampling.step.frozen", CURVE_SAMPLE_STEP === 0.5);

  assertCase("sampling.countXSteps", countXSteps(0, 2) === 5);

  const sampled = generateMathExpressionPoints("x", 0, 2);
  assertCase(
    "sampling.generateLinear",
    sampled.length === 5 &&
      sampled[0].x === 0 &&
      sampled[0].y === 0 &&
      sampled[4].x === 2 &&
      sampled[4].y === 2
  );

  assertCase(
    "sampling.determinism",
    JSON.stringify(generateMathExpressionPoints("x^2", -1, 1)) ===
      JSON.stringify(generateMathExpressionPoints("x^2", -1, 1))
  );

  const discard = computeDiscardMetrics(2, [1, 1], 4);
  assertCase(
    "sampling.discardMetrics",
    discard.globalDiscardRate === 0.25 &&
      discard.maxPerCurveDiscardRate === 0.25 &&
      discard.discardedPerCurve.length === 2
  );

  assertCase(
    "sampling.emptyDiscardMetrics",
    emptyDiscardMetrics().globalDiscardRate === 0 &&
      emptyDiscardMetrics().discardedPerCurve.length === 0
  );

  // --- symbolic ---

  assertCase(
    "symbolic.derivative.xSquared",
    computeSymbolicDerivative("x^2") === "2 * x"
  );

  const areaPoints = generateMathExpressionPoints("x", 0, 2);
  assertCase(
    "symbolic.areaUnderCurve",
    calculateAreaUnderCurve(areaPoints, 0, 2) === 2
  );

  // --- analysis ---

  const chartData = [
    { x: 0, y1: 0, y2: 2 },
    { x: 1, y1: 1, y2: 1 },
    { x: 2, y1: 2, y2: 0 },
  ];

  const intersections = calculateCurveIntersections(
    chartData,
    [
      { idx: 0, expression: "x" },
      { idx: 1, expression: "2-x" },
    ],
    0,
    2
  );
  assertCase(
    "analysis.intersections",
    intersections.intersections.length === 1 &&
      approx(intersections.intersections[0].x, 1) &&
      approx(intersections.intersections[0].y, 1)
  );

  const critical = calculateCriticalPoints(
    [
      { x: 0, y1: 0 },
      { x: 1, y1: 2 },
      { x: 2, y1: 0 },
    ],
    [{ idx: 0, expression: "parabola" }],
    0,
    2
  );
  assertCase(
    "analysis.criticalMaximum",
    critical.length === 1 &&
      critical[0].type === "maximum" &&
      critical[0].x === 1 &&
      critical[0].y === 2
  );

  const roots = calculateCurveRoots(
    [
      { x: -1, y1: 3 },
      { x: 0, y1: 0 },
      { x: 1, y1: -3 },
    ],
    [{ idx: 0, expression: "3*x" }],
    -1,
    1
  );
  assertCase(
    "analysis.roots",
    roots.length === 1 && approx(roots[0].x, 0) && roots[0].y === 0
  );

  const identical = calculateCurveIntersections(
    chartData,
    [
      { idx: 0, expression: "x" },
      { idx: 1, expression: "X" },
    ],
    0,
    2
  );
  assertCase(
    "analysis.identicalCurvesMessage",
    identical.intersections.length === 0 &&
      identical.identicalPairMessage != null
  );

  // --- warnings ---

  assertCase(
    "warnings.knownFunction.log",
    getKnownFunctionWarning("log(x)")?.includes("x > 0") === true
  );

  assertCase(
    "warnings.rangeBelowThreshold",
    formatRangeWarning(0.1, ["log(x)"]).length === 0
  );

  assertCase(
    "warnings.rangeAboveThreshold",
    formatRangeWarning(0.5, ["log(x)"]).length > 0
  );

  // --- metrics ---

  const yMetrics = computeYMetrics([1, 5, 3], [[1, 5], [3]]);
  assertCase(
    "metrics.computeY",
    yMetrics.minObservedY === 1 &&
      yMetrics.maxObservedY === 5 &&
      yMetrics.perCurve.length === 2
  );

  const domain = resolveYAxisDomainFromMetrics(computeYMetrics([0, 10]));
  assertCase(
    "metrics.resolveYDomain",
    domain != null &&
      domain[0] < 0 &&
      domain[1] > 10
  );

  assertCase(
    "metrics.emptyYMetrics",
    computeYMetrics([]).minObservedY === null &&
      computeYMetrics([]).maxObservedY === null
  );

  // --- import ---

  assertCase(
    "import.normalize.valid",
    normalizeImportedGraph({
      title: "Test",
      expression: "x^2",
      min_x: -5,
      max_x: 5,
      auto_scale_y: true,
      color: "blue",
    })?.expression === "x^2"
  );

  assertCase(
    "import.normalize.invalidRange",
    normalizeImportedGraph({
      expression: "x",
      min_x: 10,
      max_x: 5,
    }) === null
  );

  assertCase(
    "import.normalize.curvesArray",
    normalizeImportedGraph({
      curves: [{ expression: "sin(x)", color: "#3b82f6" }],
      min_x: 0,
      max_x: 1,
    })?.curves[0].expression === "sin(x)"
  );

  return results;
};
