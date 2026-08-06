# D15.1 — Preparación + Verificación Baseline — SCI-59 UI

**Épica:** ARCH-5 F5G (parcial — solo SCI-59 UI)  
**Microfases documentadas:** D15.1 ✓ · D15.2 ✓ · D15.3 ✓ · D15.4 ✓ · D15.5 ✓  
**Estado épica:** **ARCH-5 F5G CLOSED** (2026-07-06)  
**Prerequisito:** D14 CLOSED — `ScientificPublicationDashboard` en `components/reports/`

> Documento técnico temporal para facilitar D15.3–D15.5. Eliminar o archivar al cierre de D15.

---

## 1. Resumen ejecutivo

| Verificación | Resultado |
|--------------|-----------|
| Componente único a extraer | **`GuidedWorkflowPanel`** — única definición repo-wide |
| Duplicación `GuidedWorkflowPanel` fuera de `page.tsx` | **NO** |
| Módulo `components/workflow/GuidedWorkflowPanel.tsx` | **NO** — correcto para D15.1 |
| `lib/scientific/workflow/` sin React / `@/app` / `@/components` | **PASS** |
| Imports circulares UI ↔ dominio | **NO detectados** |
| `npx tsc --noEmit` | **No ejecutado en D15.1** (prep-only; gate planificado D15.5) |
| Cambios funcionales en D15.1 | **NINGUNO** |
| Cambios de código en D15.1 | **NINGUNO** (solo este documento) |

---

## 2. Baseline LOC

Medición sobre archivos fuente (1-based, inclusive donde aplica):

| Bloque / archivo | Líneas | LOC | Alcance D15 |
|------------------|--------|-----|-------------|
| `src/app/page.tsx` (total) | — | **28.737** | Boundary — orquestación permanece |
| SCI-59 UI inline (comentario + tipo + componente) | 11004–11078 | **75** | **Extracción D15.3** |
| `GuidedWorkflowPanelProps` | 11006–11012 | **7** | Move con componente |
| `GuidedWorkflowPanel` (función) | 11014–11076 | **63** | Move con componente |
| Mount shell — Análisis | 22212–22224 | **13** | Permanece en `page.tsx` |
| Mount shell — Resultados | 24380–24392 | **13** | Permanece en `page.tsx` |
| Mount shell — Reportes | 28495–28507 | **13** | Permanece en `page.tsx` |
| Template picker (Datos) | 24348–24379 | **32** | Permanece en `page.tsx` |
| `WorkflowSessionIndicator` mount | 21387–21402 | **16** | Permanece en `page.tsx` (D5) |
| `src/components/workflow/` (total) | — | **110** | Solo `WorkflowSessionIndicator.tsx` (D5) |
| `components/workflow/index.ts` | — | **0** | Nuevo en D15.3 |
| `components/workflow/GuidedWorkflowPanel.tsx` | — | **0** | Nuevo en D15.3 |

### Métricas baseline adicionales

| Métrica | Valor D15.1 |
|---------|-------------|
| Props públicas esperadas (contrato congelado) | **5** |
| Mount sites `<GuidedWorkflowPanel />` | **3** (analysis, results, reports) |
| Total líneas `import` en `page.tsx` | **55** |
| Import statements relacionados workflow | **2** (ver §2.1) |
| Símbolos importados `@/lib/scientific/workflow` | **15** (bloque L117–132) |

### 2.1 Imports relacionados workflow (baseline)

| Import | Línea | Símbolos | Post-D15 esperado |
|--------|-------|----------|-------------------|
| `@/lib/scientific/workflow` | 117–132 | 15 (8 funciones/const + 7 types) | **Sin cambio** — orquestación |
| `@/components/workflow/WorkflowSessionIndicator` | 134 | 1 | **Sin cambio** — fuera alcance D15 |
| `@/app/labUsageProfile` → `profileShowsGuidedWorkflow` | 86 | 1 | **Sin cambio** — template picker |
| `@/components/workflow` → `GuidedWorkflowPanel` | — | 0 | **+1** statement en D15.4 |

**Imports eliminados esperados en D15.4:** **0** (ningún símbolo de dominio queda huérfano).  
**Neto imports `page.tsx`:** **+1** (barrel componente).

**Reducción esperada D15.4:** ~74 LOC netas en `page.tsx` (75 inline − 1 import barrel).

Referencia cruzada: dominio SCI-59 ya en `lib/scientific/workflow/` (Fase 2 ARCH-5); UI permanece inline (~75 LOC).

---

## 3. Confirmación de alcance — único componente D15

**Extracción D15.3 (obligatoria):**

