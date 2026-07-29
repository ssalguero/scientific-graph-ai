# UX-2.2 — Toolbar Migration Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.2 — BUILD (Toolbar Foundation)  
**Fase:** Build presentacional (toolbar tokens)  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.2 = COMPLETE (awaiting human review)** · **NO UX-2.3**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.1 CERTIFIED · D49 Adaptive Toolbar freeze · D48 SSOT · `DESIGN_SYSTEM.md`

**Declaración:**

```text
UX-2.2 = COMPLETE (toolbar foundation)
Toolbar = AdaptiveToolbar (D49 frozen)
SCOPE = UI_TOKENS.toolbar VALUES ONLY
BEHAVIOR = UNCHANGED
ARCHITECTURE = UNCHANGED
AdaptiveToolbarProps = FROZEN
UI_TOKENS API = FROZEN (no keys added/renamed/removed)
VISUAL-ONLY = ENFORCED
NO src/components/ui/toolbar/ · NO TopBar · NO page.tsx rewire
READY FOR HUMAN REVIEW
STOP — do not open UX-2.3
```

---

## 1. Objetivo

Restyle in-place the frozen Adaptive Toolbar chrome so it aligns with [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) and the UX-2.1 shell (`--app-*`), without changing D49 architecture, props, handlers, or `page.tsx` composition.

---

## 2. Baseline

```text
WorkspaceLayout + getAppShell
 └── WorkspaceContent
      ├── AdaptiveToolbar (left | optional center | optional right)
      │    └── page.tsx owns left slot (header, tabs, lab selector)
      └── workspace sections
```

- Shell owner: [`AdaptiveToolbar`](../src/components/toolbar/AdaptiveToolbar.tsx) — presentational slots only.
- Tokens: [`UI_TOKENS.toolbar`](../src/lib/ui/tokens.ts) via [`TOOLBAR_TOKENS`](../src/components/toolbar/ToolbarTokens.ts).
- Wiring: `page.tsx` mounts `AdaptiveToolbar` with **`left` only** (D49 move-only).

---

## 3. Alcance

### 3.1 IN

1. **Valores only** of existing `UI_TOKENS.toolbar` keys.
2. Documentation: this file + roadmap status update.
3. Validators: toolbar architecture, move-only, design-tokens-v2, D49 umbrella, `tsc`.
4. Regression Gate (non-touch confirmation).

### 3.2 OUT

- `src/components/ui/toolbar/` hierarchy
- TopBar / Logo / Graph Controls composition
- Overflow responsive APIs / non-passthrough `ToolbarOverflow`
- `page.tsx` composition (`center` / `right` / ToolbarGroup wiring)
- Handler rewires; Graph/Math/State/Stores/Workspace/Windows/Tabs/Persistence/Autosave/Snapshots/Supabase
- High Contrast; ThemeProvider; new `UI_TOKENS` keys
- Motion key renames (100 ms global deferred to UX-2.12)

---

## 4. Archivos afectados

| Archivo | Acción |
|---------|--------|
| [`src/lib/ui/tokens.ts`](../src/lib/ui/tokens.ts) | **Valores** de `toolbar.*` únicamente |
| [`docs/UX-2.2-toolbar-foundation.md`](UX-2.2-toolbar-foundation.md) | Create — este documento |
| [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) | Status: UX-2.1 CERTIFIED · UX-2.2 COMPLETE · STOP UX-2.3 |
| [`docs/UX-2.1-appshell-foundation.md`](UX-2.1-appshell-foundation.md) | Status → CERTIFIED |

**No modificados:** `AdaptiveToolbar.tsx`, `types.ts`, barrel, `ToolbarTokens.ts` keys, `page.tsx`, validators, engines, `DESIGN_SYSTEM.md`.

---

## 5. Decisiones visuales (valores)

| Clave | Cambio (UX-2.2) |
|-------|-----------------|
| `root` | + `elevation.flat` + `transitions.colors200` (hairline flat + theme color transition) |
| `section*` | `spaceY2` → `spaceY15` (denser vertical rhythm) |
| `action` | + `focus-visible` ring (`--app-accent`/30) |
| `actionActive` | + `text-[var(--app-heading)]` + matching focus-visible; keeps accent soft border + `shadows.sm` (raised) |
| `padding` | `px2` → `px25` (dense bar 10 px horizontal, matches root) |

Claves públicas y formas D49 **sin cambio**. Colores vía `--app-*` del shell UX-2.1.

---

## 6. Criterios de aceptación UX-2.2

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-2.2.1** | `AdaptiveToolbarProps` y barrel D49 intactos | PASS |
| **CA-2.2.2** | Solo valores `UI_TOKENS.toolbar`; cero claves add/rename/delete | PASS |
| **CA-2.2.3** | `page.tsx` sin cambios de composición / handlers | PASS |
| **CA-2.2.4** | `validate:toolbar-architecture` + `validate:toolbar-move-only` PASS | PASS (ver §7) |
| **CA-2.2.5** | CA-UX-2.2 roadmap: mismas acciones / lógica | PASS (handlers untouched) |
| **CA-2.2.6** | Regression Gate documentado; visual-only | PASS (ver §8) |

---

## 7. Checklist de validación

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | **PASS** (exit 0) |
| `npm run validate:toolbar-architecture` | **PASS** (24/24) |
| `npm run validate:toolbar-move-only` | **PASS** (21/21) |
| `npm run validate:design-tokens-v2` | **PASS** (34/34) |
| `npm run validate:v11-d49-gate` | **PASS** (`D49 GATE PASS`; includes tsc + next build) |
| Diff gate `tokens.ts` | Solo valores `toolbar.*` + comentario UX-2.2 |
| Diff gate resto `src/` | Ningún otro archivo de lógica |

---

## 8. Regression Gate

| Check | Resultado |
|-------|-----------|
| Session Restore | PASS (no tocado — Visual-only) |
| Autosave | PASS (no tocado — Visual-only) |
| Window Tabs | PASS (no tocado — Visual-only) |
| Floating Windows | PASS (no tocado — Visual-only) |
| Docking | PASS (no tocado — Visual-only) |
| Snap | PASS (no tocado — Visual-only) |
| Export | PASS (no tocado — Visual-only) |
| Theme switch | PASS (shell `--app-*` + toolbar `transitions.colors200`; API intacta) |

---

## 9. STOP

```text
UX-2.2 = COMPLETE (awaiting human review)
DO NOT OPEN UX-2.3
```
