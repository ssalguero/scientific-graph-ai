# UX-2.19 — Toolbar & Action Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.19 — BUILD (Toolbar & Action Foundation)  
**Fase:** Presentational toolbar grammar + wiring  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.19 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.18b COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.19 = COMPLETE (toolbar & action foundation)
SCOPE = workspace/toolbar/ + Explorer/Inspector/Console/Canvas shell wiring
API FREEZE = ActionButton · ActionGroup · PanelToolbar · ToolbarSpacer ·
             IconSlot · ACTION_TOKENS
PACKAGE ISOLATION = toolbar/ ⊥ actions ⊥ layout ⊥ surfaces ⊥ composition
                    ⊥ disclosure ⊥ PanelState ⊥ persistence ⊥ resize
                    ⊥ focus ⊥ modes
TOKEN RULE = ACTION_TOKENS compose-only (no parallel design scale)
NO onClick · NO hooks · NO "use client" · NO public barrel export
BRIDGE = UX-2.18b Semantics → UX-2.19 Toolbar → UX-2.20 Iconography
READY FOR HUMAN REVIEW
```

> **Bridge note:** UX-2.20 Iconography & Microinteractions is COMPLETE. `ACTION_TOKENS` may compose `ICON_TOKENS` (tokens-only bridge).

---

## 1. Purpose

Introduce a presentational toolbar / action visual grammar so Explorer, Inspector, Console, Canvas, and future panels share a consistent language for buttons, icon slots, groups, and toolbars — without behavior, state, interaction, or business logic.

Toolbar primitives live **inside** existing semantic / layout regions. They do **not** replace `PanelHeader`, `ContextActions`, or `AdaptiveToolbar`.

---

## 2. Architecture / Layering

```text
PanelSurface (UX-2.16)
    ↓
PanelLayout + regions (UX-2.18)
    ↓
Semantic* identity (UX-2.18b)
    ↓
toolbar Action* (UX-2.19)
    ↓
Interaction / menus / commands (UX-2.20+)
```

```text
workspace/toolbar/
  ACTION_TOKENS.ts
  ActionButton.tsx
  ActionGroup.tsx
  PanelToolbar.tsx
  ToolbarSpacer.tsx
  IconSlot.tsx
  index.ts                ← local barrel only
```

`workspace/actions/` (UX-2.12 ContextAction / ContextActions) remains a **separate** package and is not modified.

---

## 3. Package isolation

```text
toolbar/
    │
    ▼
ACTION_TOKENS (compose-only aliases)

