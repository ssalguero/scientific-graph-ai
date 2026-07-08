import { buildProjectHistoryEntry } from "../builders";
import {
  isProjectHistoryEventType,
  isValidProjectHistoryPayload,
  PROJECT_HISTORY_EVENT_TYPES,
} from "../events";
import { DEFAULT_MAX_PROJECT_HISTORY_ENTRIES } from "../types";

import {
  createAssertCase,
  type AssertCase,
  type CaseResult,
} from "./run-assertions";

const FIXED_ISO = "2026-07-08T12:00:00.000Z";

export const runProjectHistoryDomainCases = (
  assertCase: AssertCase
): void => {
  assertCase(
    "domain.eventCatalog.count",
    PROJECT_HISTORY_EVENT_TYPES.length === 7
  );

  assertCase(
    "domain.eventCatalog.includesProjectOpened",
    PROJECT_HISTORY_EVENT_TYPES.includes("project.opened")
  );

  assertCase(
    "domain.isProjectHistoryEventType.valid",
    isProjectHistoryEventType("dataset.added") === true
  );

  assertCase(
    "domain.isProjectHistoryEventType.invalid",
    isProjectHistoryEventType("project.deleted") === false
  );

  assertCase(
    "domain.isValidProjectHistoryPayload.opened",
    isValidProjectHistoryPayload("project.opened", {
      source: "local",
      projectName: "Ensayo A",
    }) === true
  );

  assertCase(
    "domain.isValidProjectHistoryPayload.invalidOpened",
    isValidProjectHistoryPayload("project.opened", {
      source: "cloud",
      projectName: "",
    }) === false
  );

  assertCase(
    "domain.buildProjectHistoryEntry.id",
    buildProjectHistoryEntry(
      "project.saved",
      { target: "file", projectName: "Demo" },
      { occurredAt: FIXED_ISO, sequence: 3, id: "custom-id" }
    ).id === "custom-id"
  );

  assertCase(
    "domain.buildProjectHistoryEntry.defaultId",
    buildProjectHistoryEntry(
      "dataset.removed",
      { datasetName: "Serie 1" },
      { occurredAt: FIXED_ISO, sequence: 1 }
    ).id === `${FIXED_ISO}#1`
  );

  assertCase(
    "domain.buildProjectHistoryEntry.timestamp",
    buildProjectHistoryEntry(
      "workflow.started",
      { templateId: "evaluate-publication", templateLabel: "Publicación" },
      { occurredAt: FIXED_ISO }
    ).occurredAt === FIXED_ISO
  );

  assertCase(
    "domain.buildProjectHistoryEntry.descriptionOpened",
    buildProjectHistoryEntry("project.opened", {
      source: "file",
      projectName: "Mi proyecto",
    }).description === "Proyecto abierto (archivo): Mi proyecto"
  );

  assertCase(
    "domain.buildProjectHistoryEntry.descriptionDatasetAdded",
    buildProjectHistoryEntry("dataset.added", {
      datasetName: "Datos X",
      fileName: "datos.csv",
    }).description === "Dataset agregado: Datos X — datos.csv"
  );

  assertCase(
    "domain.buildProjectHistoryEntry.descriptionReportGenerated",
    buildProjectHistoryEntry("report.generated", { format: "pdf" })
      .description === "Reporte generado (PDF)"
  );

  assertCase(
    "domain.buildProjectHistoryEntry.invalidPayloadThrows",
    (() => {
      try {
        buildProjectHistoryEntry("project.saved", {
          target: "invalid",
        } as never);
        return false;
      } catch {
        return true;
      }
    })()
  );

  const entry = buildProjectHistoryEntry(
    "workflow.cancelled",
    { templateId: "quick-start", templateLabel: "Inicio rápido" },
    { occurredAt: FIXED_ISO, id: "wf-1" }
  );
  const roundTrip = JSON.parse(JSON.stringify(entry)) as typeof entry;
  assertCase(
    "domain.serialization.jsonRoundTrip",
    JSON.stringify(roundTrip) === JSON.stringify(entry)
  );

  assertCase(
    "domain.defaultMaxEntries.frozen",
    DEFAULT_MAX_PROJECT_HISTORY_ENTRIES === 100
  );
};

export const runProjectHistoryDomainCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runProjectHistoryDomainCases(assertCase);
  return results;
};
