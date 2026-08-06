# UX-2.3 — Workspace & Canvas Migration

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.3 — BUILD (Workspace & Canvas)  
**Fase:** Build presentacional (workspace chrome)  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.3 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.1 CERTIFIED · UX-2.2 COMPLETE · D47 Workspace freeze · D48 SSOT · `DESIGN_SYSTEM.md`

**Declaración:**

```text
UX-2.3 = COMPLETE (workspace & canvas chrome)
SCOPE = WorkspaceContent presentational header + canvas wrap
BEHAVIOR = UNCHANGED
ARCHITECTURE = UNCHANGED (D47 6-file set)
DOM STABILITY = {workspace} once, direct child of canvas
UI_TOKENS API = FROZEN (no new keys)
VISUAL-ONLY = ENFORCED
NO Workspace.tsx / WorkspaceCanvas.tsx / WorkspaceHeader.tsx
NO page.tsx rewire · NO GraphEditor logic changes
READY FOR HUMAN REVIEW
```

---

## 1. Objetivo

Dar identidad visual IDE al área central (header de proyecto simulado + superficie canvas) **sin** alterar el árbol de providers, el contrato D47 de workspace, ni el contenido científico de `{workspace}`.

---

## 2. Baseline → Resultado

```text
WorkspaceLayout + getAppShell
 └── WorkspaceContent
      ├── AdaptiveToolbar (UX-2.2 — unchanged slot)
      ├── header (UX-2.3 — static Project / Scientific Graph AI / Ready)
      └── canvas surface (UX-2.3)
           └── {workspace}  ← same ReactNode, wrap only
```

Provider tree (frozen):

```text
Home → WindowManager → SessionProvider → GraphEditor → WorkspaceLayout
```

---

## 3. Alcance

### 3.1 IN

1. Presentational header + canvas surface inside [`WorkspaceContent.tsx`](../src/components/workspace/WorkspaceContent.tsx)
2. Chrome classes via `--app-*` (D48 SSOT)
3. Documentation + `validate:ux-2.3`
4. Roadmap resequence note (Sidebar deferred)

### 3.2 OUT

- New workspace files (`Workspace.tsx`, `WorkspaceCanvas.tsx`, `WorkspaceHeader.tsx`)
- Changes to `WorkspaceLayout` / `WorkspacePanels` structure
- `page.tsx` composition / GraphEditor logic
- WindowManager, SessionProvider, Charts, Series, Docking, Tabs, Snap
- Persistence / Autosave / Restore
- StatusBar (deferred)
- New `UI_TOKENS` keys / categories

---

## 4. Archivos afectados

| Archivo | Acción |
|---------|--------|
| [`src/components/workspace/WorkspaceContent.tsx`](../src/components/workspace/WorkspaceContent.tsx) | Header + canvas wrap |
| [`scripts/validate-ux-2.3.ts`](../scripts/validate-ux-2.3.ts) | Create — phase gate |
| [`package.json`](../package.json) | `validate:ux-2.3` |
| [`docs/UX-2.3-workspace-canvas.md`](UX-2.3-workspace-canvas.md) | Create — este documento |
| [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) | Resequence: UX-2.3 = Workspace & Canvas |

**No modificados:** `WorkspaceLayout.tsx`, `WorkspacePanels.tsx`, `WorkspaceTokens.ts`, `types.ts`, `index.ts`, `page.tsx`, `tokens.ts` freeze literals, engines, charts.

---

## 5. DOM stability

| Regla | Enforcement |
|-------|-------------|
| `{workspace}` renders exactly once | `validate:ux-2.3` |
| Direct child of canvas (`data-workspace-canvas`) | `validate:ux-2.3` |
| No reorder / extract / split of scientific children | Code + validator (no Children.map / clone) |
| Order: `{toolbar}` → header → canvas → `{workspace}` | `validate:ux-2.3` |

---

## 6. Token mapping

| Intent (brief) | Runtime (D48) |
|----------------|---------------|
| `bg-card` | `bg-[var(--app-surface)]` |
| `border-border` | `border-[var(--app-border)]` |
| `text-foreground` | `text-[var(--app-heading)]` / `--app-text` |
| `text-muted-foreground` | `text-[var(--app-text-muted)]` |
| `rounded-xl` / `shadow-sm` / `p-4` / `p-6` | Tailwind utilities |

No new token categories. `UI_TOKENS.workspace.{shell,mainColumn,inner}` literals **unchanged**.

---

## 7. Criterios de aceptación UX-2.3

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-2.3.1** | Exact 6-file workspace directory; no new Workspace* files | PASS |
| **CA-2.3.2** | Header + canvas chrome visible; `--app-*` only | PASS |
| **CA-2.3.3** | DOM stability: `{workspace}` once, direct child of canvas | PASS |
| **CA-2.3.4** | Provider tree unchanged | PASS |
| **CA-2.3.5** | Barrel + props API frozen; no circular peer imports | PASS |
| **CA-2.3.6** | `npm run validate:ux-2.3` PASS (delegates architecture + tokens + tsc) | PASS |

---

## 8. Validation

```bash
npm run validate:ux-2.3
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
UX-2.3 = COMPLETE (awaiting human review)
Next visual consolidation (Sidebar / panels) only after certification.
```
