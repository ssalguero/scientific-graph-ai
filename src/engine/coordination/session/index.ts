/**
 * ENGINE Domain — Session coordination adapter barrel.
 * OWNERSHIP: ENGINE orchestrates session restore/save/autosave; Sessions owns persistence.
 * Platform adapters may import non-React Session modules under `@/components/session/*`
 * (restore / autosave / persistence) — never SessionProvider / Bridge / Context.
 */

export const SESSION_COORDINATION_OWNERSHIP =
  "ENGINE orchestrates session flows; Sessions owns persistence infrastructure.";

export type {
  AutosaveCoordinationStatus,
  RestoreSessionInput,
  RestoreSessionResult,
  RestoreSessionStatus,
  SessionExecutionContext,
  SessionPersistenceRecordLike,
  SessionRegistryHandle,
  SessionSaveCoordinationInput,
  SessionSaveCoordinationReason,
  SessionSaveCoordinationResult,
} from "./types";

export {
  SESSION_ERROR_CODES,
  SessionFlowError,
} from "./errors";

export type {
  AutosaveCoordinationPort,
  RestoreSessionPort,
  SessionCoordinationPorts,
  SessionSavePort,
} from "./ports";

export {
  createNoOpAutosaveCoordinationPort,
  createNoOpRestoreSessionPort,
  createNoOpSessionPorts,
  createNoOpSessionSavePort,
} from "./noop-ports";

export {
  createInjectableAutosavePort,
  createInjectableRestoreSessionPort,
  createInjectableSessionSavePort,
  type InjectableAutosaveController,
  type InjectableRestoreEngine,
} from "./injectable-ports";

export {
  createPlatformRestoreSessionPort,
} from "./platform-restore-adapter";

export {
  createPlatformAutosavePort,
} from "./platform-autosave-adapter";

export {
  SessionCoordinator,
  createSessionCoordinator,
  type SessionCoordinatorOptions,
} from "./SessionCoordinator";
