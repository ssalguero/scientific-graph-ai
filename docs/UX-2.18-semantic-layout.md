# UX-2.18 — Semantic Layout Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.18 — BUILD (Semantic Layout Foundation)  
**Fase:** Presentational semantic layout + wiring  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.18 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.17 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.18 = COMPLETE (semantic layout foundation)
SCOPE = workspace/layout/ + Explorer/Inspector/Console/Canvas shell wiring
API FREEZE = PanelLayout · PanelHeaderRegion · PanelToolbarRegion ·
             PanelContentRegion · PanelFooterRegion · PanelEmptyRegion · LAYOUT_TOKENS
PACKAGE ISOLATION = layout/ ⊥ PanelState ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
NO VARIANTS · NO density · NO orientation · NO direction props
CANONICAL ORDER (documented, not enforced) = Header → Toolbar → Content → Footer
DENSITY = EQUIVALENT to UX-2.17 (visual change = bug)
NO "use client" · NO hooks · NO callbacks · NO public barrel export
READY FOR HUMAN REVIEW
```

---

## 1. Goals

Introduce a semantic layout layer so panel shells express interface intent (header, toolbar, content, footer) instead of manual Stack/Section composition — without changing appearance, behavior, state, or domain.

---

## 2. In Scope

1. `workspace/layout/` presentational package (LayoutTokens + six components + barrel)
2. Layout-only wiring in Explorer / Inspector / Console + Canvas inner `PanelSurface`
3. This document + `validate:ux-2.18` + roadmap resequence (2.18–2.21)
4. Amend UX-2.17 wiring asserts to accept `PanelLayout` as the semantic shell

---

## 3. Out of Scope

- `"use client"` or hooks inside `layout/`
- Variants / density / compact / orientation / direction / padding / gap props on layout components
- Scroll, overflow, sticky, flex-1, resize, drag, focus, selection, keyboard, commands
- AdaptiveToolbar / Toolbar & Action Refinement (→ UX-2.19)
- PanelState / persistence / resize / focus / modes / session / docking
- Outer canvas node / resize handles / rails / focus activation changes
- Replacing UX-2.15 `ContextDivider` or UX-2.16 `PanelDivider`
- Expanding public `@/components/workspace` barrel with `layout/`
- Density redesign

---

## 4. Architecture

```text
Surface (UX-2.16)     ← visual identity
    ↓
Semantic Layout (UX-2.18)  ← region intent
    ↓
Composition (UX-2.17) ← affinity / grouping
    ↓
Domain Content
```

```text
workspace/layout/
  LayoutTokens.ts         ← sole spacing SSOT
  PanelLayout.tsx         ← flex column + panelGap; render children
  PanelHeaderRegion.tsx
  PanelToolbarRegion.tsx
  PanelContentRegion.tsx
  PanelFooterRegion.tsx
  PanelEmptyRegion.tsx
  index.ts                ← local barrel only
```

```text
layout/
    │
    ▼
LAYOUT_TOKENS (spacing only)

layout/  ──✗──►  SURFACE_TOKENS
layout/  ──✗──►  composition/
layout/  ──✗──►  panels/state
layout/  ──✗──►  panels/persistence
layout/  ──✗──►  panels/resize
layout/  ──✗──►  focus/
layout/  ──✗──►  modes
layout/  ──✗──►  session
layout/  ──✗──►  providers
```

**Density note:** `LAYOUT_TOKENS` values are visually equivalent to UX-2.17 composition spacing. Any meaningful visual change in review is a bug.

---

## 5. Package

| Module | Responsibility |
|--------|----------------|
| **LayoutTokens** | Sole spacing SSOT for the package |
| **PanelLayout** | Vertical flex + `panelGap`; renders children as-is |
| **PanelHeaderRegion** | Vertical flex + `headerGap`; padding none |
| **PanelToolbarRegion** | Horizontal flex + wrap + `toolbarGap` |
| **PanelContentRegion** | Vertical flex + `contentGap`; no scroll/overflow/flex-1 |
| **PanelFooterRegion** | Vertical flex + `footerGap`; padding none |
| **PanelEmptyRegion** | Presentational empty shell (`regionPadding` + `emptyMinHeight`) |

---

## 6. API Freeze

Every layout component exposes exactly:

```ts
type Props = {
  children: React.ReactNode;
  className?: string;
};
```

No additional props. No variants. No density. No compact mode. No orientation. No direction. No padding. No gap configuration.

If a different structural layout is needed later, add a **new semantic component** — do not turn `PanelLayout` into a configurable layout engine.

---

## 7. Canonical Region Order

Documented contract (JSDoc + this doc). **Not enforced by `PanelLayout`.**

```text
Header
  ↓
