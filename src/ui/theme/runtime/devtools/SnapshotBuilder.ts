/**
 * UX-3.8 — Build immutable RuntimeSnapshot from ThemeRuntime (private).
 * UX-3.10 — Records snapshot metric (sole recordSnapshot site).
 *
 * SnapshotBuilder never freezes Runtime.
 * Snapshot contains only scalars.
 */

import { THEME_CONTRACT_VERSION } from "../../version";
import { runtimeFingerprint } from "../context/runtimeFingerprint";
import { RuntimeMetricsCollector } from "../metrics";
import type { ThemeRuntime } from "../selectors/ThemeSelector";
import type { RuntimeSnapshot } from "./RuntimeSnapshot";

/**
 * Leaf counter rules (frozen):
 * - primitive → +1
 * - null → +1
 * - undefined → +1
 * - object → recurse
 * - array → recurse items
 * - function → ignore
 * - symbol → ignore
 *
 * Traversal order MUST NOT affect the result.
 * No sorting required because only leaf totals are produced.
 */
function countLeaves(node: unknown): number {
  if (node === null || node === undefined) {
    return 1;
  }

  const t = typeof node;
  if (t === "string" || t === "number" || t === "boolean" || t === "bigint") {
    return 1;
  }

  if (t === "function" || t === "symbol") {
    return 0;
  }

  if (Array.isArray(node)) {
    let total = 0;
    for (const item of node) {
      total += countLeaves(item);
    }
    return total;
  }

  if (t === "object") {
    let total = 0;
    const keys = Object.keys(node as object);
    for (const key of keys) {
      total += countLeaves((node as Record<string, unknown>)[key]);
    }
    return total;
  }

  return 0;
}

function build(runtime: ThemeRuntime): RuntimeSnapshot {
  RuntimeMetricsCollector.recordSnapshot();

  const colorCount = countLeaves(runtime.colors);
  const typographyCount = countLeaves(runtime.typography);
  const spacingCount = countLeaves(runtime.spacing);
  const radiusCount = countLeaves(runtime.radius);
  const elevationCount = countLeaves(runtime.elevation);
  const motionCount = countLeaves(runtime.motion);
  const shadowsCount = countLeaves(runtime.shadows);
  const layoutCount = countLeaves(runtime.layout);

  const snapshot: RuntimeSnapshot = {
    fingerprint: runtimeFingerprint(runtime),
    themeName: "",
    version: THEME_CONTRACT_VERSION,
    tokenCount:
      colorCount +
      typographyCount +
      spacingCount +
      radiusCount +
      elevationCount +
      motionCount +
      shadowsCount +
      layoutCount,
    colorCount,
    typographyCount,
    spacingCount,
    radiusCount,
    elevationCount,
  };

  return Object.freeze(snapshot);
}

export const SnapshotBuilder = Object.freeze({
  build,
});
