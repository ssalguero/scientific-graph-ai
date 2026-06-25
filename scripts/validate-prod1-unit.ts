import {
  buildFastPathPreview,
  buildFastPathPreviewFromDelimitedRows,
  buildImportPreview,
  buildImportReport,
  EPIC_B_BASELINE,
  getBlockingImportRuleCodes,
  getImportValidationRuleCatalog,
  IMPORT_RULE_CATALOG_VERSION,
  isBlockingImportRule,
  validateImportPreview,
  type ColumnDescriptor,
  type ColumnMapping,
  type TableRegion,
} from "../src/lib/import";

type CaseResult = {
  id: string;
  pass: boolean;
  details?: Record<string, unknown>;
};

const results: CaseResult[] = [];

const assertCase = (
  id: string,
  pass: boolean,
  details?: Record<string, unknown>
): void => {
  results.push({ id, pass, details });
};

const region: TableRegion = {
  startRow: 0,
  endRow: 5,
  startCol: 0,
  endCol: 2,
  headerRowIndex: 0,
  metadataRowCount: 0,
  confidence: 1,
};

const mapping: ColumnMapping = {
  xColumnIndex: 0,
  yColumnIndex: 1,
  xLabel: "time",
  yLabel: "value",
  rowFilter: "skip-sparse",
};

const descriptors: ColumnDescriptor[] = [
  {
    index: 0,
    label: "time",
    sampleValues: [0, 1, "bad", 2, ""],
    numericRatio: 0.6,
  },
  {
    index: 1,
    label: "value",
    sampleValues: [10, 12, 14, "n/a", ""],
    numericRatio: 0.6,
  },
  {
    index: 2,
    label: "note",
    sampleValues: ["ok", "ok", "bad x", "bad y", "note only"],
    numericRatio: 0,
  },
];

const auditedMatrix = [
  ["time", "value", "note"],
  [0, 10, "ok"],
  [1, 12, "ok"],
  ["bad", 14, "bad x"],
  [2, "n/a", "bad y"],
  ["", "", "note only"],
];

const auditedPreview = buildImportPreview(auditedMatrix, region, {
  mapping,
  columnDescriptors: descriptors,
  samplePolicy: { discardedRowSampleLimit: 2, previewPointSampleLimit: 5 },
});
const auditedValidation = validateImportPreview(
  auditedPreview,
  descriptors,
  mapping
);
const auditedReport = buildImportReport({
  fileName: "prod1b-audit.csv",
  sheetName: "Sheet1",
  mode: "wizard",
  mapping,
  preview: auditedPreview,
  validation: auditedValidation,
  unimportedSheetCount: 0,
  columnDescriptors: descriptors,
});

assertCase("prod1b.report.v2", auditedReport.version === "v2", {
  version: auditedReport.version,
});
assertCase(
  "prod1b.audit.reason-counts",
  auditedReport.audit?.reasonCounts.length === 3 &&
    auditedReport.audit.totalDiscardedRows === 3 &&
    auditedReport.audit.truncated === true,
  {
    audit: auditedReport.audit,
  }
);
assertCase(
  "prod1b.validation.structured-severities",
  auditedValidation.ok &&
    auditedValidation.issueSummary?.error === 0 &&
    (auditedValidation.issueSummary?.warning ?? 0) >= 2 &&
    (auditedValidation.issueSummary?.info ?? 0) >= 1,
  {
    issueSummary: auditedValidation.issueSummary,
    issueCodes: auditedValidation.issues?.map((issue) => issue.code),
  }
);
assertCase(
  "prod1b.report.reproducibility",
  auditedReport.reproducibility?.reportVersion === "v2" &&
    auditedReport.reproducibility.selectedColumns.xIndex === 0 &&
    auditedReport.reproducibility.selectedColumns.yIndex === 1,
  {
    reproducibility: auditedReport.reproducibility,
  }
);

const minimumPreview = buildImportPreview(
  [
    ["x", "y"],
    [1, 2],
  ],
  { ...region, endRow: 1, endCol: 1 },
  mapping
);
const minimumValidation = validateImportPreview(
  minimumPreview,
  descriptors,
  mapping
);
assertCase(
  "prod1b.validation.q01-blocks",
  !minimumValidation.ok &&
    minimumValidation.errors.some((issue) => issue.code === "Q-01"),
  {
    errors: minimumValidation.errors,
  }
);

