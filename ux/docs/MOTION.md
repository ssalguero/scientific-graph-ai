# MOTION.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

Motion is a usability tool.

Animations exist to:

- Communicate state changes
- Guide user attention
- Improve spatial understanding
- Reinforce hierarchy
- Increase perceived performance

Motion must never exist purely for decoration.

---

# 2. Motion Philosophy

Scientific Graph AI follows the principle:

> **Fast, subtle, meaningful.**

Animations should feel:

- Calm
- Precise
- Predictable
- Professional

Avoid playful or exaggerated effects.

---

# 3. Motion Principles

Every animation should satisfy at least one of these goals:

### Feedback

Button pressed

Checkbox selected

Menu opened

---

### Continuity

Panels moving

Docking windows

Sidebar expanding

---

### Orientation

Help users understand:

- where something came from
- where it went

---

### Emphasis

Draw attention only when necessary.

---

### State Change

Loading

Success

Error

Empty state

---

# 4. Duration

## Instant

```
0 ms
```

Used for:

- Critical updates
- Data refresh
- Accessibility overrides

---

## Fast

```
100–150 ms
```

Used for:

- Hover
- Icon color
- Button press

---

## Standard

```
200–250 ms
```

Used for:

- Panels
- Drawers
- Dialogs
- Menus

---

## Slow

```
300–400 ms
```

Used only for:

- Full-page transitions
- Complex layouts

---

Never exceed:

```
500 ms
```

---

# 5. Easing

Default:

```
ease-out
```

For entrances:

```
ease-out
```

For exits:

```
ease-in
```

Complex movements:

```
ease-in-out
```

Avoid:

- bounce
- elastic
- spring effects (unless interaction specifically requires them)

---

# 6. Opacity

Fade in:

```
0 → 100%
```

Fade out:

```
100 → 0%
```

Avoid flashing elements.

---

# 7. Scale

Small emphasis:

```
0.98 → 1.00
```

Button press:

```
1.00 → 0.98
```

Hover:

```
1.00 → 1.02
```

Never exceed:

```
1.05
```

---

# 8. Translation

Micro movement:

```
2–8 px
```

Large UI:

```
16–32 px
```

Avoid large travel distances.

---

# 9. Rotation

Allowed:

Loading spinner

Expand arrows

Chevron

Disclosure indicators

Avoid rotating:

Buttons

Cards

Charts

Panels

---

# 10. Hover Effects

Hover may change:

- background
- border
- color
- elevation
- shadow

Motion should remain subtle.

---

# 11. Button Motion

Hover:

- slightly brighter
- elevation increase
- optional 1–2 px lift

Pressed:

- scale 0.98
- shadow reduction

Duration:

```
120 ms
```

---

# 12. Dialog Motion

Open:

- fade
- slight upward movement
- scale 0.98 → 1

Close:

reverse animation

Duration:

```
200 ms
```

---

# 13. Sidebar Motion

Expand:

Width transition

Collapse:

Reverse transition

Avoid content jumping.

---

# 14. Dropdown Motion

Open:

- fade
- translateY(4px)

Close:

reverse

Duration:

```
150–180 ms
```

---

# 15. Tooltip Motion

Fade only.

Avoid scaling.

Duration:

```
120 ms
```

---

# 16. Toast Motion

Enter:

Slide + Fade

Exit:

Fade

Duration:

```
180 ms
```

---

# 17. Window System

Floating windows should animate:

- creation
- docking
- snapping
- restoration

Animations should preserve spatial continuity.

---

# 18. Charts

Never animate continuously.

Allowed:

- initial render
- series enable/disable
- zoom
- transitions after data changes

Avoid distracting animations during scientific analysis.

---

# 19. Loading Indicators

Preferred:

Spinner

Skeleton

Progress bar

Avoid:

Animated GIFs

Excessive pulsing

Flashing

---

# 20. Reduced Motion

Respect:

```css
prefers-reduced-motion
```

When enabled:

- remove transitions
- disable animations
- disable auto-scrolling
- remove parallax
- shorten durations

---

# 21. Performance

Animations should:

- use GPU-friendly properties
- animate transform and opacity
- avoid layout recalculation
- avoid animating width/height when possible
- maintain 60 FPS

---

# 22. CSS Transition Tokens

Example:

```css
transition:
transform 150ms ease-out,
opacity 150ms ease-out,
background-color 150ms ease-out,
border-color 150ms ease-out;
```

---

# 23. Motion Consistency

All interactive components should share common durations.

Example:

Hover:

```
150 ms
```

Buttons:

```
120 ms
```

Dialogs:

```
200 ms
```

Panels:

```
250 ms
```

---

# 24. Accessibility

Motion must never:

- trigger dizziness
- create flashing effects
- exceed accessibility recommendations
- rely solely on animation to communicate state

Always pair animation with visual state changes.

---

# 25. Governance

All new animations must satisfy:

- Functional purpose
- Approved duration
- Approved easing
- Accessibility compliance
- Performance requirements
- Design token compatibility
- Reduced-motion support

Any new animation pattern must be documented in this specification before being introduced into the product.