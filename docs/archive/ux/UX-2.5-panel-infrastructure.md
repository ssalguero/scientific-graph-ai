# UX-2.5 — Panel Infrastructure Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.5 — BUILD (Panel Infrastructure Foundation)  
**Fase:** Build presentacional (reusable panel chrome)  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.5 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.4 COMPLETE · D47 Workspace freeze · D48 SSOT  

**Declaración:**

```text
UX-2.5 = COMPLETE (panel infrastructure foundation)
SCOPE = Panel shell + PanelHeader + PanelBody + Left/Right/Bottom wrappers
BEHAVIOR = UNCHANGED (empty bodies; no domain)
Panel = SHELL ONLY (does not create Header/Body)
Wrappers compose Header + Body; children slot ready for UX-2.6
COLLAPSED = visual geometry freeze (w-0 / h-0 + overflow-hidden)
LAYOUT = flex freeze (Panel / Header / Body)
DATA ATTRS = data-workspace-panel + data-panel-position + data-panel-collapsed
NO Explorer · Inspector · Console content
NO resize · splitters · docking · tabs · persistence
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Replace UX-2.4 visual placeholders with a reusable panel shell so later phases can mount Explorer / Inspector / Console content and animate collapse geometry without redesigning chrome.

---

## 2. IN

1. [`src/components/workspace/panels/Panel.tsx`](../src/components/workspace/panels/Panel.tsx)
2. [`PanelHeader.tsx`](../src/components/workspace/panels/PanelHeader.tsx) / [`PanelBody.tsx`](../src/components/workspace/panels/PanelBody.tsx)
3. [`LeftPanel.tsx`](../src/components/workspace/panels/LeftPanel.tsx) / [`RightPanel.tsx`](../src/components/workspace/panels/RightPanel.tsx) / [`BottomPanel.tsx`](../src/components/workspace/panels/BottomPanel.tsx)
4. Barrel + `WorkspaceBodyLayout` import updates
5. `validate:ux-2.5` + amend `validate:ux-2.4` for renames
6. Roadmap resequence (infrastructure → content → split)
7. This document

---

## 3. OUT

- Explorer / Inspector / Console functional content
- Resize, splitters, docking, tabs, persistence, Window integration
- Changes to `WorkspaceLayout`, `WorkspacePanels`, `types.ts`, `page.tsx`
- New `UI_TOKENS` keys
- Public `@/components/workspace` barrel panel exports

---

## 4. Frozen decisions

### 4.1 Shell vs content

```text
Panel = geometric / chrome shell only.
Panel does NOT import or create PanelHeader / PanelBody.
LeftPanel / RightPanel / BottomPanel compose:
  <Panel>
    <PanelHeader />
    <PanelBody>{children}</PanelBody>
  </Panel>
UX-2.6 may replace Body children without touching Panel.tsx.
```

### 4.2 Collapsed (visual only)

```text
collapsed?: boolean  // default false
left / right  → width 0 + overflow-hidden
bottom        → height 0 + overflow-hidden
Do NOT collapse by hiding PanelBody alone.
No animation · no toggle · no React state in panels/*.
```

### 4.3 Testing attributes

```text
data-workspace-panel="left|right|bottom"
data-panel-position="left|right|bottom"
data-panel-collapsed="true|false"
```

### 4.4 Internal layout (project-life freeze)

| Layer | Contract |
|-------|----------|
| Panel | `flex` · `flex-col` · `min-h-0` · `overflow-hidden` |
| Header | `flex-none` |
| Body | `flex-1` · `min-h-0` · `overflow-auto` |

### 4.5 Phase sizes (hardcoded this phase only)

| Panel | Expanded |
|-------|----------|
| Left | `w-[320px]` |
| Right | `w-[340px]` |
| Bottom | `h-[220px]` |

---

## 5. Architecture

```text
WorkspaceLayout (shell, frozen)
  └── WorkspaceContent (composition-only)
        ├── {toolbar}
        ├── Header (UX-2.3)
        └── WorkspaceBodyLayout
              ├── LeftPanel → Panel + Header(Explorer) + Body
              ├── data-workspace-canvas → {children}
              ├── RightPanel → Panel + Header(Inspector) + Body
              └── BottomPanel → Panel + Header(Console) + Body
```

Titles: **Explorer** | **Inspector** | **Console**. Header = visible title only (no buttons).

---

## 6. Validation

```bash
npm run validate:ux-2.5
```

Delegates: `validate:workspace-architecture`, `validate:design-tokens-v2`, `npx tsc --noEmit`.

`validate:ux-2.4` amended for renamed `*Panel.tsx` files; prior architecture guarantees preserved.

---

## 7. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.5.1** | Panel / PanelHeader / PanelBody exist | PASS |
| **CA-2.5.2** | Left / Right / Bottom use Panel and compose Header+Body | PASS |
| **CA-2.5.3** | Layout + collapsed + data-* freezes enforced | PASS |
| **CA-2.5.4** | Fixed sizes 320 / 340 / 220 | PASS |
| **CA-2.5.5** | WorkspaceContent composition-only; canvas markup unchanged | PASS |
| **CA-2.5.6** | No domain content; no hooks in panels/* | PASS |
| **CA-2.5.7** | `npm run validate:ux-2.5` PASS | PASS |

---

## 8. Regression Gate (non-touch confirmation)

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

## 9. STOP

```text
UX-2.5 = COMPLETE (awaiting human review)
Next: UX-2.6 Panel Content — mount Explorer / Inspector / Console into Body slots.
Do NOT inject domain logic into Panel.tsx.
Do NOT break collapsed geometry contract (needed by UX-2.7 Resizable Split).
```
