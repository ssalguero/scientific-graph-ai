# UX-2.23 — Workspace Surface Polish Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.23 — BUILD (Workspace Surface Polish Foundation)  
**Fase:** Presentation layer composition + visual refinement  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.23 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.22 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.23 = COMPLETE (workspace surface polish foundation)
SCOPE = workspace/surface/ + Explorer/Inspector/Console/Canvas Surface wiring
API FREEZE = SURFACE_TOKENS · Surface · SurfaceHeader · SurfaceBody ·
             SurfaceFooter · SurfaceDivider
TOKEN RULE = SURFACE_TOKENS compose-only (independent local SSOT)
PanelSurface + PanelLayout PRESERVED (Surface never replaces PanelSurface)
ContextDivider → SurfaceDivider adapter (panels do not import SurfaceDivider)
NO "use client" · NO hooks · NO callbacks · NO public barrel export
NO frozen API changes · NO behavior changes
Next: UX-3.0 Docking Foundation
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce a unified **presentation layer** (`workspace/surface/`) for all workspace panels — elevation, spacing rhythm, header/body/footer chrome — without changing architecture, behavior, or frozen APIs from UX-2.16–UX-2.22.

---

## 2. Architecture

```text
PanelSurface (UX-2.16) — PRESERVED
 └── PanelAccent (UX-2.16; Explorer/Inspector/Console)
 └── Surface (UX-2.23) ← this phase
      └── PanelLayout (UX-2.18) — PRESERVED
           ├── SurfaceHeader → PanelHeaderRegion → SemanticHeader
           ├── SurfaceBody → PanelContentRegion → Content
           └── SurfaceFooter → PanelFooterRegion → SemanticFooter
```

```text
workspace/surface/
  SURFACE_TOKENS.ts
  Surface.tsx
  SurfaceHeader.tsx
  SurfaceBody.tsx
  SurfaceFooter.tsx
  SurfaceDivider.tsx
  index.ts                ← local barrel only
```

`Surface` **never** replaces `PanelSurface`. Both remain in the tree.

---

## 3. SURFACE_TOKENS (compose-only)

`SURFACE_TOKENS` is the package-local SSOT for surface polish class lookups.

**Independence rule:** It is a map of compose-only literals. It must **not** import, re-export, or depend directly on other token objects (`UI_TOKENS`, `surfaces` `SURFACE_TOKENS`, `CONTENT_TOKENS`, `LAYOUT_TOKENS`, etc.).

**Frozen keys:**

- `panelRadius` · `panelPadding` · `headerHeight` · `bodyGap` · `footerHeight`
- `surfaceBackground` · `surfaceBorder` · `surfaceShadow` · `dividerOpacity`
- `compactSpacing` · `normalSpacing` · `comfortableSpacing`

Literals alias existing workspace density (e.g. `rounded-md`, `p-2.5`, `gap-2`, `opacity-60`, `--app-*`).

---

## 4. Frozen public API

| Symbol | Responsibility | Props |
|--------|----------------|--------|
| **SURFACE_TOKENS** | Compose-only SSOT | — |
| **Surface** | bg · border · radius · overflow · shadow · flex-col | `children?` |
| **SurfaceHeader** | padding · align · spacing · min-height (no titles) | `children?` |
| **SurfaceBody** | padding · gap · flex · overflow | `children?` |
| **SurfaceFooter** | layout only | `children?` |
| **SurfaceDivider** | Official `<hr>` implementation | `className?` only — **no children** |

No internal helpers are exported. `@/components/workspace` barrel does **not** re-export `surface/`.

---

## 5. Divider adapter

```text
ContextDivider (UX-2.15 public facade)
        │
        ▼
SurfaceDivider (UX-2.23 official implementation)
```

- Explorer / Inspector / Console keep importing `ContextDivider`.
- Panels (and Canvas) **must not** import `SurfaceDivider` directly.
- `ContextDivider` props API unchanged; still references `surfaces` `SURFACE_TOKENS.divider` for UX-2.21 gate compatibility.

---

## 6. Wiring

| Surface | Change |
|---------|--------|
| **Explorer** | `Surface` + Header/Body/Footer around existing regions |
| **Inspector** | same |
| **Console** | same |
| **Canvas** | same inside `PanelSurface` (no `PanelAccent`; `PanelToolbarRegion` preserved between Header and Body) |

---

## 7. In scope

1. `workspace/surface/` presentational package + local barrel
2. Composition wiring in Explorer / Inspector / Console / Canvas
3. `ContextDivider` → `SurfaceDivider` adapter
4. This document + `validate:ux-2.23` + roadmap COMPLETE → UX-3.0

---

## 8. Out of scope

- `"use client"` or hooks inside `surface/`
- Changing PanelSurface / PanelLayout / Toolbar / Content / Semantics APIs
- Providers, stores, hooks, WindowManager, WorkspaceBody behavior
- Expanding public `@/components/workspace` barrel with `surface/`
- Replacing `ContextDivider` JSX in panels

---

## 9. Validation

```bash
npm run validate:ux-2.23
```

Delegates: `validate:ux-2.22` (leaf) → `tsc --noEmit` → eslint on surface / panels / disclosure / script.

---

## 10. Status

**UX-2.23 = COMPLETE (awaiting human review)**
