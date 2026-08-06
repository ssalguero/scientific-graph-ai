# UX-2.14 — Panel Status & Workspace Feedback Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.14 — BUILD (Panel Status & Workspace Feedback)  
**Fase:** Presentational status primitives + static panel/workspace wiring  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.14 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.13 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.14 = COMPLETE (panel status / workspace feedback)
SCOPE = workspace/status/ + PanelHeader status?/badge?/chips? + static mocks
API FREEZE = PanelVisualState · PanelStatusProps · StatusDotProps ·
             StatusBadgeProps · StatusChipProps · LoadingSkeletonProps
PACKAGE ISOLATION = status/ ⊥ PanelState ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
NO Panel.tsx change · NO domain branching · PanelBusyOverlay NOT mounted
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce a uniform visual language so panels and the workspace communicate idle / empty / loading / warning / error / success / synced feedback without reading body copy — presentational infrastructure only.

---

## 2. Architecture

```text
workspace/status/
  PanelVisualState.ts     ← contract (not UI)
  PanelStatus.tsx         ← StatusDot + children
  StatusDot.tsx
  StatusBadge.tsx
  StatusChip.tsx
  LoadingSkeleton.tsx
  PanelBusyOverlay.tsx    ← exported, not mounted
  index.ts

PanelHeader (+ status? / badge? / chips?)
  LeftPanel   → PanelStatus + StatusBadge
  RightPanel  → PanelStatus + StatusBadge + StatusChip
  BottomPanel → PanelStatus + StatusBadge + StatusChip
WorkspaceBodyLayout canvas → StatusChip (near HintGroup)
```

```text
status/  ──✗──►  panels/state
status/  ──✗──►  panels/persistence
status/  ──✗──►  panels/resize
status/  ──✗──►  focus/
status/  ──✗──►  modes
status/  ──✗──►  session
```

**Mapping:** Explorer → Left · Inspector → Right · Console → Bottom · Canvas → BodyLayout chip.

---

## 3. IN

1. `workspace/status/` presentational package + `PanelVisualState` contract file
2. Additive optional `status?` / `badge?` / `chips?` on `PanelHeader`
3. Static mock wiring in LeftPanel / RightPanel / BottomPanel
4. Static `StatusChip` near HintGroup in WorkspaceBodyLayout
5. This document + `validate:ux-2.14` + roadmap resequence (2.14–2.17)

---

## 4. OUT

- Mounting `PanelBusyOverlay`
- Real selection / console error / sync wiring
- Panel.tsx / PanelState / persistence / focus / resize / modes / session
- New `UI_TOKENS` keys
- Expanding public `@/components/workspace` barrel with `status/`
- Domain stores or conditional rendering from real state

---

## 5. Frozen APIs

### 5.1 PanelVisualState (contract)

```ts
export type PanelVisualState =
  | "idle"
  | "active"
  | "loading"
  | "busy"
  | "empty"
  | "warning"
  | "error"
  | "success";
```

Lives in `PanelVisualState.ts` only — not defined inside `PanelStatus.tsx`.

### 5.2 PanelStatus

```ts
type PanelStatusProps = {
  state: PanelVisualState;
  children?: React.ReactNode;
};
```

### 5.3 PanelHeader (additive)

```ts
status?: React.ReactNode;
badge?: React.ReactNode;
chips?: React.ReactNode;
```

---

## 6. Accessibility

- StatusBadge: required `aria-label`
- StatusDot: `role="status"` + `aria-label`
- LoadingSkeleton: `aria-hidden`
- PanelBusyOverlay: `aria-hidden` (when eventually mounted)

---

## 7. Validations

```bash
npm run validate:ux-2.14
```

Runs UX-2.14 structural checks, delegates `validate:ux-2.13`, then `tsc --noEmit` and ESLint. Asserts **component** usage (e.g. `<StatusBadge`), not badge copy strings.

---

## 8. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.14.1** | `workspace/status/` presentational package exists | PASS |
| **CA-2.14.2** | `PanelVisualState` is a standalone contract file | PASS |
| **CA-2.14.3** | PanelHeader accepts optional status / badge / chips | PASS |
| **CA-2.14.4** | Left / Right / Bottom wire Status* components statically | PASS |
| **CA-2.14.5** | PanelBusyOverlay exported but not mounted | PASS |
| **CA-2.14.6** | No PanelState / focus / resize / persistence / modes coupling | PASS |
| **CA-2.14.7** | `npm run validate:ux-2.14` PASS | PASS |

---

## 9. STOP

```text
UX-2.14 = COMPLETE (awaiting human review)
API FREEZE = PanelVisualState · PanelStatusProps · StatusDotProps ·
             StatusBadgeProps · StatusChipProps · LoadingSkeletonProps ·
             PanelHeader status?/badge?/chips?
PACKAGE ISOLATION = status/ ⊥ state ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
Next: UX-2.15 — Progressive Disclosure Foundation
Do NOT mount PanelBusyOverlay · Do NOT add domain branching · Do NOT reopen Panel.tsx
```
