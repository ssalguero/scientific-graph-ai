import type {
  ComparisonSlotV2,
  ProjectComparisonV2,
  ProjectVisualGraphPersistedV2,
  ScientificProjectV2,
} from "./domain/types-v2";
import {
  buildWorksheetSanitizeContext,
  sanitizeProjectWorksheetV2,
} from "./domain/worksheet-domain";
import type { ComparisonSlotIdV1 } from "./types";
import { issue, pushIssue } from "./guards";
import type { ProjectValidationIssue } from "./types";
import {
  sanitizeSelections,
  sanitizeVisibility,
  sanitizeWorkflowSession,
  sanitizeWorkspace,
} from "./sanitize";
import { cloneScientificProjectV2 } from "./apply-hydrate-project-v2-patch";

export type SanitizeScientificProjectV2Result = {
  project: ScientificProjectV2;
  warnings: ProjectValidationIssue[];
};

const buildDatasetIdSet = (project: ScientificProjectV2): Set<string> =>
  new Set(project.datasets.map((dataset) => dataset.id));

const buildSeriesIdSet = (project: ScientificProjectV2): Set<string> => {
  const ids = new Set<string>();
  for (const dataset of project.datasets) {
    for (const series of dataset.series) {
      ids.add(series.id);
    }
  }
  return ids;
};

const resolveActiveDatasetSeriesCount = (
  project: ScientificProjectV2,
  activeDatasetId: string
): number => {
  const active = project.datasets.find((dataset) => dataset.id === activeDatasetId);
  return active?.series.length ?? 0;
};

const sanitizeActiveDatasetId = (
  project: ScientificProjectV2,
  datasetIds: Set<string>,
  warnings: ProjectValidationIssue[]
): string => {
  const current = project.activeDatasetId;
  if (datasetIds.has(current)) {
    return current;
  }

  const fallback = project.datasets[0]?.id;
  if (fallback) {
    pushIssue(
      warnings,
      issue(
        "H-V2-ACTIVE",
        "activeDatasetId",
        `activeDatasetId "${current}" not found — fallback to "${fallback}"`,
        "warning"
      )
    );
    return fallback;
  }

  pushIssue(
    warnings,
    issue(
      "H-V2-ACTIVE-EMPTY",
      "activeDatasetId",
      `activeDatasetId "${current}" not found and no datasets available`,
      "warning"
    )
  );
  return current;
};

const sanitizeComparisonProfileSlotLabel = (
  profile: ComparisonSlotV2["profile"],
  slotId: ComparisonSlotIdV1,
  warnings: ProjectValidationIssue[]
): ComparisonSlotV2["profile"] => {
  if (!profile) {
    return null;
  }

  if (profile.slotLabel !== slotId) {
    pushIssue(
      warnings,
      issue(
        "H-CMP-LABEL",
        `comparison.slots.${slotId}.profile.slotLabel`,
        `Corrected slotLabel to "${slotId}"`,
        "warning"
      )
    );
  }

  return {
    ...profile,
    slotLabel: slotId,
  };
};

const sanitizeComparisonSlotV2 = (
  slot: ComparisonSlotV2,
  slotId: ComparisonSlotIdV1,
  datasetIds: Set<string>,
  warnings: ProjectValidationIssue[]
): ComparisonSlotV2 => {
  let sourceDatasetId = slot.sourceDatasetId;
  if (sourceDatasetId !== null && !datasetIds.has(sourceDatasetId)) {
    pushIssue(
      warnings,
      issue(
        "H-V2-CMP-SOURCE",
        `comparison.slots.${slotId}.sourceDatasetId`,
        `sourceDatasetId "${sourceDatasetId}" not found — cleared`,
        "warning"
      )
    );
    sourceDatasetId = null;
  }

  return {
    label: slot.label.trim() || (slotId === "A" ? "Slot A" : "Slot B"),
    profile: sanitizeComparisonProfileSlotLabel(slot.profile, slotId, warnings),
    sourceDatasetId,
  };
};

