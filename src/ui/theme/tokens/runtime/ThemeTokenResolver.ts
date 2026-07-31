/**
 * UX-3.2.2 — Pure Theme → ResolvedDesignTokens resolver.
 * UX-3.2.5 — TokenCache lookup/store + TokenValidation before cache.
 * Public API unchanged: resolve(theme: ThemeId | ThemeMap): ResolvedDesignTokens
 */

import { isTokenRef, primitive, semantic } from "../../../foundation/tokens";
import { resolveTokenRef } from "../../css/resolve-token-ref";
import type { ThemeId } from "../../ids";
import { themes } from "../../maps";
import type { ThemeMap } from "../../types";
import type { ColorTokens } from "../contracts/ColorTokens";
import type { ElevationTokens } from "../contracts/ElevationTokens";
import type { LayoutTokens } from "../contracts/LayoutTokens";
import type { MotionTokens } from "../contracts/MotionTokens";
import type { RadiusTokens } from "../contracts/RadiusTokens";
import type { ResolvedDesignTokens } from "../contracts/ResolvedDesignTokens";
import type { ShadowTokens } from "../contracts/ShadowTokens";
import type { SpacingTokens } from "../contracts/SpacingTokens";
import type { TypographyTokens } from "../contracts/TypographyTokens";
import { TokenCache } from "./TokenCache";
import {
  validateResolvedDesignTokens,
  type TokenValidationIssue,
} from "./TokenValidation";

/**
 * Walk a TokenRef tree into a new nested object of resolved CSS-ready strings.
 * Never mutates the source; never aliases Foundation / ThemeMap nodes.
 */
function resolveTree(node: unknown): unknown {
  if (isTokenRef(node)) {
    return resolveTokenRef(node);
  }

  if (node === null || typeof node !== "object") {
    return node;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    out[key] = resolveTree(value);
  }
  return out;
}

function resolveThemeMap(theme: ThemeId | ThemeMap): ThemeMap {
  const map = typeof theme === "string" ? themes[theme] : theme;
  if (!map) {
    throw new Error(`Unknown theme: ${String(theme)}`);
  }
  return map;
}

function resolveShadows(): ShadowTokens {
  return {
    none: primitive.shadow.none,
    sm: primitive.shadow.sm,
    md: primitive.shadow.md,
    lg: primitive.shadow.lg,
    xl: primitive.shadow.xl,
  };
}

function resolveLayout(): LayoutTokens {
  return {};
}

function buildResolvedTokens(map: ThemeMap): ResolvedDesignTokens {
  return {
    colors: resolveTree(map.color) as ColorTokens,
    typography: resolveTree(semantic.typography) as TypographyTokens,
    spacing: resolveTree(semantic.spacing) as SpacingTokens,
    radius: resolveTree(semantic.radius) as RadiusTokens,
    motion: resolveTree(semantic.motion) as MotionTokens,
    shadows: resolveShadows(),
    elevation: resolveTree(map.elevation) as ElevationTokens,
    layout: resolveLayout(),
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
