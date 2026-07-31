/**
 * UX-3.8 — O(1) RuntimeSnapshot comparison (private).
 *
 * Domain count fields are informational only and MUST NOT participate in changed.
 */

import type {
  RuntimeSnapshot,
  SnapshotCompareResult,
} from "./RuntimeSnapshot";

export function compareSnapshots(
  a: RuntimeSnapshot,
  b: RuntimeSnapshot,
): SnapshotCompareResult {
  const fingerprintChanged = a.fingerprint !== b.fingerprint;
  const tokenCountChanged = a.tokenCount !== b.tokenCount;
  const metadataChanged =
    a.themeName !== b.themeName || a.version !== b.version;

  return Object.freeze({
    changed: fingerprintChanged || tokenCountChanged || metadataChanged,
    fingerprintChanged,
    tokenCountChanged,
    metadataChanged,
  });
}

export const SnapshotComparator = Object.freeze({
  compareSnapshots,
});
