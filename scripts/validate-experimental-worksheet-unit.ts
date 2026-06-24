import type { ExperimentalSeries } from "../src/lib/experimentalData";
import {
  applyWorksheetModelUpdate,
  seriesToWorksheet,
  sortWorksheetRows,
  worksheetToSeries,
} from "../src/lib/experimentalWorksheet";

type CaseResult = { id: string; pass: boolean; detail?: string };

const results: CaseResult[] = [];

const sampleSeries: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Temperatura",
    color: "#3b82f6",
    points: [
      { x: 1, y: 10 },
      { x: 2, y: 12 },
    ],
  },
  {
    id: "s2",
    name: "Presión",
    color: "#ef4444",
    points: [
      { x: 1, y: 20 },
      { x: 2, y: 24 },
    ],
  },
];

const model = seriesToWorksheet(sampleSeries);
results.push({
  id: "model.rows",
  pass: model.rows.length === 2 && model.columns.length === 2,
  detail: `${model.rows.length} rows`,
});

const roundTrip = worksheetToSeries(model, sampleSeries);
results.push({
  id: "roundTrip.points",
  pass:
    roundTrip[0]?.points[0]?.y === 10 &&
    roundTrip[1]?.points[1]?.y === 24,
});

const sorted = sortWorksheetRows(model.rows, "s2", "desc");
results.push({
  id: "sort.desc",
  pass: (sorted[0]?.values.s2 ?? 0) >= (sorted[1]?.values.s2 ?? 0),
});

const renamed = applyWorksheetModelUpdate(sampleSeries, (current) => ({
  ...current,
  columns: current.columns.map((column) =>
    column.seriesId === "s1"
      ? { ...column, label: "Temperatura (°C)" }
      : column
  ),
}));
results.push({
  id: "rename.column",
  pass: renamed[0]?.name === "Temperatura (°C)",
});

const addedRow = applyWorksheetModelUpdate(sampleSeries, (current) => ({
  ...current,
  rows: [
    ...current.rows,
    {
      rowKey: "new-row",
      x: 3,
      values: { s1: 14, s2: 28 },
    },
  ],
}));
results.push({
  id: "add.row",
  pass: addedRow[0]?.points.length === 3,
});

const summary = {
  phase: "experimental-worksheet-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
