import type { ExperimentalSeries } from "../src/lib/experimentalData";
import {
  createTransformColumnMetadata,
  DEFAULT_COLUMN_METADATA,
  generateTransformedColumnLabel,
  seriesToWorksheet,
  transformWorksheetColumn,
  transformWorksheetValues,
  worksheetToSeries,
} from "../src/lib/experimentalWorksheet";

type CaseResult = { id: string; pass: boolean; detail?: string };

const results: CaseResult[] = [];

const control1Series: ExperimentalSeries = {
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

const baseModel = seriesToWorksheet([control1Series]);
const sourceId = baseModel.columns[0]?.seriesId ?? "";

function approxEqual(actual: number | null, expected: number, tolerance = 0.02) {
  return actual !== null && Math.abs(actual - expected) <= tolerance;
}

function assertValues(
  id: string,
  actual: Array<number | null>,
  expected: number[],
  tolerance = 0.02
) {
  results.push({
    id,
    pass:
      actual.length === expected.length &&
      expected.every((value, index) => approxEqual(actual[index] ?? null, value, tolerance)),
    detail: actual.map((value) => value?.toFixed(4) ?? "null").join(", "),
  });
}

const sourceValues = [10, 20, 30, 40];

assertValues(
  "transform.log10",
  transformWorksheetValues(sourceValues, { kind: "log", enabled: true }),
  [Math.log10(10), Math.log10(20), Math.log10(30), Math.log10(40)]
);

assertValues(
  "transform.zscore",
  transformWorksheetValues(sourceValues, { kind: "zscore", enabled: true }),
  [-1.16, -0.39, 0.39, 1.16]
);

assertValues(
  "transform.normalize",
  transformWorksheetValues(sourceValues, { kind: "normalize", enabled: true }),
  [0, 1 / 3, 2 / 3, 1]
);

assertValues(
  "transform.scale",
  transformWorksheetValues(sourceValues, {
    kind: "scale",
    enabled: true,
    params: { factor: 10 },
  }),
  [100, 200, 300, 400]
);

assertValues(
  "transform.power",
  transformWorksheetValues(sourceValues, {
    kind: "power",
    enabled: true,
    params: { exponent: 2 },
  }),
  [100, 400, 900, 1600]
);

const zscoreModel = transformWorksheetColumn(baseModel, sourceId, {
  kind: "zscore",
  enabled: true,
});
results.push({
  id: "transform.column.zscore.label",
  pass:
    zscoreModel?.columns.some((column) => column.label === "Control1 (Z)") ===
    true,
});

const logModel = transformWorksheetColumn(baseModel, sourceId, {
  kind: "log",
  enabled: true,
});
results.push({
  id: "transform.column.log.label",
  pass:
    logModel?.columns.some((column) => column.label === "Control1 (Log10)") ===
    true,
});

const scaleModel = transformWorksheetColumn(baseModel, sourceId, {
  kind: "scale",
  enabled: true,
  params: { factor: 10 },
});
const scaleColumn = scaleModel?.columns.find(
  (column) => column.label === "Control1 (×10)"
);
results.push({
  id: "transform.column.scale.values",
  pass:
    scaleColumn !== undefined &&
    scaleModel!.rows.every((row, index) => row.values[scaleColumn.seriesId] === sourceValues[index]! * 10),
});

const metadata = createTransformColumnMetadata(sourceId, DEFAULT_COLUMN_METADATA, {
  kind: "zscore",
  enabled: true,
});
results.push({
  id: "transform.metadata.audit",
  pass:
    metadata.columnType === "numeric" &&
    metadata.transforms[0]?.kind === "zscore" &&
    metadata.transforms[0]?.sourceSeriesId === sourceId &&
    metadata.transforms[0]?.enabled === true,
});

const roundTrip = worksheetToSeries(
  transformWorksheetColumn(baseModel, sourceId, {
    kind: "normalize",
    enabled: true,
  }) ?? baseModel,
  [control1Series]
);
results.push({
  id: "transform.roundtrip.series-count",
  pass: roundTrip.length === 2,
  detail: `${roundTrip.length} series`,
});

results.push({
  id: "transform.label.unique",
  pass:
    generateTransformedColumnLabel(
      "Control1",
      { kind: "zscore", enabled: true },
      [{ seriesId: "a", label: "Control1 (Z)" }]
    ) === "Control1 (Z) 2",
});

const summary = {
  phase: "worksheet-transforms-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