toolbar/  ──✗──►  actions/
toolbar/  ──✗──►  layout/
toolbar/  ──✗──►  surfaces/
toolbar/  ──✗──►  composition/
toolbar/  ──✗──►  disclosure/
toolbar/  ──✗──►  panels/state · persistence · resize
toolbar/  ──✗──►  focus/ · modes · session · docking
```

**Allowed imports inside `toolbar/`:** `react`, `./ACTION_TOKENS`, sibling toolbar modules.

Composition of regions + semantics + toolbar happens in content files (`ExplorerContent`, `InspectorContent`, `ConsoleContent`, `WorkspaceBodyLayout`).

---

## 4. ACTION_TOKENS (compose-only)

`ACTION_TOKENS` is the package-local SSOT for toolbar class lookups.

**Freeze rule:** `ACTION_TOKENS` únicamente compone clases/tokens existentes. No introduce nuevos valores visuales que dupliquen `SURFACE_TOKENS`, `LAYOUT_TOKENS`, o `SEMANTIC_TOKENS`.

It MUST NOT redefine spacing or typography scales. Keys alias Tailwind / `--app-*` utilities already used by surfaces/layout/semantics (e.g. `gap-2`, `min-h-4`, `h-4 w-4`, `p-1.5`, `rounded-md`, `opacity-70`).

Required keys: `height`, `gap`, `iconSize`, `padding`, `radius`, `hoverOpacity`, `disabledOpacity`, plus composites `button`, `group`, `toolbar`, `spacer`, `iconSlot`, `appearances`.

---

## 5. Frozen APIs

```text
Toolbar* / Action* props are API frozen after UX-2.19.
Future UX phases may compose them but should not expand their public contract
without an explicit API review.
```

| Component | Props |
|-----------|--------|
| **ActionButton** | `icon?`, `children?`, `appearance?: "default" \| "muted" \| "active" \| "disabled"` |
| **ActionGroup** | `children?` |
| **PanelToolbar** | `children?` |
| **ToolbarSpacer** | *(none)* |
| **IconSlot** | `children?` |

Do NOT introduce `label`, `title`, `leading`, `onClick`, `hints`, `status`, handlers, or interactive props without explicit architecture review.

**Agnosticism:** `PanelToolbar` receives opaque `children` only. It MUST NOT know `HintGroup`, `StatusChip`, titles, or domain actions.

`ActionButton` renders as `<span>` — never `<button>`.

Naming: `IconSlot` is package-local — never a second `PanelIconSlot`. `PanelToolbar` is distinct from layout `PanelToolbarRegion`.

---

## 6. In Scope

1. `workspace/toolbar/` presentational package + local barrel
2. Shell wiring in Explorer / Inspector / Console + Canvas (`SemanticHeader.trailing` + `PanelToolbarRegion`)
3. This document + `validate:ux-2.19` + roadmap row (UX-2.19)
4. Point UX-2.18b NEXT at UX-2.19

---

## 7. Out of Scope

- `"use client"` or hooks inside `toolbar/`
- Expanding Action* / PanelToolbar public props
- Modifying `workspace/actions/` or ContextAction(s)
- Touching `PanelHeader.actions`, LeftPanel / RightPanel / BottomPanel chrome
- Real menus, commands, keyboard, focus, tooltips, portals
- Iconography libraries (→ UX-2.20) · Final Visual Polish (→ UX-2.21)
- PanelState / persistence / resize / focus / modes / session / docking
- Expanding public `@/components/workspace` barrel with `toolbar/`

---

## 8. Wiring

| Panel | Grammar |
|-------|---------|
| **Explorer** | SemanticHeader(`Project`) + trailing PanelToolbar > ActionGroup (empty) |
| **Inspector** | SemanticHeader trailing PanelToolbar > ActionGroup (empty) |
| **Console** | SemanticHeader trailing PanelToolbar > ActionGroup (empty) |
| **Canvas** | Header trailing PanelToolbar > ActionGroup; PanelToolbarRegion wraps HintGroup + ToolbarSpacer + StatusChip as opaque children |

Disclosure, EmptyState, ContextActions chrome, and stable section IDs remain unchanged.

---

## 9. Validation

```bash
npm run validate:ux-2.19
```

Runs UX-2.19 structural checks, delegates `validate:ux-2.18b` (`UX_SKIP_DELEGATES=1`), then `tsc --noEmit` and ESLint.

---

## 10. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.19.1** | `workspace/toolbar/` package exists | PASS |
| **CA-2.19.2** | `ACTION_TOKENS` compose-only SSOT | PASS |
| **CA-2.19.3** | Action* / PanelToolbar presentational; API freeze respected | PASS |
| **CA-2.19.4** | No downward imports to actions/layout/surfaces/composition/disclosure | PASS |
| **CA-2.19.5** | No hooks / `"use client"` / `onClick` | PASS |
| **CA-2.19.6** | Explorer / Inspector / Console / Canvas wired | PASS |
| **CA-2.19.7** | `workspace/actions/` ContextAction(s) untouched | PASS |
| **CA-2.19.8** | No public workspace barrel export | PASS |
| **CA-2.19.9** | UX-2.20–2.21 IDs unchanged | PASS |
| **CA-2.19.10** | `npm run validate:ux-2.19` PASS | PASS |

---

## 11. STOP

```text
UX-2.19 = COMPLETE (awaiting human review)
API FREEZE = ActionButton · ActionGroup · PanelToolbar · ToolbarSpacer ·
             IconSlot · ACTION_TOKENS
PACKAGE ISOLATION = toolbar/ ⊥ actions ⊥ layout ⊥ surfaces ⊥ composition ⊥ disclosure
TOKEN RULE = compose-only (no parallel SURFACE/LAYOUT/SEMANTIC scale)
Next: UX-2.20 — Iconography & Microinteractions
Do NOT expand Action* props · Do NOT touch actions/ · Do NOT export toolbar publicly
```

> **Status note:** UX-2.20 Iconography & Microinteractions is COMPLETE (awaiting human review). See [`docs/UX-2.20-iconography-microinteractions.md`](UX-2.20-iconography-microinteractions.md). Next after UX-2.20: UX-2.21 — Final Visual Polish.
