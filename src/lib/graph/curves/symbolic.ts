import {
  evaluate,
  parse,
  derivative,
  simplify,
  type ConstantNode,
  type FunctionNode,
  type MathNode,
  type OperatorNode,
  type ParenthesisNode,
  type SymbolNode,
} from "mathjs";
import { normalizeExpressionForMath } from "./expression";
import type { CurveSamplePoint } from "./types";

export const computeSymbolicDerivative = (expression: string): string | null => {
  try {
    const normalized = normalizeExpressionForMath(expression);
    if (!normalized) return null;
    return derivative(normalized, "x").toString();
  } catch {
    return null;
  }
};

const isSymbolVar = (node: MathNode, variable: string): boolean =>
  node.type === "SymbolNode" && (node as SymbolNode).name === variable;

const isConstantValue = (node: MathNode): number | null => {
  if (node.type !== "ConstantNode") return null;
  const value = (node as ConstantNode).value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const integrateMathNode = (node: MathNode, variable: string): string | null => {
  if (node.type === "ConstantNode") return "0";

  if (node.type === "SymbolNode") {
    return isSymbolVar(node, variable) ? `(${variable})^2 / 2` : "0";
  }

  if (node.type === "ParenthesisNode") {
    return integrateMathNode((node as ParenthesisNode).content, variable);
  }

  if (node.type === "OperatorNode") {
    const opNode = node as OperatorNode;
    const [left, right] = opNode.args;

    if (opNode.op === "+" && left && right) {
      const a = integrateMathNode(left, variable);
      const b = integrateMathNode(right, variable);
      if (!a || !b) return null;
      return `(${a}) + (${b})`;
    }

    if (opNode.op === "-" && left && right) {
      const a = integrateMathNode(left, variable);
      const b = integrateMathNode(right, variable);
      if (!a || !b) return null;
      return `(${a}) - (${b})`;
    }

    if (opNode.op === "-" && left && !right) {
      const a = integrateMathNode(left, variable);
      if (!a) return null;
      return `-(${a})`;
    }

    if (opNode.op === "*" && left && right) {
      const leftConst = isConstantValue(left);
      const rightConst = isConstantValue(right);

      if (leftConst !== null) {
        const inner = integrateMathNode(right, variable);
        if (!inner) return null;
        return `${leftConst} * (${inner})`;
      }

      if (rightConst !== null) {
        const inner = integrateMathNode(left, variable);
        if (!inner) return null;
        return `${rightConst} * (${inner})`;
      }
    }

    if (opNode.op === "/" && left && right) {
      const rightConst = isConstantValue(right);
      if (rightConst !== null && rightConst !== 0) {
        const inner = integrateMathNode(left, variable);
        if (!inner) return null;
        return `(${inner}) / ${rightConst}`;
      }
    }

    if (opNode.op === "^" && left && right) {
      if (isSymbolVar(left, variable)) {
        const exponent = isConstantValue(right);
        if (exponent === null) return null;
        if (exponent === -1) return `log(abs(${variable}))`;
        return `(${variable})^(${exponent + 1}) / (${exponent + 1})`;
      }
    }
  }

  if (node.type === "FunctionNode") {
    const fnNode = node as FunctionNode;
    const fnName = fnNode.fn.name;
    const arg = fnNode.args[0];
    if (!arg || !isSymbolVar(arg, variable)) return null;

    if (fnName === "sin") return `-cos(${variable})`;
    if (fnName === "cos") return `sin(${variable})`;
    if (fnName === "tan") return `-log(abs(cos(${variable})))`;
    if (fnName === "exp") return `exp(${variable})`;
    if (fnName === "log") return `${variable} * log(${variable}) - ${variable}`;
    if (fnName === "sqrt") return `(2/3) * (${variable})^(3/2)`;
    if (fnName === "abs") return `(${variable}) * abs(${variable}) / 2`;
  }

  return null;
};

export const computeSymbolicIntegral = (expression: string): string | null => {
  try {
    const normalized = normalizeExpressionForMath(expression);
    if (!normalized) return null;

    const mathIntegral = (evaluate as unknown as {
      integral?: (expr: string, v: string) => { toString(): string };
    }).integral;
    if (typeof mathIntegral === "function") {
      return mathIntegral(normalized, "x").toString();
    }

    const integrated = integrateMathNode(parse(normalized), "x");
    if (!integrated) return null;

    return simplify(integrated).toString();
  } catch {
    return null;
  }
};

export const calculateAreaUnderCurve = (
  points: CurveSamplePoint[],
  minX: number,
  maxX: number
): number | null => {
  const inRange = points
    .filter((point) => point.x >= minX && point.x <= maxX)
    .sort((a, b) => a.x - b.x);

  if (inRange.length < 2) return null;

  let area = 0;
  for (let i = 1; i < inRange.length; i++) {
    const dx = inRange[i].x - inRange[i - 1].x;
    area += (dx * (inRange[i].y + inRange[i - 1].y)) / 2;
  }

  return area;
};
