/**
 * UX-3.12 — Sole constructor for composed RuntimeHealth (private).
 *
 * API: create(snapshot, metrics) only.
 * Reuses metrics and diagnostics array references — never clones.
 *
 * generatedAt = Date.now() is BUILD METADATA ONLY and must not participate
 * in fingerprint, diagnostics, equality, comparisons, or future health diffs.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import { RuntimeDiagnosticEngine } from "../diagnostics/RuntimeDiagnosticEngine";
import type { RuntimeHealth as DiagnosticAggregate } from "../diagnostics/RuntimeHealth";
import type { RuntimeHealth } from "./RuntimeHealth";
import { RuntimeHealthStatus } from "./RuntimeHealthStatus";

function create(
  snapshot: RuntimeSnapshot,
  metrics: RuntimeMetricsSnapshot,
): Readonly<RuntimeHealth> {
  const aggregate: DiagnosticAggregate = RuntimeDiagnosticEngine.evaluate(
    snapshot,
    metrics,
  );
  const result: RuntimeHealth = {
    fingerprint: snapshot.fingerprint,
    version: snapshot.version,
    diagnostics: aggregate.diagnostics,
    metrics,
    status: RuntimeHealthStatus.status(
      aggregate.errorCount,
      aggregate.warningCount,
    ),
    generatedAt: Date.now(),
  };
  return Object.freeze(result);
}

export const RuntimeHealthBuilder = Object.freeze({
  create,
});