export const sanitizeComparisonV2 = (
  comparison: ProjectComparisonV2,
  datasetIds: Set<string>,
  warnings: ProjectValidationIssue[]
): ProjectComparisonV2 => ({
  slots: {
    A: sanitizeComparisonSlotV2(comparison.slots.A, "A", datasetIds, warnings),
    B: sanitizeComparisonSlotV2(comparison.slots.B, "B", datasetIds, warnings),
  },
});

const sanitizeVisualGraphsV2 = (
  visualGraphs: ProjectVisualGraphPersistedV2[] | undefined,
  datasetIds: Set<string>,
  warnings: ProjectValidationIssue[]
): ProjectVisualGraphPersistedV2[] | undefined => {
  if (visualGraphs === undefined) {
    return undefined;
  }

  const kept: ProjectVisualGraphPersistedV2[] = [];
  visualGraphs.forEach((entry, index) => {
    if (datasetIds.has(entry.sourceDatasetId)) {
      kept.push({
        ...entry,
        graphSpec: { ...entry.graphSpec },
      });
      return;
    }

    pushIssue(
      warnings,
      issue(
        "H-V2-VGB-SOURCE",
        `visualGraphs[${index}].sourceDatasetId`,
        `visualGraphs entry references missing dataset "${entry.sourceDatasetId}" — removed`,
        "warning"
      )
    );
  });

  return kept;
};

/**
 * Sanitizes a native V2 project for hydrate/serialize boundaries.
 * Pure, deterministic, idempotent, and non-mutating on input.
 */
export const sanitizeScientificProjectV2 = (
  project: ScientificProjectV2
): SanitizeScientificProjectV2Result => {
  const warnings: ProjectValidationIssue[] = [];
  const cloned = cloneScientificProjectV2(project);
  const datasetIds = buildDatasetIdSet(cloned);
  const seriesIds = buildSeriesIdSet(cloned);
  const activeDatasetId = sanitizeActiveDatasetId(cloned, datasetIds, warnings);
  const activeSeriesCount = resolveActiveDatasetSeriesCount(cloned, activeDatasetId);

  const comparison = sanitizeComparisonV2(cloned.comparison, datasetIds, warnings);

  const sanitized: ScientificProjectV2 = {
    metadata: { ...cloned.metadata },
    datasets: cloned.datasets.map((dataset, datasetIndex) => ({
      ...dataset,
      series: dataset.series.map((series) => ({
        ...series,
        points: series.points.map((point) => ({ x: point.x, y: point.y })),
      })),
      info: dataset.info ? { ...dataset.info } : null,
      importReport: dataset.importReport ? { ...dataset.importReport } : null,
      worksheet: sanitizeProjectWorksheetV2(
        dataset.worksheet,
        buildWorksheetSanitizeContext(
          dataset.series,
          dataset.worksheet?.auxiliaryColumns
        ),
        `datasets[${datasetIndex}].worksheet`,
        (warning) =>
          pushIssue(
            warnings,
            issue(warning.code, warning.path, warning.message, "warning")
          )
      ),
    })),
    activeDatasetId,
    analysisConfig: {
      visibility: sanitizeVisibility(cloned.analysisConfig.visibility),
      modes: { ...cloned.analysisConfig.modes },
      selections: sanitizeSelections(
        cloned.analysisConfig.selections,
        seriesIds,
        warnings
      ),
      legend: {
        hiddenKeys: cloned.analysisConfig.legend.hiddenKeys.filter((key) =>
          seriesIds.has(key)
        ),
      },
    },
    workflow: {
      session: sanitizeWorkflowSession(
        cloned.workflow.session,
        activeSeriesCount,
        warnings
      ),
    },
    comparison,
    workspace: sanitizeWorkspace(cloned.workspace, warnings),
    graphContext: cloned.graphContext
      ? {
          ...cloned.graphContext,
          curves: cloned.graphContext.curves.map((curve) => ({
            expression: curve.expression.trim(),
            color: curve.color,
          })),
        }
      : null,
    visualGraphs: sanitizeVisualGraphsV2(cloned.visualGraphs, datasetIds, warnings),
    extensions: cloned.extensions ? { ...cloned.extensions } : undefined,
  };

  return { project: sanitized, warnings };
};
