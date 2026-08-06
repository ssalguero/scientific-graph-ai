/**
 * ENGINE Domain — Session coordination ports (injectable; no React).
 * OWNERSHIP: ENGINE defines ports; Sessions (Platform) fulfill via adapters / fakes.
 */

import type {
  AutosaveCoordinationStatus,
  RestoreSessionInput,
  RestoreSessionResult,
  SessionSaveCoordinationInput,
  SessionSaveCoordinationResult,
} from "./types";

/** Restore Session port — maps to SessionRestoreEngine (or fake). */
export type RestoreSessionPort = {
  restore(input: RestoreSessionInput): RestoreSessionResult | Promise<RestoreSessionResult>;
};

/**
 * Optional Session-side save coordination (dual-path with LocalProjectAdapter).
 * Does not own project durable save — may request snapshot/autosave flush only.
 */
export type SessionSavePort = {
  coordinateSave(
    input: SessionSaveCoordinationInput,
  ): Promise<SessionSaveCoordinationResult>;
};

/**
 * Autosave orchestration port — requests flush / status only.
 * Does not own AutosaveScheduler; consumes public AutosaveController API via adapter.
 */
export type AutosaveCoordinationPort = {
  requestFlush(): Promise<void>;
  getStatus(): AutosaveCoordinationStatus;
};

export type SessionCoordinationPorts = {
  readonly restore: RestoreSessionPort;
  readonly save: SessionSavePort;
  readonly autosave: AutosaveCoordinationPort;
};
