# UX-2.9 — Panel Resize System

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.9 — BUILD (Panel Resize System)  
**Fase:** Build infraestructura de resize interactivo entre paneles  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.9 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.8 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.9 = COMPLETE (panel resize system)
SCOPE = panels/resize/ + BodyLayout handles + memo content
SSOT = PanelProvider owns leftWidth / rightWidth / bottomHeight
RESIZE = session orchestration only (not a size store)
MATH = clamp / delta / applyLimits / computeNextSize / snap
HANDLE = Pointer Capture only (no window/document listeners)
PERSISTENCE = Handle → setters → PanelProvider → UX-2.8 (unchanged)
NO IndexedDB · NO new localStorage · NO schema bump · NO docking
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Add interactive splitters between Left / Canvas / Right / Bottom so the user can drag panel edges while sizes remain owned by UX-2.7 and persisted by UX-2.8.

---

## 2. Architecture

```text
PanelResizeHandle (Pointer Events + capture)
        │ client number only
        ▼
PanelResizeProvider (ResizeSession)
        │ computeNextSize(startSize, …)
        ▼
PanelProvider setters (setLeftWidth / setRightWidth / setBottomHeight)
        │
        ├── Panel CSS vars (geometry)
        └── UX-2.8 save(state) → localStorage
```

| Module | Role |
|--------|------|
| [`ResizeTypes.ts`](../src/components/workspace/panels/resize/ResizeTypes.ts) | `ResizeAxis`, `ResizeSession`, constraint bag type |
| [`ResizeConstraints.ts`](../src/components/workspace/panels/resize/ResizeConstraints.ts) | Frozen `MIN_*` / `MAX_*` / `HANDLE_SIZE` |
| [`ResizeMath.ts`](../src/components/workspace/panels/resize/ResizeMath.ts) | Pure math (exact export set) |
| [`PanelResizeContext.tsx`](../src/components/workspace/panels/resize/PanelResizeContext.tsx) | Context + frozen session API |
| [`PanelResizeProvider.tsx`](../src/components/workspace/panels/resize/PanelResizeProvider.tsx) | Session only; calls panel setters |
| [`PanelResizeHandle.tsx`](../src/components/workspace/panels/resize/PanelResizeHandle.tsx) | Presentational splitter |
| [`usePanelResize.ts`](../src/components/workspace/panels/resize/usePanelResize.ts) | Hook |
| [`index.ts`](../src/components/workspace/panels/resize/index.ts) | Barrel |

**Ownership:** `PanelResizeProvider` is **not** a size store. Durable sizes stay in `PanelProvider`.

---

## 3. Drag lifecycle

```text
pointerdown
  → setPointerCapture(pointerId)
  → beginResize(pointerId, axis, client)
       snapshots startSize from Panel State once

pointermove
  → updateResize(client)
       next = computeNextSize(startSize, startClient, client, axis, constraints)
       → setLeftWidth | setRightWidth | setBottomHeight

pointerup / pointercancel
  → endResize()
  → releasePointerCapture(pointerId)
```

**Rule:** Always `startSize + signedDelta`. Never `currentSize + delta`.

---

## 4. Frozen APIs

### ResizeSession

```ts
interface ResizeSession {
  axis: ResizeAxis
  pointerId: number
  startClient: number
  startSize: number
}
```

Never mutate `startSize` during drag.

### Provider API

```ts
beginResize(pointerId: number, axis: ResizeAxis, client: number): void
updateResize(client: number): void
endResize(): void
```

Primitives only — no `PointerEvent` in Provider or Math.

### ResizeMath (exact set)

| Function | Role |
|----------|------|
| `clamp` | Bound number |
| `delta` | `currentClient - startClient` |
| `applyLimits` | Axis min/max |
| `computeNextSize` | Single pure entry → `nextSize` |
| `snap` | Identity in UX-2.9 |

### Constraints

`MIN_LEFT` / `MAX_LEFT` / `MIN_RIGHT` / `MAX_RIGHT` / `MIN_BOTTOM` / `MAX_BOTTOM` / `HANDLE_SIZE`  
`MIN_* = 180` (aligned with `PANEL_MIN_SIZE`).

### Pointer Capture

Handle-only listeners. No `window` / `document` mouse globals. No `mousemove` / `mouseup`.

---

## 5. Integration

```tsx
<PanelProvider>
  <PanelResizeProvider>
    <WorkspaceBodyLayout>{workspace}</WorkspaceBodyLayout>
  </PanelResizeProvider>
</PanelProvider>
```

Body composition:

```text
Left | Handle(left) | Canvas | Handle(right) | Right
Handle(bottom)
Bottom
```

Handles hide when the adjacent panel is collapsed (and match responsive hide classes).

CSS variables and panel wrappers unchanged.

---

## 6. Persistence (UX-2.8)

No new storage. Flow:

```text
Handle → Provider → Panel setters → PanelProvider → save(state) → localStorage key scientific-graph-ai.panels
```

Schema v1 unchanged (`PersistedPanelEntry.size`).

---

## 7. Performance

`ExplorerContent` / `InspectorContent` / `ConsoleContent` wrapped in `React.memo`.  
During drag, geometry updates; content trees stay stable when props are unchanged.

---

## 8. Validation

```bash
npm run validate:ux-2.9
```

Delegates: `validate:ux-2.8`, `tsc --noEmit`.  
Prior amend: `validate-ux-2.4` allows `persistence` + `resize` directories.

---

## 9. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.9.1** | Left / right / bottom resizable via drag | PASS |
| **CA-2.9.2** | Min/max respected via ResizeConstraints | PASS |
| **CA-2.9.3** | Sizes persist via UX-2.8 (no new store) | PASS |
| **CA-2.9.4** | Content memoized; no remount during resize | PASS |
| **CA-2.9.5** | Pointer Capture only; no window/document listeners | PASS |
| **CA-2.9.6** | `npm run validate:ux-2.9` PASS | PASS |

---

## 10. STOP

```text
UX-2.9 = COMPLETE (awaiting human review)
Next: UX-3.0 — Docking System Foundation (after certification)
Do NOT open docking / panel relocation / collapse chrome in this phase.
Do NOT duplicate size ownership outside PanelProvider.
API FREEZE = ResizeSession · Provider API · ResizeMath · Constraints · Pointer Capture
```
