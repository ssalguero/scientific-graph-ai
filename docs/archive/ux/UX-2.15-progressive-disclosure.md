# UX-2.15 — Progressive Disclosure Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.15 — BUILD (Progressive Disclosure Foundation)  
**Fase:** Presentational hierarchy primitives + chrome/content reorganization  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.15 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.14 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.15 = COMPLETE (progressive disclosure foundation)
SCOPE = workspace/disclosure/ + PanelHeader overflow? + chrome/content 1A wiring
API FREEZE = DisclosureSection · AdvancedSection · RevealButton ·
             InlineExpander · PanelOverflowMenu · ContextDivider ·
             PanelHeader overflow?
PACKAGE ISOLATION = disclosure/ ⊥ PanelState ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
NO invented domain content · NO menus/portals · NO Panel.tsx API change
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce a reusable visual hierarchy so panels show primary content first and demote secondary actions / advanced blocks behind disclosure and overflow affordances — presentational infrastructure only (1A: reorganize existing chrome/content; no invented domain structures).

---

## 2. Architecture

```text
workspace/disclosure/
  DisclosureSection.tsx
  AdvancedSection.tsx
  RevealButton.tsx
  InlineExpander.tsx
  PanelOverflowMenu.tsx
  ContextDivider.tsx
  index.ts

PanelHeader (+ overflow?)
  LeftPanel   → New primary · Import in PanelOverflowMenu
  RightPanel  → empty ContextActions · Rename/Color in overflow
  BottomPanel → disabled empty PanelOverflowMenu
Explorer / Inspector / Console content → DisclosureSection + ContextDivider + AdvancedSection
```

```text
disclosure/  ──✗──►  panels/state
disclosure/  ──✗──►  panels/persistence
disclosure/  ──✗──►  panels/resize
disclosure/  ──✗──►  focus/
disclosure/  ──✗──►  modes
disclosure/  ──✗──►  session
```

**Mapping:** Explorer → Left · Inspector → Right · Console → Bottom.

---

## 3. IN

1. `workspace/disclosure/` presentational package (six primitives + barrel)
2. Additive optional `overflow?` on `PanelHeader` (frozen slot order)
3. Chrome wiring: move secondary actions to `PanelOverflowMenu`
4. Content wrapping: existing EmptyStates / sections via Disclosure / Divider / Advanced
5. This document + `validate:ux-2.15` + roadmap resequence (2.15–2.18)

---

## 4. OUT

- Invented Graph / Series / UUID / ID / fake property rows
- Real menus (Popover / Radix / Dropdown / portals / click-outside / keyboard menus)
- Panel.tsx / PanelState / persistence / focus / resize / modes / session
- New `UI_TOKENS` keys
- Expanding public `@/components/workspace` barrel with `disclosure/`
- Semi-controlled `DisclosureSection` or open-state on `PanelOverflowMenu`

---

## 5. Frozen APIs

### 5.1 DisclosureSection

```ts
type DisclosureSectionProps = {
  title: string;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
};
```

Owns local UI state (`useState`) initialized from `defaultExpanded`. Never syncs back to props, PanelState, WorkspaceContext, or persistence. Not semi-controlled.

### 5.2 AdvancedSection

```ts
type AdvancedSectionProps = {
  children?: React.ReactNode;
  label: string;
  expanded: boolean;
  onToggle: () => void;
};
```

Fully controlled. No internal state.

### 5.3 RevealButton

```ts
type RevealButtonProps = {
  expanded: boolean;
  onToggle: () => void;
  label: string;
  controlsId?: string; // a11y aria-controls only
};
```

### 5.4 InlineExpander

```ts
type InlineExpanderProps = {
  expanded: boolean;
  children: React.ReactNode;
  collapsedHeight: number;
};
```

CSS class toggles only (`gridCollapseOpen` / `gridCollapseClosed`).

### 5.5 PanelOverflowMenu

```ts
type PanelOverflowItem = {
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
};

type PanelOverflowMenuProps = {
  items: PanelOverflowItem[];
  disabled?: boolean;
  busy?: boolean;
};
```

**Not a menu.** Never owns open/close state. Renders muted `⋯` plus optional static muted labels. No overlays, popups, dropdowns, portals, or focus management.

### 5.6 ContextDivider

Optional `className?` only.

### 5.7 PanelHeader (additive)

```ts
overflow?: React.ReactNode;
```

**Frozen slot order:** Title → Status → Badge → Chips → Primary actions → Overflow → Collapse.

---

## 6. Accessibility

- DisclosureSection / RevealButton / Advanced toggle: `aria-expanded`, `aria-controls`, `aria-label`
- PanelOverflowMenu button: `aria-label` (does nothing)
- ContextDivider: `aria-hidden`

---

## 7. Validations

```bash
npm run validate:ux-2.15
```

Runs UX-2.15 structural checks, delegates `validate:ux-2.14` (`UX_SKIP_DELEGATES=1` nested), then `tsc --noEmit` and ESLint.

---

## 8. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.15.1** | `workspace/disclosure/` presentational package exists | PASS |
| **CA-2.15.2** | Six primitives + barrel; DisclosureSection local-only; OverflowMenu never open/close | PASS |
| **CA-2.15.3** | PanelHeader accepts optional `overflow?` with frozen order | PASS |
| **CA-2.15.4** | Explorer / Inspector / Console reorganized without invented content | PASS |
| **CA-2.15.5** | No PanelState / focus / resize / persistence / modes coupling | PASS |
| **CA-2.15.6** | Roadmap 2.15–2.18 resequence documented | PASS |
| **CA-2.15.7** | `npm run validate:ux-2.15` PASS | PASS |

---

## 9. STOP

```text
UX-2.15 = COMPLETE (awaiting human review)
API FREEZE = DisclosureSection · AdvancedSection · RevealButton ·
             InlineExpander · PanelOverflowMenu · ContextDivider ·
             PanelHeader overflow?
PACKAGE ISOLATION = disclosure/ ⊥ state ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
Next: UX-2.16 — Panel Identity & Surface Foundation
Do NOT invent domain content · Do NOT add real menus · Do NOT reopen Panel.tsx
```
