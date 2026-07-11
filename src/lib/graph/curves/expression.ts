import { evaluate, parse } from "mathjs";

export const toPlottableY = (value: unknown): number | undefined => {
  let n: number;

  if (typeof value === "number") {
    n = value;
  } else if (
    value != null &&
    typeof (value as { toNumber?: () => number }).toNumber === "function"
  ) {
    n = (value as { toNumber: () => number }).toNumber();
  } else {
    return undefined;
  }

  return Number.isFinite(n) ? n : undefined;
};

export const normalizeExpressionForMath = (expression: string) =>
  expression.trim().replace(/\bln\s*\(/gi, "log(");

export const isValidMathExpression = (expression: string): boolean => {
  const normalized = normalizeExpressionForMath(expression);
  if (!normalized) return false;

  try {
    parse(normalized);
  } catch {
    return false;
  }

  return true;
};

export const expressionsAreEquivalent = (left: string, right: string): boolean =>
  left.trim().replace(/\s+/g, "").toLowerCase() ===
  right.trim().replace(/\s+/g, "").toLowerCase();

export const evaluateExpression = (expression: string, scope: { x: number }) =>
  evaluate(normalizeExpressionForMath(expression), scope);
