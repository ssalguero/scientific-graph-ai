/**
 * ENGINE Domain — Injectable Session ports (fakes / Platform handles without React).
 * OWNERSHIP: ENGINE coordination — ports accept Session-like dependencies for tests and adapters.
 */

import {
  SESSION_ERROR_CODES,
  SessionFlowError,
} from "./errors";
import type {
  AutosaveCoordinationPort,
  RestoreSessionPort,
  SessionSavePort,
} from "./ports";
import type {
  AutosaveCoordinationStatus,
  RestoreSessionInput,
  RestoreSessionResult,
  RestoreSessionStatus,
  SessionSaveCoordinationInput,
  SessionSaveCoordinationResult,
} from "./types";

/** Minimal restore-engine surface matching SessionRestoreEngine.restore. */
export type InjectableRestoreEngine = {
  restore(request: {
    readonly records: readonly unknown[];
    readonly registry: { register(entry: unknown): boolean };
  }): {
    readonly status: RestoreSessionStatus;
    readonly statistics: {
      readonly requested: number;
      readonly restored: number;
      readonly skipped: number;
      readonly failed: number;
    };
    readonly restoredIds: readonly string[];
    readonly report?: {
      readonly errors?: readonly { readonly kind?: string; readonly message?: string }[];
    };
  };
};

/** Minimal autosave controller surface — flush only (public AutosaveController API). */
export type InjectableAutosaveController = {
  flush(): Promise<void>;
};

/**
 * Wrap an injectable restore engine (real SessionRestoreEngine or fake).
 */
export function createInjectableRestoreSessionPort(
  engine: InjectableRestoreEngine,
): RestoreSessionPort {
  return {
    restore(input: RestoreSessionInput): RestoreSessionResult {
      const result = engine.restore({
        records: input.records,
        registry: input.registry,
      });
      const errorSummaries =
        result.report?.errors
          ?.map((e) => e.message ?? e.kind ?? "restore error")
          .filter((m): m is string => typeof m === "string") ?? undefined;
      return {
        status: result.status,
        requested: result.statistics.requested,
        restored: result.statistics.restored,
        skipped: result.statistics.skipped,
        failed: result.statistics.failed,
        restoredIds: result.restoredIds.map(String),
        ...(errorSummaries && errorSummaries.length > 0
          ? { errorSummaries }
          : {}),
      };
    },
  };
}

/**
 * Session save port that optionally flushes autosave (dual-path with project save).
 */
export function createInjectableSessionSavePort(options?: {
  readonly autosave?: AutosaveCoordinationPort;
  /** When false, coordinateSave is a no-op even if autosave is present. Default true. */
  readonly enableFlushOnSave?: boolean;
}): SessionSavePort {
  const enableFlush = options?.enableFlushOnSave !== false;
  const autosave = options?.autosave;

  return {
    async coordinateSave(
      _input: SessionSaveCoordinationInput,
    ): Promise<SessionSaveCoordinationResult> {
      if (!enableFlush || !autosave || !autosave.getStatus().available) {
        return { coordinated: false, flushedAutosave: false };
      }
      try {
        await autosave.requestFlush();
        return { coordinated: true, flushedAutosave: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Session save coordination failed";
        throw new SessionFlowError(
          SESSION_ERROR_CODES.SAVE_COORDINATION_FAILED,
          message,
        );
      }
    },
  };
}

/**
 * Wrap an injectable AutosaveController-like flush API.
 */
export function createInjectableAutosavePort(
  controller: InjectableAutosaveController | null | undefined,
): AutosaveCoordinationPort {
  let lastFlushAt: number | null = null;
  let flushCount = 0;

  if (!controller) {
    return {
      async requestFlush(): Promise<void> {
        // unavailable — no-op
      },
      getStatus(): AutosaveCoordinationStatus {
        return { available: false, lastFlushAt: null, flushCount: 0 };
      },
    };
  }

  return {
    async requestFlush(): Promise<void> {
      try {
        await controller.flush();
        lastFlushAt = Date.now();
        flushCount += 1;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Autosave flush failed";
        throw new SessionFlowError(
          SESSION_ERROR_CODES.AUTOSAVE_FLUSH_FAILED,
          message,
        );
      }
    },
    getStatus(): AutosaveCoordinationStatus {
      return { available: true, lastFlushAt, flushCount };
    },
  };
}
