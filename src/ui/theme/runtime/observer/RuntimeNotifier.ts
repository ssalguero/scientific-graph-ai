/**
 * UX-3.9 — Pure fingerprint-gated Runtime change notifier (private).
 *
 * Stateless: no Runtime, fingerprints, snapshots, WeakMaps, caches, or refs.
 */

import { RuntimeObserverRegistry } from "./RuntimeObserverRegistry";

function notifyIfChanged(
  previousFingerprint: string | null | undefined,
  nextFingerprint: string,
): void {
  if (previousFingerprint === nextFingerprint) {
    return;
  }
  RuntimeObserverRegistry.notify();
}

export const RuntimeNotifier = Object.freeze({
  notifyIfChanged,
});
