/**
 * UX-3.11 — Sole factory for RuntimeDiagnostic (private).
 *
 * DiagnosticMessages and DiagnosticLevelsByCode are the SSOT for wording
 * and severity. build(code) only — callers never supply message or level.
 */

import { DiagnosticCode, type DiagnosticCode as DiagnosticCodeType } from "./DiagnosticCode";
import { DiagnosticLevel } from "./DiagnosticLevel";
import type { RuntimeDiagnostic } from "./RuntimeDiagnostic";

const DiagnosticMessages = Object.freeze({
  [DiagnosticCode.EMPTY_REGISTRY]:
    "Registry has no tokens (tokenCount is zero).",
  [DiagnosticCode.NO_THEME_REGISTERED]:
    "No theme identity is present (empty themeName or fingerprint).",
  [DiagnosticCode.RESOLUTION_MISS]:
    "One or more cache misses were recorded during resolution.",
  [DiagnosticCode.CACHE_ACTIVITY_MISSING]:
    "Heuristic only. Indicates no cache hit/miss activity was recorded while resolutions occurred. Does not assert the cache is disabled.",
  [DiagnosticCode.OBSERVER_INACTIVE]:
    "Fingerprint changes occurred without observer notifications.",
  [DiagnosticCode.METRICS_UNAVAILABLE]:
    "Snapshot has tokens but all runtime metric counters are zero.",
} as const);

const DiagnosticLevelsByCode = Object.freeze({
  [DiagnosticCode.EMPTY_REGISTRY]: DiagnosticLevel.ERROR,
  [DiagnosticCode.NO_THEME_REGISTERED]: DiagnosticLevel.ERROR,
  [DiagnosticCode.RESOLUTION_MISS]: DiagnosticLevel.WARNING,
  [DiagnosticCode.CACHE_ACTIVITY_MISSING]: DiagnosticLevel.WARNING,
  [DiagnosticCode.OBSERVER_INACTIVE]: DiagnosticLevel.INFO,
  [DiagnosticCode.METRICS_UNAVAILABLE]: DiagnosticLevel.WARNING,
} as const);

function build(code: DiagnosticCodeType): Readonly<RuntimeDiagnostic> {
  return Object.freeze({
    code,
    level: DiagnosticLevelsByCode[code],
    message: DiagnosticMessages[code],
  });
}

export const RuntimeDiagnosticBuilder = Object.freeze({
  build,
});
