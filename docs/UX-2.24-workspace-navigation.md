# UX-2.24 — Workspace Navigation Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.24 — BUILD (Workspace Navigation Foundation)  
**Fase:** Presentational navigation grammar  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.24 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.23 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.24 = COMPLETE (workspace navigation foundation)
SCOPE = workspace/navigation/ + SemanticHeader title passthrough +
        Explorer/Inspector/Console/Canvas Navigation wiring
API FREEZE = NAVIGATION_TOKENS · Navigation · Breadcrumbs ·
             BreadcrumbItem · BreadcrumbSeparator · PageTitle
TOKEN RULE = NAVIGATION_TOKENS compose-only (independent local SSOT)
Navigation = vertical stack · Breadcrumbs = horizontal trail
SemanticHeader title = passthrough (no label wrapper); leading icons PRESERVED
NO "use client" · NO hooks · NO router · NO callbacks · NO public barrel export
NO frozen API changes · NO behavior / navigation logic
Next: UX-2.25 Workspace Density & Spacing System
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce a unified **navigation grammar** (`workspace/navigation/`) for workspace panel headers — breadcrumbs + page title — without routers, pathname, URL, metadata, or business logic. Static children only; structure ready for future dynamic navigation without API breakage.

---

## 2. Architecture

```text
SemanticHeader (UX-2.18b) — API PRESERVED
  leading   → WorkspaceIcon (UX-2.20)
  title     → Navigation (UX-2.24)          ← flex column + titleGap
                ├── Breadcrumbs            ← flex row + breadcrumbGap
                │     BreadcrumbItem · BreadcrumbSeparator · …
                └── PageTitle
  trailing  → PanelToolbar (UX-2.19)
```

```text
workspace/navigation/
  navigationTokens.ts
  Navigation.tsx
  Breadcrumbs.tsx
  BreadcrumbItem.tsx
  BreadcrumbSeparator.tsx
  PageTitle.tsx
  index.ts                ← local barrel only
```

`@/components/workspace` barrel does **not** re-export `navigation/`.

---

## 3. NAVIGATION_TOKENS (compose-only)

`NAVIGATION_TOKENS` is the package-local SSOT for navigation class / glyph lookups.

**Independence rule:** It is a map of compose-only literals. It must **not** import, re-export, or depend directly on other token objects (`UI_TOKENS`, `SURFACE_TOKENS`, `CONTENT_TOKENS`, `LAYOUT_TOKENS`, `SEMANTIC_TOKENS`, etc.).

**Frozen keys:**

- layout: `flexDirection` · `height` · `alignItems` · `gap` · `breadcrumbGap` · `separatorGap` · `titleGap`
- typography: `fontSize` · `fontWeight`
- colors: `color` · `mutedColor` · `separatorColor` (`--app-heading` / `--app-text-muted` only)
- separator: `separator.glyph` (`›`)

`Navigation` consumes `flexDirection` + `titleGap` (vertical). `Breadcrumbs` consumes `alignItems` + `breadcrumbGap` (horizontal). No hardcoded `flex-col` / `flex-row` in component files.

---

## 4. Frozen public API

| Symbol | Responsibility | Props |
|--------|----------------|--------|
| **NAVIGATION_TOKENS** | Compose-only SSOT | — |
| **Navigation** | Vertical stack (Breadcrumbs above PageTitle) | `children?` |
| **Breadcrumbs** | Horizontal trail | `children?` |
| **BreadcrumbItem** | Single crumb | `children?` |
| **BreadcrumbSeparator** | Glyph only | **none** |
| **PageTitle** | Primary panel title | `children?` |

No internal helpers are exported.

---

## 5. SemanticHeader presentation tweak

`SemanticHeader` props API unchanged (`title?` · `subtitle?` · `leading?` · `trailing?`).

Title slot rendering changed from `<span className={SEMANTIC_TOKENS.label}>{title}</span>` to passthrough `{title}` so Navigation does not inherit micro-label uppercase styles. `leading` still uses `ICON_SIZE`. `SEMANTIC_TOKENS.label` remains for other consumers.

---

## 6. Wiring

| Surface | Breadcrumbs | PageTitle | leading icon |
|---------|-------------|-----------|--------------|
| **Explorer** | Workspace › Explorer | Explorer | `project` |
| **Inspector** | Workspace › Inspector | Inspector | `inspector` |
| **Console** | Workspace › Console | Console | `console` |
| **Canvas** | Workspace › Canvas | Canvas | `sparkles` |

Static children only. Toolbar / Surface / Layout / Content packages untouched.

---

## 7. In scope

1. `workspace/navigation/` presentational package + local barrel
2. SemanticHeader title passthrough (presentation only)
3. Composition wiring in Explorer / Inspector / Console / Canvas
4. This document + `validate:ux-2.24` + roadmap COMPLETE → UX-2.25

---

## 8. Out of scope

- `"use client"` or hooks inside `navigation/`
- Router / Next Navigation / pathname / URL / metadata / callbacks / state / providers
- Changing Layout / Toolbar / Surface / Content APIs
- Expanding public `@/components/workspace` barrel with `navigation/`
- Dynamic navigation logic

---

## 9. Validation

```bash
npm run validate:ux-2.24
```

Delegates: `validate:ux-2.23` (leaf) → `tsc --noEmit` → eslint on navigation / SemanticHeader / panel shells / script.

---

## 10. Acceptance

- `workspace/navigation/` created; API frozen; compose-only
- `Navigation` = vertical stack; `Breadcrumbs` = horizontal trail; both via tokens
- SemanticHeader title slot unstyled; leading icons preserved
- Explorer / Inspector / Console / Canvas wired with Workspace › Panel + PageTitle
- `tsc` clean · eslint clean · `npm run validate:ux-2.24` PASS

---

## 11. Status

**UX-2.24 = COMPLETE (awaiting human review)**
