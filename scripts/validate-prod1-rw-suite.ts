import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  buildColumnDescriptors,
  buildImportPreview,
  buildImportReport,
  detectTableRegion,
  readWorkbookFromPath,
  suggestAxisMapping,
  suggestMultiSeriesMapping,
  validateImportPreview,
} from "../src/lib/import";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RW_FIXTURE_DIR = path.join(__dirname, "fixtures", "import-rw");
const rwFixturePath = (fileName: string) => path.join(RW_FIXTURE_DIR, fileName);

type RwCase = {
  id: string;
  path: string;
  sheet: string;
  minPoints: number;
  minSeries?: number;
};

const CASES: RwCase[] = [
  {
    id: "RW-01",
    path: process.env.RW01_PATH ?? rwFixturePath("rw-01-pb.xlsx"),
    sheet: "Pb",
    minPoints: 8,
  },
  {
    id: "RW-02",
    path: process.env.RW02_PATH ?? rwFixturePath("rw-02-lang-up.xlsx"),
    sheet: "Lang_Up",
    minPoints: 8,
  },
  {
    id: "RW-03",
    path: process.env.RW03_PATH ?? rwFixturePath("rw-03-resultados-up.xlsx"),
    sheet: "resultados_Up",
    minPoints: 8,
  },
  {
    id: "RW-04",
    path: process.env.RW04_PATH ?? rwFixturePath("rw-04-up-ph3.xls"),
    sheet: "Up_PH3",
    minPoints: 10,
    minSeries: 2,
  },
];

const results = CASES.map((testCase) => {
  if (!fs.existsSync(testCase.path)) {
    return {
      id: testCase.id,
      pass: false,
      status: "FAIL",
      reason: "File not found",
    };
  }

  const snapshot = readWorkbookFromPath(testCase.path);
  const sheet = snapshot.sheets.find((item) => item.name === testCase.sheet);
  if (!sheet) {
    return {
      id: testCase.id,
      pass: false,
      status: "FAIL",
      reason: "Sheet not found",
    };
  }

  const matrix = sheet.matrix;
  const region = detectTableRegion(matrix);
  if (!region) {
    return {
      id: testCase.id,
      pass: false,
      status: "FAIL",
      reason: "Table region not detected",
    };
  }

  const descriptors = buildColumnDescriptors(matrix, region);
  const mapping =
    suggestMultiSeriesMapping(matrix, region, descriptors) ??
    suggestAxisMapping(matrix, region, descriptors);

  if (!mapping) {
    return {
      id: testCase.id,
      pass: false,
      status: "FAIL",
      reason: "Mapping not found",
    };
  }

  const preview = buildImportPreview(matrix, region, {
    mapping,
    columnDescriptors: descriptors,
  });
  const validation = validateImportPreview(preview, descriptors, mapping);
  const report = buildImportReport({
    fileName: path.basename(testCase.path),
    sheetName: testCase.sheet,
    mode: "wizard",
    mapping,
    preview,
    validation,
    unimportedSheetCount: Math.max(0, snapshot.sheets.length - 1),
    columnDescriptors: descriptors,
  });

  const multiSeriesCount =
    mapping.yColumnIndices && mapping.yColumnIndices.length >= 2
      ? mapping.yColumnIndices.length
      : 1;

  const pass =
    validation.ok &&
    preview.points.length >= testCase.minPoints &&
    validation.errors.length === 0 &&
    report.version === "v2" &&
    report.ruleCatalogVersion !== undefined &&
    (testCase.minSeries === undefined || multiSeriesCount >= testCase.minSeries);

  return {
    id: testCase.id,
    pass,
    status: pass ? "PASS" : "FAIL",
    points: preview.points.length,
    seriesDetected: multiSeriesCount,
    coverage: Math.round(preview.stats.coverageRatio * 100),
    warnings: validation.warnings.map((item) => item.code),
    reportVersion: report.version,
    mapping,
    headerRow: region.headerRowIndex,
  };
});

const summary = {
  pass: results.every((item) => item.pass),
  results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
