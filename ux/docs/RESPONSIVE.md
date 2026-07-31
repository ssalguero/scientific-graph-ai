# RESPONSIVE.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

The responsive system ensures that Scientific Graph AI provides a consistent and usable experience across different screen sizes and resolutions.

Responsiveness should preserve:

- Functionality
- Readability
- Scientific accuracy
- Workflow efficiency

---

# 2. Responsive Philosophy

Scientific Graph AI is primarily a desktop-first application.

Secondary support includes:

- Large tablets
- Small laptops

Mobile devices are supported only for limited functionality and are not intended for full scientific workflows.

---

# 3. Breakpoints

The design system defines the following responsive breakpoints.

| Token | Width |
|--------|-------|
| xs | < 640 px |
| sm | ≥ 640 px |
| md | ≥ 768 px |
| lg | ≥ 1024 px |
| xl | ≥ 1280 px |
| 2xl | ≥ 1536 px |

These values align with the Tailwind CSS breakpoint system.

---

# 4. Desktop Priority

The primary design target is:

```
1440 × 900
```

The interface should also perform well on:

- 1920 × 1080
- 2560 × 1440
- Ultra-wide displays

---

# 5. Workspace Scaling

The graph workspace always receives layout priority.

When screen space becomes limited:

1. Collapse secondary panels
2. Reduce side panel widths
3. Preserve graph visibility
4. Maintain toolbar usability

---

# 6. Sidebar Behavior

Large screens:

Expanded.

Medium screens:

Collapsible.

Small screens:

Hidden behind a toggle.

---

# 7. Inspector Behavior

Large screens:

Visible.

Medium screens:

Collapsible.

Small screens:

Drawer or modal presentation.

---

# 8. Toolbar Behavior

Toolbar items should:

- Compress spacing
- Collapse labels when necessary
- Move overflow actions into menus

Avoid wrapping toolbar rows.

---

# 9. Floating Windows

Floating windows should:

- Stay within viewport bounds
- Resize gracefully
- Preserve minimum dimensions

They should never render outside the visible workspace.

---

# 10. Dialogs

Dialogs adapt responsively.

Maximum width:

```
90vw
```

Maximum height:

```
90vh
```

Prevent viewport overflow.

---

# 11. Cards

Responsive cards should:

- Wrap naturally
- Maintain consistent spacing
- Preserve readable content widths

Avoid fixed widths when unnecessary.

---

# 12. Grid Behavior

Use CSS Grid with responsive columns.

Example:

Desktop:

```
4 columns
```

Tablet:

```
2 columns
```

Mobile:

```
1 column
```

---

# 13. Typography Scaling

Typography should remain readable.

Avoid excessive font scaling.

Preferred approach:

- Fixed type scale
- Responsive layout

Not responsive typography.

---

# 14. Images and Charts

Charts should:

- Scale with container size
- Maintain aspect ratio
- Preserve axis readability

Images should:

```css
max-width: 100%;
height: auto;
```

---

# 15. Tables

Large tables should:

- Scroll horizontally
- Preserve header visibility
- Avoid compressing scientific data

Do not reduce font size excessively.

---

# 16. Overflow Handling

Responsive layouts should prefer:

```css
overflow: auto;
```

over clipping important content.

Avoid hidden interactive elements.

---

# 17. Spacing

Spacing tokens remain consistent.

Do not reduce spacing below the approved design system values unless absolutely necessary.

---

# 18. Touch Targets

For touch-capable devices:

Minimum interactive area:

```
44 × 44 px
```

Maintain accessible interaction zones.

---

# 19. Zoom Support

The application must remain functional at:

- 125%
- 150%
- 200%

No loss of functionality should occur during browser zoom.

---

# 20. Orientation

Landscape orientation is recommended.

Portrait orientation should remain usable but may limit advanced scientific workflows.

---

# 21. Accessibility

Responsive behavior must support:

- Keyboard navigation
- Screen readers
- Browser zoom
- High contrast modes
- Reduced motion preferences

---

# 22. Performance

Responsive layouts should:

- Avoid unnecessary re-rendering
- Use lazy loading where appropriate
- Virtualize long lists
- Minimize layout shifts

---

# 23. Testing Requirements

Responsive testing should include:

- Desktop
- Laptop
- Tablet
- Narrow desktop windows
- High-resolution displays

Verify all critical workflows at each supported breakpoint.

---

# 24. Design Consistency

Responsive adaptations must preserve:

- Visual hierarchy
- Component identity
- Design tokens
- Layout structure

Behavior should change only when necessary to improve usability.

---

# 25. Governance

All new components and screens must:

- Support the approved breakpoints
- Preserve workspace priority
- Avoid horizontal overflow
- Maintain accessibility standards
- Respect the established responsive strategy

Any new breakpoint or responsive pattern requires an update to this specification before implementation.