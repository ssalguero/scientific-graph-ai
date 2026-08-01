/**
 * UX-3.16 — Runtime report composition types (private).
 *
 * RuntimeReportSnapshot is an immutable composition snapshot.
 * It is NOT a historical log — no history, no retention of past builds.
 * No timestamp — final report contract of three frozen references only.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import type { RuntimeHealth } from "../health/RuntimeHealth";

export interface RuntimeReportSnapshot {
  readonly runtime: RuntimeSnapshot;
  readonly metrics: RuntimeMetricsSnapshot;
  readonly health: RuntimeHealth;
}
