/**
 * RELEASE-P1 — Release Evidence Index architecture/contracts (P1 §14).
 *
 * In-memory structural index for architecture validation.
 * NOT the definitive Release Evidence Index artifact.
 */

import type {
  ReleaseEvidenceId,
  ReleaseEvidenceRecord,
  ReleaseGateCategory,
} from "../types";
import type { ReleaseExceptionRecord } from "./gaps";
import { listOpenBlockers } from "./gaps";
import { buildEvidenceTraceView } from "./traceability";

export type EvidenceIndexQueryAnswer = {
  readonly whatExists: readonly ReleaseEvidenceId[];
  readonly origins: Readonly<Record<string, string>>;
  readonly owners: Readonly<Record<string, string>>;
  readonly certifiesOrSupports: Readonly<Record<string, string>>;
  readonly validFlags: Readonly<Record<string, boolean>>;
  readonly currentFlags: Readonly<Record<string, boolean>>;
  readonly releaseValidated: Readonly<Record<string, boolean>>;
  readonly gates: Readonly<Record<string, readonly ReleaseGateCategory[]>>;
  readonly blocking: Readonly<Record<string, boolean>>;
  readonly superseded: Readonly<Record<string, boolean>>;
};

export type ReleaseEvidenceIndex = {
  readonly kind: "ARCHITECTURE_INDEX";
  readonly definitiveArtifact: false;
  list(): readonly ReleaseEvidenceRecord[];
  get(id: ReleaseEvidenceId): ReleaseEvidenceRecord | undefined;
  register(record: ReleaseEvidenceRecord): ReleaseEvidenceIndex;
  registerMany(records: readonly ReleaseEvidenceRecord[]): ReleaseEvidenceIndex;
  replace(record: ReleaseEvidenceRecord): ReleaseEvidenceIndex;
  answerQueries(): EvidenceIndexQueryAnswer;
  exceptions(): readonly ReleaseExceptionRecord[];
  withExceptions(
    exceptions: readonly ReleaseExceptionRecord[],
  ): ReleaseEvidenceIndex;
  openBlockers(): readonly ReleaseExceptionRecord[];
};

class InMemoryEvidenceIndex implements ReleaseEvidenceIndex {
  readonly kind = "ARCHITECTURE_INDEX" as const;
  readonly definitiveArtifact = false as const;

  constructor(
    private readonly records: readonly ReleaseEvidenceRecord[],
    private readonly exceptionRecords: readonly ReleaseExceptionRecord[],
  ) {}

  list(): readonly ReleaseEvidenceRecord[] {
    return this.records;
  }

  get(id: ReleaseEvidenceId): ReleaseEvidenceRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  register(record: ReleaseEvidenceRecord): ReleaseEvidenceIndex {
    if (this.records.some((r) => r.id === record.id)) {
      return this.replace(record);
    }
    return new InMemoryEvidenceIndex(
      [...this.records, record],
      this.exceptionRecords,
    );
  }

  registerMany(records: readonly ReleaseEvidenceRecord[]): ReleaseEvidenceIndex {
    return records.reduce<ReleaseEvidenceIndex>(
      (idx, r) => idx.register(r),
      this,
    );
  }

  replace(record: ReleaseEvidenceRecord): ReleaseEvidenceIndex {
    return new InMemoryEvidenceIndex(
      this.records.map((r) => (r.id === record.id ? record : r)),
      this.exceptionRecords,
    );
  }

  withExceptions(
    exceptions: readonly ReleaseExceptionRecord[],
  ): ReleaseEvidenceIndex {
    return new InMemoryEvidenceIndex(this.records, exceptions);
  }

  exceptions(): readonly ReleaseExceptionRecord[] {
    return this.exceptionRecords;
  }

  openBlockers(): readonly ReleaseExceptionRecord[] {
    return listOpenBlockers(this.exceptionRecords);
  }

  answerQueries(): EvidenceIndexQueryAnswer {
    const origins: Record<string, string> = {};
    const owners: Record<string, string> = {};
    const certifiesOrSupports: Record<string, string> = {};
    const validFlags: Record<string, boolean> = {};
    const currentFlags: Record<string, boolean> = {};
    const releaseValidated: Record<string, boolean> = {};
    const gates: Record<string, readonly ReleaseGateCategory[]> = {};
    const blocking: Record<string, boolean> = {};
    const superseded: Record<string, boolean> = {};

    for (const r of this.records) {
      const id = String(r.id);
      origins[id] = r.source;
      owners[id] = r.owningDomain;
      certifiesOrSupports[id] = r.certificationRelationship;
      validFlags[id] =
        r.trustClass !== "INVALID" &&
        r.trustClass !== "MISSING" &&
        r.lifecycleState !== "INVALIDATED" &&
        r.validationOutcome !== "FAIL";
      currentFlags[id] = r.freshness.isCurrent && r.trustClass !== "STALE";
      releaseValidated[id] =
        r.lifecycleState === "VALIDATED" ||
        r.lifecycleState === "ACCEPTED" ||
        r.lifecycleState === "CONSUMED" ||
        r.validationOutcome !== "NOT_EVALUATED";
      gates[id] = r.gateCategories;
      blocking[id] = r.blocking.contributes === true;
      superseded[id] = r.supersession.superseded === true;
      void buildEvidenceTraceView(r);
    }

    return {
      whatExists: this.records.map((r) => r.id),
      origins,
      owners,
      certifiesOrSupports,
      validFlags,
      currentFlags,
      releaseValidated,
      gates,
      blocking,
      superseded,
    };
  }
}

export function createEvidenceIndex(
  records: readonly ReleaseEvidenceRecord[] = [],
  exceptions: readonly ReleaseExceptionRecord[] = [],
): ReleaseEvidenceIndex {
  return new InMemoryEvidenceIndex(records, exceptions);
}

export function isDefinitiveReleaseEvidenceIndex(
  index: ReleaseEvidenceIndex,
): false {
  void index;
  return false;
}
