/**
 * UX-3.2.2 — Pure Theme → ResolvedDesignTokens resolver.
 * UX-3.2.5 — TokenCache lookup/store + TokenValidation before cache.
 * UX-3.4.1 — Shared invariant domains via ResolverOptimization (private).
 * Public API unchanged: resolve(theme: ThemeId | ThemeMap): ResolvedDesignTokens
 */

import type { ThemeId } from "../../ids";
import { themes } from "../../maps";
import type { ThemeMap } from "../../types";
import type { ColorTokens } from "../contracts/ColorTokens";
import type { ElevationTokens } from "../contracts/ElevationTokens";
import type { ResolvedDesignTokens } from "../contracts/ResolvedDesignTokens";
import {
  getSharedInvariantDomains,
  resolveThemeableTree,
} from "./ResolverOptimization";
import { TokenCache } from "./TokenCache";
import {
  validateResolvedDesignTokens,
  type TokenValidationIssue,
} from "./TokenValidation";

function resolveThemeMap(theme: ThemeId | ThemeMap): ThemeMap {
  const map = typeof theme === "string" ? themes[theme] : theme;
  if (!map) {
    throw new Error(`Unknown theme: ${String(theme)}`);
  }
  return map;
}

function buildResolvedTokens(map: ThemeMap): ResolvedDesignTokens {
  const invariants = getSharedInvariantDomains();

  return {
    colors: resolveThemeableTree(map.color) as ColorTokens,
    typography: invariants.typography,
    spacing: invariants.spacing,
    radius: invariants.radius,
    motion: invariants.motion,
    shadows: invariants.shadows,
    elevation: resolveThemeableTree(map.elevation) as ElevationTokens,
    layout: invariants.layout,
  };
}

function formatValidationIssues(issues: readonly TokenValidationIssue[]): string {
  return issues
    .map((issue) => {
      if (issue.kind === "MissingToken") {
        return `${issue.kind}@${issue.path}`;
      }
      return `${issue.kind}@${issue.path}: ${issue.detail}`;
    })
    .join("; ");
}

/** Resolve a ThemeId or ThemeMap to typed design tokens. Pure. */
export function resolve(theme: ThemeId | ThemeMap): ResolvedDesignTokens {
  const cached = TokenCache.get(theme);
  if (cached) {
    return cached;
  }

  const map = resolveThemeMap(theme);
  const tokens = buildResolvedTokens(map);

  const issues = validateResolvedDesignTokens(tokens);
  if (issues.length > 0) {
    throw new Error(
      `Invalid ResolvedDesignTokens: ${formatValidationIssues(issues)}`,
    );
  }

  return TokenCache.set(theme, tokens);
}

export const ThemeTokenResolver = {
  resolve,
} as const;
