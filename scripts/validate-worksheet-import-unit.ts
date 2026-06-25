import {
  buildColumnRegistryFromImportAuxiliary,
  createDefaultColumnRegistry,
  seriesToWorksheet,
  type WorksheetColumnRegistry,
} from "../src/lib/experimentalWorksheet";
import type { ImportAuxiliaryColumn } from "../src/lib/import/types";
import type { ExperimentalSeries } from "../src/lib/experimentalData";

type CaseResult = { id: string; pass: boolean; details?: Record<string, unknown> };

const results: CaseResult[] = [];

const assertCase = (
  id: string,
  pass: boolean,
  details?: Record<string, unknown>
): void => {
  results.push({ id, pass, details });
};

const series: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series A",
    color: "#000",
    points: [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
    ],
  },
];

const auxiliary: ImportAuxiliaryColumn[] = [
  {
    id: "import-aux-replicate-2",
    label: "Replicate",
    role: "replicate",
    valuesByRowIndex: { 1: "R1", 2: "R2" },
  },
];

const model = seriesToWorksheet(series);
const registry = buildColumnRegistryFromImportAuxiliary(
  model.columns,
  auxiliary
);

assertCase(
  "worksheet-import.registry.auxiliary-category",
  registry["import-aux-replicate-2"]?.columnType === "category",
  { registry }
);

const roundTripRegistry: WorksheetColumnRegistry = {
  ...createDefaultColumnRegistry(model.columns),
  ...registry,
};

assertCase(
  "worksheet-import.registry.series-numeric",
  model.columns.every(
    (column) => roundTripRegistry[column.seriesId]?.columnType === "numeric"
  ),
  { columns: model.columns.length }
);

const summary = {
  phase: "worksheet-import-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
