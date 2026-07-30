# UX-2.13 — Workspace Orientation & Progressive Disclosure

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.13 — BUILD (Workspace Orientation & Progressive Disclosure)  
**Fase:** UI-only active panel focus + visual orientation chrome  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.13 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.12 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.13 = COMPLETE (workspace orientation / progressive disclosure)
SCOPE = ActivePanelProvider + isActive chrome + data-panel-id/active
API FREEZE = ActivePanelId · DEFAULT_ACTIVE_PANEL · isActive? on Panel/Header/Rail
PACKAGE ISOLATION = focus/ ⊥ PanelState ⊥ persistence ⊥ resize ⊥ modes
HIERARCHY ≠ FOCUS = Canvas always Primary Surface; any surface may be active
ACTIVATION = pointerdown only
UNIDIRECTIONAL = PanelProvider / PanelResizeProvider never import focus/
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Reduce “what do I do now?” by giving the workspace a clear visual work context: exactly one active surface, secondary panels that read as auxiliaries, and Canvas that remains the Primary Surface by hierarchy styles regardless of focus.

Orientation only — no scientific functionality, layout geometry, persistence, or domain logic.

---

## 2. Architecture

```text
WorkspaceContent
  → WorkspaceModeProvider
    → PanelProvider
      → PanelResizeProvider
        → ActivePanelProvider
          → WorkspaceBodyLayout
               ├── LeftPanel / LeftExpandRail
               ├── Canvas (Primary Surface)
               ├── RightPanel / RightExpandRail
               └── BottomPanel / BottomExpandRail
```

```text
focus/  ──✗──►  panels/state
focus/  ──✗──►  panels/persistence
focus/  ──✗──►  panels/resize
focus/  ──✗──►  modes
panels/state  ──✗──►  focus/
panels/resize ──✗──►  focus/
```

**Mapping:** Explorer → `left` · Inspector → `right` · Console → `bottom` · Canvas → `canvas`.

---

## 3. IN

1. `workspace/focus/` — `ActivePanelId`, `DEFAULT_ACTIVE_PANEL`, context, provider, hook
2. Additive optional `isActive?: boolean` on `Panel` / `PanelHeader` / `PanelExpandRail`
3. `data-panel-id` + `data-panel-active` on activatable surfaces
4. `pointerdown` activation loci: LeftPanel, RightPanel, BottomPanel, WorkspaceBodyLayout
5. Visual active chrome (border, shadow, header contrast, accent bar, transitions)
6. Hover / focus-ring / cursor polish on touched chrome (Tailwind + `--app-*` only)
7. This document + `validate:ux-2.13` + roadmap resequence

---

## 4. OUT

- PanelState / PanelProvider / persistence / resize math / modes edits
- Persistence or serialization of `activePanelId`
- Docking, tabs, layout geometry changes
- Graph / canvas domain logic, shortcuts, selection, zoom/pan
- New CSS files / `workspace.css` / new `UI_TOKENS` keys
- Renames, aliases, extra wrappers for File API
- Expanding public `@/components/workspace` barrel with `focus/`

---

## 5. Frozen APIs

### 5.1 ActivePanelId

```ts
export type ActivePanelId =
  | "canvas"
  | "left"
  | "right"
  | "bottom";

export const DEFAULT_ACTIVE_PANEL: ActivePanelId = "canvas";
```

### 5.2 Context value

```ts
type PanelFocusContextValue = {
  activePanelId: ActivePanelId;
  setActivePanel(id: ActivePanelId): void;
};
```

### 5.3 Presentational `isActive` (optional)

```ts
// Panel / PanelHeader / PanelExpandRail
isActive?: boolean;
```

---

## 6. Accessibility

- Activation is pointer-driven UI state (not HTML focus ownership)
- Collapse/expand keyboard focus handoff from UX-2.11 unchanged
- Interactive controls reuse  
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30`

---

## 7. Validations

```bash
npm run validate:ux-2.13
```

Runs UX-2.13 checks, TypeScript `--noEmit`, and leaf regressions UX-2.7 → UX-2.12 (`UX_SKIP_DELEGATES=1`).

---

## 8. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.13.1** | Exactly one active panel always (`ActivePanelId`) | PASS |
| **CA-2.13.2** | `pointerdown` changes active surface; collapse/expand conserve it | PASS |
| **CA-2.13.3** | Active chrome (border, shadow, header, accent bar) without layout change | PASS |
| **CA-2.13.4** | Canvas remains Primary Surface; may also be active | PASS |
| **CA-2.13.5** | `data-panel-id` + `data-panel-active` on activatable surfaces | PASS |
| **CA-2.13.6** | `focus/` orthogonal; no PanelState / persistence / resize / modes coupling | PASS |
| **CA-2.13.7** | Unidirectional: PanelProvider / PanelResizeProvider do not import `focus/` | PASS |
| **CA-2.13.8** | `npm run validate:ux-2.13` PASS | PASS |

---

## 9. STOP

```text
UX-2.13 = COMPLETE (awaiting human review)
API FREEZE = ActivePanelId · DEFAULT_ACTIVE_PANEL · isActive?
PACKAGE ISOLATION = focus/ ⊥ state ⊥ persistence ⊥ resize ⊥ modes
Next: UX-2.14 — Toolbar & Action Refinement
Do NOT reopen panel architecture · Do NOT persist activePanelId · Do NOT add shortcuts/domain
```
