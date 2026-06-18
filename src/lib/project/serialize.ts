import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_PROJECT_NAME,
  PROJECT_KIND,
  PROJECT_SIZE_WARN_BYTES,
} from "./constants";
import { issue, pushIssue } from "./guards";
import { VISIBILITY_KEYS_V1 } from "./keys";
import type {
  GraphEditorProjectSnapshot,
  ProjectGraphContextV1,
  ProjectImportedDatasetInfo,
  ProjectValidationIssue,
  ScientificProjectFile,
  ScientificProjectV1,
  SerializeProjectInput,
  SerializeProjectResult,
} from "./types";
import { validateScientificProjectV1 } from "./validate";

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

export const normalizeProjectSnapshot = (
  snapshot: GraphEditorProjectSnapshot,
  options?: { includeChecksum?: boolean }
): ScientificProjectV1 => {
  const series = snapshot.dataset.series.map((item) => ({
    id: item.id.trim(),
    name: item.name,
    color: item.color,
    points: item.points.map((point) => ({ x: point.x, y: point.y })),
  }));

  const observationCount = series.reduce(
    (sum, item) => sum + item.points.length,
    0
  );

  const info = normalizeDatasetInfo(
    snapshot.dataset.info
      ? {
          ...snapshot.dataset.info,
          seriesCount: series.length,
          observationCount,
        }
      : series.length > 0
        ? {
            fileName: "dataset",
            importedAt: new Date().toISOString(),
            seriesCount: series.length,
            observationCount,
          }
        : null
  );

  let checksum: string | null | undefined = snapshot.dataset.checksum;
  if (options?.includeChecksum !== false) {
    try {
      const { createHash } = require("node:crypto") as typeof import("node:crypto");
      checksum = createHash("sha256")
        .update(JSON.stringify(series))
        .digest("hex");
    } catch {
      checksum = snapshot.dataset.checksum ?? null;
    }
  }

  const comparison = {
    slots: {
      A: {
        label: snapshot.comparison.slots.A.label,
        profile: snapshot.comparison.slots.A.profile
          ? {
              ...snapshot.comparison.slots.A.profile,
              datasetInfo: normalizeDatasetInfo(
                snapshot.comparison.slots.A.profile.datasetInfo
              )!,
            }
          : null,
      },
      B: {
        label: snapshot.comparison.slots.B.label,
        profile: snapshot.comparison.slots.B.profile
          ? {
              ...snapshot.comparison.slots.B.profile,
              datasetInfo: normalizeDatasetInfo(
                snapshot.comparison.slots.B.profile.datasetInfo
              )!,
            }
          : null,
      },
    },
  };

  return {
    metadata: {
      ...snapshot.metadata,
      name: snapshot.metadata.name.trim() || DEFAULT_PROJECT_NAME,
      description: snapshot.metadata.description?.trim() || undefined,
      author: snapshot.metadata.author?.trim() || undefined,
    },
    dataset: {
      series,
      info,
      checksum: checksum ?? null,
    },
    importProvenance: {
      report: snapshot.importProvenance.report,
      preserveAnalysisOnReimport:
        snapshot.importProvenance.preserveAnalysisOnReimport,
    },
    analysisConfig: {
      visibility: normalizeVisibility(snapshot.analysisConfig.visibility),
      modes: { ...snapshot.analysisConfig.modes },
      selections: { ...snapshot.analysisConfig.selections },
      legend: {
        hiddenKeys: [...snapshot.analysisConfig.legend.hiddenKeys],
      },
    },
    workflow: {
      session: {
        ...snapshot.workflow.session,
        completedStepIds: [...snapshot.workflow.session.completedStepIds],
        skippedStepIds: [...snapshot.workflow.session.skippedStepIds],
      },
    },
    comparison,
    workspace: { ...snapshot.workspace },
    graphContext: normalizeGraphContext(snapshot.graphContext),
  };
};

const preSerializeChecks = (
  snapshot: ScientificProjectV1,
  warnings: ProjectValidationIssue[]
) => {
  if (snapshot.dataset.series.length === 0) {
    pushIssue(
      warnings,
      issue(
        "S-EMPTY-DATASET",
        "dataset.series",
        "Project has no imported series",
        "warning"
      )
    );
  }

  for (const curve of snapshot.graphContext?.curves ?? []) {
    if (!curve.expression.trim()) {
      pushIssue(
        warnings,
        issue(
          "S-GRAPH-CURVE",
          "graphContext.curves",
          "Graph curve with empty expression",
          "warning"
        )
      );
    }
  }

  if (
    snapshot.workflow.session.status === "active" &&
    snapshot.workflow.session.templateId === null
  ) {
    pushIssue(
      warnings,
      issue(
        "S-WF-ACTIVE",
        "workflow.session",
        "Active workflow without templateId",
        "warning"
      )
    );
  }

  for (const slotId of ["A", "B"] as const) {
    const profile = snapshot.comparison.slots[slotId].profile;
    if (profile && profile.slotLabel !== slotId) {
      pushIssue(
        warnings,
        issue(
          "S-CMP-LABEL",
          `comparison.slots.${slotId}.profile.slotLabel`,
          `Profile slotLabel should be "${slotId}"`,
          "warning"
        )
      );
    }
  }
};

export const serializeProject = (
  input: SerializeProjectInput
): SerializeProjectResult => {
  const warnings: ProjectValidationIssue[] = [];
  const normalized = normalizeProjectSnapshot(input.snapshot, {
    includeChecksum: input.options?.includeChecksum,
  });

  const validation = validateScientificProjectV1(normalized);
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      warnings: [...validation.warnings, ...warnings],
    };
  }

  warnings.push(...validation.warnings);
  preSerializeChecks(normalized, warnings);

  const exportedAt = input.exportedAt ?? new Date().toISOString();
  const file: ScientificProjectFile = {
    kind: PROJECT_KIND,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: input.appVersion.trim(),
    exportedAt,
    project: {
      ...normalized,
      metadata: {
        ...normalized.metadata,
        updatedAt: exportedAt,
      },
    },
  };

  const pretty = input.options?.pretty !== false;
  const json = pretty ? JSON.stringify(file, null, 2) : JSON.stringify(file);

  if (Buffer.byteLength(json, "utf8") > PROJECT_SIZE_WARN_BYTES) {
    pushIssue(
      warnings,
      issue(
        "S-SIZE",
        "$",
        `Serialized project exceeds ${PROJECT_SIZE_WARN_BYTES} bytes`,
        "warning"
      )
    );
  }

  return {
    ok: true,
    file,
    json,
    warnings,
  };
};