| Símbolo | Líneas | Rol | Destino D15.3 |
|---------|--------|-----|---------------|
| `GuidedWorkflowPanelProps` | 11006–11012 | Props privadas (5 props congeladas) | `GuidedWorkflowPanel.tsx` (no export barrel) |
| `GuidedWorkflowPanel` | 11014–11076 | Componente React presentacional | `src/components/workflow/GuidedWorkflowPanel.tsx` |

**Verificación repo-wide (gate CA-D15-3-A):**

```text
grep "function GuidedWorkflowPanel"
→ Única coincidencia: src/app/page.tsx L11014
```

**PASS** — exactamente **1 definición**.

**Usos render (mount sites):**

| Tab | Líneas | Condición |
|-----|--------|-----------|
| Análisis | 22212–22224 | `guidedWorkflowHostTab === "analysis"` |
| Resultados | 24380–24392 | `guidedWorkflowHostTab === "results"` |
| Reportes | 28495–28507 | `guidedWorkflowHostTab === "reports"` |

> No existe mount en pestaña Datos. Cuando `session.status === "completed"`, `guidedWorkflowHostTab` resuelve a `"data"` (L18890–18891), pero el panel completado solo aparece en analysis/results/reports.

**Fuera de alcance D15 — cero diffs obligatorios:**

| Elemento | Líneas aprox. | Extracción |
|----------|---------------|------------|
| Template picker (`NotebookSection` + catálogo) | 24348–24379 | **NO** — D15+ o fase posterior |
| Mount shells (×3) | 22212–22224, 24380–24392, 28495–28507 | **NO** — wiring permanece |
| `WorkflowSessionIndicator` | `components/workflow/` L110 | **NO** — extraído D5 |
| Estado `guidedWorkflowSession` | L16608–16609 | **NO** |
| Refs `guidedWorkflowTabSyncedRef`, `workflowVisibilitySnapshotRef` | L16893, L18866–18868 | **NO** |
| `useMemo` (`guidedWorkflowContext`, `activeGuidedWorkflowPlan`, `guidedWorkflowHostTab`) | L18823–18896 | **NO** |
| `showGuidedWorkflowPanel`, `showWorkflowSessionIndicator` | L18897–18905 | **NO** |
| `startGuidedWorkflow` | L19028–19076 | **NO** |
| `cancelGuidedWorkflow` | L19118–19125 | **NO** |
| `useEffect` sync tab/inspector | L19126–19159 | **NO** |
| `advanceGuidedWorkflowStep` | L19160–19195 | **NO** |
| `applyCurrentGuidedWorkflowStep` | L19196–19220 | **NO** |
| `skipCurrentGuidedWorkflowStep` | L19221–19231 | **NO** |
| Snapshot (`capture` / `restore`) | L19033, L19119–19122 | **NO** |
| Dominio `lib/scientific/workflow/*` | 12 archivos | **NO** — intocable |
| Paneles SCI-50–56, SCI-60 | inline | **NO** — intocados D14 |

**Splits internos** (`GuidedWorkflowStep`, `WorkflowProgress`, `WorkflowNavigation`): **no crear** — componente monolítico suficiente (~75 LOC).

---

## 4. Inventario funcional UI

### 4.1 Inventario JSX — estructura del bloque L11026–11075

**Inicio bloque render:** L11026 (`return (`)  
**Fin bloque render:** L11075 (`);`)

```text
<div>  ← root card (contentPanel + accent border)
  <div>  ← header row (flex wrap)
    <div>
      <p>  ← título: "🧭 Guided Scientific Workflow"
      <p>  ← progressLabel (derivación local)
    </div>
    [si session.status === "active"]
      <button>  ← "Cancelar workflow" (onCancel, btnOutlineSm)
  </div>

  [rama A] session.status === "completed"
    <p>  ← mensaje completado con plan.templateTitle

  [rama B] currentStep existe (paso activo)
    <>
      <p>  ← currentStep.title
      <p>  ← currentStep.explanation
      <div>  ← fila acciones
        <button>  ← "Aplicar paso" (onApplyStep, btnPrimary)
        <button>  ← "Omitir paso" (onSkipStep, btnOutlineSm)
    </>

  [si session.completedStepIds.length > 0]
    <p>  ← "Completados: N · Omitidos: M"
</div>
```

| Elemento UI | Cantidad | Notas |
|-------------|----------|-------|
| `<div>` | 4 | Card root, header, grupo título, fila acciones |
| `<p>` | 5–7 | Título, progress, step title/explanation, completed, stats |
| `<button>` | 1–3 | Cancel (solo active), Apply, Skip |
| Fragment `<>...</>` | 1 | Contenido paso activo |
| Progress | Texto | `progressLabel` — no barra visual |
| Completed state | Condicional | Rama `session.status === "completed"` |

