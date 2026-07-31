# SHADOWS.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

Shadows provide depth and reinforce elevation.

They help users understand:

- Layer hierarchy
- Interactive surfaces
- Floating elements
- Focus

Shadows are never decorative.

---

# 2. Design Philosophy

Scientific Graph AI follows a restrained shadow system.

The interface primarily communicates hierarchy through:

- spacing
- borders
- contrast

Shadows are introduced only when they improve clarity.

---

# 3. Shadow Scale

The design system defines five shadow levels.

| Token | Usage |
|--------|-------|
| none | Base surfaces |
| sm | Cards |
| md | Popovers |
| lg | Dialogs |
| xl | Floating windows |

---

# 4. Shadow Tokens

## none

```css
none
```

---

## sm

```css
0 1px 2px rgba(0,0,0,0.05)
```

Used for:

- Cards
- Hoverable panels

---

## md

```css
0 4px 8px rgba(0,0,0,0.08)
```

Used for:

- Dropdowns
- Menus
- Popovers

---

## lg

```css
0 10px 20px rgba(0,0,0,0.12)
```

Used for:

- Dialogs
- Modal windows

---

## xl

```css
0 20px 40px rgba(0,0,0,0.16)
```

Used for:

- Floating windows
- Detached tools
- High-priority overlays

---

# 5. Light Theme

Shadows remain subtle.

Avoid:

- Heavy blur
- Dark opaque shadows
- Layer stacking with multiple strong shadows

---

# 6. Dark Theme

Reduce shadow opacity.

Hierarchy should rely more on:

- Surface color
- Borders
- Contrast

Avoid excessively black shadows that disappear into the background.

---

# 7. Hover States

Hover may increase shadow by one level.

Example:

```
sm

↓

md
```

Changes should remain subtle.

---

# 8. Active State

Active components may use:

- Same shadow
- Stronger border
- Focus ring

Avoid increasing shadow dramatically during active states.

---

# 9. Focus

Keyboard focus should rely on:

- Focus ring
- Border color

Not on shadow alone.

---

# 10. Floating Windows

Floating scientific windows use:

```
xl
```

Docked windows:

```
none
```

Transition between states should animate smoothly.

---

# 11. Dialogs

Dialogs use:

```
lg
```

Combined with:

- Backdrop
- Surface elevation
- Rounded corners

---

# 12. Menus

Menus use:

```
md
```

Examples:

- Context menus
- Dropdowns
- Select menus

---

# 13. Cards

Cards use:

```
sm
```

Only when separated from the workspace.

Flat layouts may omit shadows entirely.

---

# 14. Buttons

Buttons normally use:

```
none
```

Hover:

Optional:

```
sm
```

Pressed:

Reduce or remove shadow.

---

# 15. Toasts

Toasts use:

```
lg
```

They should remain visually distinct above application content.

---

# 16. Scientific Charts

Charts themselves do not cast shadows.

Only chart containers may receive shadows when elevated.

---

# 17. Performance

Prefer:

- Single-layer shadows
- Moderate blur radius
- Limited spread

Avoid multiple stacked shadows unless absolutely necessary.

---

# 18. CSS Variables

Recommended tokens:

```css
--shadow-none: none;

--shadow-sm:
0 1px 2px rgba(0,0,0,0.05);

--shadow-md:
0 4px 8px rgba(0,0,0,0.08);

--shadow-lg:
0 10px 20px rgba(0,0,0,0.12);

--shadow-xl:
0 20px 40px rgba(0,0,0,0.16);
```

---

# 19. Implementation

Example:

```css
box-shadow: var(--shadow-md);
```

Always use design tokens instead of hardcoded values.

---

# 20. Relationship with Elevation

Shadow levels should correspond directly to the defined elevation system.

| Elevation | Shadow |
|-----------|--------|
| Level 0 | none |
| Level 1 | sm |
| Level 2 | md |
| Level 3 | lg |
| Level 4 | xl |

This mapping must remain consistent across the application.

---

# 21. Accessibility

Shadows must never be the only indicator of:

- Focus
- Selection
- Active state
- Interaction

Always combine shadows with borders, color, or focus indicators.

---

# 22. Governance

All components must use the approved shadow tokens.

New components should:

- Reuse existing shadow levels
- Avoid custom shadow definitions
- Maintain consistency across themes
- Preserve performance and accessibility

Any new shadow token requires an update to this specification before implementation.