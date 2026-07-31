/**
 * UX-3.9 — Pure fingerprint-gated Runtime change notifier (private).
 * UX-3.10 — Records fingerprint / observer-notification metrics (private).
 *
 * Stateless: no Runtime, fingerprints, snapshots, WeakMaps, caches, or refs.
 */

import { RuntimeMetricsCollector } from "../metrics";
import { RuntimeObserverRegistry } from "./RuntimeObserverRegistry";

function notifyIfChanged(
  previousFingerprint: string | null | undefined,
  nextFingerprint: string,
): void {
  if (previousFingerprint === nextFingerprint) {
    return;
  }
  RuntimeMetricsCollector.recordFingerprintChange();
  RuntimeMetricsCollector.recordObserverNotifications(
    RuntimeObserverRegistry.size(),
  );
  RuntimeObserverRegistry.notify();
}

export const RuntimeNotifier = Object.freeze({
  notifyIfChanged,
});
