/**
 * UX-3.7 — Stability rule for ThemeRuntime references (private).
 *
 * same fingerprint      ⇒ same runtime reference
 * different fingerprint ⇒ different resolved runtime (TokenCache-built)
 *
 * Never creates an artificial ThemeRuntime.
 */

import type { ThemeRuntime } from "../selectors/ThemeSelector";
import { getRuntime, setRuntime } from "./providerCache";
import { runtimeIdentity } from "./runtimeIdentity";

/**
 * Stabilize a TokenCache-resolved ThemeRuntime reference.
 * `next` must already be built by TokenCache / resolve — never synthesized here.
 */
export function stableRuntime(
  next: ThemeRuntime,
  previous?: ThemeRuntime | null,
): ThemeRuntime {
  const nextFp = runtimeIdentity(next);

  if (previous != null && runtimeIdentity(previous) === nextFp) {
    return previous;
  }

  const cached = getRuntime(nextFp);
  if (cached !== undefined) {
    return cached;
  }

  setRuntime(nextFp, next);
  return next;
}
