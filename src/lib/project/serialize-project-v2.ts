import {
  DEFAULT_PROJECT_NAME,
  PROJECT_SIZE_WARN_BYTES,
  SCHEMA_VERSION_V2,
} from "./constants";
import {
  buildScientificProjectFileV2Native,
} from "./adapters/sgproj/serialize-v2";
import { issue, pushIssue } from "./guards";
import { normalizeScientificProjectV2 } from "./normalize-v2";
import type {
  ProjectValidationIssue,
  ScientificProjectFileV2,
  ScientificProjectV2,
  SerializeProjectResult,
} from "./types";
import { validateScientificProjectV2 } from "./validate";

export type SerializeProjectV2Input = {
  project: ScientificProjectV2;
  appVersion: string;
  exportedAt?: string;
  options?: {
    pretty?: boolean;
    includeChecksum?: boolean;
  };
};

const preSerializeChecksV2 = (
  project: ScientificProjectV2,
  warnings: ProjectValidationIssue[]
) => {
  if (project.datasets.every((dataset) => dataset.series.length === 0)) {
    pushIssue(
      warnings,
      issue(
        "S-V2-EMPTY-DATASETS",
        "datasets",
        "Project has no imported series in any dataset",
        "warning"
      )
    );
  }

  for (const curve of project.graphContext?.curves ?? []) {
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
    project.workflow.session.status === "active" &&
    project.workflow.session.templateId === null
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
    const profile = project.comparison.slots[slotId].profile;
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

/**
 * Serializes a native V2 project to `.sgproj` without V1 migration.
 */
export const serializeProjectV2 = (
  input: SerializeProjectV2Input
): SerializeProjectResult => {
  const warnings: ProjectValidationIssue[] = [];
  const normalized = normalizeScientificProjectV2(input.project, {
    includeChecksum: input.options?.includeChecksum,
  });

  const validation = validateScientificProjectV2(normalized);
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      warnings: [...validation.warnings, ...warnings],
    };
  }

  warnings.push(...validation.warnings);
  preSerializeChecksV2(normalized, warnings);

  const exportedAt = input.exportedAt ?? new Date().toISOString();
  const projectForEnvelope: ScientificProjectV2 = {
    ...normalized,
    metadata: {
      ...normalized.metadata,
      name: normalized.metadata.name.trim() || DEFAULT_PROJECT_NAME,
      updatedAt: exportedAt,
    },
  };

  const v2Build = buildScientificProjectFileV2Native({
    project: projectForEnvelope,
    appVersion: input.appVersion.trim(),
    exportedAt,
  });

  warnings.push(...v2Build.warnings);

  const postValidation = validateScientificProjectV2(v2Build.file.project);
  if (!postValidation.ok) {
    return {
      ok: false,
      errors: postValidation.errors,
      warnings: [...warnings, ...postValidation.warnings],
    };
  }
  warnings.push(...postValidation.warnings);

  const file: ScientificProjectFileV2 = v2Build.file;
  if (file.schemaVersion !== SCHEMA_VERSION_V2) {
    return {
      ok: false,
      errors: [
        issue(
          "S-V2-SCHEMA",
          "schemaVersion",
          "Native V2 serializer must produce schemaVersion 2",
          "error"
        ),
      ],
      warnings,
    };
  }

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
