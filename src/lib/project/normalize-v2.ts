import { DEFAULT_PROJECT_NAME } from "./constants";
import type { ScientificProjectV2 } from "./domain/types-v2";
import type {
  ProjectGraphContextV1,
  ProjectImportedDatasetInfo,
} from "./types";
import { VISIBILITY_KEYS_V1 } from "./keys";

const ISO_8601_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

const normalizeImportedAt = (value: string): string => {
  if (ISO_8601_PATTERN.test(value)) {
    return value;
  }
  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) {
    return new Date(parsed).toISOString();
  }
  return value;
};

const normalizeDatasetInfo = (
  info: ProjectImportedDatasetInfo | null
): ProjectImportedDatasetInfo | null => {
  if (!info) return null;
  return {
    ...info,
    fileName: info.fileName.trim(),
    importedAt: normalizeImportedAt(info.importedAt),
  };
};

const normalizeVisibility = (
  visibility: Partial<Record<string, boolean>>
): Partial<Record<string, boolean>> => {
  const normalized: Partial<Record<string, boolean>> = {};
  for (const key of VISIBILITY_KEYS_V1) {
    if (typeof visibility[key] === "boolean") {
      normalized[key] = visibility[key];
    }
  }
  for (const [key, value] of Object.entries(visibility)) {
    if (!(key in normalized) && typeof value === "boolean") {
      normalized[key] = value;
    }
  }
  return normalized;
};

const normalizeGraphContext = (
  graphContext: ProjectGraphContextV1 | null
): ProjectGraphContextV1 | null => {
  if (!graphContext) return null;

  return {
    title: graphContext.title.trim(),
    curves: graphContext.curves.map((curve) => ({
      expression: curve.expression.trim(),
      color: curve.color,
    })),
    minX: graphContext.minX,
    maxX: graphContext.maxX,
    visibleMinX: graphContext.visibleMinX,
    visibleMaxX: graphContext.visibleMaxX,
    autoScaleY: graphContext.autoScaleY,
    useSecondaryYAxis: graphContext.useSecondaryYAxis,
  };
};

const computeDatasetChecksum = (series: ScientificProjectV2["datasets"][number]["series"]) => {
  try {
    const { createHash } = require("node:crypto") as typeof import("node:crypto");
    return createHash("sha256").update(JSON.stringify(series)).digest("hex");
  } catch {
    return null;
  }
};

/**
 * Normalizes a native V2 project for serialization without schema migration.
 */
export const normalizeScientificProjectV2 = (
  project: ScientificProjectV2,
  options?: { includeChecksum?: boolean }
): ScientificProjectV2 => {
  const datasets = project.datasets.map((dataset) => {
    const series = dataset.series.map((item) => ({
      id: item.id.trim(),
      name: item.name,
      color: item.color,
      points: item.points.map((point) => ({ x: point.x, y: point.y })),
    }));

    let checksum = dataset.checksum ?? null;
    if (options?.includeChecksum !== false) {
      checksum = computeDatasetChecksum(series);
    }

    return {
      id: dataset.id,
      label: dataset.label.trim() || "Untitled dataset",
      series,
      info: normalizeDatasetInfo(
        dataset.info
          ? {
              ...dataset.info,
              seriesCount: series.length,
              observationCount: series.reduce(
                (sum, item) => sum + item.points.length,
                0
              ),
            }
          : null
      ),
      importReport: dataset.importReport ? { ...dataset.importReport } : null,
      preserveAnalysisOnReimport: dataset.preserveAnalysisOnReimport,
      worksheet: dataset.worksheet
        ? {
            modified: dataset.worksheet.modified,
            columnRegistry: dataset.worksheet.columnRegistry
              ? { ...dataset.worksheet.columnRegistry }
              : undefined,
            auxiliaryColumns: dataset.worksheet.auxiliaryColumns
              ? dataset.worksheet.auxiliaryColumns.map((item) => ({
                  ...item,
                  valuesByRowIndex: { ...item.valuesByRowIndex },
                }))
              : undefined,
          }
        : undefined,
      checksum,
    };
  });

  return {
    metadata: {
      ...project.metadata,
      name: project.metadata.name.trim() || DEFAULT_PROJECT_NAME,
      description: project.metadata.description?.trim() || undefined,
      author: project.metadata.author?.trim() || undefined,
      revisionHistory: project.metadata.revisionHistory
        ? project.metadata.revisionHistory.map((entry) => ({ ...entry }))
        : undefined,
      cloudRef: project.metadata.cloudRef
        ? { ...project.metadata.cloudRef }
        : undefined,
    },
    datasets,
    activeDatasetId: project.activeDatasetId,
    analysisConfig: {
      visibility: normalizeVisibility(project.analysisConfig.visibility),
      modes: { ...project.analysisConfig.modes },
      selections: { ...project.analysisConfig.selections },
      legend: {
        hiddenKeys: [...project.analysisConfig.legend.hiddenKeys],
      },
    },
    workflow: {
      session: {
        ...project.workflow.session,
        completedStepIds: [...project.workflow.session.completedStepIds],
        skippedStepIds: [...project.workflow.session.skippedStepIds],
      },
    },
    comparison: {
      slots: {
        A: {
          label: project.comparison.slots.A.label,
          profile: project.comparison.slots.A.profile
            ? {
                ...project.comparison.slots.A.profile,
                datasetInfo: normalizeDatasetInfo(
                  project.comparison.slots.A.profile.datasetInfo
                )!,
              }
            : null,
          sourceDatasetId: project.comparison.slots.A.sourceDatasetId,
        },
        B: {
          label: project.comparison.slots.B.label,
          profile: project.comparison.slots.B.profile
            ? {
                ...project.comparison.slots.B.profile,
                datasetInfo: normalizeDatasetInfo(
                  project.comparison.slots.B.profile.datasetInfo
                )!,
              }
            : null,
          sourceDatasetId: project.comparison.slots.B.sourceDatasetId,
        },
      },
    },
    workspace: { ...project.workspace },
    graphContext: normalizeGraphContext(project.graphContext),
    visualGraphs: project.visualGraphs
      ? project.visualGraphs.map((entry) => ({
          ...entry,
          graphSpec: { ...entry.graphSpec },
        }))
      : undefined,
    extensions: project.extensions ? { ...project.extensions } : undefined,
  };
};
