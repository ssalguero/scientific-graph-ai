/**
 * UX-3.11 — Pure runtime diagnostic evaluator (private).
 *
 * Consumes RuntimeSnapshot + RuntimeMetricsSnapshot only.
 * No state, caches, observers, logging, or side effects.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import { DiagnosticCode } from "./DiagnosticCode";
import { DiagnosticLevel } from "./DiagnosticLevel";
import { RuntimeDiagnosticBuilder } from "./RuntimeDiagnosticBuilder";
import type { RuntimeDiagnostic } from "./RuntimeDiagnostic";
import type { RuntimeHealth } from "./RuntimeHealth";

const RULE_ORDER = Object.freeze([
  DiagnosticCode.EMPTY_REGISTRY,
  DiagnosticCode.NO_THEME_REGISTERED,
  DiagnosticCode.RESOLUTION_MISS,
  DiagnosticCode.CACHE_ACTIVITY_MISSING,
  DiagnosticCode.OBSERVER_INACTIVE,
  DiagnosticCode.METRICS_UNAVAILABLE,
] as const);

function isTriggered(
  code: (typeof RULE_ORDER)[number],
  snapshot: RuntimeSnapshot,
  metrics: RuntimeMetricsSnapshot,
): boolean {
  switch (code) {
    case DiagnosticCode.EMPTY_REGISTRY:
      return snapshot.tokenCount === 0;
    case DiagnosticCode.NO_THEME_REGISTERED:
      return snapshot.themeName === "" || snapshot.fingerprint === "";
    case DiagnosticCode.RESOLUTION_MISS:
      return metrics.cacheMisses > 0;
    case DiagnosticCode.CACHE_ACTIVITY_MISSING:
      return (
        metrics.resolutions > 0 &&
        metrics.cacheHits === 0 &&
        metrics.cacheMisses === 0
      );
    case DiagnosticCode.OBSERVER_INACTIVE:
      return (
        metrics.fingerprintChanges > 0 && metrics.observerNotifications === 0
      );
    case DiagnosticCode.METRICS_UNAVAILABLE:
      return (
        snapshot.tokenCount > 0 &&
        metrics.resolutions === 0 &&
        metrics.cacheHits === 0 &&
        metrics.cacheMisses === 0 &&
        metrics.fingerprintChanges === 0 &&
        metrics.observerNotifications === 0 &&
        metrics.snapshots === 0
      );
    default:
      return false;
  }
}

function evaluate(
  snapshot: RuntimeSnapshot,
  metrics: RuntimeMetricsSnapshot,
): Readonly<RuntimeHealth> {
  const list: RuntimeDiagnostic[] = [];
  let warningCount = 0;
  let errorCount = 0;

  for (let i = 0; i < RULE_ORDER.length; i += 1) {
    const code = RULE_ORDER[i]!;
    if (!isTriggered(code, snapshot, metrics)) {
      continue;
    }
    const diagnostic = RuntimeDiagnosticBuilder.build(code);
    list.push(diagnostic);
    if (diagnostic.level === DiagnosticLevel.ERROR) {
      errorCount += 1;
    } else if (diagnostic.level === DiagnosticLevel.WARNING) {
      warningCount += 1;
    }
  }

  return Object.freeze({
    healthy: errorCount === 0,
    warningCount,
    errorCount,
    diagnostics: Object.freeze(list),
  });
}

export const RuntimeDiagnosticEngine = Object.freeze({
  evaluate,
});
