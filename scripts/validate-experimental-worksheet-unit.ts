import type { ExperimentalSeries } from "../src/lib/experimentalData";
import {
  applyWorksheetModelUpdate,
  deleteWorksheetColumn,
  duplicateWorksheetColumn,
  formatWorksheetSelectionAsTsv,
  generateDefaultColumnName,
  getWorksheetStatusSummary,
  insertWorksheetColumn,
  parseTabularClipboard,
  pasteTabularDataIntoModel,
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

const insertedColumn = insertWorksheetColumn(model);
results.push({
  id: "insert.column",
  pass:
    insertedColumn.columns.length === 3 &&
    insertedColumn.columns[2]?.label === "Nueva variable",
});

results.push({
  id: "insert.column.name",
  pass: generateDefaultColumnName(insertedColumn.columns) === "Variable 4",
});

const duplicated = duplicateWorksheetColumn(model, "s1");
results.push({
  id: "duplicate.column",
  pass:
    duplicated.columns.length === 3 &&
    duplicated.columns.some((column) => column.label.includes("(copia)")),
});

const deleted = deleteWorksheetColumn(model, "s2");
results.push({
  id: "delete.column",
  pass: deleted.columns.length === 1 && deleted.columns[0]?.seriesId === "s1",
});

const clipboardGrid = parseTabularClipboard("1\t2\t3\n4\t5\t6");
results.push({
  id: "parse.clipboard",
  pass: clipboardGrid.length === 2 && clipboardGrid[0]?.length === 3,
});

const pasted = pasteTabularDataIntoModel(model, clipboardGrid);
results.push({
  id: "paste.clipboard",
  pass:
    pasted.changed &&
    pasted.model.rows.length >= 2 &&
    pasted.model.columns.length >= 2,
});

const insertedForPaste = insertWorksheetColumn(model, "Control1");
const anchorRowKey = insertedForPaste.rows[0]?.rowKey ?? "";
const anchorSeriesId = insertedForPaste.columns[2]?.seriesId ?? "";
const verticalBlockGrid = parseTabularClipboard("100\n200\n300\n400");
const headerRowGrid = parseTabularClipboard("Control1\n100\n200\n300\n400");

const cellAnchorVerticalOverwrite = pasteTabularDataIntoModel(
  {
    ...insertedForPaste,
    rows: insertedForPaste.rows.map((row, index) => ({
      ...row,
      values: {
        ...row.values,
        [anchorSeriesId]: 10 + index,
      },
    })),
  },
  verticalBlockGrid,
  { rowKey: anchorRowKey, column: anchorSeriesId, kind: "cell" }
);
results.push({
  id: "paste.cell.vertical-block.overwrite",
  pass:
    cellAnchorVerticalOverwrite.changed &&
    cellAnchorVerticalOverwrite.model.rows[0]?.values[anchorSeriesId] === 100 &&
    cellAnchorVerticalOverwrite.model.rows[1]?.values[anchorSeriesId] === 200 &&
    cellAnchorVerticalOverwrite.model.rows[2]?.values[anchorSeriesId] === 300 &&
    cellAnchorVerticalOverwrite.model.rows[3]?.values[anchorSeriesId] === 400,
});

const cellAnchorVertical = pasteTabularDataIntoModel(
  insertedForPaste,
  verticalBlockGrid,
  { rowKey: anchorRowKey, column: anchorSeriesId, kind: "cell" }
);
results.push({
  id: "paste.cell.vertical-block",
  pass:
    cellAnchorVertical.changed &&
    cellAnchorVertical.model.rows[0]?.values[anchorSeriesId] === 100 &&
    cellAnchorVertical.model.rows[1]?.values[anchorSeriesId] === 200 &&
    cellAnchorVertical.model.rows[2]?.values[anchorSeriesId] === 300 &&
    cellAnchorVertical.model.rows[3]?.values[anchorSeriesId] === 400,
});

const cellAnchorHeaderRow = pasteTabularDataIntoModel(
  insertedForPaste,
  headerRowGrid,
  { rowKey: anchorRowKey, column: anchorSeriesId, kind: "cell" }
);
results.push({
  id: "paste.cell.header-row",
  pass:
    cellAnchorHeaderRow.changed &&
    cellAnchorHeaderRow.model.rows[0]?.values[anchorSeriesId] === 100 &&
    cellAnchorHeaderRow.model.rows[1]?.values[anchorSeriesId] === 200 &&
    cellAnchorHeaderRow.model.rows[2]?.values[anchorSeriesId] === 300 &&
    cellAnchorHeaderRow.model.rows[3]?.values[anchorSeriesId] === 400,
});

const cellAnchorSingle = pasteTabularDataIntoModel(
  insertedForPaste,
  [["100"]],
  { rowKey: anchorRowKey, column: anchorSeriesId, kind: "cell" }
);
results.push({
  id: "paste.cell.single-value",
  pass:
    cellAnchorSingle.changed &&
    cellAnchorSingle.model.rows[0]?.values[anchorSeriesId] === 100,
});

const headerAnchorVertical = pasteTabularDataIntoModel(
  insertedForPaste,
  verticalBlockGrid,
  { rowKey: anchorRowKey, column: anchorSeriesId, kind: "header" }
);
results.push({
  id: "paste.header.vertical-block",
  pass:
    headerAnchorVertical.changed &&
    headerAnchorVertical.model.rows[0]?.values[anchorSeriesId] === 100 &&
    headerAnchorVertical.model.rows[1]?.values[anchorSeriesId] === 200 &&
    headerAnchorVertical.model.rows[2]?.values[anchorSeriesId] === 300 &&
    headerAnchorVertical.model.rows[3]?.values[anchorSeriesId] === 400,
});

const scalarPaste = pasteTabularDataIntoModel(
  insertedForPaste,
  [["100"]],
  { rowKey: anchorRowKey, column: anchorSeriesId }
);
results.push({
  id: "paste.scalar.anchor",
  pass:
    scalarPaste.changed &&
    scalarPaste.model.rows[0]?.values[anchorSeriesId] === 100,
});

const scalarPastePreservesOthers = pasteTabularDataIntoModel(
  insertedForPaste,
  [["100"]],
  { rowKey: anchorRowKey, column: anchorSeriesId }
);
results.push({
  id: "paste.scalar.preserve",
  pass:
    scalarPastePreservesOthers.model.rows[0]?.values.s1 === 10 &&
    scalarPastePreservesOthers.model.rows[0]?.values.s2 === 20,
});

const verticalPaste = pasteTabularDataIntoModel(
  insertedForPaste,
  parseTabularClipboard("10\n20\n30"),
  { rowKey: anchorRowKey, column: anchorSeriesId }
);
results.push({
  id: "paste.vertical.anchor",
  pass:
    verticalPaste.changed &&
    verticalPaste.model.rows[0]?.values[anchorSeriesId] === 10 &&
    verticalPaste.model.rows[1]?.values[anchorSeriesId] === 20 &&
    verticalPaste.model.rows[2]?.values[anchorSeriesId] === 30,
});

const noopPaste = pasteTabularDataIntoModel(model, [["not-a-number"]], {
  rowKey: model.rows[0]?.rowKey ?? "",
  column: "s1",
});
results.push({
  id: "paste.noop.invalid",
  pass: noopPaste.changed === false,
});

const tsv = formatWorksheetSelectionAsTsv(model, {
  rowKeys: [model.rows[0]?.rowKey ?? ""],
  columns: ["x", "s1"],
});
results.push({
  id: "copy.tsv",
  pass: tsv.includes("\t") && tsv.startsWith("1"),
});

const status = getWorksheetStatusSummary(model, {
  s1: { columnType: "numeric", transforms: [] },
  s2: { columnType: "category", transforms: [] },
});
results.push({
  id: "status.summary",
  pass:
    status.rowCount === 2 &&
    status.numericVariables === 1 &&
    status.categoricalVariables === 1,
});

const summary = {
  phase: "experimental-worksheet-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
