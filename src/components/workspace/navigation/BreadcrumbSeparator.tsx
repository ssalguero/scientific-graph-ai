import { NAVIGATION_TOKENS } from "./navigationTokens";

/**
 * UX-2.24 — Visual breadcrumb separator.
 * No props. Renders glyph from tokens only. API frozen after UX-2.24.
 */
export function BreadcrumbSeparator() {
  const className = [
    NAVIGATION_TOKENS.fontSize,
    NAVIGATION_TOKENS.separatorColor,
    NAVIGATION_TOKENS.separatorGap,
  ].join(" ");

  return (
    <span className={className} aria-hidden>
      {NAVIGATION_TOKENS.separator.glyph}
    </span>
  );
}
