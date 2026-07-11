import type { ExperimentalSeries } from "@/lib/graph/series/types";
import type { ImportAuxiliaryColumn, ImportReport } from "./import/types";
import type { WorksheetColumnRegistry } from "./experimentalWorksheet";
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

export {
  cloneExperimentalSeries,
  computeDatasetMetrics as computeSessionDatasetMetrics,
  createSessionDatasetFromImport,
  createSessionDatasetId,
  createSessionDatasetInfo,
  getMostRecentSessionDatasetId,
  sessionDatasetIdentityKey,
  updateSessionDatasetPayload,
} from "@/lib/graph/series";
