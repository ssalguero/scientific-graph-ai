/**
 * D54.2 — Layout constraints helpers (pure).
 * No React. No DOM. No side effects.
 */
import type { LayoutConstraints } from "./types";
import { isFiniteNumber } from "./LayoutUtils";

export function createDefaultConstraints(
  overrides: Partial<LayoutConstraints> = {}
): LayoutConstraints {
  return {
    minWidth: overrides.minWidth,
    maxWidth: overrides.maxWidth,
    minHeight: overrides.minHeight,
    maxHeight: overrides.maxHeight,
    collapsed: overrides.collapsed ?? false,
    locked: overrides.locked ?? false,
  };
}

/**
 * Validates constraint shape and numeric consistency (min <= max when both set).
 * Does not mutate input.
 */
export function validateConstraints(
  constraints: unknown
): constraints is LayoutConstraints {
  if (constraints === null || typeof constraints !== "object") {
    return false;
  }

  const c = constraints as Record<string, unknown>;

  if (typeof c.collapsed !== "boolean" || typeof c.locked !== "boolean") {
    return false;
  }

  for (const key of ["minWidth", "maxWidth", "minHeight", "maxHeight"] as const) {
    if (key in c && c[key] !== undefined && !isFiniteNumber(c[key])) {
      return false;
    }
  }

  const minWidth = c.minWidth as number | undefined;
  const maxWidth = c.maxWidth as number | undefined;
  const minHeight = c.minHeight as number | undefined;
  const maxHeight = c.maxHeight as number | undefined;

  if (
    isFiniteNumber(minWidth) &&
    isFiniteNumber(maxWidth) &&
    minWidth > maxWidth
  ) {
    return false;
  }

  if (
    isFiniteNumber(minHeight) &&
    isFiniteNumber(maxHeight) &&
    minHeight > maxHeight
  ) {
    return false;
  }

  return true;
}

/**
 * Returns a normalized copy of constraints (defaults collapsed/locked).
 * Never mutates the input.
 */
export function normalizeConstraints(
  constraints: LayoutConstraints
): LayoutConstraints {
  const next: LayoutConstraints = {
    collapsed: constraints.collapsed === true,
    locked: constraints.locked === true,
  };

  if (isFiniteNumber(constraints.minWidth)) {
    next.minWidth = constraints.minWidth;
  }
  if (isFiniteNumber(constraints.maxWidth)) {
    next.maxWidth = constraints.maxWidth;
  }
  if (isFiniteNumber(constraints.minHeight)) {
    next.minHeight = constraints.minHeight;
  }
  if (isFiniteNumber(constraints.maxHeight)) {
    next.maxHeight = constraints.maxHeight;
  }

  return next;
}
