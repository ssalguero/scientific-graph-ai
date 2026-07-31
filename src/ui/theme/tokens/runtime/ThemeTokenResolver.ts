/**
 * UX-3.2.2 — Pure Theme → ResolvedDesignTokens resolver.
 * No DOM, CSS variables, React, cache, or validation.
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

/** Resolve a ThemeId or ThemeMap to typed design tokens. Pure. */
export function resolve(theme: ThemeId | ThemeMap): ResolvedDesignTokens {
  const map = resolveThemeMap(theme);

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

export const ThemeTokenResolver = {
  resolve,
} as const;