const duplicatePreview = buildImportPreview(
  [
    ["x", "y"],
    [1, 2],
    [1, 2],
    [1, 2],
  ],
  { ...region, endRow: 3, endCol: 1 },
  mapping
);
const duplicateValidation = validateImportPreview(
  duplicatePreview,
  descriptors,
  mapping
);
assertCase(
  "prod1b.validation.distribution-info",
  duplicateValidation.warnings.some((issue) => issue.code === "CONSTANT_X") &&
    duplicateValidation.warnings.some((issue) => issue.code === "CONSTANT_Y") &&
    duplicateValidation.warnings.some(
      (issue) => issue.code === "DUPLICATE_POINTS" && issue.severity === "info"
    ),
  {
    issueCodes: duplicateValidation.warnings.map((issue) => issue.code),
  }
);

const fastPathPreview = buildFastPathPreview([
  { x: 0, y: 1, sourceRowIndex: 0 },
  { x: 1, y: 2, sourceRowIndex: 1 },
]);
const fastPathValidation = validateImportPreview(fastPathPreview, undefined, {
  xColumnIndex: 0,
  yColumnIndex: 1,
});
const fastPathReport = buildImportReport({
  fileName: "prod1b-fast.csv",
  sheetName: "(texto delimitado)",
  mode: "fast-path",
  mapping,
  preview: fastPathPreview,
  validation: fastPathValidation,
  unimportedSheetCount: 0,
});
assertCase(
  "prod1b.fast-path.report-v2",
  fastPathReport.version === "v2" &&
    fastPathReport.importedPointCount === 2 &&
    fastPathReport.audit?.totalDiscardedRows === 0,
  {
    report: fastPathReport,
  }
);

const ruleCatalog = getImportValidationRuleCatalog();
assertCase(
  "prod1b.rule-catalog.required-rules",
  ["Q-01", "Q-02", "Q-03", "ROW_DISCARD_REASONS"].every((code) =>
    ruleCatalog.some((rule) => rule.code === code)
  ),
  {
    ruleCount: ruleCatalog.length,
  }
);

assertCase(
  "prod1b.rule-catalog.version",
  IMPORT_RULE_CATALOG_VERSION === "1.0.0" &&
    auditedReport.ruleCatalogVersion === IMPORT_RULE_CATALOG_VERSION,
  {
    version: auditedReport.ruleCatalogVersion,
  }
);

assertCase(
  "prod1b.blocking-rules.q01-only",
  getBlockingImportRuleCodes().length === 1 &&
    isBlockingImportRule("Q-01") &&
    !isBlockingImportRule("Q-02") &&
    !isBlockingImportRule("LOW_POINT_COUNT"),
  {
    blocking: getBlockingImportRuleCodes(),
  }
);

const delimitedAuditPreview = buildFastPathPreviewFromDelimitedRows(
  [
    ["time", "value"],
    [0, 10],
    [1, 12],
    ["bad", 14],
    [2, "n/a"],
  ],
  0,
  0,
  1
);
assertCase(
  "prod1b.fast-path.delimited-audit",
  delimitedAuditPreview.auditPartial === false &&
    (delimitedAuditPreview.audit?.totalDiscardedRows ?? 0) === 2,
  {
    audit: delimitedAuditPreview.audit,
  }
);

assertCase(
  "epic-b.baseline.frozen",
  EPIC_B_BASELINE.dataset5.overall === 77.0 &&
    EPIC_B_BASELINE.rwCases.length === 4,
  {
    baseline: EPIC_B_BASELINE,
  }
);

const lowPointPreview = buildImportPreview(
  [
    ["x", "y"],
    [1, 2],
    [2, 3],
  ],
  { ...region, endRow: 2, endCol: 1 },
  mapping
);
const lowPointValidation = validateImportPreview(
  lowPointPreview,
  descriptors,
  mapping
);
assertCase(
  "prod1b.validation.advisory-not-blocking",
  lowPointValidation.ok &&
    lowPointValidation.warnings.some((issue) => issue.code === "LOW_POINT_COUNT"),
  {
    ok: lowPointValidation.ok,
    codes: lowPointValidation.warnings.map((issue) => issue.code),
  }
);

const summary = {
  phase: "prod1b-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
