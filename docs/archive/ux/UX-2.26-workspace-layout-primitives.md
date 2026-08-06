# UX-2.26 — Workspace Layout Primitives Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.26 — BUILD (Workspace Layout Primitives Foundation)  
**Fase:** Compose-only layout grammar  
**Fecha:** 2026-07-31  
**Estado:** **UX-2.26 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.25 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.26 = COMPLETE (workspace layout primitives foundation)
SCOPE = extend workspace/layout/ + Stack/Inline/Cluster/Center/Spacer +
        LAYOUT_TOKENS expansion + flex composition wiring
API FREEZE = LAYOUT_TOKENS (expanded) · Stack · Inline · Cluster · Center · Spacer
           + historical UX-2.18 PanelLayout / Panel*Region exports
SEMANTIC RULE = PanelLayout → Stack (never panels → Stack as shell)
Cluster = independent frozen API (defaults sm/center/start/wrap)
NO "use client" · NO hooks · NO Context · NO runtime logic · NO public barrel export
NO Grid · NO Responsive · NO Overflow/Scroll helpers · NO Animations
PIXEL PARITY = replace repeated flex only
Next: UX-3.0 Docking Foundation (after human review)
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce a reusable compose-only layout grammar (`Stack`, `Inline`, `Cluster`, `Center`, `Spacer`) inside the existing UX-2.18 `workspace/layout/` package so Workspace surfaces share one vertical/horizontal composition model — without changing behavior, state, or appreciable visuals.

---

## 2. Architecture

```text
PanelLayout (semantic shell — UX-2.18)
  └── Stack (compose primitive — UX-2.26)

Panel*Region
  └── Stack | Cluster

LAYOUT_TOKENS
  ├── UX-2.18 region gaps / padding (preserved)
  └── STACK_GAPS · align · justify · wrap · direction · center · spacer · cluster
```

```text
workspace/layout/
  LayoutTokens.ts
  PanelLayout.tsx + Panel*Region.tsx
  Stack.tsx · Inline.tsx · Cluster.tsx · Center.tsx · Spacer.tsx
  index.ts
```

`@/components/workspace` barrel does **not** re-export `layout/`.

---

## 3. LAYOUT_TOKENS (expanded, compose-only)

Legacy keys preserved. New maps:

| Key | Role |
|-----|------|
| `STACK_GAPS` | `none` · `xs`…`xl` |
| `align` / `justify` / `wrap` | flex alignment maps |
| `direction` | `column` / `row` roots |
| `center` | Center root |
| `spacer` | Spacer root (`flex-1`) |
| `cluster` | Cluster vocabulary |

Independence: must not import other `*_TOKENS` / density / `ui/tokens`.

---

## 4. Frozen public API

| Symbol | Responsibility |
|--------|----------------|
| **LAYOUT_TOKENS** | Spacing + layout class maps |
| **PanelLayout** + **Panel\*Region** | Semantic panel regions (UX-2.18) |
| **Stack** | Vertical flex |
| **Inline** | Horizontal flex |
| **Cluster** | Badge/chip/action cluster (own API; may compose Inline) |
| **Center** | Centered content |
| **Spacer** | `flex-1` helper |

### Cluster defaults (official)

`gap="sm"` · `align="center"` · `justify="start"` · `wrap="wrap"`

### Semantic rule

`PanelLayout` remains the Workspace semantic abstraction. Relation is always `PanelLayout → Stack`. Panels must not mount `Stack` as a direct shell substitute.

---

## 5. Wiring

| Area | Primitive usage |
|------|-----------------|
| PanelLayout / Header·Content·Footer regions | Stack |
| PanelToolbarRegion | Cluster (`gap=md`, `align=start`) |
| Surface / SurfaceBody | Stack |
| SurfaceHeader / SurfaceFooter | Inline |
| PanelHeader | Inline + Cluster |
| EmptyState (panels + content) | Center + Stack |
| KeyValue | Inline |
| Navigation / Breadcrumbs | Stack / Inline |
| SemanticHeader / Status / Footer | Inline + Stack |
| PanelStatus | Inline |
| Notice / Description | unchanged (no flex) |

---

## 6. Out of scope

- Grid · responsive · breakpoints · resize · overflow/scroll helpers · animations
- Replacing `PanelLayout` with bare `Stack`
- Public barrel export of `layout/`
- Behavior / state / Context / hooks

---

## 7. Validation

```bash
npm run validate:ux-2.26
```

Checks: package files · historical + new exports · frozen tokens · compose-only · PanelLayout semantic rule · wiring · docs · delegate `validate:ux-2.25` (leaf) → `tsc` → eslint.

---

## 8. Acceptance

| ID | Criterio |
|----|----------|
| **CA-UX-2.26.1** | Layout primitives centralized in `workspace/layout/` |
| **CA-UX-2.26.2** | Historical UX-2.18 exports preserved |
| **CA-UX-2.26.3** | Repeated flex replaced in wired Workspace surfaces |
| **CA-UX-2.26.4** | No appreciable visual / behavior change |
| **CA-UX-2.26.5** | `validate:ux-2.26` PASS |

---

## 9. Status

**UX-2.26 = COMPLETE (awaiting human review)**

```text
Next: UX-3.0 Docking Foundation
Do NOT open UX-3.0 until human certification of UX-2.26
PanelLayout must remain the semantic shell above Stack
```
