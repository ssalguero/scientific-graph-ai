/**
 * D70.1 — Restore Points Foundation · Origin + Metadata contracts.
 * Authority: D70.0 Architecture Freeze · HR-rp-immutable.
 * Types / const surface only — no runtime logic, helpers, classes, React, or I/O.
 */

/**
 * Frozen restore-point creation origins.
 * Value + type surface (repo pattern — no TypeScript enum).
 */
export const RestorePointOrigin = {
  MANUAL: "MANUAL",
  SYSTEM: "SYSTEM",
  IMPORT: "IMPORT",
} as const;

export type RestorePointOrigin =
  (typeof RestorePointOrigin)[keyof typeof RestorePointOrigin];

/**
 * Descriptive metadata only — never SessionState / snapshot payload.
 * Extensible later via D71+ without mutating encapsulated snapshot identity.
 */
export type RestorePointMetadata = {
  readonly tags?: readonly string[];
  readonly correlationId?: string;
};
