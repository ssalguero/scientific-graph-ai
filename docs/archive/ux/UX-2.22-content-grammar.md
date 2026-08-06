# UX-2.22 — Content Grammar Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.22 — BUILD (Content Grammar Foundation)  
**Fase:** Presentational content blocks + pixel-identical wiring  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.22 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.21 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.22 = COMPLETE (content grammar foundation)
SCOPE = workspace/content/ + Explorer/Inspector/Console pixel-identical wiring
API FREEZE = CONTENT_TOKENS · ContentGroup · ContentRow · KeyValue ·
             Description · Notice · EmptyState · DividerContent
TOKEN RULE = CONTENT_TOKENS compose-only (no parallel design scale)
PIXEL PARITY = UX-2.21 (no visual / behavior change)
NO "use client" · NO hooks · NO callbacks · NO public barrel export
NO forms · NO inputs · NO KeyValue fiction · Canvas untouched
panels/empty/EmptyState API FROZEN (composes content EmptyState internally)
Next: UX-2.23
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce a unified presentational **content grammar** for Workspace panel bodies — semantic blocks that future views will compose — without changing UX-2.21 render, behavior, or public APIs.

---

## 2. Architecture

```text
PanelSurface (UX-2.16)
    ↓
PanelLayout + regions (UX-2.18)
    ↓
Semantic* identity (UX-2.18b)
    ↓
Content Grammar (UX-2.22) ← this phase
    ↓
Composition / disclosure / domain content
```

```text
workspace/content/
  CONTENT_TOKENS.ts
  ContentGroup.tsx
  ContentRow.tsx
  KeyValue.tsx
  Description.tsx
  Notice.tsx
  EmptyState.tsx          ← content primitive (no icon/action)
  DividerContent.tsx
  index.ts                ← local barrel only
```

---

## 3. CONTENT_TOKENS (compose-only)

`CONTENT_TOKENS` is the package-local SSOT for content class lookups.

**Freeze rule:** `CONTENT_TOKENS` únicamente compone clases/tokens existentes. No inventa colores, spacing ni radios. No duplica responsabilidades de:

- `SURFACE_TOKENS`
- `LAYOUT_TOKENS`
- `SEMANTIC_TOKENS`
- `ACTION_TOKENS`
- `ICON_TOKENS`

Keys alias Tailwind / `--app-*` utilities already used by surfaces, semantics, and status tones (e.g. `gap-2`, `p-1.5`, `text-[var(--app-text-muted)]`, warning/success/danger CSS vars).

---

## 4. Frozen public API

| Symbol | Responsibility | Props |
|--------|----------------|--------|
| **CONTENT_TOKENS** | Compose-only SSOT | — |
| **ContentGroup** | Group blocks · spacing · layout | `spacing?`, `children?` |
| **ContentRow** | Alignment · spacing · distribution | `spacing?`, `distribute?`, `children?` |
| **KeyValue** | Label/value pair | `label`, `value` |
| **Description** | Reusable descriptive text | `children?` |
| **Notice** | Informational block | `variant?`, `children?` |
| **EmptyState** | Content empty primitive | `title`, `description?` |
| **DividerContent** | Content-level divider | `muted?` |

**Notice variants:** `info` \| `warning` \| `success` \| `danger`

**content EmptyState** has no icons, buttons, or actions. It does **not** replace `panels/empty/EmptyState`.

**panels/empty/EmptyState** remains the frozen public empty API (`icon?` / `title` / `description?` / `action?`) and may compose content primitives internally.

No internal helpers are exported. `@/components/workspace` barrel does **not** re-export `content/`.

---

## 5. Wiring (pixel-identical)

| Surface | Change |
|---------|--------|
| **Explorer** | `ContentGroup` wraps existing structure only — no new visible UI |
| **Inspector** | `ContentGroup` + `Notice variant="info"` where `SemanticInfoBlock` chrome lived (identical classes) |
| **Console** | `ContentGroup` + descriptive copy via `Description` (through EmptyState / EmptyDescription) — no new copy |
| **Canvas** | Untouched |
| **KeyValue** | Exported; **not** wired (no fictional pairs) |
| **ContentRow** / **DividerContent** | Exported; may remain unused initially |

---

## 6. In scope

1. `workspace/content/` presentational package + local barrel
2. Pixel-identical wiring in Explorer / Inspector / Console
3. `panels/empty/EmptyState` internal composition of content EmptyState / Description
4. This document + `validate:ux-2.22` + roadmap COMPLETE → UX-2.23

---

## 7. Out of scope

- `"use client"` or hooks inside `content/`
- Forms, inputs, buttons, checkboxes, menus, tooltips, virtualization
- New user-visible strings or fictional KeyValue pairs
- Session / Window / WorkspaceLayout / Runtime / Toolbar / Composition / Layout / Semantics / Iconography packages
- Expanding public `@/components/workspace` barrel with `content/`
- Changing `panels/empty/EmptyState` public props
- Canvas / docking / PanelState / persistence / resize

---

## 8. Validation

```bash
npm run validate:ux-2.22
```

Delegates: `validate:ux-2.21` (`UX_SKIP_DELEGATES=1`) · `tsc --noEmit` · eslint on content + wired paths.

---

## 9. Acceptance

| ID | Criterion | Status |
|----|-----------|--------|
| **CA-2.22.1** | Workspace behavior identical to UX-2.21 | PASS |
| **CA-2.22.2** | Explorer / Inspector / Console / Canvas pixel parity | PASS |
| **CA-2.22.3** | No Session / Window / WorkspaceLayout changes | PASS |
| **CA-2.22.4** | `workspace/content/` complete; API frozen | PASS |
| **CA-2.22.5** | panels/empty EmptyState API preserved | PASS |
| **CA-2.22.6** | KeyValue exported without fictional wiring | PASS |
| **CA-2.22.7** | No interactive controls / business logic in content/ | PASS |
| **CA-2.22.8** | `npm run validate:ux-2.22` PASS | PASS |

---

## 10. STOP

```text
UX-2.22 = COMPLETE (awaiting human review)
CONTENT GRAMMAR API = FROZEN
PIXEL PARITY = UX-2.21
Next: UX-2.23
Do NOT open UX-2.23 until human certification of UX-2.22
```
