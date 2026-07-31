/**
 * UX-3.9 — Private Runtime Observer Registry (SSOT).
 *
 * Module-level Set only. No EventEmitter, timers, DOM, or React.
 */

import type { RuntimeObserver } from "./RuntimeObserver";

const observers = new Set<RuntimeObserver>();

function register(observer: RuntimeObserver): void {
  observers.add(observer);
}

function unregister(observer: RuntimeObserver): void {
  observers.delete(observer);
}

function notify(): void {
  for (const observer of observers) {
    try {
      observer.onRuntimeChanged();
    } catch {
      // ignore — one broken observer must not block the rest
    }
  }
}

function size(): number {
  return observers.size;
}

export const RuntimeObserverRegistry = Object.freeze({
  register,
  unregister,
  notify,
  size,
});
