import {
  isTokenRef,
  primitive,
  resolvePrimitivePath,
  type TokenRef,
} from "../../foundation/tokens";

/**
 * Format a resolved primitive leaf as a CSS value string.
 * Pure — no DOM.
 */
export function formatPrimitiveCssValue(
  path: string,
  value: unknown,
): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    if (
      path.startsWith("spacing.") ||
      path.startsWith("radius.") ||
      path.includes(".fontSize.")
    ) {
      return `${value}px`;
    }
    if (path.startsWith("motion.duration.")) {
      return `${value}ms`;
    }
    return String(value);
  }

  throw new Error(
    `Cannot format primitive value at "${path}" as CSS (type ${typeof value})`,
  );
}

/**
 * Resolve a TokenRef to a CSS-ready string via primitive lookup.
 * Pure — no DOM / React / window.
 */
export function resolveTokenRef(ref: TokenRef): string {
  if (!isTokenRef(ref)) {
    throw new Error("Expected a TokenRef");
  }

  const value = resolvePrimitivePath(primitive, ref.path);
  if (value === undefined) {
    throw new Error(`TokenRef path does not resolve: ${ref.path}`);
  }

  return formatPrimitiveCssValue(ref.path, value);
}
