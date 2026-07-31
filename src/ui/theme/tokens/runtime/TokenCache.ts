/**
 * UX-3.2.3 — Immutable cache for ResolvedDesignTokens.
 * UX-3.4.2 — WeakMap fingerprint memo (non-semantic) + skip redundant freeze.
 * Optimization only — no resolution, validation, React, DOM, or CSS.
 *
 * WeakMap entries are an optimization only and MUST NOT participate in
 * observable cache semantics. The string-key Map is the sole source of truth.
 */

import type { ThemeId } from "../../ids";
import type { ThemeMap } from "../../types";
import type { ResolvedDesignTokens } from "../contracts/ResolvedDesignTokens";

/** Sole source of observable cache semantics. */
const store = new Map<string, ResolvedDesignTokens>();

/**
 * Optional fingerprint memo for ad-hoc ThemeMap objects.
 * Miss / GC / unused → fall back to full fingerprint; same observable result.
 */
const fingerprintMemo = new WeakMap<object, string>();

/** Deep-freeze a value graph. Safe on already-frozen subtrees. */
function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value as object)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}

/**
 * True when the entire object graph is already frozen (no walk needed).
 */
function isFullyFrozen(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return true;
  }
  if (!Object.isFrozen(value)) {
    return false;
  }
  for (const child of Object.values(value as object)) {
    if (!isFullyFrozen(child)) {
      return false;
    }
  }
  return true;
}

/**
 * Stable private key for an ad-hoc ThemeMap (not part of the public API).
 * Fingerprints id + TokenRef paths without importing Foundation.
 */
function fingerprintThemeMap(map: ThemeMap): string {
  const parts: string[] = [map.id];

  const walk = (node: unknown): void => {
    if (node === null || typeof node !== "object") {
      return;
    }

    const record = node as Record<string, unknown>;
    if (
      typeof record.path === "string" &&
      record.__brand === "TokenRef"
    ) {
      parts.push(record.path);
      return;
    }

    for (const child of Object.values(record)) {
      walk(child);
    }
  };

  walk(map.color);
  walk(map.focus);
  walk(map.elevation);

  return parts.join("\0");
}

function toCacheKey(theme: ThemeId | ThemeMap): string {
  if (typeof theme === "string") {
    return theme;
  }

  // WeakMap is non-semantic: miss → same fingerprint as without memo.
  const memoized = fingerprintMemo.get(theme);
  if (memoized !== undefined) {
    return `adhoc:${memoized}`;
  }

  const fingerprint = fingerprintThemeMap(theme);
  fingerprintMemo.set(theme, fingerprint);
  return `adhoc:${fingerprint}`;
}

export const TokenCache = {
  has(theme: ThemeId | ThemeMap): boolean {
    return store.has(toCacheKey(theme));
  },

  get(theme: ThemeId | ThemeMap): ResolvedDesignTokens | undefined {
    return store.get(toCacheKey(theme));
  },

  /**
   * Deep-freeze via private deepFreeze() and store. Returns the frozen reference.
   * Skips redundant freeze walks when the graph is already fully frozen.
   */
  set(
    theme: ThemeId | ThemeMap,
    tokens: ResolvedDesignTokens,
  ): ResolvedDesignTokens {
    const frozen = isFullyFrozen(tokens) ? tokens : deepFreeze(tokens);
    store.set(toCacheKey(theme), frozen);
    return frozen;
  },

  clear(): void {
    // Observable reset: drop string store. WeakMap entries become unreachable
    // with ThemeMap GC; they never alter which tokens are returned.
    store.clear();
  },
} as const;
