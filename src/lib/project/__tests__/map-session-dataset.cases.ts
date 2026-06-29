import type { ImportAuxiliaryColumn } from "@/lib/import/types";
import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import {
  projectDatasetV2ToSessionDataset,
  sessionDatasetToProjectDatasetV2,
  type SessionDatasetToProjectDatasetOptions,
} from "../adapters/sgproj/map-session-dataset";
import type { ProjectDatasetV2 } from "@/lib/project/domain/types-v2";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const SAMPLE_SERIES: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series 1",
    color: "#3366cc",
    points: [
      { x: 1, y: 10 },
      { x: 2, y: 12 },
    ],
  },
  {
    id: "s2",
    name: "Series 2",
    color: "#dc3912",
    points: [{ x: 1, y: 5 }],
  },
];

const SAMPLE_COLUMN_REGISTRY: WorksheetColumnRegistry = {
  s1: { columnType: "numeric", transforms: [] },
  s2: { columnType: "numeric", transforms: [] },
};

const SAMPLE_AUXILIARY_COLUMNS: ImportAuxiliaryColumn[] = [
  {
    id: "aux-1",
    label: "Group",
    role: "group",
    valuesByRowIndex: { 0: "alpha", 1: "beta" },
  },
];

const buildSessionDataset = (
  overrides?: Partial<SessionDataset>
): SessionDataset => ({
  id: "00000000-0000-4000-8000-000000000099::primary",
  name: "experiment.csv",
  importedAt: "2026-06-17T12:00:00.000Z",
  seriesCount: 2,
  observationCount: 3,
  worksheetModified: true,
  datasetPayload: {
    series: SAMPLE_SERIES,
    importReport: null,
    columnRegistry: SAMPLE_COLUMN_REGISTRY,
    auxiliaryColumns: SAMPLE_AUXILIARY_COLUMNS,
  },
  ...overrides,
});

const buildProjectDataset = (
  overrides?: Partial<ProjectDatasetV2>
): ProjectDatasetV2 => ({
  id: "00000000-0000-4000-8000-000000000099::primary",
  label: "experiment.csv",
  series: SAMPLE_SERIES,
  info: {
    fileName: "experiment.csv",
    importedAt: "2026-06-17T12:00:00.000Z",
    seriesCount: 2,
    observationCount: 3,
  },
  importReport: null,
  preserveAnalysisOnReimport: true,
  checksum: "sha256:fixture",
  worksheet: {
    columnRegistry: SAMPLE_COLUMN_REGISTRY,
    auxiliaryColumns: SAMPLE_AUXILIARY_COLUMNS,
    modified: true,
  },
  ...overrides,
});

const deepEqual = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

const assertSessionEquivalent = (
  actual: SessionDataset,
  expected: SessionDataset
): boolean => deepEqual(actual, expected);

const assertProjectDatasetEquivalent = (
  actual: ProjectDatasetV2,
  expected: ProjectDatasetV2
): boolean => deepEqual(actual, expected);

const persistedOptionsFromDataset = (
  dataset: ProjectDatasetV2
): SessionDatasetToProjectDatasetOptions => ({
  preserveAnalysisOnReimport: dataset.preserveAnalysisOnReimport,
  checksum: dataset.checksum,
});

