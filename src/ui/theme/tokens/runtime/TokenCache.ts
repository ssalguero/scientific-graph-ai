/**
 * UX-3.2.3 — Immutable cache for ResolvedDesignTokens.
 * Optimization only — no resolution, validation, React, DOM, or CSS.
 */

import type { ThemeId } from "../../ids";
import type { ThemeMap } from "../../types";
import type { ResolvedDesignTokens } from "../contracts/ResolvedDesignTokens";

const store = new Map<string, ResolvedDesignTokens>();

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
  return `adhoc:${fingerprintThemeMap(theme)}`;
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
   * Not wired to ThemeTokenResolver in UX-3.2.3 — consumers call set explicitly.
   */
  set(
    theme: ThemeId | ThemeMap,
    tokens: ResolvedDesignTokens,
  ): ResolvedDesignTokens {
    const frozen = deepFreeze(tokens);
    store.set(toCacheKey(theme), frozen);
    return frozen;
  },

  clear(): void {
    store.clear();
  },
} as const;
