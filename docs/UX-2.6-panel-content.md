# UX-2.6 — Panel Content Infrastructure

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.6 — BUILD (Panel Content Infrastructure)  
**Fase:** Build presentacional (Explorer / Inspector / Console body shells)  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.6 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.5 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.6 = COMPLETE (panel content infrastructure)
SCOPE = ExplorerContent / InspectorContent / ConsoleContent in Body slots
BEHAVIOR = UNCHANGED (presentational empty states only)
Panel shell = FROZEN (Panel / Header / Body / Left|Right|Bottom wrappers)
Freeze A = PanelContentSection sole reusable block
Freeze B = Content → Section → EmptyState
Freeze C = stable IDs project|layers|properties|appearance|output
NO domain · NO Sidebar remount · NO D50 Inspector · NO resize · NO docking · NO persistence
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Mount presentational content shells into existing PanelBody slots so later phases can add widgets, resize, and persistence without redesigning content structure.

---

## 2. IN

1. [`src/components/workspace/panels/content/`](../src/components/workspace/panels/content/) — section, empty state, Explorer / Inspector / Console
2. Mount wiring in [`WorkspaceBodyLayout.tsx`](../src/components/workspace/panels/WorkspaceBodyLayout.tsx)
3. `validate:ux-2.6` + safe recursive scan amend in `validate:ux-2.5`
4. This document + roadmap update

---

## 3. OUT

- Business logic / graph manipulation / charts
- Sidebar remount (UX-2.3b)
- D50 Inspector / Analysis Inspector / GraphSettings
- Resize / splitters (UX-2.7)
- Persistence (UX-2.8)
- Docking / Window / Session / Autosave / Tabs / Floating / Snap
- Changes to `Panel.tsx`, `PanelHeader.tsx`, `PanelBody.tsx`, Left/Right/Bottom wrappers
- Changes to `WorkspaceContent`, `WorkspaceLayout`, `WorkspacePanels`, `page.tsx`
- New `UI_TOKENS` keys; public `@/components/workspace` barrel expansion

---

## 4. Frozen decisions

### 4.1 Shell vs content

```text
Panel / PanelHeader / PanelBody / Left|Right|Bottom = chrome only (UX-2.5 freeze).
Content mounts exclusively as wrapper children from WorkspaceBodyLayout.
WorkspaceContent remains composition-only ({workspace} → BodyLayout).
```

### 4.2 Freeze A — PanelContentSection

Sole reusable content block for any panel (UX-2.6 → 2.7 → 2.8+).

```ts
type PanelContentSectionProps = {
  id: string;
  title: string;
  children?: ReactNode;
};
```

Root always:

```tsx
<section data-panel-content-section={id}>
```

### 4.3 Freeze B — Hierarchy

```text
PanelBody
  └── *Content
        └── PanelContentSection (1..n)
              └── PanelEmptyState | future widgets
```

Never put widgets/empty states as direct Body children. Always Content → Section → Widgets.

### 4.4 Freeze C — Stable section IDs

| Panel | Frozen `id` | Visible `title` (may change) |
|-------|-------------|------------------------------|
| Explorer | `project` | Project |
| Explorer | `layers` | Layers |
| Inspector | `properties` | Properties |
| Inspector | `appearance` | Appearance |
| Console | `output` | Output |

Validators assert IDs, not titles.

### 4.5 Data attributes

```text
data-panel-content="explorer|inspector|console"
data-panel-content-section="project|layers|properties|appearance|output"
```

---

## 5. Hierarchy (concrete)

```text
Explorer
  ExplorerContent
    PanelContentSection id="project" → PanelEmptyState
    PanelContentSection id="layers" → PanelEmptyState

Inspector
  InspectorContent
    PanelContentSection id="properties" → PanelEmptyState
    PanelContentSection id="appearance" → PanelEmptyState

Console
  ConsoleContent
    PanelContentSection id="output" → PanelEmptyState
```

---

## 6. Architecture

```text
WorkspaceBodyLayout
  ├── LeftPanel → Body → ExplorerContent
  ├── data-workspace-canvas → {children}
  ├── RightPanel → Body → InspectorContent
  └── BottomPanel → Body → ConsoleContent
```

---

## 7. Validation

```bash
npm run validate:ux-2.6
```

Delegates: `validate:ux-2.5`, `validate:workspace-architecture`, `validate:design-tokens-v2`, `npx tsc --noEmit`.

Enforces Freezes A/B/C, mounts, shell untouched, no hooks / no domain imports under `panels/content/`.

---

## 8. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.6.1** | Explorer / Inspector / Console content components exist | PASS |
| **CA-2.6.2** | Mounted only as Body children via BodyLayout | PASS |
| **CA-2.6.3** | Panel shell + wrappers unchanged | PASS |
| **CA-2.6.4** | Hierarchy Content → Section → EmptyState | PASS |
| **CA-2.6.5** | PanelContentSection sole block; frozen IDs | PASS |
| **CA-2.6.6** | `npm run validate:ux-2.6` PASS | PASS |

---

## 9. Regression Gate (non-touch confirmation)

| Check | Expected |
|-------|----------|
| Session Restore | PASS (untouched) |
| Autosave | PASS (untouched) |
| Window Tabs | PASS (untouched) |
| Floating Windows | PASS (untouched) |
| Docking | PASS (untouched) |
| Snap | PASS (untouched) |
| Export | PASS (untouched) |
| Theme switch | PASS (`--app-*` via shell) |

---

## 10. STOP

```text
UX-2.6 = COMPLETE (awaiting human review)
Next: UX-2.7 Resizable Split Layout — after certification.
Do NOT inject domain into Panel.tsx or panels/content/.
Do NOT break Content → Section → Widgets hierarchy.
Do NOT change frozen section IDs.
```
