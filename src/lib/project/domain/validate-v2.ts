import {
  CONTROL_PANEL_TABS,
  INSPECTOR_SECTIONS,
  WORKSPACE_SECTIONS,
} from "../constants";
import { MODULE_KEYS_V1 } from "../keys";
import {
  GUIDED_WORKFLOW_STATUS_VALUES,
  GUIDED_WORKFLOW_TEMPLATE_IDS,
} from "../types";

import {
  domainIssue,
  isBoolean,
  isNumber,
  isRecord,
  isString,
  isStringArray,
  pushDomainIssue,
  type DomainValidationIssue,
  type DomainValidationResult,
} from "./guards";
import { isDomainProjectFileV2, type DomainScientificProjectFile } from "./scientific-project";
import { DOMAIN_SCHEMA_VERSION_V2, type ScientificProjectV2 } from "./types-v2";

const VISUAL_GRAPH_TYPES = [
  "scatter",
  "line",
  "bar",
  "histogram",
  "boxPlot",
  "violin",
] as const;

const validatePoint = (
  point: unknown,
  path: string,
  errors: DomainValidationIssue[]
) => {
  if (!isRecord(point)) {
    pushDomainIssue(errors, domainIssue("V2-POINT", path, "Point must be an object"));
    return;
  }
  if (!isNumber(point.x)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-POINT-X", `${path}.x`, "x must be a finite number")
    );
  }
  if (!isNumber(point.y)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-POINT-Y", `${path}.y`, "y must be a finite number")
    );
  }
};

const validateSeries = (
  series: unknown,
  path: string,
  errors: DomainValidationIssue[]
) => {
  if (!isRecord(series)) {
    pushDomainIssue(errors, domainIssue("V2-SERIES", path, "Series must be an object"));
    return;
  }
  if (!isString(series.id) || series.id.trim() === "") {
    pushDomainIssue(
      errors,
      domainIssue("V2-SERIES-ID", `${path}.id`, "Series id is required")
    );
  }
  if (!isString(series.name)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-SERIES-NAME", `${path}.name`, "Series name is required")
    );
  }
  if (!isString(series.color)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-SERIES-COLOR", `${path}.color`, "Series color is required")
    );
  }
  if (!Array.isArray(series.points)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-SERIES-POINTS", `${path}.points`, "points must be an array")
    );
    return;
  }
  series.points.forEach((point, index) =>
    validatePoint(point, `${path}.points[${index}]`, errors)
  );
};

const validateDatasetInfo = (
  info: unknown,
  path: string,
  errors: DomainValidationIssue[],
  warnings: DomainValidationIssue[]
) => {
  if (info === null) return;
  if (!isRecord(info)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-DINFO", path, "dataset.info must be an object or null")
    );
    return;
  }
  if (!isString(info.fileName)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-DINFO-NAME", `${path}.fileName`, "fileName required")
    );
  }
  if (!isString(info.importedAt)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-DINFO-AT", `${path}.importedAt`, "importedAt required")
    );
  }
  if (!isNumber(info.seriesCount)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-DINFO-SC", `${path}.seriesCount`, "seriesCount required")
    );
  }
  if (!isNumber(info.observationCount)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-DINFO-OC", `${path}.observationCount`, "observationCount required")
    );
  }
};

const validateWorkflowSession = (
  session: unknown,
  path: string,
  errors: DomainValidationIssue[]
) => {
  if (!isRecord(session)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WF", path, "workflow.session must be an object")
    );
    return;
  }

  if (
    !isString(session.status) ||
    !GUIDED_WORKFLOW_STATUS_VALUES.includes(
      session.status as (typeof GUIDED_WORKFLOW_STATUS_VALUES)[number]
    )
  ) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WF-STATUS", `${path}.status`, "Invalid workflow status")
    );
  }

  if (
    session.templateId !== null &&
    (!isString(session.templateId) ||
      !GUIDED_WORKFLOW_TEMPLATE_IDS.includes(
        session.templateId as (typeof GUIDED_WORKFLOW_TEMPLATE_IDS)[number]
      ))
  ) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WF-TEMPLATE", `${path}.templateId`, "Invalid workflow templateId")
    );
  }

  if (!isNumber(session.currentStepIndex) || session.currentStepIndex < 0) {
    pushDomainIssue(
      errors,
      domainIssue(
        "V2-WF-STEP",
        `${path}.currentStepIndex`,
        "currentStepIndex must be >= 0"
      )
    );
  }

  if (!isStringArray(session.completedStepIds)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WF-COMPLETED", `${path}.completedStepIds`, "Must be string array")
    );
  }

  if (!isStringArray(session.skippedStepIds)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WF-SKIPPED", `${path}.skippedStepIds`, "Must be string array")
    );
  }

  if (session.startedAt !== null && !isString(session.startedAt)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WF-START", `${path}.startedAt`, "Must be string or null")
    );
  }

  if (session.completedAt !== null && !isString(session.completedAt)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WF-END", `${path}.completedAt`, "Must be string or null")
    );
  }
};

