# UX-2.18b — Panel Semantics Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.18b — BUILD (Panel Semantics Foundation)  
**Fase:** Presentational semantic identity + wiring  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.18b = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.18 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.18b = COMPLETE (panel semantics foundation)
SCOPE = workspace/semantics/ + Explorer/Inspector/Console/Canvas identity wiring
API FREEZE = SemanticHeader · SemanticStatus · SemanticSectionLabel ·
             SemanticInfoBlock · SemanticFooter · SEMANTIC_TOKENS
PACKAGE ISOLATION = semantics/ ⊥ layout ⊥ surfaces ⊥ composition ⊥ disclosure
                    ⊥ PanelState ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
TOKEN RULE = SEMANTIC_TOKENS compose-only (no parallel design scale)
NO VARIANTS · NO severity · NO state · NO icon · NO badge props
BRIDGE = UX-2.18 Semantic Layout → UX-2.18b Semantics → UX-2.19 Toolbar
NO "use client" · NO hooks · NO callbacks · NO public barrel export
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce a presentational semantic grammar for panel bodies so Explorer, Inspector, Console, and Canvas share a consistent visual identity language — without behavior, state, interaction, or business logic.

Semantics live **inside** existing layout regions. They do **not** replace `PanelLayout`.

---

## 2. Architecture / Layering

```text
PanelSurface (UX-2.16)
    ↓
PanelLayout + regions (UX-2.18)
    ↓
Semantic* identity (UX-2.18b)
    ↓
Composition / disclosure / domain content
```

```text
workspace/semantics/
  SEMANTIC_TOKENS.ts
  SemanticHeader.tsx
  SemanticStatus.tsx
  SemanticSectionLabel.tsx
  SemanticInfoBlock.tsx
  SemanticFooter.tsx
  index.ts                ← local barrel only
```

---

## 3. Package isolation

```text
semantics/
    │
    ▼
SEMANTIC_TOKENS (compose-only aliases)

semantics/  ──✗──►  layout/
semantics/  ──✗──►  surfaces/
semantics/  ──✗──►  composition/
semantics/  ──✗──►  disclosure/
semantics/  ──✗──►  panels/state · persistence · resize
semantics/  ──✗──►  focus/ · modes · session · docking
```

**Allowed imports inside `semantics/`:** `react`, `./SEMANTIC_TOKENS`, sibling Semantic* modules.

Composition of regions + semantics happens in content files (`ExplorerContent`, `InspectorContent`, `ConsoleContent`, `WorkspaceBodyLayout`).

---

## 4. SEMANTIC_TOKENS (compose-only)

`SEMANTIC_TOKENS` is the package-local SSOT for Semantic* class lookups.

**Freeze rule:** `SEMANTIC_TOKENS` únicamente compone clases/tokens existentes. No introduce nuevos valores visuales que dupliquen `SURFACE_TOKENS` o `LAYOUT_TOKENS`.

It MUST NOT redefine spacing or typography scales. Keys alias Tailwind / `--app-*` utilities already used by surfaces/layout (e.g. `gap-2`, `text-[10px]`, `opacity-70`, `text-[var(--app-text-muted)]`).

---

## 5. Frozen APIs

```text
Semantic* props are API frozen after UX-2.18b.
Future UX phases may compose them but should not expand their public contract
without an explicit API review.
```

| Component | Props |
|-----------|--------|
| **SemanticHeader** | `title?`, `subtitle?`, `leading?`, `trailing?` |
| **SemanticStatus** | `children?` |
| **SemanticSectionLabel** | `children?`, `label?` |
| **SemanticInfoBlock** | `children?` |
| **SemanticFooter** | `children?` |

Do NOT introduce `variant`, `severity`, `state`, `badge`, `icon`, or interactive props without explicit architecture review.

Naming: exports are `Semantic*` — never a second `PanelHeader` / `PanelStatus` inside this package.

---

## 6. In Scope

1. `workspace/semantics/` presentational package + local barrel
2. Identity wiring in Explorer / Inspector / Console + Canvas (reuse-only copy; empty slots otherwise)
3. This document + `validate:ux-2.18b` + roadmap bridge row (UX-2.18b)
4. Point UX-2.18 NEXT at UX-2.18b

---

## 7. Out of Scope

- `"use client"` or hooks inside `semantics/`
- Expanding Semantic* public props
- New user-visible strings
- Moving EmptyState copy into SemanticInfoBlock
- Duplicating chrome "Ready" into Console body status
- AdaptiveToolbar / Toolbar & Action Refinement (→ UX-2.19)
- Iconography (→ UX-2.20) · Final Visual Polish (→ UX-2.21)
- PanelState / persistence / resize / focus / modes / session / docking
- Modifying PanelLayout / regions / SURFACE_TOKENS / LAYOUT_TOKENS / composition / disclosure
- Expanding public `@/components/workspace` barrel with `semantics/`

---

## 8. Wiring

| Panel | Grammar |
|-------|---------|
| **Explorer** | Header(`Project`) + empty Status · SectionLabel(`Project`,`Layers`) · empty Footer |
| **Inspector** | empty Header/Status · SectionLabel(`Properties`,`Appearance`) · empty InfoBlock · empty Footer |
| **Console** | empty Header/Status · SectionLabel(`Output`) · empty Footer |
| **Canvas** | empty Header · keep Toolbar/Hints/Chip/Content · empty Footer |

Disclosure, EmptyState, and stable section IDs remain unchanged.

---

## 9. Validation

```bash
npm run validate:ux-2.18b
```

Runs UX-2.18b structural checks, delegates `validate:ux-2.18` (`UX_SKIP_DELEGATES=1`), then `tsc --noEmit` and ESLint.

---

## 10. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.18b.1** | `workspace/semantics/` package exists | PASS |
| **CA-2.18b.2** | `SEMANTIC_TOKENS` compose-only SSOT | PASS |
| **CA-2.18b.3** | Semantic* presentational; API freeze respected | PASS |
| **CA-2.18b.4** | No downward imports to layout/surfaces/composition/disclosure | PASS |
| **CA-2.18b.5** | No hooks / `"use client"` | PASS |
| **CA-2.18b.6** | Explorer / Inspector / Console / Canvas wired | PASS |
| **CA-2.18b.7** | Reuse-only copy; empty slots otherwise | PASS |
| **CA-2.18b.8** | No public workspace barrel export | PASS |
| **CA-2.18b.9** | UX-2.19–2.21 IDs unchanged | PASS |
| **CA-2.18b.10** | `npm run validate:ux-2.18b` PASS | PASS |

---

## 11. STOP

```text
UX-2.18b = COMPLETE (awaiting human review)
API FREEZE = SemanticHeader · SemanticStatus · SemanticSectionLabel ·
             SemanticInfoBlock · SemanticFooter · SEMANTIC_TOKENS
PACKAGE ISOLATION = semantics/ ⊥ layout ⊥ surfaces ⊥ composition ⊥ disclosure
TOKEN RULE = compose-only (no parallel SURFACE/LAYOUT scale)
Next: UX-2.19 — Toolbar & Action Refinement
Do NOT expand Semantic* props · Do NOT invent copy · Do NOT export semantics publicly
```
