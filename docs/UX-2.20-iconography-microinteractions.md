# UX-2.20 — Iconography & Microinteractions

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.20 — BUILD (Iconography & Microinteractions)  
**Fase:** Presentational iconography + ACTION_TOKENS value enrichment  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.20 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.19 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.20 = COMPLETE (iconography & microinteractions)
SCOPE = workspace/iconography/ + Explorer/Inspector/Console/Canvas wiring
API FREEZE = ICON_TOKENS · WorkspaceIcon · WorkspaceIconProps
PACKAGE ISOLATION = iconography/ ⊥ toolbar components ⊥ layout ⊥ surfaces
                    ⊥ composition ⊥ disclosure ⊥ actions ⊥ hints ⊥ status
                    ⊥ PanelState ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
TOKEN RULE = ICON_TOKENS compose-only (sizes/color only; no interaction)
ACTION_TOKENS = sole owner of hover / pressed / disabled / transitions
REGISTRY = private workspaceIconRegistry (not barrel-exported)
NO INTERACTION_TOKENS · NO WorkspaceIconName export · NO public barrel
NO "use client" · NO hooks · NO handlers · lucide-react ONLY in iconography/
BRIDGE = ACTION_TOKENS → ICON_TOKENS (tokens only)
NO VISUAL REGRESSION = spacing · density · typography · layout · identity
                       · toolbar composition · semantic hierarchy frozen
Next: UX-2.21 — Final Visual Polish
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce a presentational workspace icon system (Lucide-backed) and enrich toolbar microinteraction affordances inside `ACTION_TOKENS` values — without expanding frozen UX-2.16–2.19 public APIs, without business logic, and without a second interaction SSOT.

---

## 2. Architecture / Layering

```text
PanelSurface (UX-2.16)
    ↓
PanelLayout + regions (UX-2.18)
    ↓
Semantic* identity (UX-2.18b)
    ↓
toolbar Action* + ACTION_TOKENS (UX-2.19)  ← owns interaction styling
    ↓
iconography / ICON_TOKENS (UX-2.20)        ← glyphs + icon sizing only
    ↓
Final Visual Polish (UX-2.21)
```

```text
workspace/iconography/
  ICON_TOKENS.ts
  workspaceIconRegistry.ts   ← PRIVATE (not barrel-exported)
  WorkspaceIcon.tsx
  index.ts                   ← local barrel only
```

**Token ownership:**

```text
ACTION_TOKENS  (hover / pressed / disabled / transitions)
    ↓ may compose
ICON_TOKENS    (size / stroke / currentColor only)
```

---

## 3. Package isolation

```text
iconography/
    │
    ▼
ICON_TOKENS (compose-only) + private registry + WorkspaceIcon

iconography/  ──✗──►  toolbar components (ActionButton, etc.)
iconography/  ──✗──►  layout / surfaces / composition / semantics
iconography/  ──✗──►  actions / hints / status / disclosure
iconography/  ──✗──►  panels/state · persistence · resize · focus · modes

ACTION_TOKENS.ts  ──✓──►  ICON_TOKENS.ts   (allowed bridge)
```

**Allowed imports inside `iconography/`:** `react`, `lucide-react`, `./ICON_TOKENS`, `./workspaceIconRegistry`.

Content trees import `WorkspaceIcon` from the local barrel — never `lucide-react` directly.

---

## 4. ICON_TOKENS (compose-only)

`ICON_TOKENS` is the only new SSOT introduced by UX-2.20.

**Owns:** icon sizes (`size-3` / `size-3.5` / `size-4`), root/svg class composition, color inheritance (`text-current`), decorative defaults.

**MUST NOT own:** hover, pressed, disabled, transition timing — those remain in `ACTION_TOKENS`.

---

## 5. Frozen APIs

| Export | Props / shape |
|--------|----------------|
| **ICON_TOKENS** | compose-only const |
| **WorkspaceIcon** | `name`, `size?: "sm" \| "md" \| "lg"` |
| **WorkspaceIconProps** | props type only |

**Not exported:** `workspaceIconRegistry`, `WorkspaceIconName` (`keyof typeof workspaceIconRegistry` is internal).

