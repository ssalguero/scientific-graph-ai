/**
 * UX-3.7 — Private identity helpers (WeakMap memo of semantic fingerprints).
 *
 * Identity cache only memoizes fingerprint computation for a given runtime
 * object. It never constructs or mutates ThemeRuntime. Not part of public API.
 */

import type { ThemeRuntime } from "../selectors/ThemeSelector";
import {
  runtimeFingerprint,
  type RuntimeFingerprint,
} from "./runtimeFingerprint";

/** WeakMap<ThemeRuntime, Fingerprint> — recompute avoidance only. */
const fingerprintByRuntime = new WeakMap<object, RuntimeFingerprint>();

/**
 * Return the semantic fingerprint for a ThemeRuntime, memoized per object.
 * Memo is non-semantic (same object ⇒ skip walk); fingerprint value is semantic.
 */
export function runtimeIdentity(runtime: ThemeRuntime): RuntimeFingerprint {
  const memoized = fingerprintByRuntime.get(runtime);
  if (memoized !== undefined) {
    return memoized;
  }
  const fp = runtimeFingerprint(runtime);
  fingerprintByRuntime.set(runtime, fp);
  return fp;
}
