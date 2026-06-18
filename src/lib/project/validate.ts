import {
  CONTROL_PANEL_TABS,
  INSPECTOR_SECTIONS,
  WORKSPACE_SECTIONS,
} from "./constants";
import {
  isBoolean,
  isNumber,
  isRecord,
  isString,
  isStringArray,
  issue,
  pushIssue,
} from "./guards";
import { MODULE_KEYS_V1 } from "./keys";
import type {
  ProjectValidationIssue,
  ProjectValidationResult,
  ScientificProjectFile,
  ScientificProjectV1,
} from "./types";
import {
  GUIDED_WORKFLOW_STATUS_VALUES,
  GUIDED_WORKFLOW_TEMPLATE_IDS,
} from "./types";

const validatePoint = (
  point: unknown,
  path: string,
  errors: ProjectValidationIssue[]
) => {
  if (!isRecord(point)) {
    pushIssue(errors, issue("V-POINT", path, "Point must be an object"));
    return;
  }
  if (!isNumber(point.x)) {
    pushIssue(errors, issue("V-POINT-X", `${path}.x`, "x must be a finite number"));
  }
  if (!isNumber(point.y)) {
    pushIssue(errors, issue("V-POINT-Y", `${path}.y`, "y must be a finite number"));
  }
};

const validateSeries = (
  series: unknown,
  path: string,
  errors: ProjectValidationIssue[]
) => {
  if (!isRecord(series)) {
    pushIssue(errors, issue("V-SERIES", path, "Series must be an object"));
    return;
  }
  if (!isString(series.id) || series.id.trim() === "") {
    pushIssue(errors, issue("V-SERIES-ID", `${path}.id`, "Series id is required"));
  }
  if (!isString(series.name)) {
    pushIssue(errors, issue("V-SERIES-NAME", `${path}.name`, "Series name is required"));
  }
  if (!isString(series.color)) {
    pushIssue(errors, issue("V-SERIES-COLOR", `${path}.color`, "Series color is required"));
  }
  if (!Array.isArray(series.points)) {
    pushIssue(errors, issue("V-SERIES-POINTS", `${path}.points`, "points must be an array"));
    return;
  }
  series.points.forEach((point, index) =>
    validatePoint(point, `${path}.points[${index}]`, errors)
  );
};

const validateDatasetInfo = (
  info: unknown,
  path: string,
  errors: ProjectValidationIssue[],
  warnings: ProjectValidationIssue[]
) => {
  if (info === null) return;
  if (!isRecord(info)) {
    pushIssue(errors, issue("V-DINFO", path, "dataset.info must be an object or null"));
    return;
  }
  if (!isString(info.fileName)) {
    pushIssue(errors, issue("V-DINFO-NAME", `${path}.fileName`, "fileName required"));
  }
  if (!isString(info.importedAt)) {
    pushIssue(errors, issue("V-DINFO-AT", `${path}.importedAt`, "importedAt required"));
  }
  if (!isNumber(info.seriesCount)) {
    pushIssue(errors, issue("V-DINFO-SC", `${path}.seriesCount`, "seriesCount required"));
  }
  if (!isNumber(info.observationCount)) {
    pushIssue(
      errors,
      issue("V-DINFO-OC", `${path}.observationCount`, "observationCount required")
    );
  }
};

const validateWorkflowSession = (
  session: unknown,
  path: string,
  errors: ProjectValidationIssue[],
  warnings: ProjectValidationIssue[]
) => {
  if (!isRecord(session)) {
    pushIssue(errors, issue("V-WF", path, "workflow.session must be an object"));
    return;
  }

  if (
    !isString(session.status) ||
    !GUIDED_WORKFLOW_STATUS_VALUES.includes(
      session.status as (typeof GUIDED_WORKFLOW_STATUS_VALUES)[number]
    )
  ) {
    pushIssue(errors, issue("V-WF-STATUS", `${path}.status`, "Invalid workflow status"));
  }

  if (
    session.templateId !== null &&
    (!isString(session.templateId) ||
      !GUIDED_WORKFLOW_TEMPLATE_IDS.includes(
        session.templateId as (typeof GUIDED_WORKFLOW_TEMPLATE_IDS)[number]
      ))
  ) {
    pushIssue(
      errors,
      issue("V-WF-TEMPLATE", `${path}.templateId`, "Invalid workflow templateId")
    );
  }

  if (!isNumber(session.currentStepIndex) || session.currentStepIndex < 0) {
    pushIssue(
      errors,
      issue(
        "V-WF-STEP",
        `${path}.currentStepIndex`,
        "currentStepIndex must be >= 0"
      )
    );
  }

  if (!isStringArray(session.completedStepIds)) {
    pushIssue(
      errors,
      issue("V-WF-COMPLETED", `${path}.completedStepIds`, "Must be string array")
    );
  }

  if (!isStringArray(session.skippedStepIds)) {
    pushIssue(
      errors,
      issue("V-WF-SKIPPED", `${path}.skippedStepIds`, "Must be string array")
    );
  }

  if (session.startedAt !== null && !isString(session.startedAt)) {
    pushIssue(errors, issue("V-WF-START", `${path}.startedAt`, "Must be string or null"));
  }

  if (session.completedAt !== null && !isString(session.completedAt)) {
    pushIssue(
      errors,
      issue("V-WF-END", `${path}.completedAt`, "Must be string or null")
    );
  }
};

