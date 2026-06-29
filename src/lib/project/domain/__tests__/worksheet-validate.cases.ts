import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportAuxiliaryColumn } from "@/lib/import/types";
import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";
import { sanitizeScientificProjectV2 } from "@/lib/project/sanitize-project-v2";
import {
  buildWorksheetSanitizeContext,
  sanitizeProjectWorksheetV2,
  validateProjectWorksheetV2,
  validateScientificProjectV2,
  type ProjectWorksheetV2,
  type ScientificProjectV2,
} from "@/lib/project/domain";

const SAMPLE_SERIES: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series 1",
    color: "#3366cc",
    points: [{ x: 1, y: 10 }],
  },
  {
    id: "s2",
    name: "Series 2",
    color: "#dc3912",
    points: [{ x: 1, y: 5 }],
  },
];

const SAMPLE_AUXILIARY: ImportAuxiliaryColumn[] = [
  {
    id: "aux-1",
    label: "Group",
    role: "group",
    valuesByRowIndex: { 0: "alpha" },
  },
];

const buildMinimalProject = (
  overrides?: Partial<ScientificProjectV2>
): ScientificProjectV2 => ({
  metadata: {
    id: "worksheet-domain-test",
    name: "Worksheet Domain Test",
    createdAt: "2026-06-17T10:00:00.000Z",
    updatedAt: "2026-06-17T12:00:00.000Z",
  },
  datasets: [
    {
      id: "dataset-alpha",
      label: "Alpha",
      series: SAMPLE_SERIES,
      info: null,
      importReport: null,
    },
  ],
  activeDatasetId: "dataset-alpha",
  analysisConfig: {
    visibility: {},
    modes: {
      regressionModel: "none",
      errorBarMode: "sd",
      correlationMethod: "pearson",
      outlierMethod: "iqr",
      heatmapMode: "correlation",
      nonParametricMode: "mann-whitney",
      histogramBins: 10,
      axisScaleMode: "linear",
      naturalLanguageEnabled: true,
    },
    selections: {
      tTestSeriesA: null,
      tTestSeriesB: null,
      mannWhitneySeriesA: null,
      mannWhitneySeriesB: null,
    },
    legend: { hiddenKeys: [] },
  },
  workflow: {
    session: {
      status: "idle",
      templateId: null,
      currentStepIndex: 0,
      completedStepIds: [],
      skippedStepIds: [],
      startedAt: null,
      completedAt: null,
    },
  },
  comparison: {
    slots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: null },
      B: { label: "Slot B", profile: null, sourceDatasetId: null },
    },
  },
  workspace: {
    activeSection: "data",
    inspectorSection: "visualization",
    enabledModules: { basic: true },
  },
  graphContext: null,
  ...overrides,
});

const buildWorksheet = (
  overrides?: Partial<ProjectWorksheetV2>
): ProjectWorksheetV2 => ({
  modified: false,
  ...overrides,
});

const seriesIds = new Set(SAMPLE_SERIES.map((series) => series.id));