### 4.2 Props y contrato (congelado — exactamente 5)

```typescript
type GuidedWorkflowPanelProps = {
  plan: GuidedWorkflowPlan;
  session: GuidedWorkflowSession;
  onApplyStep: () => void;
  onSkipStep: () => void;
  onCancel: () => void;
};
```

**Contrato congelado.** Prohibido añadir props auxiliares derivables desde `plan`/`session`:

- `isCompleted`, `currentStepLabel`, `progress`, `stepCount`, `showCancel`, `templateTitle`, etc.

**Regla presentational-only (boundary congelado):**

El componente podrá calcular únicamente **derivaciones de render** (`currentStep`, `progressLabel`).

**Prohibido en componente extraído:**

- `useState`, `useReducer`, `useEffect`, `useMemo`, `useCallback`, `useRef`
- `dispatch`, acceso a stores, mutación de `plan` o `session`
- Context, Providers

### 4.3 Dependencias del componente (a trasladar con copias move-only)

| Símbolo | Origen actual | Acción D15.3 |
|---------|---------------|--------------|
| `GuidedWorkflowPlan` | `@/lib/scientific/workflow` | `import type` en componente |
| `GuidedWorkflowSession` | `@/lib/scientific/workflow` | `import type` en componente |
| `contentPanel` | `page.tsx` L337–338 | **Copy privado** en componente |
| `btnPrimary` | `page.tsx` L368–369 | **Copy privado** en componente |
| `btnOutlineSm` | `page.tsx` L372–373 | **Copy privado** en componente |
| `currentStep` | derivación local L11021 | Move con componente |
| `progressLabel` | derivación local L11022–11024 | Move con componente |

**Prohibido en componente extraído:**

- Import desde `@/app/page` o cualquier `src/app/*`
- Import desde hooks, stores, o lógica de orquestación
- Crear lógica SCI-59 nueva

### 4.4 Wiring React (permanece en `page.tsx`)

| Símbolo | Líneas | Hook / patrón |
|---------|--------|---------------|
| `guidedWorkflowSession` | L16608–16609 | `useState<GuidedWorkflowSession>` |
| `guidedWorkflowTabSyncedRef` | L16893 | `useRef` |
| `workflowVisibilitySnapshotRef` | L18866–18868 | `useRef` |
| `guidedWorkflowContext` | L18823–18838 | `useMemo` |
| `guidedWorkflowToggleSetters` | L18839–18865 | Objeto setter |
| `activeGuidedWorkflowPlan` | L18869–18881 | `useMemo` |
| `guidedWorkflowHostTab` | L18882–18896 | `useMemo` |
| `showGuidedWorkflowPanel` | L18897–18900 | Derivado |
| `showWorkflowSessionIndicator` | L18901–18905 | Derivado |
| `startGuidedWorkflow` | L19028–19076 | Callback |
| `cancelGuidedWorkflow` | L19118–19125 | Callback |
| Tab/inspector sync | L19126–19159 | `useEffect` |
| `advanceGuidedWorkflowStep` | L19160–19195 | Callback interno |
| `applyCurrentGuidedWorkflowStep` | L19196–19220 | Callback → prop `onApplyStep` |
| `skipCurrentGuidedWorkflowStep` | L19221–19231 | Callback → prop `onSkipStep` |
| Mount shells (×3) | 22212–22224, 24380–24392, 28495–28507 | JSX condicional |
| `WorkflowSessionIndicator` | 21387–21402 | Componente D5 |
| Template picker | 24348–24379 | `startGuidedWorkflow` |

**Wiring mount sites (idéntico en los 3):**

```tsx
<GuidedWorkflowPanel
  plan={activeGuidedWorkflowPlan}
  session={guidedWorkflowSession}
  onApplyStep={applyCurrentGuidedWorkflowStep}
  onSkipStep={skipCurrentGuidedWorkflowStep}
  onCancel={cancelGuidedWorkflow}
/>
```

---

## 5. Mapa de dependencias

### 5.1 Entradas (UI SCI-59 consume)

```text
                    ┌─────────────────────────────────────┐
                    │       GuidedWorkflowPanel           │
                    │  props: plan, session, 3 callbacks  │
                    └─────────────────────────────────────┘
                                        ▲
                         mount shells page.tsx (×3)
                                        ▲
              useMemo + useState + callbacks page.tsx
                                        ▲
                    ┌─────────────────────────────────────┐
                    │   lib/scientific/workflow/          │
                    │   (types, plan, apply, snapshot)    │
                    └─────────────────────────────────────┘
```