export const runMapSessionDatasetCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const session = buildSessionDataset();
  const persisted = buildProjectDataset();

  const runtimeToPersisted = sessionDatasetToProjectDatasetV2(session, {
    preserveAnalysisOnReimport: true,
    checksum: "sha256:fixture",
  });

  assertCase(
    "map.runtimeToPersisted.id",
    runtimeToPersisted.id === session.id &&
      !runtimeToPersisted.id.startsWith("session-ds-")
  );
  assertCase(
    "map.runtimeToPersisted.label",
    runtimeToPersisted.label === session.name
  );
  assertCase(
    "map.runtimeToPersisted.series",
    deepEqual(runtimeToPersisted.series, session.datasetPayload.series)
  );
  assertCase(
    "map.runtimeToPersisted.info",
    deepEqual(runtimeToPersisted.info, {
      fileName: session.name,
      importedAt: session.importedAt,
      seriesCount: session.seriesCount,
      observationCount: session.observationCount,
    })
  );
  assertCase(
    "map.runtimeToPersisted.worksheet",
    runtimeToPersisted.worksheet?.modified === true &&
      deepEqual(
        runtimeToPersisted.worksheet?.columnRegistry,
        session.datasetPayload.columnRegistry
      )
  );
  assertCase(
    "map.runtimeToPersisted.preserveAnalysisOnReimport",
    runtimeToPersisted.preserveAnalysisOnReimport === true
  );
  assertCase(
    "map.runtimeToPersisted.checksum",
    runtimeToPersisted.checksum === "sha256:fixture"
  );

  const persistedToRuntime = projectDatasetV2ToSessionDataset(persisted);

  assertCase(
    "map.persistedToRuntime.id",
    persistedToRuntime.id === persisted.id &&
      !persistedToRuntime.id.startsWith("session-ds-")
  );
  assertCase(
    "map.persistedToRuntime.name",
    persistedToRuntime.name === persisted.info?.fileName
  );
  assertCase(
    "map.persistedToRuntime.metrics",
    persistedToRuntime.seriesCount === 2 &&
      persistedToRuntime.observationCount === 3
  );
  assertCase(
    "map.persistedToRuntime.payload",
    deepEqual(persistedToRuntime.datasetPayload.series, persisted.series) &&
      deepEqual(
        persistedToRuntime.datasetPayload.columnRegistry,
        persisted.worksheet?.columnRegistry
      )
  );

  const sessionRoundTrip = projectDatasetV2ToSessionDataset(runtimeToPersisted);
  assertCase(
    "map.roundtrip.session.equivalent",
    assertSessionEquivalent(sessionRoundTrip, session)
  );

  const persistedRoundTrip = sessionDatasetToProjectDatasetV2(
    persistedToRuntime,
    persistedOptionsFromDataset(persisted)
  );
  assertCase(
    "map.roundtrip.persisted.equivalent",
    assertProjectDatasetEquivalent(persistedRoundTrip, persisted)
  );

  const domainIdSession = buildSessionDataset({
    id: "proj-abc-123::primary",
    name: "Dataset5.csv",
  });
  const domainIdPersisted = sessionDatasetToProjectDatasetV2(domainIdSession);
  assertCase(
    "map.id.domainPrimaryPreserved",
    domainIdPersisted.id === "proj-abc-123::primary"
  );

  const uuidSession = buildSessionDataset({
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  });
  const uuidPersisted = sessionDatasetToProjectDatasetV2(uuidSession);
  assertCase(
    "map.id.uuidPreserved",
    uuidPersisted.id === "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  );

  const frozenSession = Object.freeze(
    buildSessionDataset({
      datasetPayload: Object.freeze({
        series: Object.freeze(
          SAMPLE_SERIES.map((item) =>
            Object.freeze({
              ...item,
              points: Object.freeze(item.points.map((point) => ({ ...point }))),
            })
          )
        ) as ExperimentalSeries[],
        importReport: null,
        columnRegistry: Object.freeze({ ...SAMPLE_COLUMN_REGISTRY }),
        auxiliaryColumns: Object.freeze([
          Object.freeze({
            ...SAMPLE_AUXILIARY_COLUMNS[0],
            valuesByRowIndex: Object.freeze({
              ...SAMPLE_AUXILIARY_COLUMNS[0].valuesByRowIndex,
            }),
          }),
        ]) as ImportAuxiliaryColumn[],
      }),
    })
  );

  const beforeSnapshot = JSON.stringify(frozenSession);
  sessionDatasetToProjectDatasetV2(frozenSession as SessionDataset);
  assertCase(
    "map.immutable.runtimeInput",
    JSON.stringify(frozenSession) === beforeSnapshot
  );

  const frozenPersisted = Object.freeze(buildProjectDataset());
  const beforePersistedSnapshot = JSON.stringify(frozenPersisted);
  projectDatasetV2ToSessionDataset(frozenPersisted as ProjectDatasetV2);
  assertCase(
    "map.immutable.persistedInput",
    JSON.stringify(frozenPersisted) === beforePersistedSnapshot
  );

  const emptySession = buildSessionDataset({
    seriesCount: 0,
    observationCount: 0,
    worksheetModified: false,
    datasetPayload: {
      series: [],
      importReport: null,
    },
  });
  const emptyPersisted = sessionDatasetToProjectDatasetV2(emptySession);
  assertCase(
    "map.empty.runtimeToPersisted",
    emptyPersisted.series.length === 0 &&
      emptyPersisted.importReport === null &&
      emptyPersisted.worksheet === undefined
  );

  const emptyRoundTrip = projectDatasetV2ToSessionDataset(emptyPersisted);
  assertCase(
    "map.empty.roundtrip.equivalent",
    assertSessionEquivalent(emptyRoundTrip, emptySession)
  );

  const importReportSession = buildSessionDataset({
    datasetPayload: {
      series: SAMPLE_SERIES,
      importReport: {
        fileName: "experiment.csv",
        sheetName: "Sheet1",
        selectedSheet: "Sheet1",
        mode: "fast-path",
        importMode: "fast-path",
        mapping: {
          xColumnIndex: 0,
          yColumnIndex: 1,
          xLabel: "X",
          yLabel: "Y",
          rowFilter: "skip-sparse",
        },
        selectedColumns: {
          xIndex: 0,
          yIndex: 1,
          xLabel: "X",
          yLabel: "Y",
          xNumericRatio: 1,
          yNumericRatio: 1,
        },
        importedPointCount: 3,
        discardedPointCount: 0,
        skippedRowCount: 0,
        warningCount: 0,
        errorCount: 0,
        unimportedSheetCount: 0,
        coverageRatio: 1,
        warnings: [],
        errors: [],
        stats: {
          importablePointCount: 3,
          skippedRowCount: 0,
          evaluatedRowCount: 2,
          coverageRatio: 1,
          duplicatePointCount: 0,
          xMin: 1,
          xMax: 2,
          yMin: 5,
          yMax: 12,
        },
        validation: {
          ok: true,
          errors: [],
          warnings: [],
        },
      },
    },
  });
  const importReportPersisted =
    sessionDatasetToProjectDatasetV2(importReportSession);
  assertCase(
    "map.importReport.preserved",
    deepEqual(
      importReportPersisted.importReport,
      importReportSession.datasetPayload.importReport
    )
  );

  return results;
};
