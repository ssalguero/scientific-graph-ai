# UX-2.11 — Collapse / Expand UI

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.11 — BUILD (Collapse / Expand UI)  
**Fase:** Build chrome presentacional para colapsar / expandir paneles IDE  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.11 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.10 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.11 = COMPLETE (collapse / expand UI)
SCOPE = PanelHeader toggle + BodyLayout expand rails + focus + CSS animated class
SSOT = PanelProvider toggle*/expand* (UX-2.7) + persistence (UX-2.8) unchanged
ANIMATION = class only when resize.session == null (no gelatina with UX-2.9)
NO PanelState reshape · NO persistence schema · NO resize math · NO docking
NO toolbar rewire · NO File/Edit/View · NO visual hierarchy polish
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Add collapse / expand chrome for Explorer, Inspector, and Console using only the state API and persistence already shipped in UX-2.7–2.10.

---

## 2. Architecture

```text
WorkspaceBodyLayout
  ├── LeftExpandRail          (if leftCollapsed → expandLeft)
  ├── LeftPanel
  │     └── PanelHeader onToggle → toggleLeft
  ├── Handle(left)?
  ├── Canvas
  ├── Handle(right)?
  ├── RightPanel
  │     └── PanelHeader onToggle → toggleRight
  ├── RightExpandRail         (if rightCollapsed → expandRight)
  ├── Handle(bottom)?
  ├── BottomPanel
  │     └── PanelHeader onToggle → toggleBottom
  └── BottomExpandRail        (if bottomCollapsed → expandBottom)
```

```text
Header toggle / Expand rail
        │
        ▼
usePanelState()  →  toggle* / expand*
        │
        ▼
PanelProvider state (*Collapsed)
        │
        ├── Panel geometry (width/height 0) + optional animated class
        └── UX-2.8 save(state)  (unchanged)
```

**Rule (frozen):** Rails live in `WorkspaceBodyLayout`, never inside `Panel` (avoids `width: 0` + `overflow: hidden`).

---

## 3. IN

1. [`PanelHeader.tsx`](../src/components/workspace/panels/PanelHeader.tsx) — additive `collapsed?` / `onToggle?`
2. Left / Right / Bottom wrappers — wire `toggle*` via `usePanelState()`
3. Expand rails in [`WorkspaceBodyLayout.tsx`](../src/components/workspace/panels/WorkspaceBodyLayout.tsx) (+ [`PanelExpandRail.tsx`](../src/components/workspace/panels/PanelExpandRail.tsx))
4. Presentational `animated` class on Panel when `resize.session == null`
5. Focus handoff: collapse → rail; expand from rail → header toggle
6. This document + `validate:ux-2.11` + roadmap STOP status

---

## 4. OUT

- AdaptiveToolbar / Sidebar / canvas action rewire
- File / Edit / View menus
- PanelState / PanelContext / PanelProvider shape changes
- `persistence/` schema, serializers, storage
- ResizeMath / Pointer Capture / constraints (UX-2.9)
- Docking, modes, visual hierarchy, spacing, empty states, scrollbars
- New `UI_TOKENS` keys
- Expanding `@/components/workspace` public barrel

---

## 5. Frozen decisions

### 5.1 PanelHeader (generic)

```ts
type PanelHeaderProps = {
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
};
```

- `aria-label` from `title`: `Collapse ${title}` / `Expand ${title}`
- No imports of PanelState, Persistence, or Resize internals
- Icons only from `src/lib/ui/icons.ts` (`collapse` / `expand`)

### 5.2 Collapsed geometry (unchanged)

```text
collapsed → width 0 | height 0 + overflow-hidden
children ALWAYS remain mounted
```

### 5.3 Animation

```text
animated = resize.session == null
class transition-[width,height] duration-200 only when animated
NO inline transition styles
NO ResizeMath / handle changes
```

### 5.4 Focus

```text
Collapse (header toggle) → focus [data-panel-expand]
Expand (rail)            → focus [data-panel-toggle] inside panel
```

### 5.5 Persistence

UX-2.8 already persists `collapsed`. No schema bump. No persistence file edits.

---

## 6. Components modified / created

| Path | Role |
|------|------|
| `PanelHeader.tsx` | Toggle button |
| `LeftPanel.tsx` / `RightPanel.tsx` / `BottomPanel.tsx` | Wire `toggle*` + focus on collapse |
| `Panel.tsx` | Optional `animated` class |
| `PanelExpandRail.tsx` | Left / Right / Bottom expand rails |
| `WorkspaceBodyLayout.tsx` | Mount rails; pass `animated` |
| `panels/index.ts` | Export rails (panels barrel only) |

---

## 7. Validations

```bash
npm run validate:ux-2.11
```

Runs UX-2.11 checks, TypeScript `--noEmit`, and automatically executes leaf regressions:

- `scripts/validate-ux-2.7.ts`
- `scripts/validate-ux-2.8.ts`
- `scripts/validate-ux-2.9.ts`
- `scripts/validate-ux-2.10.ts`

(with `UX_SKIP_DELEGATES=1` to avoid nested npm/tsc fan-out; each script still runs its full local assert suite)

---

## 8. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.11.1** | Explorer / Inspector / Console can collapse | PASS |
| **CA-2.11.2** | Visible expand affordance when collapsed | PASS |
| **CA-2.11.3** | Collapsed persists via UX-2.8; schema unchanged | PASS |
| **CA-2.11.4** | Smooth transition; no resize gelatina | PASS |
| **CA-2.11.5** | Children stay mounted when collapsed | PASS |
| **CA-2.11.6** | `npm run validate:ux-2.11` PASS | PASS |
| **CA-2.11.7** | Regression UX-2.7–2.10 PASS | PASS |

---

## 9. STOP

```text
UX-2.11 = COMPLETE (awaiting human review)
API FREEZE = PanelState · PanelContext · PanelProvider · persistence schema v1 ·
             ResizeMath · PanelResizeContext · WorkspaceMode*
Next: UX-2.12 — Forms (roadmap)
Do NOT reopen panel architecture · Do NOT add toolbar menus · Do NOT reshape PanelState
```