| Fuente | Símbolos consumidos por UI | Import en D15.3 |
|--------|---------------------------|-----------------|
| `lib/scientific/workflow/` | `GuidedWorkflowPlan`, `GuidedWorkflowSession` (types) | Barrel type only |
| `page.tsx` inline CSS | `contentPanel`, `btnPrimary`, `btnOutlineSm` | Copy move-only |

### 5.2 Salidas (consumidores post-D15.3)

| Consumidor | Ubicación | Qué usa |
|------------|-----------|---------|
| Mount shell Análisis | `page.tsx` L22216 | `<GuidedWorkflowPanel ... />` |
| Mount shell Resultados | `page.tsx` L24384 | `<GuidedWorkflowPanel ... />` |
| Mount shell Reportes | `page.tsx` L28499 | `<GuidedWorkflowPanel ... />` |
| Import | `page.tsx` | `@/components/workflow` |

**Sin otros consumidores** de `GuidedWorkflowPanel` en repo.

### 5.3 Prohibiciones de grafo (preservar post-D15.3)

- `lib/scientific/workflow/` → `@/components/*` — **prohibido** (PASS D15.1)
- `components/workflow/GuidedWorkflowPanel.tsx` → `@/app/page` o `src/app/*` — **prohibido** (gate R6)
- `components/workflow/` → deep import fuera de barrel público — **prohibido**

---

## 6. API Freeze congelada

### 6.1 `lib/scientific/workflow/index.ts` — intocable D15

Exports congelados (dominio Fase 2):

1. `GuidedWorkflowContext` (type)
2. `GUIDED_WORKFLOW_IDLE_SESSION`, `GUIDED_WORKFLOW_TEMPLATE_CATALOG`
3. `GuidedWorkflowCatalogEntry` (type)
4. Types: `GuidedWorkflowInspectorSection`, `GuidedWorkflowPlan`, `GuidedWorkflowSession`, `GuidedWorkflowStatus`, `GuidedWorkflowStep`, `GuidedWorkflowTemplateId`, `GuidedWorkflowToggleKey`, `GuidedWorkflowToggleSetters`, `GuidedWorkflowWorkspaceTab`
5. `applyGuidedWorkflowToggles`
6. `buildGuidedWorkflowPlan`, `resolveGuidedWorkflowStepToggles`
7. `captureWorkflowVisibilitySnapshot`, `restoreWorkflowVisibilitySnapshot`, `WorkflowVisibilitySnapshot` (type)

**D15 no modifica ningún archivo en `lib/scientific/workflow/`.**

### 6.2 `components/workflow/` — estado D15.1

Archivos actuales:

- `WorkflowSessionIndicator.tsx` (110 LOC) — D5, intocable

**No existe `index.ts` ni `GuidedWorkflowPanel.tsx`** — correcto para D15.1.

**Adición planificada D15.3:**

```text
export { GuidedWorkflowPanel } from "./GuidedWorkflowPanel";
```

**NO exportar en D15.3:**

- `GuidedWorkflowPanelProps` (privada del archivo)

### 6.3 Estructura carpetas planificada D15.3

```text
src/components/workflow/
├── index.ts                          ← nuevo D15.3 (barrel congelado)
├── WorkflowSessionIndicator.tsx      ← D5, intocable
└── GuidedWorkflowPanel.tsx           ← nuevo D15.3 (monolítico)
```

**No crear:** subcarpetas ni sub-componentes artificiales.

---

## 7. Reducción esperada

| Métrica | Baseline D15.1 | Post-D15 (estimado) | Neto |
|---------|----------------|---------------------|------|
| LOC `page.tsx` | 28.737 | ~28.663 | **−74** |
| LOC bloque inline eliminado | 75 | 0 | −75 |
| LOC import barrel añadido | 0 | 1 | +1 |
| LOC `GuidedWorkflowPanel.tsx` | 0 | ~85–90 | +85–90 |
| LOC `components/workflow/index.ts` | 0 | 1 | +1 |
| Líneas `import` en `page.tsx` | 55 | 56 | +1 |
| Definiciones `function GuidedWorkflowPanel` | 1 (inline) | 1 (extracted) | 0 |

