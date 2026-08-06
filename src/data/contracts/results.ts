/**
 * DATA Domain — Opaque result / failure shapes for the public surface.
 *
 * DATA-I1: Structural envelopes only. No scientific payloads, error catalogs,
 * or processing semantics. DTOs remain opaque (`unknown`) until later stages.
 *
 * @packageDocumentation
 */

/** Opaque public request envelope — payload refined in later DATA-I* stages. */
export interface DataRequest {
  readonly payload?: unknown;
}

/** Opaque failure envelope — codes/messages refined when behavior lands. */
export interface DataFailure {
  readonly code?: string;
  readonly message?: string;
  readonly details?: unknown;
}

/**
 * Opaque public result envelope.
 * Present so Capability Group APIs can be typed without inventing schemas.
 */
export interface DataResult {
  readonly ok: boolean;
  readonly error?: DataFailure;
  readonly result?: unknown;
}