`WorkspaceIcon` is decorative (`aria-hidden`); no children, handlers, or role.

Toolbar Action* / PanelToolbar / IconSlot public props remain frozen from UX-2.19.

---

## 6. No Visual Regression

```text
UX-2.20 MUST NOT
- change spacing
- change density
- change typography
- change layout
- change semantic hierarchy
- change panel identity
- change toolbar composition

Only icons and interaction affordances may become visually richer.
```

---

## 7. In Scope

1. `workspace/iconography/` presentational package + local barrel
2. Value-only `ACTION_TOKENS` microinteraction enrichment + optional `ICON_TOKENS` compose
3. Shell wiring: Explorer / Inspector / Console / Canvas (`SemanticHeader.leading`, `EmptyState.icon`, `ActionButton.icon`)
4. This document + `validate:ux-2.20` + roadmap row (UX-2.20)
5. Point UX-2.19 NEXT at UX-2.20; UX-2.20 NEXT at UX-2.21
6. `lucide-react` dependency (sole icon library)

---

## 8. Out of Scope

- `INTERACTION_TOKENS` or any second interaction SSOT
- Exporting `WorkspaceIconName` / `workspaceIconRegistry`
- `"use client"` or hooks inside `iconography/`
- Expanding Action* / Semantic* / EmptyState / Hint* / Status* public props
- Real menus, commands, keyboard, focus management, tooltips, portals
- Final Visual Polish (→ UX-2.21)
- PanelState / persistence / resize / focus / modes / session / docking
- Expanding public `@/components/workspace` barrel with `iconography/`

---

## 9. Wiring

| Panel | Grammar |
|-------|---------|
| **Explorer** | SemanticHeader leading + trailing ActionButton icons; EmptyState WorkspaceIcon |
| **Inspector** | Same pattern |
| **Console** | Same pattern |
| **Canvas** | SemanticHeader leading + trailing ActionButton icon; HintGroup/StatusChip unchanged as opaque children |

---

## 10. Validation

```bash
npm run validate:ux-2.20
```

Runs UX-2.20 structural checks, delegates `validate:ux-2.19` (`UX_SKIP_DELEGATES=1` leaf pattern), then `tsc --noEmit` and ESLint.

---

## 11. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.20.1** | `workspace/iconography/` package exists | PASS |
| **CA-2.20.2** | `ICON_TOKENS` sole new compose-only SSOT; no `INTERACTION_TOKENS` | PASS |
| **CA-2.20.3** | WorkspaceIcon API frozen; registry private | PASS |
| **CA-2.20.4** | Lucide only inside `iconography/` | PASS |
| **CA-2.20.5** | UX-2.19 Action* public props unchanged | PASS |
| **CA-2.20.6** | ACTION_TOKENS owns interaction; may compose ICON_TOKENS | PASS |
| **CA-2.20.7** | Explorer / Inspector / Console / Canvas wired | PASS |
| **CA-2.20.8** | No public workspace barrel export | PASS |
| **CA-2.20.9** | No Visual Regression contract documented | PASS |
| **CA-2.20.10** | UX-2.21 ID unchanged; NEXT → Final Visual Polish | PASS |
| **CA-2.20.11** | `npm run validate:ux-2.20` PASS | PASS |

---

## 12. STOP

```text
UX-2.20 = COMPLETE (awaiting human review)
API FREEZE = ICON_TOKENS · WorkspaceIcon · WorkspaceIconProps
PACKAGE ISOLATION = iconography/ ⊥ toolbar components ⊥ layout ⊥ surfaces
                    ⊥ composition ⊥ disclosure ⊥ actions ⊥ state ⊥ modes
TOKEN RULE = ICON_TOKENS sizes/color only; ACTION_TOKENS owns interaction
REGISTRY = private (not exported)
NO VISUAL REGRESSION = spacing · density · typography · layout · identity
                       · toolbar composition · semantic hierarchy
Next: UX-2.21 — Final Visual Polish
Do NOT export registry · Do NOT add INTERACTION_TOKENS · Do NOT expand Action* props
```