Composición estimada `GuidedWorkflowPanel.tsx`: `"use client"` + imports (~4) + CSS copies (~6) + tipo props (7) + función (63) ≈ **~80–90 LOC**.

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Import circular `workflow` ↔ `page.tsx` | Componente solo importa types de `@/lib/scientific/workflow`; barrel solo re-exporta componente; gate R6 |
| **Props creep** | Mantener exactamente **5 props certificadas**; prohibir props auxiliares derivables desde `plan`/`session` |
| CSS drift vs inline original | Copia literal de `contentPanel`, `btnPrimary`, `btnOutlineSm`; CA-D15-11 diff visual |
| Scope creep (template picker / indicator / mount shells) | Checklist §3 fuera de alcance; D15.4 regla byte-identical en mount sites |
| Mount sites alterados accidentalmente | D15.4: no modificar condicionales ni wrappers; solo sustituir definición inline por import |
| Hooks prohibidos en componente | Regla presentational-only §4.2; revisión R4 en gate D15.5 |
| Duplicación accidental del componente | Gate `grep "function GuidedWorkflowPanel"` → 1 definición (CA-D15-3-A) |

---

## 9. Verificación arquitectónica D15.1

### 9.1 Duplicación

```text
grep "function GuidedWorkflowPanel"
→ Definición única: src/app/page.tsx L11014
→ Usos render: page.tsx L22216, L24384, L28499
→ Sin archivo GuidedWorkflowPanel.tsx en components/workflow/
```

**PASS**

### 9.2 Imports circulares

- `lib/scientific/workflow/` no importa React ni `@/components` — **PASS**
- Post-D15.3: `page.tsx` → `@/components/workflow` → `@/lib/scientific/workflow` (types) — acíclico proyectado

### 9.3 Hooks fuera de lugar

- `GuidedWorkflowPanel` inline: **0 hooks** — solo `const` derivaciones de render — **PASS**
- Estado/toggles/callbacks permanecen en boundary — **PASS**

### 9.4 Presentational-only

- Derivaciones permitidas: `currentStep`, `progressLabel` (L11021–11024)
- Sin mutación de `plan`/`session` en componente — **PASS**

---

## 10. Gates de entrada D15.1

| Gate | Comando / verificación | Resultado |
|------|------------------------|-----------|
| Definición única | `grep "function GuidedWorkflowPanel"` | **1** definición (L11014) |
| Bloque localizado | L11004–11078 | **PASS** |
| Props identificadas | 5 props congeladas | **PASS** |
| Sin duplicados repo-wide | grep + inventario §3 | **PASS** |
| Baseline LOC registrada | §2 | **PASS** |
| Baseline imports registrada | §2.1 | **PASS** |
| Fuera de alcance documentado | §3 | **PASS** |
| Sin cambios de código fuente | Solo este `.md` | **PASS** |

---

## 11. Criterios de aceptación D15.1

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D15.1-1** | Baseline LOC registrado (`page.tsx` + bloque SCI-59) | **PASS** |
| **CA-D15.1-2** | Baseline imports registrado (55 total, 2 workflow-related) | **PASS** |
| **CA-D15.1-3** | Mapa de dependencias UI preparado | **PASS** |
| **CA-D15.1-4** | Componente único confirmado (`GuidedWorkflowPanel`) | **PASS** |
| **CA-D15.1-5** | Contrato 5 props congelado documentado | **PASS** |
| **CA-D15.1-6** | API Freeze `lib/scientific/workflow/` documentada | **PASS** |
| **CA-D15.1-7** | Orquestación, template picker, mount shells fuera de alcance | **PASS** |
| **CA-D15.1-8** | `grep "function GuidedWorkflowPanel"` → 1 definición | **PASS** |
| **CA-D15.1-9** | Sin cambios funcionales ni de código fuente | **PASS** |
| **CA-D15.1-10** | Reducción esperada y riesgos documentados | **PASS** |

---

## 12. D15.2 — Contrato congelado (props-only)

**Microfase:** D15.2 (diseño del contrato — sin extracción, sin cambios de código)  
**Estado:** **CLOSED** (2026-07-06)

### 12.1 Contrato público definitivo — CONGELADO

```typescript
// GuidedWorkflowPanel.tsx — tipo privado (NO exportar en barrel)
type GuidedWorkflowPanelProps = {
  plan: GuidedWorkflowPlan;
  session: GuidedWorkflowSession;
  onApplyStep: () => void;
  onSkipStep: () => void;
  onCancel: () => void;
};
```

**Regla:** exactamente **5 props**. Ninguna adicional para el resto de D15 (D15.3–D15.5).

**Props prohibidas** (derivar internamente desde `plan` / `session`):

| Prop prohibida | Derivación interna |
|----------------|-------------------|
| `isCompleted` | `session.status === "completed"` |
| `progress` / `progressLabel` | `plan.steps`, `session.currentStepIndex`, `plan.templateTitle` |
| `currentStep` | `plan.steps[session.currentStepIndex]` |
| `currentStepLabel` | `currentStep.title` |
| `stepCount` | `plan.steps.length` |
| `templateTitle` | `plan.templateTitle` |
| `showCancel` | `session.status === "active"` |

