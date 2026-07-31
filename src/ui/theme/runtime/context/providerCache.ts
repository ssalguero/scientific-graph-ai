/**
 * UX-3.7 — Private identity reuse registry (fingerprint → runtime reference).
 *
 * Lives above TokenCache. Never builds, resolves, or mutates ThemeRuntime.
 * Not a second semantic token cache — only reuses already-resolved references.
 */

import type { ThemeRuntime } from "../selectors/ThemeSelector";
import type { RuntimeFingerprint } from "./runtimeFingerprint";

/** Fingerprint → already-resolved ThemeRuntime reference (identity reuse only). */
const runtimeByFingerprint = new Map<RuntimeFingerprint, ThemeRuntime>();

export function hasRuntime(fp: RuntimeFingerprint): boolean {
  return runtimeByFingerprint.has(fp);
}

export function getRuntime(
  fp: RuntimeFingerprint,
): ThemeRuntime | undefined {
  return runtimeByFingerprint.get(fp);
}

/** Register an already-resolved runtime for reference reuse. */
export function setRuntime(
  fp: RuntimeFingerprint,
  runtime: ThemeRuntime,
): void {
  if (!runtimeByFingerprint.has(fp)) {
    runtimeByFingerprint.set(fp, runtime);
  }
}

/** Test/gate helper — clears identity reuse registry only (not TokenCache). */
export function clearProviderCache(): void {
  runtimeByFingerprint.clear();
}
