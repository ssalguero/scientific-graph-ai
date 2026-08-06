/**
 * ENGINE Domain — Result contracts (Application API).
 * OWNERSHIP: ENGINE defines success/failure and diagnostics refs for UX-facing payloads.
 * ENGINE-0: Result / failure / notification payload shapes frozen.
 */

/** Discriminated operation result for Application API consumers. */
export type EngineResult<T = unknown> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: EngineFailure };

/** Failure payload returned by ENGINE operations. */
export interface EngineFailure {
  readonly code: string;
  readonly message: string;
  readonly diagnosticsRef?: string;
}

/** UX-facing notification payload (data only — UX owns presentation). */
export interface EngineNotificationPayload {
  readonly kind: "info" | "warning" | "error" | "success";
  readonly message: string;
  readonly diagnosticsRef?: string;
}