### 12.2 Suficiencia de las 5 props — matriz JSX → fuente

| Necesidad de render | Fuente | Prop / derivación |
|---------------------|--------|-------------------|
| Título fijo «🧭 Guided Scientific Workflow» | Constante JSX | — |
| Etiqueta de progreso | `plan.templateTitle`, `plan.steps.length`, `session.currentStepIndex` | Derivación `progressLabel` |
| Botón «Cancelar workflow» | `session.status`, handler | `session` + `onCancel` |
| Mensaje workflow completado | `session.status`, `plan.templateTitle` | `session` + `plan` |
| Título del paso | `plan.steps[i].title` | Derivación `currentStep` desde `plan` + `session` |
| Explicación del paso | `plan.steps[i].explanation` | Derivación `currentStep` |
| Botón «Aplicar paso» | Handler orquestación | `onApplyStep` |
| Botón «Omitir paso» | Handler orquestación | `onSkipStep` |
| Contadores completados/omitidos | `session.completedStepIds`, `session.skippedStepIds` | `session` |

**Conclusión:** las 5 props son **suficientes y necesarias**. No hay props redundantes: cada callback encapsula lógica de orquestación que no puede vivir en UI; `plan` y `session` son el SSOT de estado observable.

### 12.3 Verificación mount sites — contrato idéntico

Los tres mount sites pasan **exactamente** las mismas 5 props con los mismos nombres y callbacks:

| Prop | Análisis L22216–22221 | Resultados L24384–24389 | Reportes L28499–28504 |
|------|----------------------|-------------------------|----------------------|
| `plan` | `activeGuidedWorkflowPlan` | `activeGuidedWorkflowPlan` | `activeGuidedWorkflowPlan` |
| `session` | `guidedWorkflowSession` | `guidedWorkflowSession` | `guidedWorkflowSession` |
| `onApplyStep` | `applyCurrentGuidedWorkflowStep` | `applyCurrentGuidedWorkflowStep` | `applyCurrentGuidedWorkflowStep` |
| `onSkipStep` | `skipCurrentGuidedWorkflowStep` | `skipCurrentGuidedWorkflowStep` | `skipCurrentGuidedWorkflowStep` |
| `onCancel` | `cancelGuidedWorkflow` | `cancelGuidedWorkflow` | `cancelGuidedWorkflow` |

**PASS** — wiring byte-identical en los 3 sitios. Condicionales externos (`guidedWorkflowHostTab`, `showGuidedWorkflowPanel`, `activeGuidedWorkflowPlan`) permanecen en `page.tsx`; **no se modifican en D15**.

### 12.4 Regla presentational-only — certificación D15.2

El componente extraído en D15.3 contendrá **únicamente:**

| Permitido | Prohibido |
|-----------|-----------|
| JSX | `useState`, `useReducer` |
| Render condicional (`session.status`, `currentStep`) | `useEffect`, `useMemo`, `useCallback`, `useRef` |
| Derivaciones locales de render (`currentStep`, `progressLabel`) | `dispatch`, stores |
| Handlers recibidos por props (`onApplyStep`, `onSkipStep`, `onCancel`) | Mutación de `plan` o `session` |
| Constantes CSS copiadas (move-only) | Context, Provider |

**No será necesario:** Context · Provider · Store · hooks React en el componente extraído.

### 12.5 Barrel congelado — definición (creación en D15.3)

Archivo planificado: `src/components/workflow/index.ts`

```typescript
export { GuidedWorkflowPanel } from "./GuidedWorkflowPanel";
```

| Regla | Valor |
|-------|-------|
| Exportaciones públicas | **1** — `GuidedWorkflowPanel` |
| NO exportar | `GuidedWorkflowPanelProps`, helpers internos, CSS constants |
| NO deep exports | Sin re-export de `WorkflowSessionIndicator` en D15 |
| Creación física del archivo | **D15.3** (no creado en D15.2) |

### 12.6 Criterios de aceptación D15.2

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D15.2-1** | Las 5 props son suficientes para renderizar todo el componente | **PASS** |
| **CA-D15.2-2** | No existen props redundantes | **PASS** |
| **CA-D15.2-3** | Los 3 mount sites utilizan exactamente el mismo contrato | **PASS** |
| **CA-D15.2-4** | No será necesario Context | **PASS** |
| **CA-D15.2-5** | No será necesario Provider | **PASS** |
| **CA-D15.2-6** | No será necesario Store | **PASS** |
| **CA-D15.2-7** | No será necesario añadir hooks al componente extraído | **PASS** |
| **CA-D15.2-8** | Barrel definido con única exportación pública (`GuidedWorkflowPanel`) | **PASS** |
| **CA-D15.2-9** | Sin cambios de código fuente en D15.2 | **PASS** |

