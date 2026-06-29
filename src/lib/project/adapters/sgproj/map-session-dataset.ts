import type { ImportReport } from "@/lib/import/types";
import {
  cloneExperimentalSeries,
  cloneProjectWorksheetV2,
  computeDatasetMetrics,
  isWorksheetPayloadEmpty,
  preservePersistedDatasetId,
} from "@/lib/project/domain";
import type { ProjectDatasetV2 } from "@/lib/project/domain/types-v2";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";

/** Optional persisted-only fields not present on runtime `SessionDataset`. */
export type SessionDatasetToProjectDatasetOptions = Readonly<{
  preserveAnalysisOnReimport?: boolean;
  checksum?: string | null;
}>;

const cloneImportReport = (report: ImportReport | null): ImportReport | null =>
  report ? { ...report } : null;

const buildProjectDatasetInfo = (
  session: SessionDataset
): ProjectDatasetV2["info"] => ({
  fileName: session.name,
  importedAt: session.importedAt,
  seriesCount: session.seriesCount,
  observationCount: session.observationCount,
});

const buildWorksheetFromSession = (
  session: SessionDataset
): ProjectDatasetV2["worksheet"] | undefined => {
  const { columnRegistry, auxiliaryColumns } = session.datasetPayload;
  const hasWorksheetPayload =
    columnRegistry !== undefined || auxiliaryColumns !== undefined;

  if (!hasWorksheetPayload && !session.worksheetModified) {
    return undefined;
  }

  const cloned = cloneProjectWorksheetV2({
    modified: session.worksheetModified,
    columnRegistry,
    auxiliaryColumns,
  });

  if (isWorksheetPayloadEmpty(cloned)) {
    return undefined;
  }

  return {
    columnRegistry: cloned.columnRegistry,
    auxiliaryColumns: cloned.auxiliaryColumns,
    modified: cloned.modified,
  };
};

const resolvePreserveAnalysisOnReimport = (
  session: SessionDataset,
  options?: SessionDatasetToProjectDatasetOptions
): boolean | undefined => {
  if (options?.preserveAnalysisOnReimport !== undefined) {
    return options.preserveAnalysisOnReimport;
  }

  return session.preserveAnalysisOnReimport;
};

const resolveSessionName = (dataset: ProjectDatasetV2): string => {
  const fromInfo = dataset.info?.fileName?.trim();
  if (fromInfo) {
    return fromInfo;
  }

  const fromLabel = dataset.label.trim();
  return fromLabel || "Untitled dataset";
};

const resolveSessionImportedAt = (dataset: ProjectDatasetV2): string =>
  dataset.info?.importedAt?.trim() || "";

/**
 * Maps a runtime session dataset to a persisted V2 domain dataset.
 * Pure, deterministic, and non-mutating. Preserves canonical `ProjectDatasetV2.id`.
 */
export const sessionDatasetToProjectDatasetV2 = (
  session: SessionDataset,
  options?: SessionDatasetToProjectDatasetOptions
): ProjectDatasetV2 => {
  const persistedId = preservePersistedDatasetId(session.id);
  const clonedSeries = cloneExperimentalSeries(session.datasetPayload.series);
  const worksheet = buildWorksheetFromSession(session);
  const preserveAnalysisOnReimport = resolvePreserveAnalysisOnReimport(
    session,
    options
  );

  const persisted: ProjectDatasetV2 = {
    id: persistedId,
    label: session.name.trim() || "Untitled dataset",
    series: clonedSeries,
    info: buildProjectDatasetInfo(session),
    importReport: cloneImportReport(session.datasetPayload.importReport),
  };

  if (preserveAnalysisOnReimport !== undefined) {
    persisted.preserveAnalysisOnReimport = preserveAnalysisOnReimport;
  }

  if (options?.checksum !== undefined) {
    persisted.checksum = options.checksum;
  }

  if (worksheet !== undefined) {
    persisted.worksheet = worksheet;
  }

  return persisted;
};

/**
 * Maps a persisted V2 domain dataset to a runtime session dataset.
 * Pure, deterministic, and non-mutating. Preserves canonical `ProjectDatasetV2.id`.
 */
export const projectDatasetV2ToSessionDataset = (
  dataset: ProjectDatasetV2
): SessionDataset => {
  const sessionId = preservePersistedDatasetId(dataset.id);
  const clonedSeries = cloneExperimentalSeries(dataset.series);
  const metrics = computeDatasetMetrics(clonedSeries);
  const clonedWorksheet = dataset.worksheet
    ? cloneProjectWorksheetV2(dataset.worksheet)
    : undefined;

  return {
    id: sessionId,
    name: resolveSessionName(dataset),
    importedAt: resolveSessionImportedAt(dataset),
    seriesCount: metrics.seriesCount,
    observationCount: metrics.observationCount,
    worksheetModified: dataset.worksheet?.modified ?? false,
    preserveAnalysisOnReimport: dataset.preserveAnalysisOnReimport,
    datasetPayload: {
      series: clonedSeries,
      importReport: cloneImportReport(dataset.importReport),
      columnRegistry: clonedWorksheet?.columnRegistry,
      auxiliaryColumns: clonedWorksheet?.auxiliaryColumns,
    },
  };
};
