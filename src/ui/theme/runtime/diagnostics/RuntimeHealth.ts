/**
 * UX-3.11 — Aggregated immutable runtime health (private).
 *
 * healthy === (errorCount === 0). Warnings and Info do not flip healthy.
 */

import type { RuntimeDiagnostic } from "./RuntimeDiagnostic";

export type RuntimeHealth = {
  readonly healthy: boolean;
  readonly warningCount: number;
  readonly errorCount: number;
  readonly diagnostics: ReadonlyArray<Readonly<RuntimeDiagnostic>>;
};