const validateComparisonProfile = (
  profile: unknown,
  slotId: string,
  path: string,
  errors: ProjectValidationIssue[],
  warnings: ProjectValidationIssue[]
) => {
  if (profile === null) return;
  if (!isRecord(profile)) {
    pushIssue(errors, issue("V-CMP-PROFILE", path, "profile must be object or null"));
    return;
  }

  if (profile.slotLabel !== slotId) {
    pushIssue(
      warnings,
      issue(
        "V-CMP-LABEL",
        `${path}.slotLabel`,
        `slotLabel should match slot id "${slotId}"`,
        "warning"
      )
    );
  }

  if (!isBoolean(profile.isComplete)) {
    pushIssue(
      errors,
      issue("V-CMP-COMPLETE", `${path}.isComplete`, "isComplete boolean required")
    );
  }

  if (!isString(profile.capturedAt)) {
    pushIssue(
      errors,
      issue("V-CMP-CAPTURED", `${path}.capturedAt`, "capturedAt required")
    );
  }
};

const validateGraphContext = (
  graphContext: unknown,
  path: string,
  errors: ProjectValidationIssue[]
) => {
  if (graphContext === null || graphContext === undefined) return;
  if (!isRecord(graphContext)) {
    pushIssue(errors, issue("V-GRAPH", path, "graphContext must be object or null"));
    return;
  }

  if (!isString(graphContext.title)) {
    pushIssue(errors, issue("V-GRAPH-TITLE", `${path}.title`, "title required"));
  }

  if (!Array.isArray(graphContext.curves)) {
    pushIssue(errors, issue("V-GRAPH-CURVES", `${path}.curves`, "curves must be array"));
  }

  for (const key of [
    "minX",
    "maxX",
    "visibleMinX",
    "visibleMaxX",
  ] as const) {
    if (!isNumber(graphContext[key])) {
      pushIssue(
        errors,
        issue(`V-GRAPH-${key}`, `${path}.${key}`, "Must be a finite number")
      );
    }
  }

  if (!isBoolean(graphContext.autoScaleY)) {
    pushIssue(
      errors,
      issue("V-GRAPH-AUTO", `${path}.autoScaleY`, "autoScaleY boolean required")
    );
  }

  if (!isBoolean(graphContext.useSecondaryYAxis)) {
    pushIssue(
      errors,
      issue("V-GRAPH-SEC", `${path}.useSecondaryYAxis`, "useSecondaryYAxis required")
    );
  }
};

