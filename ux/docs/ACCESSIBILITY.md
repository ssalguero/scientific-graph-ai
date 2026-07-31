# ACCESSIBILITY.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

Accessibility ensures that Scientific Graph AI can be used by the widest possible range of users regardless of ability, device, or interaction method.

Accessibility is a core product requirement, not an optional enhancement.

---

# 2. Accessibility Standard

Scientific Graph AI targets compliance with:

- WCAG 2.2 Level AA

Where practical, implementations should follow AAA recommendations for readability and usability.

---

# 3. Core Principles

The interface must be:

- Perceivable
- Operable
- Understandable
- Robust

These four principles guide every accessibility decision.

---

# 4. Keyboard Navigation

Every interactive element must be accessible using only the keyboard.

Required support includes:

- Tab
- Shift + Tab
- Enter
- Space
- Escape
- Arrow keys where appropriate

No feature should require a mouse.

---

# 5. Focus Management

Keyboard focus must always be:

- Visible
- Predictable
- Logical

Never remove focus indicators.

Example:

```css
outline: 2px solid var(--color-primary);
outline-offset: 2px;
```

---

# 6. Tab Order

Tab order should follow the visual hierarchy.

Avoid:

- Random focus jumps
- Hidden focus targets
- Keyboard traps

---

# 7. Screen Reader Support

All interactive components require meaningful labels.

Use:

```tsx
aria-label
```

or

```tsx
aria-labelledby
```

Decorative elements should use:

```tsx
aria-hidden="true"
```

---

# 8. Semantic HTML

Prefer semantic elements whenever possible.

Examples:

```html
<button>
<nav>
<header>
<main>
<footer>
<section>
<article>
<form>
<label>
```

Avoid replacing semantic elements with generic `<div>` containers.

---

# 9. Color Contrast

Minimum contrast ratios:

Normal text:

```
4.5 : 1
```

Large text:

```
3 : 1
```

Interactive controls:

Must meet WCAG AA contrast requirements.

Never rely solely on color to communicate information.

---

# 10. Typography

Text should remain readable.

Avoid:

- Very small font sizes
- Low contrast
- Excessive line length

Recommended minimum body size:

```
16 px
```

---

# 11. Touch Targets

Minimum interactive size:

```
44 × 44 px
```

Spacing between adjacent controls should prevent accidental activation.

---

# 12. Forms

Every input requires:

- Visible label
- Error message
- Validation feedback
- Keyboard accessibility

Placeholder text must never replace labels.

---

# 13. Error Messages

Errors should include:

- Clear explanation
- Suggested resolution
- Accessible announcement when appropriate

Avoid generic messages such as:

```
Error
```

Prefer:

```
Unable to import file. The selected format is not supported.
```

---

# 14. Motion

Respect user preferences.

Support:

```css
prefers-reduced-motion
```

Disable:

- Non-essential animations
- Parallax
- Excessive transitions

---

# 15. Images

Informative images require:

```html
alt=""
```

with meaningful descriptions.

Decorative images:

```html
alt=""
aria-hidden="true"
```

---

# 16. Icons

Interactive icons require:

```tsx
aria-label
```

Icon-only controls should be used sparingly.

Whenever possible, combine icons with text labels.

---

# 17. Dialogs

Dialogs must:

- Trap keyboard focus
- Restore focus when closed
- Support Escape
- Include accessible titles

---

# 18. Notifications

Toast messages should:

- Be announced appropriately
- Not steal keyboard focus
- Remain dismissible when required

Critical alerts should use appropriate ARIA live regions.

---

# 19. Tables

Data tables require:

- Header cells
- Scope attributes
- Logical reading order

Large scientific datasets should remain navigable with assistive technologies.

---

# 20. Charts

Charts should provide alternative access to information.

Recommendations include:

- Text summaries
- Data tables
- Downloadable values

Visualizations must not be the sole source of critical information.

---

# 21. Responsive Accessibility

Accessibility must be preserved across:

- Desktop
- Laptop
- Tablet
- Browser zoom up to 200%

Responsive layouts must not hide essential functionality.

---

# 22. Performance

Accessibility features must not significantly impact performance.

Prefer native browser capabilities over complex custom implementations when possible.

---

# 23. Testing

Accessibility testing should include:

- Keyboard-only navigation
- Screen reader testing
- Color contrast validation
- Browser zoom
- Reduced motion
- High contrast mode

Automated tools should be complemented with manual testing.

---

# 24. Documentation

Every reusable component should document:

- Keyboard behavior
- ARIA attributes
- Focus handling
- Accessibility considerations

Accessibility requirements are part of the component contract.

---

# 25. Governance

All new components and features must:

- Meet WCAG 2.2 AA requirements
- Support keyboard navigation
- Provide accessible labels
- Preserve visible focus
- Maintain sufficient color contrast
- Respect reduced-motion preferences

Accessibility compliance is mandatory for production releases.

Any accessibility guideline changes must be reflected in this specification before implementation.