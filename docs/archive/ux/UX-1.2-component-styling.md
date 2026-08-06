# UX-1.2 — Component Styling Foundation

**Épica:** UX-1 — Lovable Design System Integration  
**Microfase:** UX-1.2 — BUILD (Component Styling Foundation)  
**Fase:** Build presentacional  
**Fecha:** 2026-07-29  
**Estado:** **UX-1.2 = COMPLETE (awaiting human review)** · **NO UX-1.3**  
**Prerrequisitos:** UX-1.1 RELEASED · Architecture Freeze vigente · D48 SSOT · `DESIGN_SYSTEM.md` referencia visual  

**Declaración:**

```text
UX-1.2 = COMPLETE (component styling foundation)
SCOPE = Cards · Inputs · Labels · Buttons · Empty States · Separators · Form chrome (via D48)
page.tsx = OUT OF SCOPE
BEHAVIOR = UNCHANGED
ARCHITECTURE = UNCHANGED
D48 = SOLE TOKEN SSOT
NO new public UI_TOKENS keys · NO new APIs · NO shadcn/Radix
READY FOR HUMAN REVIEW
STOP — do not open UX-1.3
```

---

## 1. Objetivo

Aplicar el Design System de forma visible sobre componentes de uso diario, únicamente en apariencia, mediante **Visual Token Alignment** sobre D48 y deduplicación **1:1** hacia facades existentes.

---

## 2. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| [`src/lib/ui/tokens.ts`](../src/lib/ui/tokens.ts) | Valores de `panel.*` (card/content/subsection/empty*/inputField/…), `typography.fieldLabel`, `button.*` (mismas claves públicas) |
| [`src/components/reports/ScientificPublicationDashboard.tsx`](../src/components/reports/ScientificPublicationDashboard.tsx) | `contentPanel` / `emptyState` desde theme (equivalencia 1:1) |
| [`src/components/home/SmartStartScreen.tsx`](../src/components/home/SmartStartScreen.tsx) | `card` / `panelHeadingSubtext` desde theme (1:1) |
| [`src/components/home/PublicationEntryBanner.tsx`](../src/components/home/PublicationEntryBanner.tsx) | `contentPanel` desde theme (1:1; override de acento local conservado) |
| [`src/components/workflow/GuidedWorkflowPanel.tsx`](../src/components/workflow/GuidedWorkflowPanel.tsx) | `contentPanel` / `btnPrimary` / `btnOutlineSm` desde theme (1:1) |
| [`src/components/settings/SettingsPanel.tsx`](../src/components/settings/SettingsPanel.tsx) | toggles desde theme (1:1); shell local retenido |
| [`docs/UX-1.2-component-styling.md`](UX-1.2-component-styling.md) | Este documento |
| [`.cursor/rules/ui-tokens-compositions.mdc`](../.cursor/rules/ui-tokens-compositions.mdc) | Regla de consumo D48 |

**No modificados (explícito):** `src/app/page.tsx`, Providers, Registries, Session, Restore, Persistence, Autosave, Layout Engine, Docking, Snap, Window lifecycle/handlers, APIs públicas, `theme.ts` API surface, `DESIGN_SYSTEM.md`, `workstation/`, `styles.css`.

---

## 3. Decisiones visuales

### 3.1 Visual Token Alignment (D48)

- Sin nuevas claves públicas en `UI_TOKENS`.
- Densidad **por composición** (no altura única global):
  - Cards / content / subsection / empty → `radius.md`, sin sombra decorativa de “web card”
  - Inputs → `h-8`, `radius.md`, `text-xs`, focus-visible
  - Botones primary/outline/actionBar → `h-8`, `radius.md`, `text-xs`, sin `active:scale`
  - Botones densos (`outlineSm`) → `h-7` (ya alineado)
  - Labels → `text-[11px]` (escala de panel del DS)
- Textareas / selects siguen reutilizando `inputField` (sin clave nueva).
- Acento global `--app-accent` no migrado a cian Lovable.

### 3.2 Deduplicación 1:1

Solo se migró cuando el literal local coincidía visualmente con una composición D48 existente.

### 3.3 Literales retenidos a propósito (no 1:1)

| Archivo | Motivo |
|---------|--------|
| `ScientificMultiDatasetComparisonDashboard.tsx` | `contentPanel` / `emptyState` locales con padding/tipografía distintos |
| `ComparisonSlotSummaryCard.tsx` | Mismo `contentPanel` local más holgado |
| `Comparison*Section.tsx` | `emptyState` local (`px-3 py-2 text-sm`, sin `text-center`) ≠ `dataEmpty` / `empty` |
| `WorkbookImportWizard.tsx` | `inputClass` / botones locales sin focus ring / alturas distintas de `inputField` / `btn*` |
| `SettingsPanel.tsx` | `panelClassName` / `settingRowClassName` densidades distintas de `contentPanel` |
| `SmartStartScreen.tsx` (section hero) | Contenedor de sección con `p-4 sm:p-6` — no es `panel.card` |

---

## 4. Limitaciones

- Cascada visual hacia superficies dentro de `page.tsx` solo vía valores de tokens ya importados allí; **cero ediciones** a `page.tsx`.
- Comparison / wizard conservan composiciones locales deliberadas.
- Fuentes Plex/Mono, Lucide, HC, Inspector chrome: fuera de alcance.

---

## 5. Elementos deliberadamente no implementados

- Intervención en `page.tsx` (diferido a Dashboard Composition/Layout)
- Nuevos componentes Input/Select/Textarea/Label/Card/EmptyState/Form
- Nuevas claves públicas D48
- shadcn / Radix / `workstation/` / `styles.css`
- UX-1.3 y microfases posteriores

---

## 6. Verificación

Ejecutado en esta microfase (ver entrega BUILD):

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | PASS |
| `validate:design-tokens-v2` | PASS (34/34) |
| `validate:ui-button-panel-smoke` | PASS |
| `validate:ui-architecture` | PASS |
| `validate:ui-sidebar-architecture` | PASS |
| `validate:sidebar-v2` | PASS |
| `validate:workspace-architecture` | PASS |
| `validate:toolbar-architecture` | PASS |
| `validate:toolbar-move-only` | PASS |
| `validate:d55-window-api` | PASS |
| `validate:d56-floating-api` | PASS |
| `validate:d57-drag-api` | PASS |
| `validate:d58-resize-api` | PASS |

---

## 7. STOP

```text
UX-1.2 = COMPLETE (awaiting human review)
DO NOT OPEN UX-1.3
```
