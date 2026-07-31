/**
 * Pure immutable theme utilities.
 * deepMergeTheme merges only themeable domains (color, focus, elevation).
 */
import type { ThemeId } from "../ids";
import type { ThemeMap } from "../types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepCloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepCloneValue(item)) as T;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = deepCloneValue(child);
    }
    return out as T;
  }
  return value;
}

function deepFreezeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreezeValue(item);
    }
    return Object.freeze(value);
  }
  if (isPlainObject(value)) {
    for (const child of Object.values(value)) {
      deepFreezeValue(child);
    }
    return Object.freeze(value);
  }
  return value;
}

function deepMergeObjects(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...deepCloneValue(base) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const current = result[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = deepMergeObjects(current, value);
    } else {
      result[key] = deepCloneValue(value);
    }
  }
  return result;
}

/** Structural clone of a ThemeMap (immutable toward the input). */
export function cloneTheme(theme: ThemeMap): ThemeMap {
  return deepCloneValue(theme);
}

/** Deep-freeze a clone of the theme (input is not mutated). */
export function freezeTheme(theme: ThemeMap): Readonly<ThemeMap> {
  return deepFreezeValue(deepCloneValue(theme));
}

export type ThemeableOverride = {
  readonly id?: ThemeId;
  readonly color?: ThemeMap["color"];
  readonly focus?: ThemeMap["focus"];
  readonly elevation?: ThemeMap["elevation"];
};

/**
 * Deep-merge only themeable properties onto a cloned base.
 * Never merges Foundation invariants (spacing, typography, radius, motion, …).
 */
export function deepMergeTheme(
  base: ThemeMap,
  override: ThemeableOverride,
): ThemeMap {
  const next: ThemeMap = {
    id: override.id ?? base.id,
    color: override.color
      ? (deepMergeObjects(
          base.color as unknown as Record<string, unknown>,
          override.color as unknown as Record<string, unknown>,
        ) as ThemeMap["color"])
      : deepCloneValue(base.color),
    focus: override.focus
      ? (deepMergeObjects(
          base.focus as unknown as Record<string, unknown>,
          override.focus as unknown as Record<string, unknown>,
        ) as ThemeMap["focus"])
      : deepCloneValue(base.focus),
    elevation: override.elevation
      ? (deepMergeObjects(
          base.elevation as unknown as Record<string, unknown>,
          override.elevation as unknown as Record<string, unknown>,
        ) as ThemeMap["elevation"])
      : deepCloneValue(base.elevation),
  };
  return next;
}

/** Normalize by cloning themeable domains into a plain ThemeMap. */
export function normalizeTheme(theme: ThemeMap): ThemeMap {
  return {
    id: theme.id,
    color: deepCloneValue(theme.color),
    focus: deepCloneValue(theme.focus),
    elevation: deepCloneValue(theme.elevation),
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`)
    .join(",")}}`;
}

/** Structural equality of themeable ThemeMap fields. */
export function compareThemes(a: ThemeMap, b: ThemeMap): boolean {
  return (
    a.id === b.id &&
    stableStringify(a.color) === stableStringify(b.color) &&
    stableStringify(a.focus) === stableStringify(b.focus) &&
    stableStringify(a.elevation) === stableStringify(b.elevation)
  );
}