const validateComparisonProfile = (
  profile: unknown,
  slotId: string,
  path: string,
  errors: DomainValidationIssue[],
  warnings: DomainValidationIssue[]
) => {
  if (profile === null) return;
  if (!isRecord(profile)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-CMP-PROFILE", path, "profile must be object or null")
    );
    return;
  }

  if (profile.slotLabel !== slotId) {
    pushDomainIssue(
      warnings,
      domainIssue(
        "V2-CMP-LABEL",
        `${path}.slotLabel`,
        `slotLabel should match slot id "${slotId}"`,
        "warning"
      )
    );
  }

  if (!isBoolean(profile.isComplete)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-CMP-COMPLETE", `${path}.isComplete`, "isComplete boolean required")
    );
  }

  if (!isString(profile.capturedAt)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-CMP-CAPTURED", `${path}.capturedAt`, "capturedAt required")
    );
  }
};

const validateGraphContext = (
  graphContext: unknown,
  path: string,
  errors: DomainValidationIssue[]
) => {
  if (graphContext === null || graphContext === undefined) return;
  if (!isRecord(graphContext)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-GRAPH", path, "graphContext must be object or null")
    );
    return;
  }

  if (!isString(graphContext.title)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-GRAPH-TITLE", `${path}.title`, "title required")
    );
  }

  if (!Array.isArray(graphContext.curves)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-GRAPH-CURVES", `${path}.curves`, "curves must be array")
    );
  }

  for (const key of ["minX", "maxX", "visibleMinX", "visibleMaxX"] as const) {
    if (!isNumber(graphContext[key])) {
      pushDomainIssue(
        errors,
        domainIssue(`V2-GRAPH-${key}`, `${path}.${key}`, "Must be a finite number")
      );
    }
  }

  if (!isBoolean(graphContext.autoScaleY)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-GRAPH-AUTO", `${path}.autoScaleY`, "autoScaleY boolean required")
    );
  }

  if (!isBoolean(graphContext.useSecondaryYAxis)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-GRAPH-SEC", `${path}.useSecondaryYAxis`, "useSecondaryYAxis required")
    );
  }
};

const validateWorksheet = (
  worksheet: unknown,
  path: string,
  errors: DomainValidationIssue[]
) => {
  if (worksheet === undefined) return;
  if (!isRecord(worksheet)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WSH", path, "worksheet must be an object when present")
    );
    return;
  }
  if (!isBoolean(worksheet.modified)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WSH-MOD", `${path}.modified`, "modified boolean required")
    );
  }
};

const validateGraphSpec = (
  graphSpec: unknown,
  path: string,
  errors: DomainValidationIssue[]
) => {
  if (!isRecord(graphSpec)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-VGB-SPEC", path, "graphSpec must be an object")
    );
    return;
  }

  if (
    !isString(graphSpec.graphType) ||
    !VISUAL_GRAPH_TYPES.includes(
      graphSpec.graphType as (typeof VISUAL_GRAPH_TYPES)[number]
    )
  ) {
    pushDomainIssue(
      errors,
      domainIssue("V2-VGB-TYPE", `${path}.graphType`, "Invalid graphType")
    );
  }

  if (!isString(graphSpec.id) || graphSpec.id.trim() === "") {
    pushDomainIssue(
      errors,
      domainIssue("V2-VGB-ID", `${path}.id`, "graphSpec.id is required")
    );
  }

  if (!isString(graphSpec.createdAt)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-VGB-CREATED", `${path}.createdAt`, "createdAt required")
    );
  }
};

