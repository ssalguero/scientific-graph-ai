/**
 * D65.1 — Session Foundation · shared type contracts.
 * Authority: D65.0 API Freeze · HR-def-state-split · HR-session-serializable.
 * Types only — no runtime logic, no storage, no UI, no React.
 */

import type { SessionDefinition } from "./SessionDefinition";
import type { SessionState } from "./SessionState";

/** Opaque session identity — plain string alias (repo pattern). */
export type SessionId = string;

/**
 * Opaque metadata bag — serializable plain object values only.
 * No Map / Set / Date / Function / ReactNode (HR-session-serializable).
 */
export interface SessionMetadata {
  readonly [key: string]: unknown;
}

/**
 * Composition of immutable Definition + operational State.
 * Does not redefine Definition/State fields — references only.
 * D66 serializes SessionEntry without special reconstruction.
 */
export interface SessionEntry {
  readonly definition: SessionDefinition;
  readonly state: SessionState;
}
