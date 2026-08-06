# UX-2.7 — Panel State & Resizing Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.7 — BUILD (Panel State & Resizing Foundation)  
**Fase:** Build infraestructura de estado visual de paneles  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.7 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.6 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.7 = COMPLETE (panel state foundation)
SCOPE = PanelProvider / Context / usePanelState + CSS-var sizing
BEHAVIOR = defaults expanded (280 / 320 / 240); collapse API ready, no chrome buttons
state nested on context (state: PanelState)
DEFAULT_PANEL_STATE = Readonly
PANEL_CSS_VARS = SSOT for --workspace-*-*
children ALWAYS mounted (collapse = geometry only)
NO ResizeHandle · NO drag · NO snap · NO docking · NO persistence · NO animations
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce panel visual state infrastructure so UX-2.8 can add resize handles without redesigning ownership, sizing, or collapse geometry.

---

## 2. IN

1. [`src/components/workspace/panels/state/`](../src/components/workspace/panels/state/) — PanelState, Context, Provider, hook, barrel
2. Wire `PanelProvider` in [`WorkspaceContent.tsx`](../src/components/workspace/WorkspaceContent.tsx) around BodyLayout only
3. [`WorkspaceBodyLayout`](../src/components/workspace/panels/WorkspaceBodyLayout.tsx) reads `usePanelState()` and passes `collapsed` + `size`
4. [`Panel.tsx`](../src/components/workspace/panels/Panel.tsx) — `PANEL_CSS_VARS`, `size` / `sizeKey`; remove hardcoded Tailwind sizes
5. Left / Right / Bottom wrappers forward `collapsed` + `size` + fixed `sizeKey`
6. `validate:ux-2.7` + amend UX-2.4 / 2.5 / 2.6 hook carve-outs
7. This document + roadmap resequence

---

## 3. OUT

- ResizeHandle / splitters / pointer events
- Collapse / expand UI buttons
- Drag / snap / docking
- localStorage / IndexedDB / layout persistence
- Changes to GraphEditor, Series, Window System, Sessions, Persistence, Charts, Canvas, Docking, `page.tsx`
- Expansion of public `@/components/workspace` barrel

---

## 4. Frozen decisions

### 4.1 Ownership

```text
WorkspaceContent (no hooks)
  ├── Toolbar / Header  (outside Provider)
  └── PanelProvider     (exactly one; only here)
        └── WorkspaceBodyLayout  (usePanelState)
              ├── LeftPanel(collapsed, size)
              ├── data-workspace-canvas → {children}
              ├── RightPanel(collapsed, size)
              └── BottomPanel(collapsed, size)
```

### 4.2 Context shape

```ts
interface PanelContextValue {
  state: PanelState;
  collapseLeft(): void;
  expandLeft(): void;
  toggleLeft(): void;
  // … right / bottom …
  setLeftWidth(width: number): void;
  setRightWidth(width: number): void;
  setBottomHeight(height: number): void;
}
```

State is **not** flattened onto the context value.

### 4.3 Defaults & clamps

| Field | Default | Setter clamp |
|-------|---------|--------------|
| leftWidth | 280 | `Math.max(180, …)` |
| rightWidth | 320 | `Math.max(180, …)` |
| bottomHeight | 240 | `Math.max(180, …)` |

`DEFAULT_PANEL_STATE: Readonly<PanelState>`. No dock token imports. No maximum yet.

### 4.4 CSS variables

```ts
const PANEL_CSS_VARS = {
  left: "--workspace-left-width",
  right: "--workspace-right-width",
  bottom: "--workspace-bottom-height",
} as const;
```

Sizing uses **only** these variables. `sizeKey` selects the var; Panel stays side-agnostic for size wiring.

### 4.5 Collapsed mount contract

```text
collapsed → width/height 0 + overflow-hidden
children ALWAYS remain mounted
NEVER collapsed ? null : children
```

Explorer / Inspector / Console keep internal state across collapse (required by UX-2.10+).

### 4.6 PanelId

```ts
export type PanelId = "left" | "right" | "bottom";
```

Exported now; unused until UX-2.8 ResizeHandle.

---

## 5. Validation

```bash
npm run validate:ux-2.7
```

Also: `validate:ux-2.4`, `validate:ux-2.5`, `validate:ux-2.6`, `validate:workspace-architecture`, `validate:design-tokens-v2`, `npx tsc --noEmit`.

Prior gates amended: hooks allowed only in `panels/state/**` and `WorkspaceBodyLayout.tsx`.

---

## 6. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.7.1** | state/ Provider, Context, hook, PanelState, index exist | PASS |
| **CA-2.7.2** | Exactly one PanelProvider; only in WorkspaceContent | PASS |
| **CA-2.7.3** | BodyLayout uses hook; forwards collapsed + size | PASS |
| **CA-2.7.4** | CSS vars only; no EXPANDED_SIZE / Tailwind fixed sizes | PASS |
| **CA-2.7.5** | Setters clamp Math.max(180, …); nested state on context | PASS |
| **CA-2.7.6** | No persistence keywords in panels/state | PASS |
| **CA-2.7.7** | `npm run validate:ux-2.7` PASS | PASS |

---

## 7. Regression Gate (non-touch confirmation)

| Check | Expected |
|-------|----------|
| Session Restore | PASS (untouched) |
| Autosave | PASS (untouched) |
| Window Tabs | PASS (untouched) |
| Floating Windows | PASS (untouched) |
| Docking | PASS (untouched) |
| Snap | PASS (untouched) |
| Export | PASS (untouched) |
| Theme switch | PASS (`--app-*` via shell) |

---

## 8. STOP

```text
UX-2.7 = COMPLETE (awaiting human review)
Next: UX-2.8 Resize Handles — after certification.
Do NOT add ResizeHandle / persistence / collapse buttons in this phase.
Do NOT break children-always-mounted contract.
```
