import type { DatasetAnalysisProfile } from "@/lib/scientific/comparison";

export type ComparisonSlotFreshness = {
  isStale: boolean;
  messages: string[];
};

/** UI-only freshness derived from A1 captureMetadata — no domain recalculation. */
export function deriveComparisonSlotFreshness(input: {
  profile: DatasetAnalysisProfile;
  activeFileName: string | null;
  activeImportedAt: string | null;
  activeWorksheetModified: boolean;
}): ComparisonSlotFreshness {
  const { profile, activeFileName, activeImportedAt, activeWorksheetModified } =
    input;
  const messages: string[] = [];

  if (
    activeFileName !== null &&
    profile.datasetInfo.fileName !== activeFileName
  ) {
    messages.push("Dataset activo distinto al capturado en este slot.");
  }

  const sameDatasetIdentity =
    activeFileName !== null &&
    profile.datasetInfo.fileName === activeFileName &&
    (activeImportedAt === null ||
      profile.datasetInfo.importedAt === activeImportedAt);

  if (
    sameDatasetIdentity &&
    activeWorksheetModified &&
    profile.captureMetadata?.worksheetModifiedAtCapture === false
  ) {
    messages.push("La worksheet se modificó después de la captura del snapshot.");
  }

  if (
    sameDatasetIdentity &&
    profile.captureMetadata?.worksheetModifiedAtCapture === true
  ) {
    messages.push("Snapshot capturado con worksheet ya modificada.");
  }

  return {
    isStale: messages.length > 0,
    messages,
  };
}
