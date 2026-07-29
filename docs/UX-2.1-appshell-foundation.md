# UX-2.1 — AppShell Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.1 — BUILD (AppShell Foundation)  
**Fase:** Build presentacional (shell tokens)  
**Fecha:** 2026-07-29  
**Estado:** **UX-2.1 = COMPLETE (awaiting human review)** · **NO UX-2.2**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · Architecture Freeze · D48 SSOT · UX-1.0–1.3  

**Declaración:**

```text
UX-2.1 = COMPLETE (appshell foundation)
AppShell = CONCEPTUAL (WorkspaceLayout + getAppShell)
SCOPE = layout.appShellLight / layout.appShellDark VALUES ONLY
BEHAVIOR = UNCHANGED
ARCHITECTURE = UNCHANGED
UI_TOKENS API = FROZEN (no keys added/renamed/removed)
VISUAL-ONLY = ENFORCED
NO layout/AppShell.tsx · NO StatusBar · NO ThemeProvider
READY FOR HUMAN REVIEW
STOP — do not open UX-2.2
```

---

## 1. Objetivo

Integrar el **AppShell conceptual**: alinear los valores de tema del shell (`getAppShell` ← `layout.appShellLight|Dark`) hacia la identidad de [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md), sin reemplazar `page.tsx` por un componente `AppShell` ni alterar providers.

---

## 2. Baseline actual

```text
Home
 └─ WindowManager
    └─ SessionProvider
       ├─ SessionBridge
       └─ GraphEditor
          └─ WorkspaceLayout(themeMode)   ← AppShell conceptual
             ├─ sidebar: Sidebar
             ├─ workspace: WorkspaceContent (AdaptiveToolbar + sections)
             └─ panels: WorkspacePanels (Dock Inspector + FloatingWindowBridge)
```

- Shell owner: [`WorkspaceLayout`](../src/components/workspace/WorkspaceLayout.tsx) — **sin cambios de lógica en UX-2.1**.
- Tema: `getAppShell(themeMode)` en [`theme.ts`](../src/lib/ui/theme.ts) — **API intacta**.
- Pre-UX-2.1: `--app-*` en slate/azul (`#2563eb` / `#3b82f6`).

### Confirmación AppShell conceptual

| Check | Resultado |
|-------|-----------|
| `WorkspaceLayout` sigue siendo el único `<main>` shell | PASS |
| Consume `getAppShell(themeMode)` + `WORKSPACE_TOKENS.shell` | PASS |
| No existe `src/components/layout/AppShell.tsx` | PASS |
| Árbol providers sin cambios estructurales | PASS |

---

## 3. Alcance

### 3.1 IN

1. Documentación: este archivo + roadmap UX-2.0.
2. Visual Token Alignment (**valores only**) de `UI_TOKENS.layout.appShellLight` / `appShellDark`.
3. Verificación de composición `WorkspaceLayout` (sin editar lógica).
4. Smoke visual light + dark (accent cian; fondos cálidos / grafito).

### 3.2 OUT

- `AppShell.tsx` / `src/components/layout/**`
- StatusBar, CommandPalette, ThemeProvider, HC
- Cambios estructurales en `page.tsx`
- Edits a `session/`, WindowManager, docking, layout-engine, graph, storage, autosave, restore
- Migración Toolbar / Sidebar / Inspector / Forms (UX-2.2+)
- `workstation/`, `styles.css`, shadcn, Radix, Plex, Lucide
- Claves nuevas / renombradas / eliminadas en `UI_TOKENS`

---

## 4. Archivos afectados

| Archivo | Acción |
|---------|--------|
| [`src/lib/ui/tokens.ts`](../src/lib/ui/tokens.ts) | **Valores** de `layout.appShellLight` / `appShellDark` únicamente |
| [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) | Create — roadmap epic |
| [`docs/UX-2.1-appshell-foundation.md`](UX-2.1-appshell-foundation.md) | Create — este documento |

**No modificados:** `WorkspaceLayout.tsx`, `theme.ts` API, `page.tsx`, providers, engines, `DESIGN_SYSTEM.md`.

---

## 5. Pasos ejecutados

