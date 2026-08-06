# UX-1.3 — Dashboard Composition Foundation

**Épica:** UX-1 — Lovable Design System Integration  
**Microfase:** UX-1.3 — BUILD (Dashboard Composition Foundation)  
**Fase:** Build presentacional (recomposición)  
**Fecha:** 2026-07-29  
**Estado:** **UX-1.3 = COMPLETE (awaiting human review)** · **NO UX-1.4**  
**Prerrequisitos:** UX-1.2 RELEASED · Architecture Freeze · D48 SSOT · `DESIGN_SYSTEM.md` referencia de composición  

**Declaración:**

```text
UX-1.3 = COMPLETE (dashboard composition foundation)
SCOPE = Home recomposition + toolbar chrome hierarchy
page.tsx = Home + toolbar chrome ONLY
NO Data · Analysis · Results · Reports · navegación
RECOMPOSITION (not reimplementation)
NO UI deletion unless demonstrable duplication
BEHAVIOR = UNCHANGED
ARCHITECTURE = UNCHANGED
D48 = SOLE TOKEN SSOT (tokens.ts untouched)
READY FOR HUMAN REVIEW
STOP — do not open UX-1.4
```

---

## 1. Objetivo

Primer cambio visual importante de **composición** del Dashboard de entrada: jerarquía, orden de superficies, respiración estructural y balance chrome/workspace — guiado por `DESIGN_SYSTEM.md` como referencia de distribución (no runtime SSOT).

---

## 2. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| [`src/components/home/SmartStartScreen.tsx`](../src/components/home/SmartStartScreen.tsx) | Welcome denso left-aligned; grid de acciones primero; intent secundario; panel surface; gaps densos |
| [`src/components/home/SmartStartIntentAssistant.tsx`](../src/components/home/SmartStartIntentAssistant.tsx) | Densidad / full-width; label secundario; sin reescritura de estado/handlers |
| [`src/app/page.tsx`](../src/app/page.tsx) | Toolbar brand densificado + subcopy; Home `sectionLabel` reducido visualmente (no eliminado) |
| [`docs/UX-1.3-dashboard-composition.md`](UX-1.3-dashboard-composition.md) | Este documento |

**No modificados:** `tokens.ts`, `theme.ts` API, Data/Analysis/Results/Reports JSX, hooks, handlers, navegación, engines, `DESIGN_SYSTEM.md`.

---

## 3. Decisiones de composición

### 3.1 Orden Home (qué aparece primero)

1. Welcome compacto (panel, no landing)  
2. Grid de acciones primarias (+ modo experto dashed)  
3. Asistente de intención (camino alternativo)

### 3.2 Toolbar chrome

- Brand: `text-sm font-semibold` (instrumento, no hero marketing)  
- Subcopy densificada; elementos conservados  
- Nav con padding inferior más corto  

### 3.3 No eliminación

- `h2` “🏠 Inicio” **retenido**; tipografía rail densificada (`text-[10px] tracking-[0.09em]`)  
- Subtítulos de toolbar home / welcome hint **retenidos**

### 3.4 No reescritura

- Mismos componentes, props y handlers  
- Solo orden de hijos + classNames de composición  

---

## 4. Verificación

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | PASS |
| `validate:design-tokens-v2` | PASS |
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
| Diff gate `page.tsx` | Solo toolbar chrome + Home `sectionLabel` (12 líneas) |

---

## 5. STOP

```text
UX-1.3 = COMPLETE (awaiting human review)
DO NOT OPEN UX-1.4
```
