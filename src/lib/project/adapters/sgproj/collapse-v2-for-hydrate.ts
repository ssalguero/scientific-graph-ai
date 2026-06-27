import type {
  ComparisonSlotV1,
  DatasetAnalysisProfileV1,
  ProjectComparisonV1,
  ScientificProjectV1,
} from "../../types";
import type { ComparisonSlotV2, ScientificProjectV2 } from "../../domain/types-v2";

const profileV2ToV1 = (
  profile: ComparisonSlotV2["profile"]
): DatasetAnalysisProfileV1 | null => {
  if (profile === null) return null;
  return profile;
};

const slotV2ToV1 = (slot: ComparisonSlotV2): ComparisonSlotV1 => ({
  label: slot.label,
  profile: profileV2ToV1(slot.profile),
});

/** B1.4 — Collapse V2 disk shape to V1 hydrate patch until B2 multi-dataset UI. */
export const collapseProjectV2ForHydrate = (
  project: ScientificProjectV2
): ScientificProjectV1 => {
  const activeDataset =
    project.datasets.find((item) => item.id === project.activeDatasetId) ??
    project.datasets[0];

  if (!activeDataset) {
    throw new Error("ScientificProjectV2 has no datasets to collapse for hydrate.");
  }

  const comparison: ProjectComparisonV1 = {
    slots: {
      A: slotV2ToV1(project.comparison.slots.A),
      B: slotV2ToV1(project.comparison.slots.B),
    },
  };

  return {
    metadata: {
      id: project.metadata.id,
      name: project.metadata.name,
      description: project.metadata.description,
      createdAt: project.metadata.createdAt,
      updatedAt: project.metadata.updatedAt,
      author: project.metadata.author,
    },
    dataset: {
      series: activeDataset.series,
      info: activeDataset.info,
      checksum: activeDataset.checksum ?? null,
    },
    importProvenance: {
      report: activeDataset.importReport,
      preserveAnalysisOnReimport:
        activeDataset.preserveAnalysisOnReimport ?? false,
    },
    analysisConfig: project.analysisConfig,
    workflow: project.workflow,
    comparison,
    workspace: project.workspace,
    graphContext: project.graphContext,
  };
};
