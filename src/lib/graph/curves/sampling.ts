import { evaluate } from "mathjs";
import { CURVE_SAMPLE_STEP } from "./constants";
import {
  normalizeExpressionForMath,
  toPlottableY,
} from "./expression";
import type { CurveSamplePoint, DiscardMetrics } from "./types";

export const countXSteps = (min: number, max: number) => {
  let numX = 0;
  for (let x = min; x <= max; x += CURVE_SAMPLE_STEP) numX++;
  return numX;
};

export const computeDiscardMetrics = (
  discardedCount: number,
  discardedPerCurve: number[],
  numX: number
): DiscardMetrics => {
  const curveCount = discardedPerCurve.length;
  const totalAttempts = numX * curveCount;
  const globalDiscardRate =
    totalAttempts > 0 ? discardedCount / totalAttempts : 0;
  const maxPerCurveDiscardRate =
    numX > 0 && curveCount > 0
      ? Math.max(...discardedPerCurve.map((d) => d / numX))
      : 0;

  return {
    globalDiscardRate,
    maxPerCurveDiscardRate,
    discardedPerCurve,
  };
};

export const emptyDiscardMetrics = (): DiscardMetrics => ({
  globalDiscardRate: 0,
  maxPerCurveDiscardRate: 0,
  discardedPerCurve: [],
});

export const generateMathExpressionPoints = (
  mathExpression: string,
  minX: number,
  maxX: number
): CurveSamplePoint[] => {
  const points: CurveSamplePoint[] = [];

  for (let x = minX; x <= maxX; x += CURVE_SAMPLE_STEP) {
    const y = toPlottableY(
      evaluate(normalizeExpressionForMath(mathExpression), { x })
    );
    if (y !== undefined) {
      points.push({ x, y });
    }
  }

  return points;
};

export const generateDerivativePoints = generateMathExpressionPoints;

export const generateIntegralPoints = generateMathExpressionPoints;