const validateDatasetRefs = (
  datasetIds: Set<string>,
  sourceDatasetId: unknown,
  path: string,
  errors: DomainValidationIssue[]
) => {
  if (sourceDatasetId === null) return;
  if (!isString(sourceDatasetId) || sourceDatasetId.trim() === "") {
    pushDomainIssue(
      errors,
      domainIssue("V2-DS-REF", path, "sourceDatasetId must be a non-empty string or null")
    );
    return;
  }
  if (!datasetIds.has(sourceDatasetId)) {
    pushDomainIssue(
      errors,
      domainIssue(
        "V2-DS-REF-MISS",
        path,
        `sourceDatasetId "${sourceDatasetId}" does not match any dataset.id`
      )
    );
  }
};

export const validateScientificProjectV2 = (
  project: ScientificProjectV2
): DomainValidationResult => {
  const errors: DomainValidationIssue[] = [];
  const warnings: DomainValidationIssue[] = [];

  const { metadata, datasets, activeDatasetId, analysisConfig, workflow, comparison, workspace } =
    project;

  if (!isString(metadata.id) || metadata.id.trim() === "") {
    pushDomainIssue(errors, domainIssue("V2-META-ID", "metadata.id", "Project id is required"));
  }

  if (!isString(metadata.name) || metadata.name.trim() === "") {
    pushDomainIssue(
      errors,
      domainIssue("V2-META-NAME", "metadata.name", "Project name is required")
    );
  }

  if (!isString(metadata.createdAt)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-META-CA", "metadata.createdAt", "createdAt required")
    );
  }

  if (!isString(metadata.updatedAt)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-META-UA", "metadata.updatedAt", "updatedAt required")
    );
  }

  if (metadata.revisionHistory !== undefined) {
    if (!Array.isArray(metadata.revisionHistory)) {
      pushDomainIssue(
        errors,
        domainIssue(
          "V2-META-REV",
          "metadata.revisionHistory",
          "revisionHistory must be an array when present"
        )
      );
    } else {
      metadata.revisionHistory.forEach((entry, index) => {
        const entryPath = `metadata.revisionHistory[${index}]`;
        if (!isRecord(entry)) {
          pushDomainIssue(
            errors,
            domainIssue("V2-META-REV-ITEM", entryPath, "Entry must be an object")
          );
          return;
        }
        if (!isString(entry.exportedAt)) {
          pushDomainIssue(
            errors,
            domainIssue("V2-META-REV-AT", `${entryPath}.exportedAt`, "exportedAt required")
          );
        }
        if (!isNumber(entry.schemaVersion)) {
          pushDomainIssue(
            errors,
            domainIssue(
              "V2-META-REV-SV",
              `${entryPath}.schemaVersion`,
              "schemaVersion required"
            )
          );
        }
      });
    }
  }

  if (metadata.cloudRef !== undefined) {
    if (!isRecord(metadata.cloudRef)) {
      pushDomainIssue(
        errors,
        domainIssue("V2-META-CLOUD", "metadata.cloudRef", "cloudRef must be an object")
      );
    } else {
      if (!isString(metadata.cloudRef.remoteId)) {
        pushDomainIssue(
          errors,
          domainIssue("V2-META-CLOUD-ID", "metadata.cloudRef.remoteId", "remoteId required")
        );
      }
      if (!isString(metadata.cloudRef.lastSyncedAt)) {
        pushDomainIssue(
          errors,
          domainIssue(
            "V2-META-CLOUD-AT",
            "metadata.cloudRef.lastSyncedAt",
            "lastSyncedAt required"
          )
        );
      }
    }
  }

  if (!Array.isArray(datasets)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-DATASETS", "datasets", "datasets must be an array")
    );
  } else if (datasets.length === 0) {
    pushDomainIssue(
      errors,
      domainIssue("V2-DATASETS-EMPTY", "datasets", "At least one dataset is required")
    );
  } else {
    const datasetIds = new Set<string>();

    datasets.forEach((dataset, index) => {
      const basePath = `datasets[${index}]`;

      if (!isString(dataset.id) || dataset.id.trim() === "") {
        pushDomainIssue(
          errors,
          domainIssue("V2-DS-ID", `${basePath}.id`, "Dataset id is required")
        );
      } else if (datasetIds.has(dataset.id)) {
        pushDomainIssue(
          errors,
          domainIssue(
            "V2-DS-DUP",
            `${basePath}.id`,
            `Duplicate dataset id "${dataset.id}"`
          )
        );
      } else {
        datasetIds.add(dataset.id);
      }

      if (!isString(dataset.label) || dataset.label.trim() === "") {
        pushDomainIssue(
          errors,
          domainIssue("V2-DS-LABEL", `${basePath}.label`, "Dataset label is required")
        );
      }

      if (!Array.isArray(dataset.series)) {
        pushDomainIssue(
          errors,
          domainIssue("V2-DS-SERIES", `${basePath}.series`, "series must be an array")
        );
      } else {
        const seenSeriesIds = new Set<string>();
        dataset.series.forEach((series, seriesIndex) => {
          validateSeries(series, `${basePath}.series[${seriesIndex}]`, errors);
          if (isRecord(series) && isString(series.id)) {
            if (seenSeriesIds.has(series.id)) {
              pushDomainIssue(
                errors,
                domainIssue(
                  "V2-SERIES-DUP",
                  `${basePath}.series[${seriesIndex}].id`,
                  `Duplicate series id "${series.id}"`
                )
              );
            }
            seenSeriesIds.add(series.id);
          }
        });

        const pointCount = dataset.series.reduce(
          (sum, series) => sum + (series.points?.length ?? 0),
          0
        );

        validateDatasetInfo(dataset.info, `${basePath}.info`, errors, warnings);

        if (dataset.series.length > 0 && dataset.info === null) {
          pushDomainIssue(
            warnings,
            domainIssue(
              "V2-DINFO-MISSING",
              `${basePath}.info`,
              "dataset.info is null but series are present",
              "warning"
            )
          );
        }

        if (dataset.info) {
          if (dataset.info.seriesCount !== dataset.series.length) {
            pushDomainIssue(
              warnings,
              domainIssue(
                "V2-DINFO-SCOUNT",
                `${basePath}.info.seriesCount`,
                "seriesCount does not match dataset.series.length",
                "warning"
              )
            );
          }
          if (dataset.info.observationCount !== pointCount) {
            pushDomainIssue(
              warnings,
              domainIssue(
                "V2-DINFO-OCOUNT",
                `${basePath}.info.observationCount`,
                "observationCount does not match total points",
                "warning"
              )
            );
          }
        }
      }

      if (dataset.importReport !== null && !isRecord(dataset.importReport)) {
        pushDomainIssue(
          errors,
          domainIssue(
            "V2-DS-REPORT",
            `${basePath}.importReport`,
            "importReport must be an object or null"
          )
        );
      }

      if (
        dataset.preserveAnalysisOnReimport !== undefined &&
        !isBoolean(dataset.preserveAnalysisOnReimport)
      ) {
        pushDomainIssue(
          errors,
          domainIssue(
            "V2-DS-PRESERVE",
            `${basePath}.preserveAnalysisOnReimport`,
            "Must be boolean when present"
          )
        );
      }

      validateWorksheet(dataset.worksheet, `${basePath}.worksheet`, errors);
    });

    if (!isString(activeDatasetId) || activeDatasetId.trim() === "") {
      pushDomainIssue(
        errors,
        domainIssue("V2-ACTIVE-ID", "activeDatasetId", "activeDatasetId is required")
      );
    } else if (!datasetIds.has(activeDatasetId)) {
      pushDomainIssue(
        errors,
        domainIssue(
          "V2-ACTIVE-MISS",
          "activeDatasetId",
          `activeDatasetId "${activeDatasetId}" does not match any dataset.id`
        )
      );
    }

    if (!comparison?.slots?.A || !comparison?.slots?.B) {
      pushDomainIssue(
        errors,
        domainIssue("V2-CMP-SLOTS", "comparison.slots", "Slots A and B are required")
      );
    } else {
      for (const slotId of ["A", "B"] as const) {
        const slot = comparison.slots[slotId];
        const slotPath = `comparison.slots.${slotId}`;

        if (!isString(slot.label)) {
          pushDomainIssue(
            errors,
            domainIssue("V2-CMP-SLOT-LABEL", `${slotPath}.label`, "label required")
          );
        }

        validateComparisonProfile(
          slot.profile,
          slotId,
          `${slotPath}.profile`,
          errors,
          warnings
        );

        validateDatasetRefs(
          datasetIds,
          slot.sourceDatasetId,
          `${slotPath}.sourceDatasetId`,
          errors
        );
      }
    }

    if (project.visualGraphs !== undefined) {
      if (!Array.isArray(project.visualGraphs)) {
        pushDomainIssue(
          errors,
          domainIssue("V2-VGB", "visualGraphs", "visualGraphs must be an array when present")
        );
      } else {
        const seenGraphIds = new Set<string>();
        project.visualGraphs.forEach((entry, index) => {
          const basePath = `visualGraphs[${index}]`;

          if (!isString(entry.id) || entry.id.trim() === "") {
            pushDomainIssue(
              errors,
              domainIssue("V2-VGB-ENTRY-ID", `${basePath}.id`, "id is required")
            );
          } else if (seenGraphIds.has(entry.id)) {
            pushDomainIssue(
              errors,
              domainIssue(
                "V2-VGB-DUP",
                `${basePath}.id`,
                `Duplicate visual graph id "${entry.id}"`
              )
            );
          } else {
            seenGraphIds.add(entry.id);
          }

          if (!isString(entry.createdAt)) {
            pushDomainIssue(
              errors,
              domainIssue("V2-VGB-CREATED-AT", `${basePath}.createdAt`, "createdAt required")
            );
          }

          validateGraphSpec(entry.graphSpec, `${basePath}.graphSpec`, errors);

          if (
            !isString(entry.sourceDatasetId) ||
            entry.sourceDatasetId.trim() === ""
          ) {
            pushDomainIssue(
              errors,
              domainIssue(
                "V2-VGB-SOURCE",
                `${basePath}.sourceDatasetId`,
                "sourceDatasetId is required"
              )
            );
          } else if (!datasetIds.has(entry.sourceDatasetId)) {
            pushDomainIssue(
              errors,
              domainIssue(
                "V2-VGB-SOURCE-MISS",
                `${basePath}.sourceDatasetId`,
                `sourceDatasetId "${entry.sourceDatasetId}" does not match any dataset.id`
              )
            );
          }
        });
      }
    }
  }

  if (!isRecord(analysisConfig?.modes)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-MODES", "analysisConfig.modes", "modes required")
    );
  } else if (!isNumber(analysisConfig.modes.histogramBins)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-MODES-BINS", "analysisConfig.modes.histogramBins", "Must be number")
    );
  }

  if (!isRecord(analysisConfig?.selections)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-SELECTIONS", "analysisConfig.selections", "selections required")
    );
  }

  validateWorkflowSession(workflow?.session, "workflow.session", errors);

  if (
    !WORKSPACE_SECTIONS.includes(
      workspace.activeSection as (typeof WORKSPACE_SECTIONS)[number]
    )
  ) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WS-SECTION", "workspace.activeSection", "Invalid workspace section")
    );
  }

  if (
    !INSPECTOR_SECTIONS.includes(
      workspace.inspectorSection as (typeof INSPECTOR_SECTIONS)[number]
    )
  ) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WS-INSPECTOR", "workspace.inspectorSection", "Invalid inspector section")
    );
  }

  if (!isRecord(workspace.enabledModules)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-WS-MODULES", "workspace.enabledModules", "enabledModules required")
    );
  } else {
    for (const key of MODULE_KEYS_V1) {
      if (typeof workspace.enabledModules[key] !== "boolean") {
        pushDomainIssue(
          warnings,
          domainIssue(
            "V2-WS-MODULE",
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
    pushDomainIssue(
      errors,
      domainIssue("V2-WS-TAB", "workspace.controlPanelTab", "Invalid control panel tab")
    );
  }

  validateGraphContext(project.graphContext, "graphContext", errors);

  if (project.extensions !== undefined && !isRecord(project.extensions)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-EXT", "extensions", "extensions must be an object when present")
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateDomainProjectFileV2 = (
  file: DomainScientificProjectFile
): DomainValidationResult => {
  const errors: DomainValidationIssue[] = [];
  const warnings: DomainValidationIssue[] = [];

  if (file.schemaVersion !== DOMAIN_SCHEMA_VERSION_V2) {
    pushDomainIssue(
      errors,
      domainIssue(
        "V2-FILE-SV",
        "schemaVersion",
        `Expected schemaVersion ${DOMAIN_SCHEMA_VERSION_V2}`
      )
    );
  }

  if (!isDomainProjectFileV2(file)) {
    pushDomainIssue(
      errors,
      domainIssue("V2-FILE-SHAPE", "project", "Project shape does not match schema v2")
    );
    return { ok: false, errors, warnings };
  }

  const projectResult = validateScientificProjectV2(file.project);
  errors.push(...projectResult.errors);
  warnings.push(...projectResult.warnings);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
};
