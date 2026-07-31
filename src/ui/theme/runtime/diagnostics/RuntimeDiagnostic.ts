/**
 * UX-3.11 — Immutable runtime diagnostic (private).
 *
 * No timestamps. No mutable metadata. No optional fields.
 */

import type { DiagnosticCode } from "./DiagnosticCode";
import type { DiagnosticLevel } from "./DiagnosticLevel";

export type RuntimeDiagnostic = {
  readonly code: DiagnosticCode;
  readonly level: DiagnosticLevel;
  readonly message: string;
};
