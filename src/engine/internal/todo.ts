/**
 * ENGINE Domain — shared stub helper (ENGINE-internal).
 * Throws phased TODO errors so shells compile but cannot execute productively.
 */

/** @throws always — skeleton / not-yet-implemented marker */
export function engineNotImplemented(phase: string, name: string): never {
  throw new Error(`TODO ${phase}: not implemented — ${name}`);
}
