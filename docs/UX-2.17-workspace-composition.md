# UX-2.17 — Workspace Composition Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.17 — BUILD (Workspace Composition Foundation)  
**Fase:** Presentational composition primitives + layout-only wiring  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.17 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.16 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.17 = COMPLETE (workspace composition foundation)
SCOPE = workspace/composition/ + Explorer/Inspector/Console/Canvas layout wiring
API FREEZE = WorkspaceSection · WorkspaceStack · WorkspaceGroup ·
             WorkspaceDivider · WorkspaceSpacer · composition SURFACE_TOKENS keys
PACKAGE ISOLATION = composition/ ⊥ PanelState ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
DENSITY = EQUIVALENT to UX-2.16 (visual change = bug)
NO "use client" · NO hooks · NO callbacks · NO public barrel export
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Introduce reusable structural composition primitives so Explorer, Inspector, Console, and Canvas read as parts of one workspace — without changing behavior, state, resize geometry, or surface identity APIs.

Layout-only: replace ad-hoc wrappers with `composition/` primitives. Surfaces remain identity/chrome; composition owns structure.

---

## 2. Architecture

```text
workspace/composition/
  WorkspaceSection.tsx   ← zone wrapper (no flex)
  WorkspaceStack.tsx     ← sole flex owner (spacing=md, direction=vertical)
  WorkspaceGroup.tsx     ← semantic affinity (not hierarchy)
  WorkspaceDivider.tsx   ← decorative <div aria-hidden>
  WorkspaceSpacer.tsx    ← frozen scale none|sm|md
  index.ts

Explorer / Inspector / Console / Canvas
  → Section → Stack → Group → existing content
```

```text
composition/
    │
    ▼
SURFACE_TOKENS (composition keys)

composition/  ──✗──►  panels/state
composition/  ──✗──►  panels/persistence
composition/  ──✗──►  panels/resize
composition/  ──✗──►  focus/
composition/  ──✗──►  modes
composition/  ──✗──►  session
composition/  ──✗──►  providers
```

**Density note:** New `SURFACE_TOKENS` composition keys are visually equivalent to existing UX-2.16 density. They do not redesign spacing. Any meaningful visual change in review is a bug.

---

## 3. Composition hierarchy

Canonical tree (reused through UX-3):

```text
WorkspaceSection
  ↓
WorkspaceStack
  ↓
WorkspaceGroup
  ↓
Existing content
```

| Primitive | Responsibility |
|-----------|----------------|
| **Section** | Zone wrapper only — no default flex |
| **Stack** | Sole flex layout owner |
| **Group** | Semantic affinity (Properties + Appearance), not Header/Body/Footer |
| **Divider** | Composition-level decorative separator |
| **Spacer** | Semantic space (`none` \| `sm` \| `md`) |

---

## 4. IN

1. `workspace/composition/` presentational package (five modules + barrel)
2. Composition keys on `SURFACE_TOKENS` (density-equivalent)
3. Layout-only wiring in Explorer / Inspector / Console + Canvas inner `PanelSurface`
4. This document + `validate:ux-2.17` + roadmap resequence (2.17–2.20)

---

## 5. OUT

- `"use client"` or hooks inside `composition/`
- Callbacks / providers / stores / contexts
- PanelState / persistence / resize / focus / modes / session / docking
- Outer canvas node / resize handles / rails / focus activation changes
- Replacing UX-2.15 `ContextDivider` or UX-2.16 `PanelDivider`
- Expanding public `@/components/workspace` barrel with `composition/`
- Density redesign; spacer scales beyond `none|sm|md`
- Toolbar / AdaptiveToolbar rewiring (→ UX-2.18)

---

## 6. Frozen APIs

### 6.1 Composition tokens (on SURFACE_TOKENS)

```ts
workspaceGap / sectionGap / groupGap
dividerColor / dividerMuted / dividerInset
sectionPadding / spacer
```

Values mirror existing density. Primitives look up keys only — no local maps.

### 6.2 WorkspaceSection

```ts
type WorkspaceSectionProps = {
  padding?: "none" | "sm" | "md"; // default "none"
  children: React.ReactNode;
  className?: string;
};
```

No flex by default.

### 6.3 WorkspaceStack

```ts
type WorkspaceStackProps = {
  spacing?: "sm" | "md";              // default "md"
  direction?: "vertical" | "horizontal"; // default "vertical"
  children: React.ReactNode;
  className?: string;
};
```

Uses `SURFACE_TOKENS.workspaceGap` only.

### 6.4 WorkspaceGroup

```ts
type WorkspaceGroupProps = {
  spacing?: "sm" | "md"; // default "md"
  children: React.ReactNode;
  className?: string;
};
```

Affinity only — not hierarchy.

### 6.5 WorkspaceDivider

```ts
type WorkspaceDividerProps = {
  inset?: "none" | "sm" | "md";
  muted?: boolean;
  className?: string;
};
```

`<div aria-hidden />` only. Uses `dividerColor` / `dividerInset` / `dividerMuted` exclusively. `muted` is a token alias.

### 6.6 WorkspaceSpacer

```ts
type WorkspaceSpacerProps = {
  size?: "none" | "sm" | "md"; // default "md"
  className?: string;
};
```

---

## 7. Validations

```bash
npm run validate:ux-2.17
```

Runs UX-2.17 structural checks (including no local Stack maps, Divider token exclusivity, no new ad-hoc spacing in wired files), delegates `validate:ux-2.16` (`UX_SKIP_DELEGATES` leaf pattern), then `tsc --noEmit` and ESLint.

---

## 8. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.17.1** | `workspace/composition/` presentational package exists | PASS |
| **CA-2.17.2** | Composition keys on `SURFACE_TOKENS`; density-equivalent | PASS |
| **CA-2.17.3** | Stack defaults md/vertical; uses `workspaceGap`; no local maps | PASS |
| **CA-2.17.4** | Section has no default flex; Group = affinity; Spacer `none\|sm\|md` | PASS |
| **CA-2.17.5** | Divider is `<div aria-hidden>`; token-only muted | PASS |
| **CA-2.17.6** | Explorer / Inspector / Console / Canvas composed; outer canvas untouched | PASS |
| **CA-2.17.7** | No PanelState / focus / resize / persistence / modes coupling | PASS |
| **CA-2.17.8** | Roadmap 2.17 Composition → 2.18 Toolbar → 2.19 Iconography → 2.20 Polish | PASS |
| **CA-2.17.9** | `npm run validate:ux-2.17` PASS | PASS |

---

## 9. STOP

```text
UX-2.17 = COMPLETE (awaiting human review)
API FREEZE = WorkspaceSection · WorkspaceStack · WorkspaceGroup ·
             WorkspaceDivider · WorkspaceSpacer · composition tokens
PACKAGE ISOLATION = composition/ ⊥ state ⊥ persistence ⊥ resize ⊥ focus ⊥ modes
Next: UX-2.18 — Toolbar & Action Refinement
Do NOT redesign density · Do NOT reopen Panel.tsx · Do NOT export composition publicly
```
