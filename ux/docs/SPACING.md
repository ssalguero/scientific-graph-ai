# SPACING.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# Purpose

This document defines the official spacing system used throughout Scientific Graph AI.

Goals:

- Create a consistent visual rhythm.
- Simplify layout decisions.
- Eliminate arbitrary spacing values.
- Enable scalable responsive layouts.
- Serve as the single source of truth for margins, paddings, gaps, and component spacing.

---

# Design Principles

The spacing system follows a strict **8px grid**, with intermediate 4px values for fine adjustments.

Rules:

- Never invent spacing values.
- Prefer design tokens.
- Components define spacing through tokens only.
- No hardcoded pixel values inside components.
- Layout primitives own spacing behavior.

---

# Base Unit

Base Unit:


4px


Primary Grid:


8px


Every spacing token is derived from these units.

---

# Spacing Scale

| Token | px | Usage |
|---------|----|----------------------------|
| space-0 | 0 | None |
| space-1 | 4 | Micro spacing |
| space-2 | 8 | Tight spacing |
| space-3 | 12 | Compact spacing |
| space-4 | 16 | Default spacing |
| space-5 | 20 | Medium spacing |
| space-6 | 24 | Comfortable spacing |
| space-8 | 32 | Large spacing |
| space-10 | 40 | Extra large |
| space-12 | 48 | Section spacing |
| space-16 | 64 | Major separation |
| space-20 | 80 | Screen sections |
| space-24 | 96 | Large layouts |

---

# Semantic Usage

Instead of thinking in pixels:


space-2


Think:


Compact gap


Instead of:


16px


Think:


Default spacing


---

# Component Spacing

Buttons

Padding:

Vertical:


space-2


Horizontal:


space-4


Gap:


space-2


---

Cards

Internal padding:


space-4


Gap between sections:


space-4


Gap between cards:


space-6


---

Dialogs

Outer padding:


space-6


Header → Body:


space-4


Body → Footer:


space-6


Footer buttons:


space-3


---

Toolbar

Horizontal padding:


space-3


Vertical padding:


space-2


Item gap:


space-2


---

Sidebar

Padding:


space-4


Section gap:


space-6


Item spacing:


space-2


---

Inspector

Padding:


space-4


Property gap:


space-3


Section gap:


space-6


---

Panels

Padding:


space-4


Header spacing:


space-3


Content spacing:


space-4


---

Workspace

Canvas padding:


space-6


Floating window margin:


space-4


Window snap spacing:


space-2


---

Forms

Between controls:


space-4


Between label and field:


space-2


Between form groups:


space-6


---

Lists

Item padding:


space-3


Group spacing:


space-4


Section spacing:


space-6


---

Tables

Cell padding:


space-3


Header padding:


space-4


Toolbar gap:


space-3


---

Charts

Toolbar → Chart:


space-4


Legend spacing:


space-3


Controls spacing:


space-2


Panel padding:


space-4


---

Window System

Titlebar padding:


space-3


Tab spacing:


space-2


Content padding:


space-4


Resize handle margin:


space-1


---

Stack Layout

Recommended gaps:

Small:


space-2


Medium:


space-4


Large:


space-6


Extra:


space-8


---

Grid Layout

Column gap:


space-4


Row gap:


space-4


Dense mode:


space-2


Relaxed mode:


space-6


---

Responsive Scaling

Desktop:

Uses full spacing scale.

Tablet:

Reduce large spaces one level.

Example:


space-8
↓

space-6


Mobile:

Prefer:


space-2
space-3
space-4


Avoid excessive whitespace.

---

Implementation

Design Tokens:


--space-0
--space-1
--space-2
...
--space-24


Example:

```css
padding: var(--space-4);
gap: var(--space-3);
margin-bottom: var(--space-6);

Never write:

padding: 17px;
margin: 13px;
gap: 21px;

Allowed Values

✔

0

4

8

12

16

20

24

32

40

48

64

80

96

Not allowed:

5px
7px
11px
13px
15px
17px
19px
23px
27px

Unless explicitly required by rendering or browser constraints.

Audit Checklist

Every component should satisfy:

Uses spacing tokens only.
No arbitrary pixel values.
Consistent internal rhythm.
Consistent external spacing.
Responsive spacing maintained.
Grid alignment respected.
Layout primitives control spacing.

Future Evolution

Potential future additions:

Density-aware spacing
Adaptive spacing tokens
User-configurable density
Animation spacing presets
Platform-specific spacing variants

The base spacing scale itself should remain stable to preserve visual consistency.