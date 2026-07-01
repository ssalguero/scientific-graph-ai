import {
  areProjectRevisionIdsEqual,
  areRevisionsEquivalent,
  compareRevisionTimes,
  createProjectRevisionRef,
  getEffectiveRevisionTimestamp,
  isIncomingRevisionNewerThan,
  isIncomingRevisionOlderThan,
  parseRevisionIsoTimestamp,
  type ProjectRevisionRef,
} from "../persistence-conflict";
import type {
  AutosaveIndicatorState,
  ProjectSizeAssessment,
  ProjectSizeWarningTier,
} from "../persistence-status";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const PROJECT_ID = "00000000-0000-4000-8000-00000000b601";

const revision = (
  overrides: Partial<ProjectRevisionRef> & Pick<ProjectRevisionRef, "updatedAt">
): ProjectRevisionRef =>
  createProjectRevisionRef({
    projectId: PROJECT_ID,
    source: "session",
    ...overrides,
  });

const ALL_AUTOSAVE_STATES: AutosaveIndicatorState[] = [
  "idle",
  "pending",
  "saving",
  "saved",
  "error",
];

const ALL_SIZE_TIERS: ProjectSizeWarningTier[] = [
  "none",
  "approaching",
  "exceeded",
];

export const runPersistenceConflictDomainCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  assertCase(
    "revision.parse.validIso",
    parseRevisionIsoTimestamp("2026-06-30T12:00:00.000Z") ===
      Date.parse("2026-06-30T12:00:00.000Z")
  );
  assertCase("revision.parse.empty", parseRevisionIsoTimestamp("") === null);
  assertCase(
    "revision.parse.invalid",
    parseRevisionIsoTimestamp("not-a-date") === null
  );

  assertCase(
    "revision.ids.equal.trim",
    areProjectRevisionIdsEqual(
      " 00000000-0000-4000-8000-00000000b601 ",
      PROJECT_ID
    )
  );
  assertCase(
    "revision.ids.notEqual",
    areProjectRevisionIdsEqual(PROJECT_ID, "other-id") === false
  );

  const base = revision({ updatedAt: "2026-06-30T10:00:00.000Z" });
  const newer = revision({
    updatedAt: "2026-06-30T11:00:00.000Z",
    source: "sgproj-file",
  });
  const older = revision({
    updatedAt: "2026-06-30T09:00:00.000Z",
    source: "local-committed",
  });

  assertCase(
    "revision.compare.equal",
    compareRevisionTimes(base, { ...base, source: "local-draft" }) === "equal"
  );
  assertCase(
    "revision.compare.before",
    compareRevisionTimes(base, newer) === "before"
  );
  assertCase(
    "revision.compare.after",
    compareRevisionTimes(base, older) === "after"
  );

  assertCase(
    "revision.incomingNewer",
    isIncomingRevisionNewerThan(base, newer) === true
  );
  assertCase(
    "revision.incomingOlder",
    isIncomingRevisionOlderThan(base, older) === true
  );
  assertCase(
    "revision.incomingNotNewerWhenEqual",
    isIncomingRevisionNewerThan(base, base) === false
  );

  const withExport = revision({
    updatedAt: "2026-06-30T09:00:00.000Z",
    exportedAt: "2026-06-30T12:00:00.000Z",
    source: "sgproj-file",
  });
  assertCase(
    "revision.effectivePrefersExportedAt",
    getEffectiveRevisionTimestamp(withExport) ===
      Date.parse("2026-06-30T12:00:00.000Z")
  );
  assertCase(
    "revision.effectiveFallsBackToUpdatedAt",
    getEffectiveRevisionTimestamp(base) ===
      Date.parse("2026-06-30T10:00:00.000Z")
  );
  assertCase(
    "revision.exportedAtInvalidUsesUpdatedAt",
    getEffectiveRevisionTimestamp(
      revision({
        updatedAt: "2026-06-30T10:00:00.000Z",
        exportedAt: "invalid",
      })
    ) === Date.parse("2026-06-30T10:00:00.000Z")
  );

  assertCase(
    "revision.equivalentSameIdAndTime",
    areRevisionsEquivalent(base, { ...base, source: "sgproj-file" }) === true
  );
  assertCase(
    "revision.notEquivalentDifferentTime",
    areRevisionsEquivalent(base, newer) === false
  );

  assertCase(
    "revision.incomparableLeftInvalid",
    compareRevisionTimes(
      revision({ updatedAt: "invalid" }),
      base
    ) === "incomparable"
  );
  assertCase(
    "revision.incomparableBothInvalid",
    compareRevisionTimes(
      revision({ updatedAt: "invalid" }),
      revision({ updatedAt: "" })
    ) === "incomparable"
  );
  assertCase(
    "revision.incomparableNotTreatedAsNewer",
    isIncomingRevisionNewerThan(
      base,
      revision({ updatedAt: "invalid", source: "sgproj-file" })
    ) === false
  );
  assertCase(
    "revision.incomparableNotTreatedAsOlder",
    isIncomingRevisionOlderThan(
      base,
      revision({ updatedAt: "invalid", source: "local-committed" })
    ) === false
  );

  const draft = revision({
    updatedAt: "2026-06-30T12:30:00.000Z",
    source: "local-draft",
  });
  const committed = revision({
    updatedAt: "2026-06-30T12:00:00.000Z",
    source: "local-committed",
  });
  assertCase(
    "revision.draftNewerThanCommitted",
    isIncomingRevisionNewerThan(committed, draft) === true
  );

  assertCase(
    "status.autosaveStates.count",
    ALL_AUTOSAVE_STATES.length === 5
  );
  assertCase(
    "status.sizeTiers.count",
    ALL_SIZE_TIERS.length === 3
  );

  const sampleAssessment: ProjectSizeAssessment = {
    tier: "exceeded",
    byteLength: 11 * 1024 * 1024,
    thresholdBytes: 10 * 1024 * 1024,
    issueCodes: ["S-SIZE"],
  };
  assertCase(
    "status.assessment.shape",
    sampleAssessment.tier === "exceeded" &&
      sampleAssessment.issueCodes.includes("S-SIZE")
  );

  return results;
};
