export type {
  CriticalPoint,
  CurveIntersection,
  CurveRoot,
  DiscardMetrics,
  GraphJsonExport,
  YMetrics,
} from "./types";

export { normalizeImportedGraph } from "./import";
export { resolveNaturalLanguageExpression } from "./natural-language";
export {
  evaluateExpression,
  toPlottableY,
} from "./expression";
export {
  countXSteps,
  computeDiscardMetrics,
  emptyDiscardMetrics,
  generateDerivativePoints,
  generateIntegralPoints,
  generateMathExpressionPoints,
} from "./sampling";
export {
  calculateAreaUnderCurve,
  computeSymbolicDerivative,
  computeSymbolicIntegral,
} from "./symbolic";
export {
  calculateCriticalPoints,
  calculateCurveIntersections,
  calculateCurveRoots,
} from "./analysis";
export {
  collectChartScaleSamples,
  computeYMetrics,
  formatScaleWarning,
  mergeYMetricsWithExperimental,
  resolveYAxisDomainFromMetrics,
} from "./metrics";
export { formatRangeWarning } from "./warnings";
