/**
 * ENGINE Domain — Session Coordinator.
 * OWNERSHIP: ENGINE orchestrates Session-related Product Flows.
 * Sessions (Platform) remain authoritative for persistence, restore, autosave, session state.
 */

import {
  SESSION_ERROR_CODES,
  SessionFlowError,
} from "./errors";
import type {
  AutosaveCoordinationPort,
  RestoreSessionPort,
  SessionCoordinationPorts,
  SessionSavePort,
} from "./ports";
import type {
  AutosaveCoordinationStatus,
  RestoreSessionInput,
  RestoreSessionResult,
  SessionExecutionContext,
  SessionSaveCoordinationInput,
  SessionSaveCoordinationResult,
} from "./types";

export type SessionCoordinatorOptions = {
  readonly ports: SessionCoordinationPorts;
};

/**
 * Coordinates Restore Session, optional save hooks, and autosave flush requests.
 */
export class SessionCoordinator {
  private readonly restorePort: RestoreSessionPort;
  private readonly savePort: SessionSavePort;
  private readonly autosavePort: AutosaveCoordinationPort;

  constructor(options: SessionCoordinatorOptions) {
    this.restorePort = options.ports.restore;
    this.savePort = options.ports.save;
    this.autosavePort = options.ports.autosave;
  }

  /** Restore Session — delegates to RestoreSessionPort (SessionRestoreEngine or fake). */
  async restoreSession(
    input: RestoreSessionInput,
    _ctx?: SessionExecutionContext,
  ): Promise<RestoreSessionResult> {
    if (!Array.isArray(input.records)) {
      throw new SessionFlowError(
        SESSION_ERROR_CODES.INVALID_PAYLOAD,
        "restoreSession requires records: array",
      );
    }
    if (
      input.registry == null ||
      typeof input.registry.register !== "function"
    ) {
      throw new SessionFlowError(
        SESSION_ERROR_CODES.INVALID_PAYLOAD,
        "restoreSession requires registry with register()",
      );
    }

    const result = await this.restorePort.restore(input);

    if (result.status === "failed" && result.restored === 0) {
      throw new SessionFlowError(
        SESSION_ERROR_CODES.RESTORE_FAILED,
        result.errorSummaries?.join("; ") ||
          "Session restore failed (status=failed, restored=0)",
      );
    }

    return result;
  }

  /**
   * Dual-path save coordination with Session (optional).
   * Project durable save stays on LocalProjectAdapter / ProjectEngine.
   */
  async coordinateSave(
    input: SessionSaveCoordinationInput,
    _ctx?: SessionExecutionContext,
  ): Promise<SessionSaveCoordinationResult> {
    return this.savePort.coordinateSave(input);
  }

  /** Request autosave flush — orchestration only; Session owns scheduler. */
  async requestAutosaveFlush(
    _ctx?: SessionExecutionContext,
  ): Promise<void> {
    const status = this.autosavePort.getStatus();
    if (!status.available) {
      throw new SessionFlowError(
        SESSION_ERROR_CODES.AUTOSAVE_UNAVAILABLE,
        "Autosave coordination port is not wired",
      );
    }
    await this.autosavePort.requestFlush();
  }

  /** Read autosave orchestration status (not Session internals). */
  getAutosaveStatus(): AutosaveCoordinationStatus {
    return this.autosavePort.getStatus();
  }
}

export function createSessionCoordinator(
  options: SessionCoordinatorOptions,
): SessionCoordinator {
  return new SessionCoordinator(options);
}