Toolbar
  ↓
Content
  ↓
Footer
```

Callers may omit unused regions. When present, they should follow this order. `PanelLayout` simply renders `children`.

---

## 8. LayoutTokens

```ts
LAYOUT_TOKENS = {
  panelGap
  headerGap
  toolbarGap
  contentGap
  footerGap
  regionPadding.none | .sm | .md
  emptyMinHeight
}
```

Layout components may only read `LAYOUT_TOKENS`. No local Tailwind spacing literals. Never import `SURFACE_TOKENS` or composition tokens.

---

## 9. Wiring

| Panel | Structure |
|-------|-----------|
| **Explorer** | `PanelSurface` → Accent → `PanelLayout` → Header (identity) → Content (`WorkspaceGroup` + disclosure) |
| **Inspector** | `PanelSurface` → Accent → `PanelLayout` → Content (Divider order preserved + `WorkspaceGroup`) |
| **Console** | `PanelSurface` → Accent → `PanelLayout` → Content (`WorkspaceGroup`) |
| **Canvas** | outer `data-workspace-canvas` untouched → `PanelSurface` → `PanelLayout` → Toolbar (Hints + StatusChip) → Content (`{children}`) |

`WorkspaceGroup` remains for affinity inside Content. `PanelEmptyRegion` is shipped but not required in panel trees this phase.

---

## 10. Validations

```bash
npm run validate:ux-2.18
```

Runs UX-2.18 structural checks, delegates `validate:ux-2.17` (`UX_SKIP_DELEGATES` leaf pattern), then `tsc --noEmit` and ESLint.

---

## 11. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.18.1** | `workspace/layout/` package exists | PASS |
| **CA-2.18.2** | `LAYOUT_TOKENS` is the only spacing SSOT | PASS |
| **CA-2.18.3** | `PanelLayout` only renders region children | PASS |
| **CA-2.18.4** | Regions presentational; API freeze respected | PASS |
| **CA-2.18.5** | No variants / density / orientation props | PASS |
| **CA-2.18.6** | Canonical order documented, not enforced | PASS |
| **CA-2.18.7** | Explorer / Inspector / Console / Canvas migrated | PASS |
| **CA-2.18.8** | No appreciable visual change vs UX-2.17 | PASS |
| **CA-2.18.9** | No PanelState / focus / resize / persistence / modes coupling | PASS |
| **CA-2.18.10** | Roadmap 2.18 Layout → 2.19 Toolbar → 2.20 Iconography → 2.21 Polish | PASS |
| **CA-2.18.11** | `npm run validate:ux-2.18` PASS | PASS |

---

## 12. STOP

```text
UX-2.18 = COMPLETE (awaiting human review)
API FREEZE = PanelLayout · regions · LAYOUT_TOKENS
PACKAGE ISOLATION = layout/ ⊥ state ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
NO VARIANTS on PanelLayout — new layouts = new components
Next: UX-2.19 — Toolbar & Action Refinement
Do NOT redesign density · Do NOT reopen Panel.tsx · Do NOT export layout publicly
```
