# UX-2.12 — Contextual Actions & Empty States Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.12 — BUILD (Contextual Actions & Empty States)  
**Fase:** Presentational empty states, header actions, and inline hints  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.12 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.11 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.12 = COMPLETE (empty states / contextual actions / hints)
SCOPE = EmptyState + ContextActions + HintGroup (presentational only)
API FREEZE = EmptyStateProps · ContextActionItem · ContextActionsProps · HintProps · HintGroupProps
PACKAGE ISOLATION = empty/ ⊥ actions/ ⊥ hints/
NO Panel.tsx change · NO PanelState · NO persistence · NO resize · NO modes
NO domain branching (series.length / selection)
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Replace muted `(empty)` panel placeholders with professional empty states, add prop-driven contextual actions in panel headers, and mount inline workspace hints — without application logic, state, or architecture changes.

---

## 2. Architecture

```text
Panel (unchanged)
  PanelHeader (+ actions?: ReactNode)
    ContextActions          ← workspace/actions (props only)
  PanelBody
    *Content
      PanelContentSection
        EmptyState          ← panels/empty (always rendered this phase)
HintGroup                   ← workspace/hints on canvas (props only)
```

```text
empty/  ──✗──►  actions/
empty/  ──✗──►  hints/
actions/ ──✗──►  empty/
actions/ ──✗──►  hints/
hints/  ──✗──►  empty/
hints/  ──✗──►  actions/
```

**Mapping:** Series examples → Explorer (`ExplorerContent` + `LeftPanel`). Panel titles remain Explorer / Inspector / Console.

---

## 3. IN

1. `panels/empty/` — EmptyState composer + EmptyIcon / EmptyTitle / EmptyDescription / EmptyAction
2. `workspace/actions/` — ContextAction + ContextActions
3. `workspace/hints/` — Hint + HintBadge + HintGroup
4. Additive `actions?: ReactNode` on PanelHeader
5. Static ContextActions in LeftPanel / RightPanel
6. EmptyState in Explorer / Inspector / Console content
7. Static HintGroup in WorkspaceBodyLayout canvas
8. This document + `validate:ux-2.12` + roadmap STOP status

---

## 4. OUT

- Panel.tsx API / geometry
- PanelState / PanelProvider / persistence / resize / modes
- Real series/selection handlers or domain branching
- New UI_TOKENS keys
- Expanding `@/components/workspace` public barrel
- Toolbar rewrite, docking, window / session systems
- Toast / modal / popup hints
- Preference wiring (`showContextualHints`)

---

## 5. Frozen APIs

### 5.1 EmptyState

```ts
type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};
```

### 5.2 ContextActionItem / ContextActions

```ts
type ContextActionItem = {
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
};

type ContextActionsProps = {
  actions: ContextActionItem[];
  orientation?: "horizontal" | "vertical";
};
```

Do **not** add: icon, variant, tooltip, shortcut, color, danger, size, loading.

### 5.3 Hint / HintGroup

```ts
type HintProps = {
  variant?: "tip" | "info";
  children: React.ReactNode;
};

type HintGroupProps = {
  children: React.ReactNode;
};
```

### 5.4 PanelHeader (additive)

```ts
type PanelHeaderProps = {
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
  actions?: React.ReactNode;
};
```

---

## 6. Accessibility

- EmptyState: `role="status"`
- ContextAction / Empty action buttons: `type="button"`, `aria-label`, keyboard focusable
- Hint: `role="note"`
- Collapse focus handoff from UX-2.11 unchanged

---

## 7. Validations

```bash
npm run validate:ux-2.12
```

Runs UX-2.12 checks, TypeScript `--noEmit`, and leaf regressions UX-2.7 → UX-2.11 (`UX_SKIP_DELEGATES=1`). Does **not** include `validate:ux-2.6`.

---

## 8. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.12.1** | Professional EmptyState replaces muted empty copy | PASS |
| **CA-2.12.2** | ContextActions rendered via PanelHeader `actions` | PASS |
| **CA-2.12.3** | HintGroup visible on workspace canvas | PASS |
| **CA-2.12.4** | No domain coupling in empty/actions/hints | PASS |
| **CA-2.12.5** | PanelState / Resize / Persistence unchanged | PASS |
| **CA-2.12.6** | Packages remain isolated | PASS |
| **CA-2.12.7** | `npm run validate:ux-2.12` PASS | PASS |

---

## 9. STOP

```text
UX-2.12 = COMPLETE (awaiting human review)
API FREEZE = EmptyStateProps · ContextActionItem · ContextActionsProps ·
             HintProps · HintGroupProps · PanelHeader actions?
PACKAGE ISOLATION = empty/ ⊥ actions/ ⊥ hints/
Next: UX-2.13 — Toolbar & Action Refinement
Do NOT reopen panel architecture · Do NOT add domain branching · Do NOT extend frozen APIs
```
