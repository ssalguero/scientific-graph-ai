# COMPONENT_INVENTORY.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

This document inventories every reusable UI component present in the exported
Lovable frontend.

Goals:

- Identify reusable components
- Detect duplicates
- Define ownership
- Prepare migration into Scientific Graph AI Design System

---

# 2. Classification

Legend

✅ Production Ready
🟡 Needs Refactor
🔴 Duplicate
⚪ Placeholder

---

# 3. Layout

| Component | Status | Notes |
|-----------|--------|------|
| AppShell | ✅ | Root layout |
| Sidebar | ✅ | Navigation |
| Workspace | ✅ | Main canvas |
| Toolbar | 🟡 | Split into primitives |
| Inspector | 🟡 | Requires modularization |
| Panel | ✅ | Generic |

---

# 4. Navigation

...

---

# 5. Inputs

Buttons

Text Inputs

Search

Dropdown

Checkbox

Radio

Switch

Slider

Color Picker

---

# 6. Data Display

Card

Badge

Avatar

Tooltip

Progress

Table

List

Accordion

Tabs

Breadcrumb

---

# 7. Overlays

Dialog

Drawer

Popover

Context Menu

Dropdown Menu

Command Palette

Toast

Alert

Hover Card

---

# 8. Scientific Components

Equation Editor

Expression Input

Graph Canvas

Series List

Axis Controls

Legend

Color Scale

Export Dialog

Import Dialog

Project Browser

Dataset Preview

Inspector Sections

Properties Panel

---

# 9. Window System

Window Frame

Window Tabs

Window Header

Window Actions

Dock Preview

Resize Handles

Snap Indicators

Floating Window

---

# 10. Workspace Components

Canvas

Toolbar

Status Bar

Selection Box

Viewport Controls

Zoom Controls

MiniMap

---

# 11. Feedback

Loading

Skeleton

Spinner

Empty State

Error State

Success Message

---

# 12. Typography Components

Heading

Label

Caption

Body

Code

Monospace

---

# 13. Icons

Icon Library

Custom Scientific Icons

Window Icons

Toolbar Icons

---

# 14. Tokens Usage

Color Tokens

Spacing Tokens

Radius Tokens

Shadow Tokens

Typography Tokens

Motion Tokens

---

# 15. Duplicate Detection

| Duplicate | Preferred |
|-----------|-----------|
| ButtonA/ButtonB | Button |
| CardV1/CardV2 | Card |

---

# 16. Migration Priority

P0

AppShell

Sidebar

Workspace

Button

Panel

P1

Forms

Dialogs

Tables

Cards

P2

Scientific Components

P3

Experimental

---

# 17. Missing Components

Components expected but absent.

---

# 18. Future Components

Components planned for Scientific Graph AI.

---

# 19. Migration Status

| Component | Cursor | Lovable | Status |
|-----------|---------|----------|--------|
| Button | ✓ | ✓ | Pending |
| Panel | ✓ | ✓ | Complete |

---

# 20. Notes

```
All reusable UI elements must originate from this inventory.

No new component may be introduced without updating this document.
```



