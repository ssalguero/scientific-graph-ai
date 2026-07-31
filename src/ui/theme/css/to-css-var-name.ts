/**
 * Convert camelCase / Pascal segments to kebab-case.
 * e.g. ringColor → ring-color, headingMd → heading-md
 */
function toKebab(segment: string): string {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

/**
 * Semantic path → public CSS custom property name.
 * Part of the Theme Contract — renaming is a breaking change.
 *
 * Examples:
 *   color.surface.default → --color-surface-default
 *   focus.ringColor → --focus-ring-color
 *   typography.headingMd.fontSize → --typography-heading-md-font-size
 */
export function toCssVarName(semanticPath: string): string {
  const segments = semanticPath.split(".").filter(Boolean).map(toKebab);
  return `--${segments.join("-")}`;
}
