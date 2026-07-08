import { isValidProjectHistoryPayload } from "./events";
import type {
  ProjectHistoryEntry,
  ProjectHistoryEventType,
  ProjectHistoryPayloadMap,
} from "./types";

export type BuildProjectHistoryEntryOptions = {
  id?: string;
  occurredAt?: string;
  sequence?: number;
};

const buildEntryId = (
  occurredAt: string,
  sequence: number,
  explicitId?: string
): string => explicitId ?? `${occurredAt}#${sequence}`;

const resolveOccurredAt = (occurredAt?: string): string =>
  occurredAt ?? new Date().toISOString();

const describeProjectOpened = (
  payload: ProjectHistoryPayloadMap["project.opened"]
): string => {
  const sourceLabel = payload.source === "local" ? "biblioteca local" : "archivo";
  return `Proyecto abierto (${sourceLabel}): ${payload.projectName}`;
};

const describeProjectSaved = (
  payload: ProjectHistoryPayloadMap["project.saved"]
): string => {
  const targetLabel =
    payload.target === "local" ? "biblioteca local" : "archivo .sgproj";
  const nameSuffix = payload.projectName ? `: ${payload.projectName}` : "";
  return `Proyecto guardado (${targetLabel})${nameSuffix}`;
};

const describeDatasetAdded = (
  payload: ProjectHistoryPayloadMap["dataset.added"]
): string => {
  const fileSuffix = payload.fileName ? ` — ${payload.fileName}` : "";
  return `Dataset agregado: ${payload.datasetName}${fileSuffix}`;
};

const describeDatasetRemoved = (
  payload: ProjectHistoryPayloadMap["dataset.removed"]
): string => `Dataset eliminado: ${payload.datasetName}`;

const describeWorkflowStarted = (
  payload: ProjectHistoryPayloadMap["workflow.started"]
): string => `Workflow iniciado: ${payload.templateLabel}`;

const describeWorkflowCancelled = (
  payload: ProjectHistoryPayloadMap["workflow.cancelled"]
): string => `Workflow cancelado: ${payload.templateLabel}`;

const describeReportGenerated = (
  payload: ProjectHistoryPayloadMap["report.generated"]
): string => `Reporte generado (${payload.format.toUpperCase()})`;

const buildDescription = <T extends ProjectHistoryEventType>(
  type: T,
  payload: ProjectHistoryPayloadMap[T]
): string => {
  switch (type) {
    case "project.opened":
      return describeProjectOpened(
        payload as ProjectHistoryPayloadMap["project.opened"]
      );
    case "project.saved":
      return describeProjectSaved(
        payload as ProjectHistoryPayloadMap["project.saved"]
      );
    case "dataset.added":
      return describeDatasetAdded(
        payload as ProjectHistoryPayloadMap["dataset.added"]
      );
    case "dataset.removed":
      return describeDatasetRemoved(
        payload as ProjectHistoryPayloadMap["dataset.removed"]
      );
    case "workflow.started":
      return describeWorkflowStarted(
        payload as ProjectHistoryPayloadMap["workflow.started"]
      );
    case "workflow.cancelled":
      return describeWorkflowCancelled(
        payload as ProjectHistoryPayloadMap["workflow.cancelled"]
      );
    case "report.generated":
      return describeReportGenerated(
        payload as ProjectHistoryPayloadMap["report.generated"]
      );
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
};

export const buildProjectHistoryEntry = <T extends ProjectHistoryEventType>(
  type: T,
  payload: ProjectHistoryPayloadMap[T],
  options: BuildProjectHistoryEntryOptions = {}
): ProjectHistoryEntry => {
  if (!isValidProjectHistoryPayload(type, payload)) {
    throw new Error(
      `Invalid payload for project history event type "${type}".`
    );
  }

  const occurredAt = resolveOccurredAt(options.occurredAt);
  const sequence = options.sequence ?? 0;
  const id = buildEntryId(occurredAt, sequence, options.id);
  const description = buildDescription(type, payload);

  return {
    id,
    type,
    occurredAt,
    description,
    payload,
  };
};
