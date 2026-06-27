import {
  type ComparisonSlotV1,
  type DatasetAnalysisProfileV1,
  type ProjectComparisonV1,
  type ScientificProjectV1,
} from "../types-v1";
import {
  DOMAIN_SCHEMA_VERSION_V2,
  type ComparisonSlotV2,
  type DatasetAnalysisProfileV2,
  type ProjectComparisonV2,
  type ProjectDatasetV2,
  type ScientificProjectV2,
} from "../types-v2";
import {
  isDomainProjectFileV1,
  isDomainProjectFileV2,
  isScientificProjectV2,
  type DomainScientificProjectFile,
  type ScientificProject,
} from "../scientific-project";

export const PRIMARY_DATASET_ID_SUFFIX = "primary" as const;

export type DomainMigrationWarning = {
  code: string;
  path: string;
  message: string;
  severity: "warning";
};

export type MigrateV1ToV2Result = {
  project: ScientificProjectV2;
  warnings: DomainMigrationWarning[];
};

/**
 * Migrator-only rule: assigns `{projectMetadataId}::primary` to the dataset
 * created from legacy V1 `project.dataset`. Not a general V2 format requirement.
 * See `migrations/README.md`.
 */
export const toPrimaryDatasetId = (projectMetadataId: string): string =>
  `${projectMetadataId}::${PRIMARY_DATASET_ID_SUFFIX}`;

const migrateProfileV1ToV2 = (
  profile: DatasetAnalysisProfileV1
): DatasetAnalysisProfileV2 => ({
  ...profile,
});

const migrateComparisonSlotV1ToV2 = (
  slot: ComparisonSlotV1,
  primaryDatasetId: string
): ComparisonSlotV2 => ({
  label: slot.label,
  profile: slot.profile ? migrateProfileV1ToV2(slot.profile) : null,
  sourceDatasetId: slot.profile ? primaryDatasetId : null,
});

const migrateComparisonV1ToV2 = (
  comparison: ProjectComparisonV1,
  primaryDatasetId: string
): ProjectComparisonV2 => ({
  slots: {
    A: migrateComparisonSlotV1ToV2(comparison.slots.A, primaryDatasetId),
    B: migrateComparisonSlotV1ToV2(comparison.slots.B, primaryDatasetId),
  },
});

const buildPrimaryDataset = (
  project: ScientificProjectV1,
  primaryDatasetId: string
): ProjectDatasetV2 => {
  const label =
    project.dataset.info?.fileName?.trim() ||
    project.metadata.name.trim() ||
    "Primary dataset";

  return {
    id: primaryDatasetId,
    label,
    series: project.dataset.series,
    info: project.dataset.info,
    importReport: project.importProvenance.report,
    preserveAnalysisOnReimport:
      project.importProvenance.preserveAnalysisOnReimport,
    checksum: project.dataset.checksum ?? null,
  };
};

export const migrateV1ToV2 = (
  project: ScientificProjectV1,
  options?: { migratedAt?: string }
): MigrateV1ToV2Result => {
  const warnings: DomainMigrationWarning[] = [];
  const primaryDatasetId = toPrimaryDatasetId(project.metadata.id);
  const migratedAt = options?.migratedAt ?? project.metadata.updatedAt;

  warnings.push({
    code: "MIG-V1-IMPORT-FOLD",
    path: "project.datasets[0]",
    message:
      "Legacy importProvenance was folded into the primary dataset record.",
    severity: "warning",
  });

  const migrated: ScientificProjectV2 = {
    metadata: {
      ...project.metadata,
      revisionHistory: [
        {
          exportedAt: migratedAt,
          schemaVersion: DOMAIN_SCHEMA_VERSION_V2,
          checksum: project.dataset.checksum ?? null,
        },
      ],
    },
    datasets: [buildPrimaryDataset(project, primaryDatasetId)],
    activeDatasetId: primaryDatasetId,
    analysisConfig: project.analysisConfig,
    workflow: project.workflow,
    comparison: migrateComparisonV1ToV2(project.comparison, primaryDatasetId),
    workspace: project.workspace,
    graphContext: project.graphContext,
  };

  return { project: migrated, warnings };
};

export const migrateProjectToV2 = (
  project: ScientificProject,
  options?: { migratedAt?: string }
): MigrateV1ToV2Result => {
  if (isScientificProjectV2(project)) {
    return { project, warnings: [] };
  }

  return migrateV1ToV2(project, options);
};

export type MigrateDomainFileToV2Result = {
  file: DomainScientificProjectFile;
  warnings: DomainMigrationWarning[];
};

export const migrateDomainProjectFileToV2 = (
  file: DomainScientificProjectFile,
  options?: { migratedAt?: string }
): MigrateDomainFileToV2Result => {
  if (isDomainProjectFileV2(file)) {
    return { file, warnings: [] };
  }

  if (!isDomainProjectFileV1(file)) {
    throw new Error("Unsupported domain project file schema version.");
  }

  const { project, warnings } = migrateV1ToV2(file.project, options);

  return {
    file: {
      ...file,
      schemaVersion: DOMAIN_SCHEMA_VERSION_V2,
      project,
    },
    warnings,
  };
};
