/**
 * ENGINE Domain — Session coordination DTOs (ENGINE-owned).
 * OWNERSHIP: ENGINE orchestrates; Sessions (Platform) owns persistence/restore/autosave.
 * Shapes are intentionally opaque toward Session internals — adapters map to Platform APIs.
 */

/** Opaque registry handle — must match SessionRegistry.register write surface. */
export type SessionRegistryHandle = {
  register(entry: unknown): boolean;
};

/** Opaque persistence records — SessionPersistenceRecord[] at the Platform boundary. */
export type SessionPersistenceRecordLike = unknown;

export type RestoreSessionInput = {
  readonly records: readonly SessionPersistenceRecordLike[];
  readonly registry: SessionRegistryHandle;
};

export type RestoreSessionStatus = "success" | "partial" | "failed";

export type RestoreSessionResult = {
  readonly status: RestoreSessionStatus;
  readonly requested: number;
  readonly restored: number;
  readonly skipped: number;
  readonly failed: number;
  readonly restoredIds: readonly string[];
  /** Platform error kinds / messages — opaque for diagnostics. */
  readonly errorSummaries?: readonly string[];
};

export type SessionSaveCoordinationReason = "project.save" | "explicit";

export type SessionSaveCoordinationInput = {
  readonly projectName: string;
  readonly projectId?: string;
  readonly reason: SessionSaveCoordinationReason;
};

/**
 * Dual-path save coordination result.
 * Project durable save remains LocalProjectAdapter; this reports Session-side orchestration only.
 */
export type SessionSaveCoordinationResult = {
  /** True when a SessionSavePort performed coordination (not a no-op stub). */
  readonly coordinated: boolean;
  /** True when an autosave flush was requested as part of save coordination. */
  readonly flushedAutosave: boolean;
};

export type AutosaveCoordinationStatus = {
  /** False when no AutosaveCoordinationPort is wired (no-op stub). */
  readonly available: boolean;
  /** Optional last successful flush timestamp (ms). */
  readonly lastFlushAt: number | null;
  readonly flushCount: number;
};

/**
 * Per-operation Session execution context (ENGINE coordination — not React).
 * Distinct from WorkflowExecutionContext; flows may pass diagnostics via SessionCoordinator.
 */
export type SessionExecutionContext = {
  readonly operationId: string;
  readonly flowId?: string;
  readonly reason?: string;
};
