import {
  create,
  all,
  type FunctionNode,
  type MathNode,
  type SymbolNode,
} from "mathjs";

import type { WorksheetModel, WorksheetRow } from "./experimentalWorksheet";

const math = create(all, {});

/** Funciones permitidas en V1. V2: if(), estadísticas por fila, funciones sobre columnas. */
export const FORMULA_BUILDER_FUNCTIONS = [
  "abs",
  "sqrt",
  "log",
  "log10",
  "ln",
  "exp",
  "sin",
  "cos",
  "tan",
  "min",
  "max",
  "mean",
  "pow",
  "round",
  "floor",
  "ceil",
] as const;

export type FormulaBuilderFunction = (typeof FORMULA_BUILDER_FUNCTIONS)[number];

const FORMULA_FUNCTION_SET = new Set<string>(FORMULA_BUILDER_FUNCTIONS);

const MATHJS_RESERVED_SYMBOLS = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "Infinity",
  "NaN",
  "pi",
  "e",
  "i",
  "version",
]);

const DISALLOWED_NODE_TYPES = new Set([
  "AssignmentNode",
  "FunctionAssignmentNode",
  "BlockNode",
]);

function validateAllowedFunctions(node: MathNode): string | null {
  let error: string | null = null;

  node.traverse((child) => {
    if (error) return;
    if (DISALLOWED_NODE_TYPES.has(child.type)) {
      error = "La fórmula contiene un error de sintaxis.";
      return;
    }
    if (child.type === "FunctionNode") {
      const functionNode = child as FunctionNode;
      const fnName =
        functionNode.fn.type === "SymbolNode" ? functionNode.fn.name : "";
      if (!fnName || !FORMULA_FUNCTION_SET.has(fnName)) {
        error = "La fórmula contiene un error de sintaxis.";
      }
    }
  });

  return error;
}

export type WorksheetFormulaVariable = {
  label: string;
  seriesId: string;
  kind: "column" | "x";
};

export type FormulaValidationResult =
  | {
      ok: true;
      normalizedExpression: string;
      sourceSeriesIds: string[];
      referencedLabels: string[];
    }
  | {
      ok: false;
      message: string;
    };

export type FormulaEvaluationResult = {
  values: Array<number | null>;
  normalizedExpression: string;
  sourceSeriesIds: string[];
};

function collectSymbolNames(node: MathNode, symbols: Set<string>) {
  node.traverse((child) => {
    if (child.type === "SymbolNode") {
      symbols.add((child as SymbolNode).name);
    }
  });
}

export function normalizeFormulaExpression(expression: string): string {
  let normalized = expression.trim();
  normalized = normalized.replace(/\bln\s*\(/gi, "log(");
  return normalized;
}

export function buildWorksheetFormulaVariables(
  model: WorksheetModel
): WorksheetFormulaVariable[] {
  const variables: WorksheetFormulaVariable[] = [
    {
      label: model.xColumnLabel.trim() || "X",
      seriesId: "x",
      kind: "x",
    },
  ];

  for (const column of model.columns) {
    variables.push({
      label: column.label.trim(),
      seriesId: column.seriesId,
      kind: "column",
    });
  }

  return variables;
}

function buildVariableLookup(
  variables: WorksheetFormulaVariable[]
): Map<string, WorksheetFormulaVariable> {
  const lookup = new Map<string, WorksheetFormulaVariable>();
  for (const variable of variables) {
    if (!lookup.has(variable.label)) {
      lookup.set(variable.label, variable);
    }
  }
  return lookup;
}

export function validateWorksheetFormula(
  model: WorksheetModel,
  expression: string
): FormulaValidationResult {
  const normalizedExpression = normalizeFormulaExpression(expression);
  if (!normalizedExpression) {
    return {
      ok: false,
      message: "La fórmula contiene un error de sintaxis.",
    };
  }

  let parsed: MathNode;
  try {
    parsed = math.parse(normalizedExpression);
  } catch {
    return {
      ok: false,
      message: "La fórmula contiene un error de sintaxis.",
    };
  }

  const functionError = validateAllowedFunctions(parsed);
  if (functionError) {
    return {
      ok: false,
      message: functionError,
    };
  }

  const symbols = new Set<string>();
  collectSymbolNames(parsed, symbols);

  const variables = buildWorksheetFormulaVariables(model);
  const lookup = buildVariableLookup(variables);
  const referencedLabels: string[] = [];
  const sourceSeriesIds: string[] = [];

  for (const symbol of symbols) {
    if (
      FORMULA_FUNCTION_SET.has(symbol) ||
      MATHJS_RESERVED_SYMBOLS.has(symbol)
    ) {
      continue;
    }

    const variable = lookup.get(symbol);
    if (!variable) {
      return {
        ok: false,
        message: `Variable "${symbol}" no encontrada.`,
      };
    }

    referencedLabels.push(variable.label);
    if (variable.kind === "column" && !sourceSeriesIds.includes(variable.seriesId)) {
      sourceSeriesIds.push(variable.seriesId);
    }
  }

  return {
    ok: true,
    normalizedExpression,
    sourceSeriesIds,
    referencedLabels,
  };
}

function readRowVariableValue(
  row: WorksheetRow,
  variable: WorksheetFormulaVariable
): number | null {
  if (variable.kind === "x") {
    return Number.isFinite(row.x) ? row.x : null;
  }

  const value = row.values[variable.seriesId] ?? null;
  return value !== null && Number.isFinite(value) ? value : null;
}

export function evaluateWorksheetFormula(
  model: WorksheetModel,
  expression: string
): FormulaEvaluationResult | { error: string } {
  const validation = validateWorksheetFormula(model, expression);
  if (!validation.ok) {
    return { error: validation.message };
  }

  const variables = buildWorksheetFormulaVariables(model);
  const lookup = buildVariableLookup(variables);
  const compiled = math.compile(validation.normalizedExpression);

  const values = model.rows.map((row) => {
    const scope: Record<string, number> = {};

    for (const label of validation.referencedLabels) {
      const variable = lookup.get(label);
      if (!variable) continue;
      const value = readRowVariableValue(row, variable);
      scope[label] = value ?? Number.NaN;
    }

    try {
      const result = compiled.evaluate(scope);
      if (typeof result !== "number" || !Number.isFinite(result)) {
        return null;
      }
      return result;
    } catch {
      return null;
    }
  });

  return {
    values,
    normalizedExpression: validation.normalizedExpression,
    sourceSeriesIds: validation.sourceSeriesIds,
  };
}

export function isFormulaDerivedColumn(
  transforms: Array<{ kind: string; enabled: boolean }>
): boolean {
  return transforms.some(
    (transform) => transform.kind === "formula" && transform.enabled
  );
}
