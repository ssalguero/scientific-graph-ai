import type {
  ProjectHistoryDatasetAddedPayload,
  ProjectHistoryDatasetRemovedPayload,
  ProjectHistoryEventType,
  ProjectHistoryOpenedPayload,
  ProjectHistoryPayloadMap,
  ProjectHistoryReportGeneratedPayload,
  ProjectHistorySavedPayload,
  ProjectHistoryWorkflowPayload,
} from "./types";

export const PROJECT_HISTORY_EVENT_TYPES = [
  "project.opened",
  "project.saved",
  "dataset.added",
  "dataset.removed",
  "workflow.started",
  "workflow.cancelled",
  "report.generated",
] as const satisfies readonly ProjectHistoryEventType[];

const EVENT_TYPE_SET = new Set<string>(PROJECT_HISTORY_EVENT_TYPES);

export const isProjectHistoryEventType = (
  value: unknown
): value is ProjectHistoryEventType =>
  typeof value === "string" && EVENT_TYPE_SET.has(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isLocalOrFile = (value: unknown): value is "local" | "file" =>
  value === "local" || value === "file";

const validateOpenedPayload = (
  payload: unknown
): payload is ProjectHistoryOpenedPayload => {
  if (typeof payload !== "object" || payload === null) return false;
  const record = payload as Record<string, unknown>;
  return (
    isLocalOrFile(record.source) && isNonEmptyString(record.projectName)
  );
};

const validateSavedPayload = (
  payload: unknown
): payload is ProjectHistorySavedPayload => {
  if (typeof payload !== "object" || payload === null) return false;
  const record = payload as Record<string, unknown>;
  if (!isLocalOrFile(record.target)) return false;
  if (record.projectName === undefined) return true;
  return isNonEmptyString(record.projectName);
};

const validateDatasetAddedPayload = (
  payload: unknown
): payload is ProjectHistoryDatasetAddedPayload => {
  if (typeof payload !== "object" || payload === null) return false;
  const record = payload as Record<string, unknown>;
  if (!isNonEmptyString(record.datasetName)) return false;
  if (record.fileName === undefined) return true;
  return isNonEmptyString(record.fileName);
};

const validateDatasetRemovedPayload = (
  payload: unknown
): payload is ProjectHistoryDatasetRemovedPayload => {
  if (typeof payload !== "object" || payload === null) return false;
  const record = payload as Record<string, unknown>;
  return isNonEmptyString(record.datasetName);
};

const validateWorkflowPayload = (
  payload: unknown
): payload is ProjectHistoryWorkflowPayload => {
  if (typeof payload !== "object" || payload === null) return false;
  const record = payload as Record<string, unknown>;
  return (
    isNonEmptyString(record.templateId) &&
    isNonEmptyString(record.templateLabel)
  );
};

const validateReportGeneratedPayload = (
  payload: unknown
): payload is ProjectHistoryReportGeneratedPayload => {
  if (typeof payload !== "object" || payload === null) return false;
  const record = payload as Record<string, unknown>;
  return record.format === "pdf";
};

export const isValidProjectHistoryPayload = <T extends ProjectHistoryEventType>(
  type: T,
  payload: unknown
): payload is ProjectHistoryPayloadMap[T] => {
  switch (type) {
    case "project.opened":
      return validateOpenedPayload(payload);
    case "project.saved":
      return validateSavedPayload(payload);
    case "dataset.added":
      return validateDatasetAddedPayload(payload);
    case "dataset.removed":
      return validateDatasetRemovedPayload(payload);
    case "workflow.started":
    case "workflow.cancelled":
      return validateWorkflowPayload(payload);
    case "report.generated":
      return validateReportGeneratedPayload(payload);
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
};
