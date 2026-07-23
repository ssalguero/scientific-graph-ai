/**
 * D67.5 / D67.6 — Session Restore Foundation · Session Restore Engine.
 * Authority: D67.0 Architecture Freeze · API Freeze.
 * Sync pipeline: validate → report → deserializeRegistry (D66) → register → result.
 * No React, no IO, no UI — sole write via SessionRegistry.register.
 *
 * Registry reconstruction scope (D67.6):
 *   SessionPersistenceRecord[] → deserializeRegistry() → SessionEntry[]
 *     → SessionRegistry.register(...)
 *
 * Deferred (Workspace Persistence · D68–D70) — not implemented here:
 *   WindowRegistry · TabRegistry · ContentRegistry · SeriesRegistry restore
 */

import { deserializeRegistry } from "../persistence/SessionDeserializer";
import type { SessionPersistenceRecord } from "../persistence/SessionPersistenceTypes";
import type { SessionRegistry } from "../SessionRegistry";
import type { SessionEntry, SessionId } from "../SessionTypes";
import type { RestoreError } from "./RestoreErrors";
import { createRestoreReport } from "./RestoreReport";
import type {
  RestoreRequest,
  RestoreResult,
  RestoreStatistics,
  RestoreStatus,
  SessionRestoreEngine,
} from "./RestoreTypes";
import { createRestoreValidator } from "./RestoreValidator";

/** Private — RestoreStatus from RestoreStatistics only. */
function buildRestoreStatus(statistics: RestoreStatistics): RestoreStatus {
  if (statistics.restored > 0 && statistics.restored === statistics.requested) {
    return "success";
  }
  if (statistics.restored > 0) {
    return "partial";
  }
  return "failed";
}

/** Private — immutable statistics bag (no calculations beyond field assembly). */
function buildStatistics(
  requested: number,
  restored: number,
  skipped: number,
  failed: number
): RestoreStatistics {
  return {
    requested,
    restored,
    skipped,
    failed,
  };
}

function collectInvalidIndices(
  errors: readonly RestoreError[]
): ReadonlySet<number> {
  const indices = new Set<number>();
  for (const error of errors) {
    if (
      (error.kind === "ValidationFailure" ||
        error.kind === "CorruptedSnapshot") &&
      typeof error.index === "number"
    ) {
      indices.add(error.index);
    }
  }
  return indices;
}

type ReconstructionOutcome = {
  readonly restored: number;
  readonly skipped: number;
  readonly failed: number;
  readonly restoredIds: readonly SessionId[];
  readonly registryErrors: readonly RestoreError[];
};

/**
 * Private — SessionRegistry reconstruction only.
 * Flow: valid records → deserializeRegistry (D66) → registry.register per entry.
 * Does not touch Window / Tab / Content / Series registries (deferred D68–D70).
 */
function restoreEntries(
  records: readonly SessionPersistenceRecord[],
  invalidIndices: ReadonlySet<number>,
  registry: SessionRegistry
): ReconstructionOutcome {
  const validRecords: SessionPersistenceRecord[] = [];
  let skipped = 0;

  for (let index = 0; index < records.length; index += 1) {
    if (invalidIndices.has(index)) {
      skipped += 1;
      continue;
    }
    validRecords.push(records[index]!);
  }

  // D66 certified deserializer — sole reconstruction path (no second mechanism).
  const entries: readonly SessionEntry[] = deserializeRegistry(validRecords);

  const restoredIds: SessionId[] = [];
  const registryErrors: RestoreError[] = [];
  let restored = 0;
  let failed = 0;

  for (const entry of entries) {
    // Sole write surface — public SessionRegistry API only.
    const registered = registry.register(entry);
    if (registered) {
      restored += 1;
      restoredIds.push(entry.definition.id);
    } else {
      failed += 1;
      registryErrors.push({
        kind: "RegistryFailure",
        sessionId: entry.definition.id,
        message: `SessionRegistry.register rejected session "${entry.definition.id}"`,
      });
    }
  }

  return {
    restored,
    skipped,
    failed,
    restoredIds,
    registryErrors,
  };
}

/**
 * Creates a stateless SessionRestoreEngine.
 * Registry is always supplied via RestoreRequest — never captured.
 */
export function createSessionRestoreEngine(): SessionRestoreEngine {
  const validator = createRestoreValidator();

  return {
    restore(request: RestoreRequest): RestoreResult {
      const startedAt = performance.now();
      const { records, registry } = request;

      const validationErrors = validator.validate(records);
      const errors: RestoreError[] = validationErrors.slice();
      const warnings: RestoreError[] = [];

      const requested = Array.isArray(records) ? records.length : 0;
      let restored = 0;
      let skipped = 0;
      let failed = 0;
      let restoredIds: readonly SessionId[] = [];

      const hasMissingPayload = validationErrors.some(
        (error) => error.kind === "MissingSnapshot"
      );

      if (!hasMissingPayload && requested > 0) {
        const outcome = restoreEntries(
          records,
          collectInvalidIndices(validationErrors),
          registry
        );
        restored = outcome.restored;
        skipped = outcome.skipped;
        failed = outcome.failed;
        restoredIds = outcome.restoredIds;
        for (const registryError of outcome.registryErrors) {
          errors.push(registryError);
        }
      }

      const statistics = buildStatistics(
        requested,
        restored,
        skipped,
        failed
      );
      const status = buildRestoreStatus(statistics);
      const elapsedTime = performance.now() - startedAt;

      const report = createRestoreReport({
        warnings,
        errors,
        restoredItems: restored,
        skippedItems: skipped,
        elapsedTime,
      });

      return {
        status,
        report,
        statistics,
        restoredIds: restoredIds.slice(),
      };
    },
  };
}
