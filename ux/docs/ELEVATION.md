# ELEVATION.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

Elevation communicates visual hierarchy.

It indicates:

- Surface priority
- Layer relationships
- Interaction states
- Focus
- Floating elements

Elevation must never be used as decoration.

---

# 2. Elevation Philosophy

Scientific Graph AI follows a minimal elevation model.

The interface relies primarily on:

- spacing
- borders
- contrast

Shadows are only introduced when they improve usability.

---

# 3. Elevation Levels

The design system defines five elevation levels.

| Level | Usage |
|--------|-------|
| 0 | Base surfaces |
| 1 | Cards |
| 2 | Popovers |
| 3 | Dialogs |
| 4 | Floating windows |

---

# 4. Level 0 — Surface

Examples:

- Workspace
- Sidebar background
- Inspector background
- Panels

Characteristics:

- No shadow
- Border only
- Background token

---

# 5. Level 1 — Card

Examples:

- Project cards
- Dashboard widgets
- Informational panels

Characteristics:

- Small shadow
- Thin border

---

# 6. Level 2 — Popover

Examples:

- Context menus
- Dropdown menus
- Color picker
- Select menus

Characteristics:

- Medium shadow
- Elevated over cards

---

# 7. Level 3 — Dialog

Examples:

- Modal dialogs
- Confirmation windows
- Preferences

Characteristics:

- Strong shadow
- Overlay backdrop
- Highest modal priority

---

# 8. Level 4 — Floating Window

Examples:

- Dockable windows
- Detached inspectors
- Floating scientific tools

Characteristics:

- Strongest elevation
- Clear separation from workspace
- Persistent while active

---

# 9. Interaction Elevation

Hover:

Increase one elevation level when appropriate.

Example:

```
Card (Level 1)

↓

Hover

↓

Level 2
```

Avoid dramatic changes.

---

# 10. Active State

Active components may receive:

- Elevated shadow
- Accent border
- Focus ring

Prefer focus indicators over excessive shadows.

---

# 11. Focus

Keyboard focus must not rely solely on elevation.

Always include:

- Visible focus ring
- Accessible contrast
- Consistent outline

---

# 12. Disabled Elements

Disabled components:

- Keep original elevation
- Reduce opacity
- Do not cast stronger shadows

---

# 13. Window System

Floating windows use:

Level 4

Docked windows return to:

Level 0

Transitions between states should animate smoothly.

---

# 14. Overlay Hierarchy

Recommended stacking order:

| Layer | Elevation |
|--------|-----------|
| Workspace | 0 |
| Cards | 1 |
| Popovers | 2 |
| Dialogs | 3 |
| Floating Windows | 4 |
| Toasts | Above all application layers |

---

# 15. Dark Theme

Shadows become less visually prominent.

Increase separation primarily through:

- Surface contrast
- Borders
- Background tones

Avoid excessively dark shadows.

---

# 16. Light Theme

Shadows remain subtle.

Do not rely on heavy blur or opacity.

The interface should maintain a clean, technical appearance.

---

# 17. Relationship with Shadows

Elevation is a semantic concept.

Shadows are one implementation detail.

Other visual cues include:

- Borders
- Background contrast
- Layer ordering
- Spacing

---

# 18. Relationship with Motion

Elevation changes should be accompanied by subtle motion.

Examples:

- Hover
- Dialog opening
- Floating window creation
- Dock/undock transitions

Avoid abrupt changes.

---

# 19. Performance

Shadows should:

- Avoid excessive blur radii
- Minimize repaint cost
- Remain GPU-friendly when possible

Large layered shadows should be limited to high-elevation surfaces.

---

# 20. Governance

Every component must define its intended elevation level.

New UI components should:

- Use one of the existing elevation levels
- Avoid introducing custom elevation tiers
- Follow the established interaction hierarchy
- Remain consistent across light and dark themes

Any new elevation level requires an update to this specification before implementation.