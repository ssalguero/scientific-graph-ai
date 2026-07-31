/**
 * UX-3.8 — Stateless ThemeRuntime inspection helpers (private).
 *
 * Static namespace only. Constructor remains implicit/private by convention;
 * class is never instantiated. No state, no caches, no memoization.
 */

import type { ThemeRuntime } from "../selectors/ThemeSelector";
import type {
  RuntimeSnapshot,
  SnapshotCompareResult,
} from "./RuntimeSnapshot";
import { SnapshotBuilder } from "./SnapshotBuilder";
import { compareSnapshots } from "./SnapshotComparator";

export class RuntimeInspector {
  static inspect(runtime: ThemeRuntime): RuntimeSnapshot {
    return SnapshotBuilder.build(runtime);
  }

  static snapshot(runtime: ThemeRuntime): RuntimeSnapshot {
    return SnapshotBuilder.build(runtime);
  }

  static compare(
    a: RuntimeSnapshot,
    b: RuntimeSnapshot,
  ): SnapshotCompareResult {
    return compareSnapshots(a, b);
  }
}

Object.freeze(RuntimeInspector);
