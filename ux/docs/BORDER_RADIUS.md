# BORDER_RADIUS.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

Border radius defines the curvature of interface elements.

A consistent radius system improves:

- Visual harmony
- Component recognition
- UI consistency
- Modern appearance

Scientific Graph AI uses subtle rounding to maintain a professional and technical aesthetic.

---

# 2. Design Philosophy

The interface avoids:

- Sharp edges everywhere
- Excessively rounded "bubble" components

Instead, it adopts:

> **Minimal, balanced, functional rounding.**

---

# 3. Radius Scale

The design system defines a limited radius scale.

| Token | Radius |
|--------|--------|
| none | 0 px |
| xs | 2 px |
| sm | 4 px |
| md | 6 px |
| lg | 8 px |
| xl | 12 px |
| full | 9999 px |

---

# 4. Default Radius

Most interactive components use:

```
8 px
```

Equivalent token:

```
lg
```

---

# 5. Buttons

Primary

Secondary

Ghost

Outline

Use:

```
8 px
```

---

# 6. Inputs

Text input

Number input

Textarea

Search

Use:

```
8 px
```

---

# 7. Cards

Cards use:

```
12 px
```

Large containers may also use 12 px.

---

# 8. Dialogs

Dialogs use:

```
12 px
```

This provides stronger visual separation from the background.

---

# 9. Popovers

Dropdowns

Menus

Color pickers

Use:

```
8 px
```

---

# 10. Tooltips

Tooltips use:

```
6 px
```

---

# 11. Badges

Badges use:

```
9999 px
```

Pill-style appearance.

---

# 12. Avatars

Circular avatars:

```
9999 px
```

Rounded avatars:

```
12 px
```

---

# 13. Tables

Table cells:

```
0 px
```

Container:

```
8 px
```

Avoid individually rounded rows.

---

# 14. Floating Windows

Floating scientific windows:

```
12 px
```

Docked windows:

```
0–8 px
```

depending on layout context.

---

# 15. Charts

Charts generally use:

```
0 px
```

Chart containers:

```
12 px
```

---

# 16. Images

Default:

```
8 px
```

Hero images:

```
12 px
```

Scientific visualizations:

```
0 px
```

when precision is preferred.

---

# 17. Overflow

Whenever border radius is applied:

```css
overflow: hidden;
```

should be considered when child elements may exceed container bounds.

---

# 18. Consistency Rules

Do not mix arbitrary radius values.

Avoid values such as:

- 5 px
- 7 px
- 9 px
- 11 px

Use only the approved design tokens.

---

# 19. Responsive Behavior

Border radius remains constant across breakpoints.

Do not increase curvature on larger screens.

---

# 20. Accessibility

Border radius must never reduce:

- Clickable area
- Focus visibility
- Contrast
- Component recognition

Focus rings must remain fully visible around rounded elements.

---

# 21. Relationship with Shadows

Higher elevation components often use slightly larger radii.

Example:

| Component | Radius |
|-----------|--------|
| Button | 8 px |
| Card | 12 px |
| Dialog | 12 px |
| Floating Window | 12 px |

---

# 22. Design Tokens

Recommended CSS variables:

```css
--radius-none: 0px;
--radius-xs: 2px;
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-full: 9999px;
```

---

# 23. Implementation

Example:

```css
border-radius: var(--radius-lg);
```

Never hardcode values inside components when design tokens are available.

---

# 24. Governance

All UI components must use the approved border radius tokens.

New components should:

- Reuse existing radius values
- Avoid custom curvature
- Maintain consistency across themes
- Preserve accessibility and visual hierarchy

Any new radius token requires an update to this specification before implementation.