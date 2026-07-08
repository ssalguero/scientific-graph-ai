export const DEFAULT_MAX_PROJECT_HISTORY_ENTRIES = 100;

export type ProjectHistoryEventType =
  | "project.opened"
  | "project.saved"
  | "dataset.added"
  | "dataset.removed"
  | "workflow.started"
  | "workflow.cancelled"
  | "report.generated";

export type ProjectHistoryOpenedPayload = {
  source: "local" | "file";
  projectName: string;
};

export type ProjectHistorySavedPayload = {
  target: "local" | "file";
  projectName?: string;
};

export type ProjectHistoryDatasetAddedPayload = {
  datasetName: string;
  fileName?: string;
};

export type ProjectHistoryDatasetRemovedPayload = {
  datasetName: string;
};

export type ProjectHistoryWorkflowPayload = {
  templateId: string;
  templateLabel: string;
};

export type ProjectHistoryReportGeneratedPayload = {
  format: "pdf";
};

export type ProjectHistoryPayloadMap = {
  "project.opened": ProjectHistoryOpenedPayload;
  "project.saved": ProjectHistorySavedPayload;
  "dataset.added": ProjectHistoryDatasetAddedPayload;
  "dataset.removed": ProjectHistoryDatasetRemovedPayload;
  "workflow.started": ProjectHistoryWorkflowPayload;
  "workflow.cancelled": ProjectHistoryWorkflowPayload;
  "report.generated": ProjectHistoryReportGeneratedPayload;
};

export type ProjectHistoryEntry = {
  id: string;
  type: ProjectHistoryEventType;
  occurredAt: string;
  description: string;
  payload: ProjectHistoryPayloadMap[ProjectHistoryEventType];
};

/** Handle de store — implementación concreta diferida a D22.3 (adapter). */
export type ProjectHistoryStore = {
  entries: ProjectHistoryEntry[];
  maxEntries: number;
};
