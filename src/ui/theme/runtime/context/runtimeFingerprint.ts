/**
 * UX-3.7 — Semantic fingerprint for ThemeRuntime (private).
 *
 * Fingerprint answers only: does this ThemeRuntime represent exactly the
 * same Design Tokens? Never depends on object identity, WeakMap ids,
 * references, timestamps, caches, or ephemeral values.
 */

import type { ThemeRuntime } from "../selectors/ThemeSelector";

export type RuntimeFingerprint = string;

const DOMAIN_KEYS = [
  "colors",
  "typography",
  "spacing",
  "radius",
  "motion",
  "shadows",
  "elevation",
  "layout",
] as const;

/** Append logical content of a value graph (primitives + sorted keys). */
function walk(node: unknown, parts: string[]): void {
  if (node === null) {
    parts.push("null");
    return;
  }
  if (node === undefined) {
    parts.push("undefined");
    return;
  }

  const t = typeof node;
  if (t === "string" || t === "number" || t === "boolean" || t === "bigint") {
    parts.push(t, String(node));
    return;
  }

  if (Array.isArray(node)) {
    parts.push("[");
    for (const item of node) {
      walk(item, parts);
    }
    parts.push("]");
    return;
  }

  if (t === "object") {
    const keys = Object.keys(node as object).sort();
    parts.push("{");
    for (const key of keys) {
      parts.push(key);
      walk((node as Record<string, unknown>)[key], parts);
    }
    parts.push("}");
  }
}

/**
 * Semantic fingerprint of ThemeRuntime content.
 * Same logical Design Tokens ⇒ same fingerprint string.
 */
export function runtimeFingerprint(runtime: ThemeRuntime): RuntimeFingerprint {
  const parts: string[] = [];
  for (const key of DOMAIN_KEYS) {
    parts.push(key);
    walk(runtime[key], parts);
  }
  return parts.join("\0");
}
