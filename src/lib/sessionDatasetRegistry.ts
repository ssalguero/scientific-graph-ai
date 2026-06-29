import type { ExperimentalSeries } from "./experimentalData";
import type { ImportAuxiliaryColumn, ImportReport } from "./import/types";
import type { WorksheetColumnRegistry } from "./experimentalWorksheet";
import type { ProjectImportedDatasetInfo } from "./project";
import type { DatasetAnalysisProfile } from "./scientific/comparison/types";

export type SessionDatasetPayload = {
  series: ExperimentalSeries[];
  importReport: ImportReport | null;
  columnRegistry?: WorksheetColumnRegistry;
  auxiliaryColumns?: ImportAuxiliaryColumn[];
};

export type SessionDataset = {
  id: string;
  name: string;
  importedAt: string;
  seriesCount: number;
  observationCount: number;
  worksheetModified: boolean;
  preserveAnalysisOnReimport?: boolean;
  datasetPayload: SessionDatasetPayload;
};

export function createSessionDatasetId(): string {
  return `session-ds-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function cloneExperimentalSeries(
  series: ExperimentalSeries[]
): ExperimentalSeries[] {
  return series.map((item) => ({
    ...item,
    points: item.points.map((point) => ({ ...point })),
  }));
}

export function computeSessionDatasetMetrics(series: ExperimentalSeries[]): {
  seriesCount: number;
  observationCount: number;
} {
  return {
    seriesCount: series.length,
    observationCount: series.reduce((total, item) => total + item.points.length, 0),
  };
}

export function createSessionDatasetFromImport(
  name: string,
  series: ExperimentalSeries[],
  importReport: ImportReport | null,
  importedAt: string = new Date().toLocaleString(),
  payloadExtras?: Pick<
    SessionDatasetPayload,
    "columnRegistry" | "auxiliaryColumns"
  >
): SessionDataset {
  const clonedSeries = cloneExperimentalSeries(series);
  const metrics = computeSessionDatasetMetrics(clonedSeries);

  return {
    id: createSessionDatasetId(),
    name,
    importedAt,
    seriesCount: metrics.seriesCount,
    observationCount: metrics.observationCount,
    worksheetModified: false,
    datasetPayload: {
      series: clonedSeries,
      importReport: importReport ? { ...importReport } : null,
      columnRegistry: payloadExtras?.columnRegistry
        ? { ...payloadExtras.columnRegistry }
        : undefined,
      auxiliaryColumns: payloadExtras?.auxiliaryColumns
        ? payloadExtras.auxiliaryColumns.map((item) => ({
            ...item,
            valuesByRowIndex: { ...item.valuesByRowIndex },
          }))
        : undefined,
    },
  };
}

export function createSessionDatasetInfo(
  dataset: SessionDataset
): ProjectImportedDatasetInfo {
  return {
    fileName: dataset.name,
    importedAt: dataset.importedAt,
    seriesCount: dataset.seriesCount,
    observationCount: dataset.observationCount,
  };
}

export function updateSessionDatasetPayload(
  dataset: SessionDataset,
  series: ExperimentalSeries[],
  importReport: ImportReport | null,
  worksheetModified: boolean,
  payloadExtras?: Pick<
    SessionDatasetPayload,
    "columnRegistry" | "auxiliaryColumns"
  >
): SessionDataset {
  const clonedSeries = cloneExperimentalSeries(series);
  const metrics = computeSessionDatasetMetrics(clonedSeries);

  return {
    ...dataset,
    seriesCount: metrics.seriesCount,
    observationCount: metrics.observationCount,
    worksheetModified,
    datasetPayload: {
      series: clonedSeries,
      importReport: importReport ? { ...importReport } : null,
      columnRegistry:
        payloadExtras?.columnRegistry ??
        dataset.datasetPayload.columnRegistry,
      auxiliaryColumns:
        payloadExtras?.auxiliaryColumns ??
        dataset.datasetPayload.auxiliaryColumns,
    },
  };
}

export function slotReferencesSessionDataset(
  profile: DatasetAnalysisProfile | null,
  dataset: SessionDataset
): boolean {
  if (!profile) {
    return false;
  }

  return (
    profile.datasetInfo.fileName === dataset.name &&
    profile.datasetInfo.importedAt === dataset.importedAt
  );
}

export function sessionDatasetIdentityKey(
  name: string,
  importedAt: string
): string {
  return `${name}::${importedAt}`;
}

export function getMostRecentSessionDatasetId(
  datasets: SessionDataset[],
  excludeId?: string
): string | null {
  const candidates = excludeId
    ? datasets.filter((dataset) => dataset.id !== excludeId)
    : datasets;

  if (candidates.length === 0) {
    return null;
  }

  return candidates[candidates.length - 1]?.id ?? null;
}
