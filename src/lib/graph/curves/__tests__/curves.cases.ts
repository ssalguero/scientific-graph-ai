import { CURVE_SAMPLE_STEP, INTERSECTION_DEDUP_X } from "../constants";
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
import { formatRangeWarning, getKnownFunctionWarning, getNumericalAreaDisclosureLines } from "../warnings";
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

  const xSquaredAreaPoints = generateMathExpressionPoints("x^2", -10, 10);
  assertCase(
    "cc04.area.xSquared.trapezoid-667.5-unchanged",
    calculateAreaUnderCurve(xSquaredAreaPoints, -10, 10) === 667.5
  );

  const areaDisclosure = getNumericalAreaDisclosureLines();
  const areaDisclosureText = areaDisclosure.join(" ");
  assertCase(
    "cc04.area.disclosure.numerical-not-exact",
    areaDisclosureText.includes("aproximación numérica") &&
      areaDisclosureText.includes("no el valor exacto")
  );
  assertCase(
    "cc04.area.disclosure.trapezoidal-method",
    areaDisclosureText.includes("trapezoidal")
  );
  assertCase(
    "cc04.area.disclosure.sample-step",
    areaDisclosureText.includes("h = 0.5")
  );
  assertCase(
    "cc04.area.disclosure.symbolic-independent",
    areaDisclosureText.includes("antiderivada simbólica")
  );
  const xSquaredDisclosure = getNumericalAreaDisclosureLines(
    xSquaredAreaPoints.length
  ).join(" ");
  assertCase(
    "cc04.area.disclosure.sample-count-adjacent-contract",
    xSquaredDisclosure.includes(
      `Muestras utilizadas: ${xSquaredAreaPoints.length} puntos`
    ) &&
      xSquaredDisclosure.includes(
        `${xSquaredAreaPoints.length - 1} paneles trapezoidales`
      ) &&
      xSquaredDisclosure.includes("no es el valor de área mostrado")
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

  const chartFromExpressions = (expressions: string[], minX: number, maxX: number) => {
    const rows = new Map<number, Record<string, number>>();
    expressions.forEach((expression, idx) => {
      for (const point of generateMathExpressionPoints(expression, minX, maxX)) {
        const row = rows.get(point.x) ?? { x: point.x };
        row[`y${idx + 1}`] = point.y;
        rows.set(point.x, row);
      }
    });
    return [...rows.values()].sort((a, b) => a.x - b.x);
  };

  const pairXs = (
    items: { curveA: string; curveB: string; x: number }[],
    a: string,
    b: string
  ) =>
    items
      .filter(
        (item) =>
          (item.curveA === a && item.curveB === b) ||
          (item.curveA === b && item.curveB === a)
      )
      .map((item) => item.x);

  const pairHasX = (xs: number[], expected: number) =>
    xs.some((x) => approx(x, expected, 1e-3));

  const x2_3x = calculateCurveIntersections(
    chartFromExpressions(["x^2", "3*x"], -10, 10),
    [
      { idx: 0, expression: "x^2" },
      { idx: 1, expression: "3*x" },
    ],
    -10,
    10
  );
  const x2_3xXs = pairXs(x2_3x.intersections, "x^2", "3*x");
  assertCase(
    "cc05.intersections.single-pair.x2-3x",
    pairHasX(x2_3xXs, 0) && pairHasX(x2_3xXs, 3)
  );

  const threeCurveResult = calculateCurveIntersections(
    chartFromExpressions(["x^2", "2*x", "3*x"], -10, 10),
    [
      { idx: 0, expression: "x^2" },
      { idx: 1, expression: "2*x" },
      { idx: 2, expression: "3*x" },
    ],
    -10,
    10
  );
  const x2_2xXs = pairXs(threeCurveResult.intersections, "x^2", "2*x");
  const x2_3xThreeXs = pairXs(threeCurveResult.intersections, "x^2", "3*x");
  const twoX_3xXs = pairXs(threeCurveResult.intersections, "2*x", "3*x");
  assertCase(
    "cc05.intersections.three-curves.pair-values",
    pairHasX(x2_2xXs, 0) &&
      pairHasX(x2_2xXs, 2) &&
      pairHasX(x2_3xThreeXs, 0) &&
      pairHasX(x2_3xThreeXs, 3) &&
      pairHasX(twoX_3xXs, 0)
  );
  assertCase(
    "cc05.intersections.shared-x.preserved-per-pair",
    pairHasX(x2_2xXs, 0) &&
      pairHasX(x2_3xThreeXs, 0) &&
      pairHasX(twoX_3xXs, 0)
  );

  const samePairNearDuplicates = calculateCurveIntersections(
    [
      { x: 0, y1: 0, y2: 0 },
      { x: 0.0004, y1: 0.1, y2: 0 },
      { x: 0.0008, y1: -0.1, y2: 0 },
    ],
    [
      { idx: 0, expression: "near-a" },
      { idx: 1, expression: "near-b" },
    ],
    0,
    0.0008
  );
  const samePairXs = pairXs(
    samePairNearDuplicates.intersections,
    "near-a",
    "near-b"
  );
  assertCase(
    "cc05.intersections.same-pair.dedup-tolerance",
    samePairXs.length === 1 &&
      samePairXs.every((x) => Math.abs(x - samePairXs[0]) < INTERSECTION_DEDUP_X)
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