---

## 13. D15.3 — Extracción move-only (sin wiring)

**Microfase:** D15.3 (creación de archivos — `page.tsx` intocado)  
**Estado:** **CLOSED** (2026-07-06)

### 13.1 Archivos creados

| Archivo | LOC | Estado |
|---------|-----|--------|
| `src/components/workflow/GuidedWorkflowPanel.tsx` | **85** | Creado |
| `src/components/workflow/index.ts` | **1** | Creado |

### 13.2 Contenido movido (literal)

| Elemento | Origen `page.tsx` | Destino |
|----------|-------------------|---------|
| `GuidedWorkflowPanelProps` | L11006–11012 | `GuidedWorkflowPanel.tsx` (privado) |
| `GuidedWorkflowPanel` + JSX | L11014–11076 | `GuidedWorkflowPanel.tsx` (`export function`) |
| `contentPanel` | L337–338 | Copy privado |
| `btnPrimary` | L368–369 | Copy privado |
| `btnOutlineSm` | L372–373 | Copy privado |
| Derivaciones `currentStep`, `progressLabel` | L11021–11024 | Incluidas |

**No movido / intocado:**

- Bloque inline L11004–11078 en `page.tsx` — **permanece** (wiring D15.4)
- Mount sites, template picker, orquestación, `lib/scientific/workflow/*`

### 13.3 Verificación grep temporal (esperado en D15.3)

```text
grep "function GuidedWorkflowPanel"
→ src/app/page.tsx L11014          (inline — pendiente eliminar D15.4)
→ src/components/workflow/GuidedWorkflowPanel.tsx L23  (extracted)
```

**2 definiciones** — estado temporal correcto pre-wiring. Tras D15.4 debe quedar **1**.

### 13.4 Verificaciones presentational-only

| Verificación | Resultado |
|--------------|-----------|
| Hooks (`useState`, `useEffect`, etc.) | **0** — PASS |
| Imports `src/app/*` o `page.tsx` | **0** — PASS |
| Imports | `@/lib/scientific/workflow` (types only) — PASS |
| Derivaciones locales | Solo `currentStep`, `progressLabel` — PASS |
| Props | 5 certificadas §12.1 — PASS |
| Barrel exports | Solo `GuidedWorkflowPanel` — PASS |

### 13.5 Criterios de aceptación D15.3

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D15.3-1** | Existe `GuidedWorkflowPanel.tsx` | **PASS** |
| **CA-D15.3-2** | Existe `index.ts` | **PASS** |
| **CA-D15.3-3** | Exactamente 5 props certificadas | **PASS** |
| **CA-D15.3-4** | JSX byte-equivalente al inline original | **PASS** |
| **CA-D15.3-5** | Solo derivaciones `currentStep`, `progressLabel` | **PASS** |
| **CA-D15.3-6** | Sin hooks | **PASS** |
| **CA-D15.3-7** | Sin imports `src/app/*` ni `page.tsx` | **PASS** |
| **CA-D15.3-8** | Barrel exporta únicamente `GuidedWorkflowPanel` | **PASS** |
| **CA-D15.3-9** | Grep → **2 definiciones** temporales (esperado) | **PASS** |
| **CA-D15.3-10** | `page.tsx` sin modificaciones | **PASS** |
| **CA-D15.3-11** | Sin cambios funcionales | **PASS** |

### 13.6 Wiring pendiente

| Tarea | Microfase |
|-------|-----------|
| Eliminar bloque inline L11004–11078 | **D15.4** |
| Añadir `import { GuidedWorkflowPanel } from "@/components/workflow"` | **D15.4** |
| Grep → 1 definición repo-wide | **D15.4** |
| Mount sites byte-identical | **D15.4** (no tocar condicionales) |

---

## 15. D15.4 — Wiring en `page.tsx`

**Microfase:** D15.4 (import barrel + eliminación inline — sin gates globales)  
**Estado:** **CLOSED** (2026-07-06)

### 15.1 Cambios realizados

| Acción | Detalle |
|--------|---------|
| Import añadido | `import { GuidedWorkflowPanel } from "@/components/workflow";` (L134) |
| Bloque eliminado | L11004–11078 (`// BEGIN SCI-59` … `// END SCI-59`) — **75 LOC** |
| Imports muertos eliminados | **0** — `GuidedWorkflowPlan` / `GuidedWorkflowSession` siguen en uso (`useState`, orquestación) |
| Mount sites | **Intocados** — props y condicionales byte-identical |

