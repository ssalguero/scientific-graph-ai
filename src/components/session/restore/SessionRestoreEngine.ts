/**
 * D67.5 — Session Restore Foundation · Session Restore Engine.
 * Authority: D67.0 Architecture Freeze · API Freeze.
 * Sync pipeline: validate → report → deserializeRegistry (D66) → register → result.
 * No React, no IO, no UI — sole write via SessionRegistry.register.
 */

import { deserializeRegistry } from "../persistence/SessionDeserializer";
import type { SessionPersistenceRecord } from "../persistence/SessionPersistenceTypes";
import type { SessionId } from "../SessionTypes";
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

function resolveStatus(statistics: RestoreStatistics): RestoreStatus {
  if (statistics.restored > 0 && statistics.restored === statistics.requested) {
    return "success";
  }
  if (statistics.restored > 0) {
    return "partial";
  }
  return "failed";
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
      const restoredIds: SessionId[] = [];
      let restored = 0;
      let skipped = 0;
      let failed = 0;

      const hasMissingPayload = validationErrors.some(
        (error) => error.kind === "MissingSnapshot"
      );

      if (!hasMissingPayload && requested > 0) {
        const invalidIndices = collectInvalidIndices(validationErrors);

        const validRecords: SessionPersistenceRecord[] = [];
        for (let index = 0; index < records.length; index += 1) {
          if (invalidIndices.has(index)) {
            skipped += 1;
            continue;
          }
          validRecords.push(records[index]!);
        }

        const entries = deserializeRegistry(validRecords);

        for (const entry of entries) {
          const registered = registry.register(entry);
          if (registered) {
            restored += 1;
            restoredIds.push(entry.definition.id);
          } else {
            failed += 1;
            errors.push({
              kind: "RegistryFailure",
              sessionId: entry.definition.id,
              message: `SessionRegistry.register rejected session "${entry.definition.id}"`,
            });
          }
        }
      }

      const statistics: RestoreStatistics = {
        requested,
        restored,
        skipped,
        failed,
      };

      const status = resolveStatus(statistics);
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
