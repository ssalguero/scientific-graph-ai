# COLOR_TOKENS.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

Color Tokens
Purpose

This document defines the official color token architecture used across Scientific Graph AI.

The goal is to ensure:

Single Source of Truth
predictable theming
accessibility
semantic colors instead of hardcoded values
future Dark/Light themes
future branding updates
component consistency

No component should use raw colors directly.

Token Hierarchy

The color system follows four abstraction layers.

Primitive Colors
        ↓
Semantic Tokens
        ↓
Component Tokens
        ↓
UI Components
Layer 1 — Primitive Colors

Primitive colors represent the raw palette.

These values should almost never be referenced directly by components.

Example:

Slate 50
Slate 100
Slate 200
Slate 300
...

Blue 500

Green 500

Red 500

Amber 500

Example naming:

--color-slate-50
--color-slate-100
--color-slate-200

--color-blue-500

--color-green-500

--color-red-500
Layer 2 — Semantic Tokens

Semantic tokens describe meaning.

Never use primitive colors inside components.

Instead use semantic variables.

Examples:

Surface

Background

Foreground

Border

Primary

Secondary

Muted

Success

Warning

Danger

Info

Example:

surface-default

surface-elevated

surface-overlay

text-primary

text-secondary

text-muted

border-default

border-subtle

accent-primary

accent-hover

success

warning

danger
Layer 3 — Component Tokens

Component tokens adapt semantic colors to specific components.

Example:

Button Background

Button Hover

Button Border

Button Text

Another example:

Panel Header

Panel Border

Panel Background

Inspector Divider

These tokens isolate component styling from the semantic palette.

Layer 4 — Component Usage

Components never contain hex values.

Good:

Button
    ↓
button-background
        ↓
accent-primary
            ↓
blue-500

Bad:

Button

background:

#3B82F6
Token Categories
Surface
surface-canvas

surface-default

surface-raised

surface-overlay

surface-floating

surface-inverse
Text
text-primary

text-secondary

text-muted

text-disabled

text-inverse
Border
border-default

border-muted

border-focus

border-danger
Brand
brand-primary

brand-secondary

brand-hover

brand-active
Feedback
success

warning

danger

info
Charts

Scientific Graph AI requires dedicated visualization colors.

Example:

chart-series-1

chart-series-2

chart-series-3

...

chart-selection

chart-hover

chart-grid

chart-axis

chart-background

These colors are independent from application branding.

Workspace

Workspace-specific colors.

workspace-background

workspace-grid

workspace-selection

workspace-highlight

workspace-drop-zone
Window System
window-background

window-header

window-border

window-shadow

window-active

window-inactive
Panels
panel-background

panel-header

panel-divider

panel-border
Inputs
input-background

input-border

input-focus

input-placeholder

input-disabled
Toolbar
toolbar-background

toolbar-divider

toolbar-button

toolbar-button-hover
Sidebar
sidebar-background

sidebar-border

sidebar-item

sidebar-item-hover

sidebar-item-active
Interaction States

Interactive elements define explicit state tokens.

default

hover

pressed

focused

disabled

selected

dragging

Example:

button-primary

button-primary-hover

button-primary-active

button-primary-disabled
Elevation

Elevation is represented through surface tokens.

Surface 0

Surface 1

Surface 2

Surface 3

rather than arbitrary opacity adjustments.

Accessibility

Every semantic token must satisfy accessibility requirements.

Minimum goals:

Context	Contrast
Body text	AA (4.5:1)
Large text	AA (3:1)
UI icons	AA
Interactive controls	WCAG AA
Dark Mode Strategy

Dark mode swaps semantic mappings only.

Light

surface-default
↓

white

Dark

surface-default
↓

slate-900

Components remain unchanged.

Forbidden Practices

Never:

use hex colors inside components
use RGB literals
use inline styles
duplicate semantic tokens
reference primitive colors from components
invent local color variables
Naming Convention

Recommended pattern:

color.surface.default

color.surface.raised

color.text.primary

color.text.secondary

color.border.default

color.brand.primary

color.feedback.success

color.chart.series.1

Equivalent CSS variables:

--color-surface-default

--color-text-primary

--color-border-default

--color-brand-primary

--color-chart-series-1
Governance Rules

Every new component must:

consume semantic tokens only
avoid hardcoded colors
support future theme switching
maintain WCAG AA compliance
reuse existing tokens whenever possible
introduce new tokens only when a genuine semantic need exists
Future Extensions

This architecture is designed to support:

Light Theme
Dark Theme
High Contrast Theme
Presentation Mode
Print Mode
Color-Blind Friendly Themes
Brand Customization
User-selectable Accent Colors

without requiring component-level changes.