export const runWorksheetValidateCases = (
  assertCase: (id: string, pass: boolean, detail?: string) => void
): void => {
  assertCase(
    "worksheet.validate.absent",
    validateProjectWorksheetV2(undefined, seriesIds, "worksheet").ok === true
  );

  assertCase(
    "worksheet.validate.minimalModified",
    validateProjectWorksheetV2(
      buildWorksheet({ modified: false }),
      seriesIds,
      "worksheet"
    ).ok === true
  );

  const fullRegistry: WorksheetColumnRegistry = {
    s1: {
      columnType: "numeric",
      transforms: [
        {
          kind: "formula",
          enabled: true,
          expression: "s1 + s2",
          sourceSeriesIds: ["s1", "s2"],
        },
      ],
    },
    s2: { columnType: "numeric", transforms: [] },
    "aux-1": { columnType: "category", transforms: [] },
  };

  assertCase(
    "worksheet.validate.fullRegistry",
    validateProjectWorksheetV2(
      buildWorksheet({
        modified: true,
        columnRegistry: fullRegistry,
        auxiliaryColumns: SAMPLE_AUXILIARY,
      }),
      seriesIds,
      "worksheet"
    ).ok === true
  );

  const badColumnType = validateProjectWorksheetV2(
    buildWorksheet({
      modified: true,
      columnRegistry: {
        s1: { columnType: "invalid" as "numeric", transforms: [] },
      },
    }),
    seriesIds,
    "worksheet"
  );
  assertCase(
    "worksheet.validate.badColumnType",
    badColumnType.ok === false &&
      badColumnType.errors.some((item) => item.code === "V2-WSH-TYPE")
  );

  const badTransformKind = validateProjectWorksheetV2(
    buildWorksheet({
      modified: true,
      columnRegistry: {
        s1: {
          columnType: "numeric",
          transforms: [{ kind: "bad-kind" as "log", enabled: true }],
        },
      },
    }),
    seriesIds,
    "worksheet"
  );
  assertCase(
    "worksheet.validate.badTransformKind",
    badTransformKind.ok === false &&
      badTransformKind.errors.some((item) => item.code === "V2-WSH-XFORM-KIND")
  );

  const badAuxRole = validateProjectWorksheetV2(
    buildWorksheet({
      modified: true,
      auxiliaryColumns: [
        {
          id: "aux-1",
          label: "Group",
          role: "invalid" as "group",
          valuesByRowIndex: { 0: "alpha" },
        },
      ],
    }),
    seriesIds,
    "worksheet"
  );
  assertCase(
    "worksheet.validate.badAuxRole",
    badAuxRole.ok === false &&
      badAuxRole.errors.some((item) => item.code === "V2-WSH-AUX-ROLE")
  );

  const missingModified = validateProjectWorksheetV2(
    { columnRegistry: { s1: { columnType: "numeric", transforms: [] } } },
    seriesIds,
    "worksheet"
  );
  assertCase(
    "worksheet.validate.missingModified",
    missingModified.ok === false &&
      missingModified.errors.some((item) => item.code === "V2-WSH-MOD")
  );

  const orphanRegistryKey = validateProjectWorksheetV2(
    buildWorksheet({
      modified: true,
      columnRegistry: {
        orphan: { columnType: "numeric", transforms: [] },
        s1: { columnType: "numeric", transforms: [] },
      },
    }),
    seriesIds,
    "worksheet"
  );
  assertCase(
    "worksheet.validate.orphanRegistryKey",
    orphanRegistryKey.ok === true &&
      orphanRegistryKey.warnings.some((item) => item.code === "V2-WSH-ORPHAN") &&
      !orphanRegistryKey.errors.some((item) => item.code === "V2-WSH-ORPHAN")
  );

  const orphanSanitizeInput = buildWorksheet({
    modified: true,
    columnRegistry: {
      orphan: { columnType: "numeric", transforms: [] },
      s1: { columnType: "numeric", transforms: [] },
    },
  });
  const orphanSanitizeWarnings: Array<{
    code: string;
    path: string;
    message: string;
  }> = [];
  const orphanSanitized = sanitizeProjectWorksheetV2(
    orphanSanitizeInput,
    buildWorksheetSanitizeContext(SAMPLE_SERIES, orphanSanitizeInput.auxiliaryColumns),
    "worksheet",
    (warning) => orphanSanitizeWarnings.push(warning)
  );
  assertCase(
    "worksheet.sanitize.orphanRegistryKey",
    orphanSanitized?.columnRegistry?.orphan === undefined &&
      orphanSanitized?.columnRegistry?.s1 !== undefined &&
      orphanSanitizeWarnings.some((item) => item.code === "H-WS-ORPHAN")
  );

  const orphanTransformInput = buildWorksheet({
    modified: true,
    columnRegistry: {
      s1: {
        columnType: "numeric",
        transforms: [
          {
            kind: "formula",
            enabled: true,
            sourceSeriesIds: ["s1", "missing-series"],
          },
        ],
      },
    },
  });
  const orphanTransformWarnings: Array<{
    code: string;
    path: string;
    message: string;
  }> = [];
  const orphanTransformSanitized = sanitizeProjectWorksheetV2(
    orphanTransformInput,
    buildWorksheetSanitizeContext(
      SAMPLE_SERIES,
      orphanTransformInput.auxiliaryColumns
    ),
    "worksheet",
    (warning) => orphanTransformWarnings.push(warning)
  );
  assertCase(
    "worksheet.sanitize.orphanTransformRef",
    orphanTransformSanitized?.columnRegistry?.s1.transforms[0]?.sourceSeriesIds?.length ===
      1 &&
      orphanTransformSanitized?.columnRegistry?.s1.transforms[0]?.sourceSeriesIds?.[0] ===
        "s1" &&
      orphanTransformWarnings.some((item) => item.code === "H-WS-ORPHAN")
  );

  const emptyAfterRepairInput = buildWorksheet({
    modified: false,
    columnRegistry: {
      orphan: { columnType: "numeric", transforms: [] },
    },
  });
  const emptyAfterRepair = sanitizeProjectWorksheetV2(
    emptyAfterRepairInput,
    buildWorksheetSanitizeContext(
      SAMPLE_SERIES,
      emptyAfterRepairInput.auxiliaryColumns
    ),
    "worksheet",
    () => undefined
  );
  assertCase(
    "worksheet.sanitize.emptyAfterRepair",
    emptyAfterRepair === undefined
  );

  const idempotentInput = buildWorksheet({
    modified: true,
    columnRegistry: {
      s1: {
        columnType: "numeric",
        transforms: [
          {
            kind: "formula",
            enabled: true,
            sourceSeriesIds: ["s1", "missing-series"],
          },
        ],
      },
    },
  });
  const firstPassWarnings: Array<{ code: string; path: string; message: string }> =
    [];
  const firstPass = sanitizeProjectWorksheetV2(
    idempotentInput,
    buildWorksheetSanitizeContext(SAMPLE_SERIES, idempotentInput.auxiliaryColumns),
    "worksheet",
    (warning) => firstPassWarnings.push(warning)
  );
  const secondPassWarnings: Array<{ code: string; path: string; message: string }> =
    [];
  sanitizeProjectWorksheetV2(
    firstPass,
    buildWorksheetSanitizeContext(SAMPLE_SERIES, firstPass?.auxiliaryColumns),
    "worksheet",
    (warning) => secondPassWarnings.push(warning)
  );
  assertCase(
    "worksheet.sanitize.idempotent",
    firstPassWarnings.length > 0 && secondPassWarnings.length === 0
  );

  const projectWithOrphanWorksheet = buildMinimalProject({
    datasets: [
      {
        id: "dataset-alpha",
        label: "Alpha",
        series: SAMPLE_SERIES,
        info: null,
        importReport: null,
        worksheet: buildWorksheet({
          modified: true,
          columnRegistry: {
            orphan: { columnType: "numeric", transforms: [] },
            s1: { columnType: "numeric", transforms: [] },
          },
        }),
      },
    ],
  });
  const projectSanitized = sanitizeScientificProjectV2(projectWithOrphanWorksheet);
  assertCase(
    "worksheet.sanitize.projectIntegration",
    projectSanitized.project.datasets[0]?.worksheet?.columnRegistry?.orphan ===
      undefined &&
      projectSanitized.project.datasets[0]?.worksheet?.columnRegistry?.s1 !==
        undefined &&
      projectSanitized.warnings.some((item) => item.code === "H-WS-ORPHAN")
  );

  assertCase(
    "worksheet.compat.b2ProjectNoWorksheet",
    validateScientificProjectV2(buildMinimalProject()).ok === true
  );
};

export const runWorksheetValidateCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runWorksheetValidateCases(assertCase);
  return results;
};
