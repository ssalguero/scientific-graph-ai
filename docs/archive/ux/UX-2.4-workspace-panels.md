# UX-2.4 — Workspace Panels Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.4 — BUILD (Workspace Panels Foundation)  
**Fase:** Build presentacional (IDE body regions)  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.4 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.3 COMPLETE · D47 Workspace freeze · D48 SSOT  

**Declaración:**

```text
UX-2.4 = COMPLETE (workspace panels foundation)
SCOPE = WorkspaceBodyLayout + Left/Right/Bottom placeholders
BEHAVIOR = UNCHANGED
D47 SHELL = FROZEN (WorkspaceLayout + WorkspaceLayoutProps)
WorkspacePanels = floating/dock host ONLY
Canvas ownership = WorkspaceBodyLayout (exactly one data-workspace-canvas)
WorkspaceContent = orchestration (toolbar → header → BodyLayout)
VISUAL-ONLY = ENFORCED
NO Inspector logic · NO resize · NO persistence · NO splitters
READY FOR HUMAN REVIEW
```

---

## 1. Objective

Introduce the IDE panel architecture (left / canvas / right / bottom) as **presentation-only** chrome so later phases can mount Inspector, split layout, and persistence without reopening the main shell.

---

## 2. Architecture

```text
WorkspaceLayout (shell, frozen)
  └── WorkspaceContent
        ├── {toolbar}
        ├── Header (UX-2.3, unchanged)
        └── WorkspaceBodyLayout({children})
              ├── LeftWorkspacePanel
              ├── data-workspace-canvas
              │     └── {children}   ← Content passes {workspace}
              ├── RightWorkspacePanel
              └── BottomWorkspacePanel
```

Provider tree (frozen):

```text
Home → WindowManager → SessionProvider → GraphEditor → WorkspaceLayout
```

---

## 3. IN / OUT

### 3.1 IN

1. [`src/components/workspace/panels/`](../src/components/workspace/panels/) — Left / Right / Bottom / `WorkspaceBodyLayout` / barrel  
2. Composition update in [`WorkspaceContent.tsx`](../src/components/workspace/WorkspaceContent.tsx)  
3. `validate:ux-2.4` + amend architecture / UX-2.3 gates for `panels/`  
4. Roadmap resequence (panels → Inspector → split → persistence)  
5. This document  

### 3.2 OUT

- Inspector functionality, resizable panels, collapse, persistence, splitters  
- Changes to `WorkspaceLayout` API / `page.tsx` wiring  
- Window / Session / Docking / Tabs / Persistence / providers / context  
- New `UI_TOKENS` keys  
- Expanding the public `@/components/workspace` barrel with panel exports  

---

## 4. UX-2.4 Freeze

```text
WorkspaceBodyLayout is presentation-only.
No hooks.
No state.
No effects.
No providers.
No context.
No business imports.
Canvas ownership remains inside WorkspaceBodyLayout.
WorkspaceContent remains orchestration only.
WorkspaceLayout remains frozen.
WorkspaceLayoutProps remains exactly the same.
WorkspacePanels remains floating/docking host only.
Placeholders are declarative (no .map).
API: WorkspaceBodyLayoutProps = { children } only.
Exactly one data-workspace-canvas; {workspace} once; children direct child of canvas.
```

---

## 5. Files

| File | Action |
|------|--------|
| `src/components/workspace/panels/*` | Create |
| `src/components/workspace/WorkspaceContent.tsx` | Compose BodyLayout |
| `scripts/validate-ux-2.4.ts` | Create |
| `scripts/validate-workspace-architecture.ts` | Allow `panels/` |
| `scripts/validate-ux-2.3.ts` | Canvas contract location-agnostic |
| `package.json` | `validate:ux-2.4` |
| `docs/UX-2.4-workspace-panels.md` | Create |
| `docs/UX-2.0-roadmap.md` | Resequence |

**Unchanged:** `WorkspaceLayout.tsx`, `WorkspacePanels.tsx`, `types.ts`, `page.tsx`, engines, tokens API shape.

---

## 6. DOM stability

| Rule | Enforcement |
|------|-------------|
| Exactly one `data-workspace-canvas` | `validate:ux-2.4` (owned by BodyLayout) |
| `{workspace}` once | `validate:ux-2.4` / `validate:ux-2.3` |
| Direct child of canvas | Content → BodyLayout → canvas → `{children}` |
| Order: toolbar → header → BodyLayout | `validate:ux-2.4` |

---

## 7. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.4.1** | Left / Right / Bottom panels visible (placeholders) | PASS |
| **CA-2.4.2** | Canvas / toolbar / header unchanged functionally | PASS |
| **CA-2.4.3** | Single canvas; workspace once; direct child | PASS |
| **CA-2.4.4** | D47 shell + props frozen; overlay host untouched | PASS |
| **CA-2.4.5** | No hooks / domain imports in `panels/*` | PASS |
| **CA-2.4.6** | `npm run validate:ux-2.4` PASS | PASS |

---

## 8. Validation

```bash
npm run validate:ux-2.4
```

Delegates: `validate:workspace-architecture`, `validate:design-tokens-v2`, `npx tsc --noEmit`.

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
UX-2.4 = COMPLETE (awaiting human review)
Next: UX-2.5 Inspector mounts into RightWorkspacePanel chrome — after certification.
Do NOT inject Inspector logic into WorkspaceBodyLayout.
```