### 15.2 Métricas LOC finales

| Métrica | Baseline (D15.1) | Post-D15.4 | Neto |
|---------|------------------|------------|------|
| LOC `page.tsx` | 28.737 | **28.662** | **−75** |
| Import barrel `@/components/workflow` | 0 | 1 | +1 |
| Bloque inline SCI-59 | 75 | 0 | −75 |
| Líneas `import` en `page.tsx` | 55 | **56** | +1 |

### 15.3 Verificación grep (post-wiring)

```text
grep "function GuidedWorkflowPanel"
→ Única coincidencia: src/components/workflow/GuidedWorkflowPanel.tsx L23
```

**1 definición** — PASS (CA-D15.4-1 / CA-D15-3-A).

### 15.4 Mount sites — sin cambios

| Tab | Líneas | Props |
|-----|--------|-------|
| Análisis | L22137–22149 | `plan`, `session`, `onApplyStep`, `onSkipStep`, `onCancel` |
| Resultados | L24305–24317 | idéntico |
| Reportes | L28420–28432 | idéntico |

### 15.5 Criterios de aceptación D15.4

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D15.4-1** | Grep → 1 definición en `GuidedWorkflowPanel.tsx` | **PASS** |
| **CA-D15.4-2** | 3 mount sites idénticos | **PASS** |
| **CA-D15.4-3** | Import desde `@/components/workflow` (barrel) | **PASS** |
| **CA-D15.4-4** | Sin deep imports | **PASS** |
| **CA-D15.4-5** | `lib/scientific/workflow/*` sin cambios | **PASS** |
| **CA-D15.4-6** | Sin cambios funcionales | **PASS** |
| **CA-D15.4-7** | Sin cambios visuales | **PASS** |
| **CA-D15.4-8** | Sin dependencias circulares (R6 proyectado) | **PASS** |
| **CA-D15.4-9** | Imports muertos: ninguno pendiente; dominio conservado | **PASS** |
| **CA-D15.4-10** | `page.tsx` LOC reducido — métrica registrada | **PASS** (−75) |

### 15.6 Gates pendientes

| Gate | Microfase |
|------|-----------|
| `npx tsc --noEmit` | **D15.5** |
| Lint | **D15.5** |
| `validate-workflow-unit` | **D15.5** |
| Revisión R1–R6 | **D15.5** |
| `PROJECT_STATUS_PROD_2D.md` §D15 | **D15.5** |

---

## 16. Handoff → D15.5

Próxima microfase: **D15.5 — Gates finales y cierre documental**

1. Ejecutar `npx tsc --noEmit`, lint, `npx tsx scripts/validate-workflow-unit.ts`
2. Revisión post-BUILD R1–R6
3. Actualizar `PROJECT_STATUS_PROD_2D.md` §D15 (acta, CA-D15, handoff D16)
4. Certificar ARCH-5 F5G CLOSED

---

## 17. D15.5 — Gate final + certificación

**Microfase:** D15.5 (validación + documentación — sin cambios de código)  
**Estado:** **CLOSED** (2026-07-06)

### 17.1 Gates técnicos

| Gate | Comando | Resultado |
|------|---------|-----------|
| TypeScript | `npx tsc --noEmit` | **PASS** |
| Lint repo | `npm run lint` | **FAIL** — 101 problemas preexistentes (42 errors); deuda histórica |
| Lint artefactos D15 | `eslint GuidedWorkflowPanel.tsx index.ts` | **PASS** |
| Workflow unit | `npx tsx scripts/validate-workflow-unit.ts` | **PASS** — 9/9 (W1–W9) |
| Definición única | `grep "function GuidedWorkflowPanel"` | **PASS** — 1 en `GuidedWorkflowPanel.tsx` |

### 17.2 R1–R6

| ID | Resultado |
|----|-----------|
| R1 | **PASS** — sin JSX duplicado en `page.tsx` |
| R2 | **PASS** — callbacks únicos |
| R3 | **PASS** — `lib/scientific/workflow/*` sin diffs |
| R4 | **PASS** — presentacional-only |
| R5 | **PASS** — LOC 28.737 → 28.662 (−75) |
| R6 | **PASS** — sin imports `src/app/*` |

### 17.3 CA-D15-1…11

Todos **PASS** (ver `PROJECT_STATUS_PROD_2D.md` §D15).

### 17.4 Cierre

**D15 — ARCH-5 F5G: CLOSED.** Handoff → **D16** (F5H — infraestructura validación, sin extracciones UI).
