# TYPOGRAPHY.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31


1. Philosophy

Scientific Graph AI prioritizes:

readability over decoration
information density
numerical precision
consistency
accessibility
scientific workflows

Typography is therefore intentionally conservative.

No display fonts.

No decorative styles.

The interface should feel closer to professional scientific software than consumer applications.

Examples:

MATLAB
Figma
Linear
VSCode
Bloomberg Terminal (modernized)
2. Font Stack
Primary Font
Inter

Fallbacks

system-ui,
-apple-system,
BlinkMacSystemFont,
"Segoe UI",
Roboto,
Helvetica,
Arial,
sans-serif

Never mix fonts.

Entire application uses one family.

3. Font Weights
Token	Weight
regular	400
medium	500
semibold	600
bold	700

No font-weight 800+

No thin fonts.

4. Font Sizes
Display

Not currently used.

Reserved for future marketing pages.

Headings
Token	Size	Weight	Line Height
text-heading-xl	32px	700	40px
text-heading-lg	28px	700	36px
text-heading-md	24px	600	32px
text-heading-sm	20px	600	28px
Section Titles
Token	Size
text-section	18px

Weight

600

Body
Token	Size
text-body-lg	16px
text-body	14px
text-body-sm	13px

Weights

400

UI Labels
Token	Size
text-label	13px
text-label-sm	12px

Weight

500

Captions
Token	Size
text-caption	12px
text-caption-xs	11px
Code
13px

Monospace stack

ui-monospace,
SFMono-Regular,
Consolas,
Monaco,
monospace
5. Line Heights
Token	Value
tight	1.2
normal	1.4
relaxed	1.6

Usage

Headings

tight

Body

normal

Documentation

relaxed
6. Letter Spacing

Default

0

Headings

-0.01em

Caps

0.04em
7. Typography Tokens
text-heading-xl

text-heading-lg

text-heading-md

text-heading-sm

text-section

text-body-lg

text-body

text-body-sm

text-label

text-label-sm

text-caption

text-caption-xs

text-code
8. Semantic Usage
Window Title
text-section
600
Panel Title
text-label
600
Toolbar
text-label
500
Inspector

Labels

text-label-sm

Values

text-body-sm
Dialog

Title

text-heading-sm

Body

text-body
Menu

Items

text-body-sm

Shortcut

text-code
Table

Header

text-label

Cell

text-body-sm

Numeric

text-code
Charts

Axis Labels

text-caption

Legend

text-label-sm

Tooltip

text-body-sm
9. Responsive Rules

Do not scale typography aggressively.

Desktop-first application.

Minimum desktop width:

1280px

Scaling policy:

small labels remain fixed
body remains fixed
only headings may scale
10. Accessibility

Minimum body size

14px

Minimum label size

12px

Minimum contrast

WCAG AA

Avoid:

light gray body text
low contrast captions
ultra-thin fonts
11. Implementation Tokens

Example

export const typography = {
  headingXL: {
    size: 32,
    weight: 700,
    lineHeight: 40,
  },

  headingLG: {
    size: 28,
    weight: 700,
    lineHeight: 36,
  },

  headingMD: {
    size: 24,
    weight: 600,
    lineHeight: 32,
  },

  headingSM: {
    size: 20,
    weight: 600,
    lineHeight: 28,
  },

  section: {
    size: 18,
    weight: 600,
    lineHeight: 26,
  },

  body: {
    size: 14,
    weight: 400,
    lineHeight: 20,
  },

  bodySmall: {
    size: 13,
    weight: 400,
    lineHeight: 18,
  },

  label: {
    size: 13,
    weight: 500,
    lineHeight: 18,
  },

  labelSmall: {
    size: 12,
    weight: 500,
    lineHeight: 16,
  },

  caption: {
    size: 12,
    weight: 400,
    lineHeight: 16,
  },

  code: {
    size: 13,
    weight: 400,
    lineHeight: 18,
  },
};
12. Governance Rules

Typography must follow these invariants:

Single font family across the application.
Only approved typography tokens may be used.
No hardcoded font sizes in components.
No font weights outside the approved set (400, 500, 600, 700).
Body text must never be smaller than 14px.
Labels must never be smaller than 12px.
Monospace typography is reserved exclusively for code, formulas, numeric values, and technical identifiers.
Typography tokens must be consumed through the Design System, never declared inline.
Any new typography token requires an update to TYPOGRAPHY.md and approval through the UX governance process.
13. Future Evolution

Reserved for UX-4:

Variable font support
Density-aware typography
Presentation mode scaling
High-DPI optimization
User-configurable font scaling
International typography adjustments (CJK/RTL)
Print/export typography profiles