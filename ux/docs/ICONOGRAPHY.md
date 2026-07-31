# ICONOGRAPHY.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

The icon system provides a consistent visual language across the application.

Icons are designed to:

- Improve recognition speed
- Reduce cognitive load
- Support scientific workflows
- Remain visually neutral
- Scale across all interface densities

Icons should never become decorative elements.

Every icon must communicate a specific action, object, or state.

---

# 2. Icon Library

Scientific Graph AI uses:

**Lucide React**

Reasons:

- Lightweight
- Tree-shakeable
- Consistent stroke system
- Large icon coverage
- Excellent React integration

No other icon library should be introduced.

---

# 3. Style

All icons must use:

- Outline style
- Rounded joins
- Rounded caps
- Uniform stroke
- No fills (unless specifically required)

Avoid:

- Mixed outline + filled icons
- Emoji
- Decorative illustrations
- 3D icons

---

# 4. Stroke Width

Standard:

```
2px
```

Never mix multiple stroke widths inside the same toolbar.

---

# 5. Corner Radius

Icons inherit Lucide geometry.

Do not edit SVG paths manually.

---

# 6. Sizes

### Toolbar

16 px

---

### Buttons

18 px

---

### Inspector

18 px

---

### Sidebar

18 px

---

### Navigation

20 px

---

### Empty States

32–48 px

---

### Hero Sections

48–64 px

---

# 7. Color

Default:

```
text-muted-foreground
```

Interactive:

```
foreground
```

Primary actions:

```
primary
```

Danger:

```
destructive
```

Disabled:

```
muted-foreground
opacity 40%
```

Never hardcode colors.

Always consume design tokens.

---

# 8. Icon Spacing

Button:

```
[ Icon ] 8px [ Label ]
```

Toolbar:

```
12px gap
```

Menus:

```
8px gap
```

Sidebar:

```
10px gap
```

---

# 9. Alignment

Icons must align to the text baseline.

Avoid vertical optical misalignment.

Use flex alignment:

```css
align-items: center;
justify-content: center;
```

---

# 10. Semantic Consistency

A single meaning must always use the same icon.

Example:

Save

Always:

```
Save
```

Never alternate between:

- Check
- Download
- Archive
- Folder

for the same action.

---

# 11. Scientific Graph AI Icon Mapping

## Projects

Folder

---

## Graph

Chart

---

## Data

Database

---

## Import

Upload

---

## Export

Download

---

## Settings

Gear

---

## Theme

Sun / Moon

---

## Zoom

Search Plus / Minus

---

## Delete

Trash

---

## Duplicate

Copy

---

## Rename

Pencil

---

## Lock

Lock

---

## Unlock

Unlock

---

## Window

Square

---

## Session

Layers

---

## Restore

History

---

## Refresh

Rotate CW

---

## Search

Search

---

## Filter

Filter

---

## Warning

Triangle Alert

---

## Error

Circle Alert

---

## Success

Check Circle

---

## Information

Info

---

# 12. Hover Behavior

Hover changes:

- foreground color
- background (button)
- cursor

Icons should not:

- rotate
- bounce
- scale aggressively

Subtle motion only.

---

# 13. Active State

Active icons:

- Primary color
- Active background
- Optional bold container

Do not change icon geometry.

---

# 14. Disabled State

Disabled icons:

- 40% opacity
- No hover
- No pointer events

---

# 15. Loading

Never replace icons with unrelated symbols.

Instead:

```
Icon
↓

Spinner

↓

Icon
```

---

# 16. Accessibility

Icons representing actions must include:

```tsx
aria-label
```

Example:

```tsx
<Button aria-label="Export Graph">
```

Purely decorative icons:

```tsx
aria-hidden="true"
```

---

# 17. Icon + Text Rule

Never rely on icon-only controls for critical workflows.

Whenever possible:

```
✓ Icon + Label
```

instead of

```
Icon only
```

Exceptions:

- Toolbar
- Window controls
- Zoom controls
- Compact navigation

---

# 18. Consistency Rules

Never:

- Mix icon packs
- Stretch icons
- Distort aspect ratios
- Apply shadows
- Add gradients
- Add outlines manually

---

# 19. Future Extensions

Additional icons should:

- Exist in Lucide
- Match the existing semantic mapping
- Preserve stroke consistency
- Reuse existing metaphors before introducing new ones

If no appropriate icon exists, evaluate creating a custom icon only as a last resort, ensuring it matches Lucide’s visual language.

---

# 20. Governance

Any new icon introduced into the product must satisfy:

- Uses the approved Lucide React library
- Matches the established semantic mapping
- Uses design token colors
- Uses approved sizes
- Includes accessibility attributes when interactive
- Does not introduce a duplicate meaning
- Maintains visual consistency across all UI surfaces

Changes to icon semantics require an update to this document before implementation.