1. Redactar [`UX-2.0-roadmap.md`](UX-2.0-roadmap.md) (Hard Rules, mapeo, Regression Gate, 2.1–2.14).
2. Ajustar valores `appShellLight` / `appShellDark` (accent cian; surfaces/borders/text coherentes light/dark).
3. Confirmar `WorkspaceLayout` = AppShell conceptual (sin tocar lógica).
4. Correr validators + `tsc`.
5. Documentar evidencias + Regression Gate + STOP.

---

## 6. Decisiones visuales (D48)

Mapeo conceptual `DESIGN_SYSTEM.md` → `--app-*` (hex aproximados desde oklch de referencia):

| Rol Lovable | Variable D48 | Light | Dark |
|-------------|--------------|-------|------|
| workspace | shell `bg` | `#ecebe8` | `#1b2028` |
| surface | `--app-surface` | `#f9f8f6` | `#2c333e` |
| panel | `--app-surface-muted` | `#f3f2ef` | `#232933` |
| border | `--app-border` | `#dad8d4` | `#2f3946` |
| foreground | `--app-text` / `--app-heading` | `#313339` | `#e2e8ef` |
| muted-foreground | `--app-text-muted` | `#5e6269` | `#a8b4c4` |
| accent-primary | `--app-accent` | `#2a7690` (cian) | `#8fc7d8` (cian) |
| ok / warn / destructive | success / warning / danger (+ bg/text/border) | alineados a DS | alineados a DS |

- Mismas claves CSS `--app-*` y mismas claves públicas `layout.appShellLight` / `appShellDark`.
- Sin segundo SSOT.

---

## 7. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Accent global afecta botones/estados en toda la app | Intencional en 2.1; Theme switch en Regression Gate |
| Drift parcial vs toolbar/sidebar UX-1 | 2.1 solo shell tokens; 2.2+ completa chrome |
| Presión por StatusBar / AppShell.tsx | OUT explícito + tabla de mapeo en roadmap |
| Tentación de nuevas claves D48 | UI_TOKENS API Freeze |

---

## 8. Criterios de aceptación UX-2.1

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-2.1.1** | No existe `layout/AppShell.tsx`; shell runtime = `WorkspaceLayout` | PASS |
| **CA-2.1.2** | Árbol WindowManager → SessionProvider → GraphEditor → WorkspaceLayout sin cambios estructurales | PASS |
| **CA-2.1.3** | `getAppShell` / `ThemeMode` API sin cambios; solo valores D48 del shell | PASS |
| **CA-2.1.4** | Light y dark más cercanos a DESIGN_SYSTEM (accent cian; sin hardcoded nuevos fuera de tokens) | PASS |
| **CA-2.1.5** | Validators PASS; Regression Gate documentado; Visual-only cumplido | PASS (ver §9) |

---

## 9. Checklist de validación

### 9.1 Validators

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | **PASS** (exit 0; sin errores) |
| `npm run validate:design-tokens-v2` | **PASS** (34/34) |
| `npm run validate:workspace-architecture` | **PASS** |
| `npm run validate:ui-architecture` | **PASS** |
| Diff gate `tokens.ts` | Solo valores `appShellLight` / `appShellDark` + comentario UX-2.1; cero claves add/rename/delete |
| Diff gate resto `src/` | Ningún otro archivo de lógica |

### 9.2 Regression Gate

| Check | Resultado |
|-------|-----------|
| Session Restore | PASS (no tocado — Visual-only) |
| Autosave | PASS (no tocado — Visual-only) |
| Window Tabs | PASS (no tocado — Visual-only) |
| Floating Windows | PASS (no tocado — Visual-only) |
| Docking | PASS (no tocado — Visual-only) |
| Snap | PASS (no tocado — Visual-only) |
| Export | PASS (no tocado — Visual-only) |
| Theme switch | PASS (API `themeMode` / `getAppShell` intacta; valores visuales actualizados) |

---

## 10. Evidencias esperadas

- Diff de `tokens.ts` limitado a strings de `layout.appShellLight` y `layout.appShellDark`.
- Docs UX-2.0 + UX-2.1 presentes.
- `--app-accent` light ≈ cian `#2a7690`; dark ≈ `#8fc7d8`.
- Shell bg light cálido `#ecebe8`; dark grafito `#1b2028`.
- Confirmación escrita: arquitectura PROD-3 intacta; sin componentes estructurales nuevos; sin API pública modificada.

---

## 11. STOP

```text
UX-2.1 = COMPLETE (awaiting human review)
DO NOT OPEN UX-2.2
```
