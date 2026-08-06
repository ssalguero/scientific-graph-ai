# UX-2.25 — Workspace Density & Spacing System

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.25 — BUILD (Workspace Density & Spacing System)  
**Fase:** Presentational density / spacing SSOT  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.25 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.24 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.25 = COMPLETE (workspace density & spacing system)
SCOPE = workspace/density/ + DensityProvider wiring + hardcode removal +
        unidirectional parity (Density → Layout / Surface / Content / Semantic)
API FREEZE = WORKSPACE_DENSITY_TOKENS · DensityProvider · DensitySpacer
TOKEN RULE = WORKSPACE_DENSITY_TOKENS compose-only (canonical spacing SSOT)
DensityProvider = compose-only semantic boundary (Fragment; NOT Context)
DensitySpacer = deterministic DENSITY_SPACER_MAP (no if / switch / ternary)
NO "use client" · NO hooks · NO Context · NO runtime logic · NO public barrel export
NO typography / colors / iconography / layout / behavior changes
PIXEL PARITY = UX-2.24 comfortable scale (consolidation only)
Next: UX-3.0 Docking Foundation
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Unify workspace visual density through a single spacing SSOT (`workspace/density/`) — padding, gaps, and chrome heights — without changing architecture, behavior, or frozen APIs from UX-2.16–UX-2.24.

---

## 2. Architecture

```text
WORKSPACE_DENSITY_TOKENS (UX-2.25)     ← spacing authority (SSOT)
  ↓ unidirectional parity (never reverse)
LAYOUT_TOKENS · SURFACE_TOKENS · CONTENT_TOKENS · SEMANTIC_TOKENS
  (independent compose-only mirrors — no token-object imports)

DensityProvider  → Fragment semantic boundary around shells / panels
DensitySpacer    → presentational spacer via frozen DENSITY_SPACER_MAP
```

```text
workspace/density/
  densityTokens.ts
  DensityProvider.tsx
  DensitySpacer.tsx
  index.ts                ← local barrel only
```

`@/components/workspace` barrel does **not** re-export `density/`.

---

## 3. WORKSPACE_DENSITY_TOKENS (compose-only)

Canonical spacing authority. Frozen keys:

| Key | Value |
|-----|-------|
| `panelPadding` | `p-2.5` |
| `panelGap` | `gap-2` |
| `headerHeight` | `min-h-8` |
| `headerGap` | `gap-2` |
| `contentGap` | `gap-2` |
| `sectionGap` | `my-2.5` |
| `rowGap` | `gap-2` |
| `controlHeight` | `min-h-4` |
| `toolbarGap` | `gap-2` |
| `iconGap` | `gap-1.5` |
| `listGap` | `gap-1.5` |
| `cardGap` | `gap-2` |

**Independence rule:** Must not import/re-export other `*_TOKENS` objects.

**Parity model (locked):** Density is the **only** authority.

```text
Density
  ↓
Layout
Surface
Content
Semantic
```

Validators assert `Density.X === mirror.X`. If mirrors disagree, **edit the mirror** — never Density.

---

## 4. Frozen public API

| Symbol | Responsibility | Props |
|--------|----------------|-------|
| **WORKSPACE_DENSITY_TOKENS** | Spacing SSOT | — |
| **DensityProvider** | Compose-only semantic boundary | `density?` · `children?` |
| **DensitySpacer** | Presentational spacer | `size` |

No internal helpers (`DENSITY_SPACER_MAP` is file-private).

### DensityProvider — architectural marker, not a provider

> **DensityProvider is a compose-only semantic boundary. It is not a React Context provider and intentionally performs no runtime work.**

- Returns Fragment only — no wrapper DOM
- Default `density="comfortable"`
- `compact` accepted, intentionally ignored this phase
- Must **never** evolve into React Context (including UX-3.x)
- Future scales: `comfortable` · `compact` · `touch` — only comfortable implemented

### DensitySpacer — fully deterministic

Private frozen map:

```ts
const DENSITY_SPACER_MAP = {
  section: WORKSPACE_DENSITY_TOKENS.sectionGap,
  row: WORKSPACE_DENSITY_TOKENS.rowGap,
  list: WORKSPACE_DENSITY_TOKENS.listGap,
  card: WORKSPACE_DENSITY_TOKENS.cardGap,
} as const;
```

No `if` / `switch` / ternaries on `size`.

---

## 5. Wiring

| Area | Density usage |
|------|----------------|
| **Explorer** | `DensityProvider` wrap |
| **Inspector** | `DensityProvider` wrap |
| **Console** | `DensityProvider` wrap |
| **Canvas** | `DensityProvider` + `panelPadding` |
| **Navigation** | `DensityProvider` wrap |
| **Surface** | `DensityProvider` + `SurfaceDivider` → `sectionGap` |
| **Header** | `SemanticHeader` + `SurfaceHeader` → `DensityProvider` |
| **Content** | `ContentGroup` → `DensityProvider` |
| **PanelLayout** | `DensityProvider` wrap |
| **WorkspaceContent** | density tokens replace `pb-3` / `space-y-0.5` |

---

## 6. In scope

1. `workspace/density/` presentational package + local barrel
2. DensityProvider / DensitySpacer / WORKSPACE_DENSITY_TOKENS
3. Unidirectional parity with Layout / Surface / Content / Semantic mirrors
4. Hardcode removal (WorkspaceContent · SurfaceDivider)
5. This document + `validate:ux-2.25` + roadmap COMPLETE → UX-3.0

---

## 7. Out of scope

- `"use client"` or hooks inside `density/`
- React Context / real providers / runtime density switching
- Typography · colors · iconography · layout structure · responsive · animations
- Behavior · state · public API changes outside density package
- Nav micro-gaps (`gap-1` / `gap-0.5` / `px-0.5`) — stay in `NAVIGATION_TOKENS`
- Accent bars · skeleton geometry · expand-rail chrome · resize math · canvas grid · `min-h-0` flex constraints
- Expanding public `@/components/workspace` barrel with `density/`

---

## 8. Validation

```bash
npm run validate:ux-2.25
```

Delegates: `validate:ux-2.24` (leaf) → `tsc --noEmit` → eslint on density / wired shells / script.

---

## 9. Acceptance

| ID | Criterio |
|----|----------|
| **CA-UX-2.25.1** | Unique spacing SSOT (`WORKSPACE_DENSITY_TOKENS`); unidirectional Density → mirrors |
| **CA-UX-2.25.2** | No density-owned hardcoded paddings remain in scoped workspace TSX |
| **CA-UX-2.25.3** | All panels share the same separation scale via Density wiring |
| **CA-UX-2.25.4** | No functional / architectural changes; Fragment marker only |
| **CA-UX-2.25.5** | Public API frozen (3 exports); private `DENSITY_SPACER_MAP` |
| **CA-UX-2.25.6** | `validate:ux-2.25` PASS (incl. delegated 2.24 · tsc · eslint) |

---

## 10. Status

**UX-2.25 = COMPLETE (awaiting human review)**

```text
Next: UX-3.0 Docking Foundation
Do NOT open UX-3.0 until human certification of UX-2.25
DensityProvider must never evolve into Context
```