export const validateScientificProjectV1 = (
  project: ScientificProjectV1
): ProjectValidationResult => {
  const errors: ProjectValidationIssue[] = [];
  const warnings: ProjectValidationIssue[] = [];

  const { metadata, dataset, importProvenance, analysisConfig, workflow, comparison, workspace } =
    project;

  if (!isString(metadata.id) || metadata.id.trim() === "") {
    pushIssue(errors, issue("V-META-ID", "metadata.id", "Project id is required"));
  }

  if (!isString(metadata.name) || metadata.name.trim() === "") {
    pushIssue(errors, issue("V-META-NAME", "metadata.name", "Project name is required"));
  }

  if (!isString(metadata.createdAt)) {
    pushIssue(errors, issue("V-META-CA", "metadata.createdAt", "createdAt required"));
  }

  if (!isString(metadata.updatedAt)) {
    pushIssue(errors, issue("V-META-UA", "metadata.updatedAt", "updatedAt required"));
  }

  if (!Array.isArray(dataset.series)) {
    pushIssue(errors, issue("V-DATASET", "dataset.series", "series must be an array"));
  } else {
    const seenIds = new Set<string>();
    dataset.series.forEach((series, index) => {
      validateSeries(series, `dataset.series[${index}]`, errors);
      if (isRecord(series) && isString(series.id)) {
        if (seenIds.has(series.id)) {
          pushIssue(
            errors,
            issue(
              "V-SERIES-DUP",
              `dataset.series[${index}].id`,
              `Duplicate series id "${series.id}"`
            )
          );
        }
        seenIds.add(series.id);
      }
    });

    const pointCount = dataset.series.reduce(
      (sum, series) => sum + (series.points?.length ?? 0),
      0
    );

    validateDatasetInfo(dataset.info, "dataset.info", errors, warnings);

    if (dataset.series.length > 0 && dataset.info === null) {
      pushIssue(
        warnings,
        issue(
          "V-DINFO-MISSING",
          "dataset.info",
          "dataset.info is null but series are present",
          "warning"
        )
      );
    }

    if (dataset.info) {
      if (dataset.info.seriesCount !== dataset.series.length) {
        pushIssue(
          warnings,
          issue(
            "V-DINFO-SCOUNT",
            "dataset.info.seriesCount",
            "seriesCount does not match dataset.series.length",
            "warning"
          )
        );
      }
      if (dataset.info.observationCount !== pointCount) {
        pushIssue(
          warnings,
          issue(
            "V-DINFO-OCOUNT",
            "dataset.info.observationCount",
            "observationCount does not match total points",
            "warning"
          )
        );
      }
    }
  }

  if (!isRecord(importProvenance)) {
    pushIssue(errors, issue("V-PROV", "importProvenance", "importProvenance required"));
  } else if (!isBoolean(importProvenance.preserveAnalysisOnReimport)) {
    pushIssue(
      errors,
      issue(
        "V-PROV-PRESERVE",
        "importProvenance.preserveAnalysisOnReimport",
        "boolean required"
      )
    );
  }

  if (!isRecord(analysisConfig?.modes)) {
    pushIssue(errors, issue("V-MODES", "analysisConfig.modes", "modes required"));
  } else if (!isNumber(analysisConfig.modes.histogramBins)) {
    pushIssue(
      errors,
      issue("V-MODES-BINS", "analysisConfig.modes.histogramBins", "Must be number")
    );
  }

  if (!isRecord(analysisConfig?.selections)) {
    pushIssue(
      errors,
      issue("V-SELECTIONS", "analysisConfig.selections", "selections required")
    );
  }

  validateWorkflowSession(workflow?.session, "workflow.session", errors, warnings);

  if (!comparison?.slots?.A || !comparison?.slots?.B) {
    pushIssue(
      errors,
      issue("V-CMP-SLOTS", "comparison.slots", "Slots A and B are required")
    );
  } else {
    validateComparisonProfile(
      comparison.slots.A.profile,
      "A",
      "comparison.slots.A.profile",
      errors,
      warnings
    );
    validateComparisonProfile(
      comparison.slots.B.profile,
      "B",
      "comparison.slots.B.profile",
      errors,
      warnings
    );
  }

  if (
    !WORKSPACE_SECTIONS.includes(
      workspace.activeSection as (typeof WORKSPACE_SECTIONS)[number]
    )
  ) {
    pushIssue(
      errors,
      issue("V-WS-SECTION", "workspace.activeSection", "Invalid workspace section")
    );
  }

  if (
    !INSPECTOR_SECTIONS.includes(
      workspace.inspectorSection as (typeof INSPECTOR_SECTIONS)[number]
    )
  ) {
    pushIssue(
      errors,
      issue("V-WS-INSPECTOR", "workspace.inspectorSection", "Invalid inspector section")
    );
  }

  if (!isRecord(workspace.enabledModules)) {
    pushIssue(
      errors,
      issue("V-WS-MODULES", "workspace.enabledModules", "enabledModules required")
    );
  } else {
    for (const key of MODULE_KEYS_V1) {
      if (typeof workspace.enabledModules[key] !== "boolean") {
        pushIssue(
          warnings,
          issue(
            "V-WS-MODULE",
            `workspace.enabledModules.${key}`,
            "Missing module key — will default on hydrate",
            "warning"
          )
        );
      }
    }
  }

  if (
    workspace.controlPanelTab !== undefined &&
    !CONTROL_PANEL_TABS.includes(
      workspace.controlPanelTab as (typeof CONTROL_PANEL_TABS)[number]
    )
  ) {
    pushIssue(
      errors,
      issue("V-WS-TAB", "workspace.controlPanelTab", "Invalid control panel tab")
    );
  }

  validateGraphContext(project.graphContext, "graphContext", errors);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateScientificProjectFile = (
  file: ScientificProjectFile
): ProjectValidationResult => {
  const errors: ProjectValidationIssue[] = [];
  const warnings: ProjectValidationIssue[] = [];

  const projectResult = validateScientificProjectV1(file.project);
  errors.push(...projectResult.errors);
  warnings.push(...projectResult.warnings);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
};
