/**
 * UX-3.12 — Pure RuntimeHealth reporter facade (private).
 *
 * API: build(snapshot, metrics) only.
 * Delegates to RuntimeHealthBuilder.create. No state, cache, or singleton storage.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import { RuntimeHealthBuilder } from "./RuntimeHealthBuilder";
import type { RuntimeHealth } from "./RuntimeHealth";

function build(
  snapshot: RuntimeSnapshot,
  metrics: RuntimeMetricsSnapshot,
): Readonly<RuntimeHealth> {
  return RuntimeHealthBuilder.create(snapshot, metrics);
}

export const RuntimeHealthReporter = Object.freeze({
  build,
});
