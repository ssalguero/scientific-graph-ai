import {
  appendProjectHistoryEntry,
  buildProjectHistoryEntry,
  clearProjectHistory,
  createProjectHistoryStore,
  listProjectHistoryEntries,
} from "@/lib/project-history";

import { useProjectHistory } from "@/app/useProjectHistory";

import {
  createAssertCase,
  type AssertCase,
  type CaseResult,
} from "./run-assertions";

const FIXED_ISO = "2026-07-08T12:00:00.000Z";

export const runProjectHistoryAdapterCases = (
  assertCase: AssertCase
): void => {
  const store = createProjectHistoryStore(3);

  assertCase(
    "adapter.createProjectHistoryStore.defaultMax",
    store.maxEntries === 3 && store.entries.length === 0
  );

  const first = buildProjectHistoryEntry(
    "project.saved",
    { target: "local", projectName: "A" },
    { occurredAt: `${FIXED_ISO}`, sequence: 0 }
  );
  const second = buildProjectHistoryEntry(
    "dataset.added",
    { datasetName: "B" },
    { occurredAt: `${FIXED_ISO}`, sequence: 1 }
  );
  const third = buildProjectHistoryEntry(
    "workflow.started",
    { templateId: "compare-groups", templateLabel: "Comparar grupos" },
    { occurredAt: `${FIXED_ISO}`, sequence: 2 }
  );
  const fourth = buildProjectHistoryEntry(
    "workflow.cancelled",
    { templateId: "compare-groups", templateLabel: "Comparar grupos" },
    { occurredAt: "2026-07-08T13:00:00.000Z", sequence: 0 }
  );

  appendProjectHistoryEntry(store, first);
  appendProjectHistoryEntry(store, second);
  appendProjectHistoryEntry(store, third);
  appendCaseRingBuffer(store, fourth, assertCase);

  assertCase(
    "adapter.listProjectHistoryEntries.descending",
    listProjectHistoryEntries(store)[0]?.type === "workflow.cancelled"
  );

  clearProjectHistory(store);
  assertCase(
    "adapter.clearProjectHistory",
    store.entries.length === 0 &&
      listProjectHistoryEntries(store).length === 0
  );
};

const appendCaseRingBuffer = (
  store: ReturnType<typeof createProjectHistoryStore>,
  fourth: ReturnType<typeof buildProjectHistoryEntry>,
  assertCase: AssertCase
): void => {
  appendProjectHistoryEntry(store, fourth);
  assertCase(
    "adapter.appendProjectHistoryEntry.ringBuffer",
    store.entries.length === 3 && store.entries[0]?.type === "dataset.added"
  );
};

export const runProjectHistoryAdapterCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runProjectHistoryAdapterCases(assertCase);
  return results;
};

export const runProjectHistoryHookCases = (assertCase: AssertCase): void => {
  assertCase(
    "hook.useProjectHistory.exported",
    typeof useProjectHistory === "function"
  );
};
