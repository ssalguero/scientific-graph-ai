import type { TypographyScale } from "../types/primitive";

/**
 * Typography primitive scales — ux/docs/TYPOGRAPHY.md
 * Sizes in px; line heights unitless; letter spacing as CSS strings.
 */
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: "ui-monospace, SFMono-Regular, Consolas, Monaco, monospace",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSize: {
    headingXl: 32,
    headingLg: 28,
    headingMd: 24,
    headingSm: 20,
    section: 18,
    bodyLg: 16,
    body: 14,
    bodySm: 13,
    label: 13,
    labelSm: 12,
    caption: 12,
    captionXs: 11,
    code: 13,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    default: "0",
    heading: "-0.01em",
    caps: "0.04em",
  },
} as const satisfies TypographyScale;
