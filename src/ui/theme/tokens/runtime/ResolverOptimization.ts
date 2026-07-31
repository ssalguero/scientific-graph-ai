/**
 * UX-3.4.1 — Private resolver optimization helpers.
 * Not exported from any barrel.
 *
 * Shared invariant domains MUST be initialized lazily exactly once per process
 * and frozen before reuse.
 */

import { isTokenRef, primitive, semantic } from "../../../foundation/tokens";
import { resolveTokenRef } from "../../css/resolve-token-ref";
import type { LayoutTokens } from "../contracts/LayoutTokens";
import type { MotionTokens } from "../contracts/MotionTokens";
import type { RadiusTokens } from "../contracts/RadiusTokens";
import type { ShadowTokens } from "../contracts/ShadowTokens";
import type { SpacingTokens } from "../contracts/SpacingTokens";
import type { TypographyTokens } from "../contracts/TypographyTokens";

/** Private leaf memo: TokenRef path → resolved CSS string. */
const leafMemo = new Map<string, string>();

/**
 * Deep-freeze a value graph. Safe on already-frozen subtrees.
 * Private — shared with invariant domain init only.
 */
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
 * Resolve a TokenRef leaf with optional path memo.
 * Transparent: same CSS strings as resolveTokenRef.
 */
function resolveLeaf(node: { readonly path: string }): string {
  const cached = leafMemo.get(node.path);
  if (cached !== undefined) {
    return cached;
  }
  const value = resolveTokenRef(node as Parameters<typeof resolveTokenRef>[0]);
  leafMemo.set(node.path, value);
  return value;
}

/**
 * Walk a TokenRef tree into a new nested object of resolved CSS-ready strings.
 * Never mutates the source; never aliases Foundation / ThemeMap nodes.
 */
export function resolveThemeableTree(node: unknown): unknown {
  if (isTokenRef(node)) {
    return resolveLeaf(node);
  }

  if (node === null || typeof node !== "object") {
    return node;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    out[key] = resolveThemeableTree(value);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Shared invariant domains — lazy once per process, frozen before reuse      */
/* -------------------------------------------------------------------------- */

type InvariantDomains = {
  readonly typography: TypographyTokens;
  readonly spacing: SpacingTokens;
  readonly radius: RadiusTokens;
  readonly motion: MotionTokens;
  readonly shadows: ShadowTokens;
  readonly layout: LayoutTokens;
};

let invariantDomains: InvariantDomains | null = null;

function buildInvariantDomains(): InvariantDomains {
  const typography = resolveThemeableTree(
    semantic.typography,
  ) as TypographyTokens;
  const spacing = resolveThemeableTree(semantic.spacing) as SpacingTokens;
  const radius = resolveThemeableTree(semantic.radius) as RadiusTokens;
  const motion = resolveThemeableTree(semantic.motion) as MotionTokens;

  const shadows: ShadowTokens = {
    none: primitive.shadow.none,
    sm: primitive.shadow.sm,
    md: primitive.shadow.md,
    lg: primitive.shadow.lg,
    xl: primitive.shadow.xl,
  };

  const layout: LayoutTokens = {};

  return deepFreeze({
    typography,
    spacing,
    radius,
    motion,
    shadows,
    layout,
  });
}

/**
 * Shared invariant domains: lazy init exactly once per process, frozen.
 * All subsequent resolve() misses reuse these exact references.
 */
export function getSharedInvariantDomains(): InvariantDomains {
  if (invariantDomains === null) {
    invariantDomains = buildInvariantDomains();
  }
  return invariantDomains;
}

/** Frozen empty layout singleton (alias of shared layout). */
export function getEmptyLayout(): LayoutTokens {
  return getSharedInvariantDomains().layout;
}
