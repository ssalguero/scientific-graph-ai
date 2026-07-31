# LAYOUT.md

> **Scientific Graph AI — Design System**
> Version: 1.0
> Status: Official Specification
> Last Updated: 2026-07-31

---

# 1. Purpose

The layout system defines how interface elements are organized across the application.

Its goals are:

- Consistency
- Predictability
- Responsiveness
- Scalability
- Efficient use of workspace

The layout must support complex scientific workflows while minimizing cognitive load.

---

# 2. Layout Philosophy

Scientific Graph AI follows a workspace-first approach.

The interface prioritizes:

- Graph visualization
- Data analysis
- Multi-window workflows
- Minimal visual distraction

The graph workspace is always the primary focus.

---

# 3. Primary Layout Structure

The application is divided into five major regions.

```
+------------------------------------------------------+
| Toolbar                                               |
+---------+---------------------------+-----------------+
| Sidebar |                           | Inspector       |
|         |        Workspace          |                 |
|         |                           |                 |
+---------+---------------------------+-----------------+
| Status Bar                                            |
+------------------------------------------------------+
```

---

# 4. Layout Regions

## Toolbar

Located at the top.

Contains:

- Primary actions
- Global tools
- Session controls
- Export
- Settings

---

## Sidebar

Located on the left.

Contains:

- Projects
- Data
- Graph list
- Resources
- Navigation

---

## Workspace

Largest visual area.

Contains:

- Charts
- Floating windows
- Editors
- Visualization canvas

The workspace always has layout priority.

---

## Inspector

Located on the right.

Contains:

- Properties
- Styling
- Configuration
- Scientific parameters

---

## Status Bar

Located at the bottom.

Displays:

- Coordinates
- Zoom level
- Execution status
- Notifications
- Background operations

---

# 5. Layout Hierarchy

Priority order:

1. Workspace
2. Floating windows
3. Inspector
4. Sidebar
5. Toolbar
6. Status Bar

The workspace should retain maximum usable area.

---

# 6. Containers

Containers should use:

- Consistent spacing
- Standard padding
- Defined border radius
- Elevation tokens
- Design tokens

Avoid arbitrary margins.

---

# 7. Grid System

The layout follows an 8-point spacing system.

Examples:

```
8 px

16 px

24 px

32 px

40 px

48 px
```

Avoid irregular spacing values.

---

# 8. Alignment

Use consistent alignment.

Preferred:

```css
display: flex;
```

or

```css
display: grid;
```

Avoid manual positioning.

---

# 9. Flexbox Usage

Use Flexbox for:

- Toolbars
- Button groups
- Forms
- Menus
- Horizontal layouts

---

# 10. Grid Usage

Use CSS Grid for:

- Dashboards
- Property panels
- Responsive cards
- Complex scientific layouts

---

# 11. Responsive Containers

Containers should adapt without breaking hierarchy.

Preferred behavior:

- Resize
- Wrap
- Collapse

Avoid overlapping content.

---

# 12. Maximum Width

Reading-oriented content:

```
900–1200 px
```

Scientific workspace:

Unlimited.

The graph canvas should expand to available space.

---

# 13. Minimum Widths

Recommended minimums:

Sidebar:

```
240 px
```

Inspector:

```
280 px
```

Floating windows:

```
320 px
```

Dialogs:

```
400 px
```

---

# 14. Padding

Default container padding:

```
16 px
```

Large containers:

```
24 px
```

Compact panels:

```
12 px
```

---

# 15. Gaps

Default:

```
16 px
```

Compact:

```
8 px
```

Large:

```
24 px
```

---

# 16. Scrolling

Only content areas should scroll.

Avoid nested scrolling whenever possible.

Preferred:

Workspace

Sidebar

Inspector

Each scrolls independently.

---

# 17. Floating Windows

Floating windows should:

- Preserve boundaries
- Snap correctly
- Dock smoothly
- Avoid covering essential UI

They must remain inside the application viewport.

---

# 18. Overflow

Avoid unintended overflow.

Use:

```css
overflow: auto;
```

or

```css
overflow: hidden;
```

only when necessary.

---

# 19. Layering

Visual hierarchy:

Workspace

↓

Cards

↓

Menus

↓

Dialogs

↓

Floating windows

↓

Toasts

---

# 20. White Space

White space improves readability.

Never compress layouts unnecessarily.

Spacing is a functional design element.

---

# 21. Empty States

Empty areas should include:

- Illustration or icon
- Explanation
- Suggested action

Avoid blank screens.

---

# 22. Consistency Rules

All layouts should:

- Use spacing tokens
- Use radius tokens
- Use shadow tokens
- Follow elevation rules
- Preserve alignment

Avoid custom layout exceptions unless documented.

---

# 23. Accessibility

Layouts must support:

- Keyboard navigation
- Logical tab order
- Screen readers
- Zoom up to 200%
- Responsive resizing without loss of functionality

---

# 24. Performance

Large layouts should:

- Minimize unnecessary reflows
- Virtualize long lists when appropriate
- Avoid deeply nested containers
- Use efficient rendering strategies

---

# 25. Governance

Every new screen or major UI surface must:

- Follow the approved layout regions
- Preserve workspace priority
- Use spacing and sizing tokens
- Maintain responsive behavior
- Respect accessibility requirements

Any structural layout changes require an update to this specification before implementation.