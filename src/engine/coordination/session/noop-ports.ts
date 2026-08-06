/**
 * ENGINE Domain — No-op Session ports (safe defaults for Node tests / unwired app).
 * OWNERSHIP: ENGINE coordination stubs — Session Platform not required at compose time.
 */

import type {
  AutosaveCoordinationPort,
  RestoreSessionPort,
  SessionCoordinationPorts,
  SessionSavePort,
} from "./ports";
import type {
  AutosaveCoordinationStatus,
  RestoreSessionResult,
  SessionSaveCoordinationResult,
} from "./types";

export function createNoOpRestoreSessionPort(): RestoreSessionPort {
  return {
    restore(): RestoreSessionResult {
      return {
        status: "failed",
        requested: 0,
        restored: 0,
        skipped: 0,
        failed: 0,
        restoredIds: [],
        errorSummaries: ["Session restore port not wired (no-op)"],
      };
    },
  };
}

export function createNoOpSessionSavePort(): SessionSavePort {
  return {
    async coordinateSave(): Promise<SessionSaveCoordinationResult> {
      return { coordinated: false, flushedAutosave: false };
    },
  };
}

export function createNoOpAutosaveCoordinationPort(): AutosaveCoordinationPort {
  return {
    async requestFlush(): Promise<void> {
      // no-op
    },
    getStatus(): AutosaveCoordinationStatus {
      return { available: false, lastFlushAt: null, flushCount: 0 };
    },
  };
}

/** Default Session ports when Session Platform deps are not injected. */
export function createNoOpSessionPorts(): SessionCoordinationPorts {
  return {
    restore: createNoOpRestoreSessionPort(),
    save: createNoOpSessionSavePort(),
    autosave: createNoOpAutosaveCoordinationPort(),
  };
}
