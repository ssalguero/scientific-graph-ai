import type { WorksheetModel } from "../src/lib/experimentalWorksheet";
import {
  createFormulaWorksheetColumn,
  seriesToWorksheet,
} from "../src/lib/experimentalWorksheet";
import type { ExperimentalSeries } from "../src/lib/experimentalData";
import {
  evaluateWorksheetFormula,
  validateWorksheetFormula,
} from "../src/lib/worksheetFormulaBuilder";

type CaseResult = { id: string; pass: boolean; detail?: string };

const results: CaseResult[] = [];

const control1: ExperimentalSeries = {
  id: "control1",
  name: "Control1",
  color: "#3b82f6",
  points: [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 30 },
    { x: 4, y: 40 },
  ],
};

const tratamiento1: ExperimentalSeries = {
  id: "tratamiento1",
  name: "Tratamiento1",
  color: "#ef4444",
  points: [
    { x: 1, y: 30 },
    { x: 2, y: 40 },
    { x: 3, y: 50 },
    { x: 4, y: 60 },
  ],
};

const baseModel = seriesToWorksheet([control1, tratamiento1]);

function approxEqual(actual: number | null, expected: number, tolerance = 0.02) {
  return actual !== null && Math.abs(actual - expected) <= tolerance;
}

function assertFormulaValues(
  id: string,
  expression: string,
  expected: number[],
  model: WorksheetModel = baseModel,
  tolerance = 0.02
) {
  const evaluation = evaluateWorksheetFormula(model, expression);
  if ("error" in evaluation) {
    results.push({ id, pass: false, detail: evaluation.error });
    return;
  }

  results.push({
    id,
    pass:
      evaluation.values.length === expected.length &&
      expected.every((value, index) =>
        approxEqual(evaluation.values[index] ?? null, value, tolerance)
      ),
    detail: evaluation.values.map((value) => value?.toFixed(4) ?? "null").join(", "),
  });
}

assertFormulaValues("formula.add", "Control1 + Tratamiento1", [40, 60, 80, 100]);
assertFormulaValues("formula.subtract", "Tratamiento1 - Control1", [20, 20, 20, 20]);
assertFormulaValues("formula.multiply", "Control1 * 2", [20, 40, 60, 80]);
assertFormulaValues("formula.divide", "Control1 / 2", [5, 10, 15, 20]);
assertFormulaValues("formula.power", "Control1 ^ 2", [100, 400, 900, 1600]);
assertFormulaValues("formula.log10", "log10(Control1)", [
  Math.log10(10),
  Math.log10(20),
  Math.log10(30),
  Math.log10(40),
]);
assertFormulaValues("formula.sqrt", "sqrt(Control1)", [
  Math.sqrt(10),
  Math.sqrt(20),
  Math.sqrt(30),
  Math.sqrt(40),
]);
assertFormulaValues("formula.sin", "sin(Control1)", [
  Math.sin(10),
  Math.sin(20),
  Math.sin(30),
  Math.sin(40),
]);
assertFormulaValues("formula.abs", "abs(Control1 - Tratamiento1)", [20, 20, 20, 20]);
assertFormulaValues(
  "formula.mean-two-columns",
  "mean(Control1, Tratamiento1)",
  [20, 30, 40, 50]
);
assertFormulaValues(
  "formula.average-expression",
  "(Control1 + Tratamiento1) / 2",
  [20, 30, 40, 50]
);

const missingVariable = validateWorksheetFormula(baseModel, "Control1 + Control3");
results.push({
  id: "formula.missing-variable",
  pass:
    !missingVariable.ok &&
    missingVariable.message === 'Variable "Control3" no encontrada.',
});

const invalidFormula = validateWorksheetFormula(baseModel, "Control1 +* 2");
results.push({
  id: "formula.invalid-syntax",
  pass:
    !invalidFormula.ok &&
    invalidFormula.message === "La fórmula contiene un error de sintaxis.",
});

const divideByZero = evaluateWorksheetFormula(baseModel, "Control1 / 0");
results.push({
  id: "formula.divide-by-zero",
  pass:
    !("error" in divideByZero) &&
    divideByZero.values.every((value) => value === null),
  detail: divideByZero && "values" in divideByZero
    ? divideByZero.values.map((value) => String(value)).join(", ")
    : undefined,
});

const created = createFormulaWorksheetColumn(
  baseModel,
  "Índice metabólico",
  "(Control1 + Tratamiento1) / 2",
  "control1"
);
results.push({
  id: "formula.create-column",
  pass:
    !("error" in created) &&
    created.model.columns.some((column) => column.label === "Índice metabólico") &&
    created.transform.kind === "formula" &&
    created.transform.expression === "(Control1 + Tratamiento1) / 2" &&
    created.transform.sourceSeriesIds?.includes("control1") === true &&
    created.transform.sourceSeriesIds?.includes("tratamiento1") === true &&
    typeof created.transform.createdAt === "string",
});

const summary = {
  phase: "formula-builder-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
