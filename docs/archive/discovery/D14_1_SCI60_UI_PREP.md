# D14.1 — Preparación + Verificación Baseline — SCI-60 UI

**Épica:** ARCH-5 F5F (parcial — solo SCI-60)  
**Microfase:** D14.1 (preparación únicamente — sin extracción)  
**Fecha:** 2026-07-06  
**Prerequisito:** D13 CLOSED — dominio en `methodology/publication/`

> Documento técnico temporal para facilitar D14.2–D14.3. Eliminar o archivar al cierre de D14.

---

## 1. Resumen ejecutivo

| Verificación | Resultado |
|--------------|-----------|
| Componente único a extraer | **`ScientificPublicationDashboard`** — única definición repo-wide |
| Duplicación `ScientificPublicationDashboard` fuera de `page.tsx` | **NO** |
| Módulo `components/reports/ScientificPublicationDashboard.tsx` | **NO** — correcto para D14.1 |
| `publication/` sin React / `@/app` / `@/components` | **PASS** |
| Imports circulares UI ↔ dominio | **NO detectados** |
| `npx tsc --noEmit` | **PASS** (2026-07-06) |
| Cambios funcionales en D14.1 | **NINGUNO** |

---

## 2. Baseline LOC

Medición sobre archivos fuente (1-based, inclusive donde aplica):

| Bloque / archivo | Líneas | LOC | Alcance D14 |
|------------------|--------|-----|-------------|
| `src/app/page.tsx` (total) | — | **26.631** | Boundary — wiring permanece |
| SCI-60 UI inline (comentario + tipo + componente) | 11003–11238 | **236** | **Extracción D14.2** |
| `ScientificPublicationDashboardProps` | 11006–11008 | **3** | Move con componente |
| `ScientificPublicationDashboard` (función) | 11010–11238 | **229** | Move con componente |
| Panel shell resultados (boundary) | 27448–27466 | **19** | Permanece en `page.tsx` |
| Inspector toggle SCI-60 | 24264–24303 | **40** | Permanece en `page.tsx` |
| `src/components/reports/` (total D8) | — | **~53** | Barrel destino D14.2 |
| `components/reports/index.ts` | — | **6** | +1 export en D14.2 |
| `PdfExportVisibilityBanner.tsx` | — | **32** | Intocable D8 |
| `resolve-pdf-export-disclaimer.ts` | — | **15** | Intocable D8 |

**Reducción esperada D14.2:** ~233 LOC netas en `page.tsx` (236 inline − import barrel + eliminación bloque).

Referencia cruzada D13.1: dominio SCI-60 ya extraído; UI permanecía inline (~232 LOC en baseline D13.1).

### Baselines QA-1 congelados (Publication Status)

| Dataset | Publication Status | Readiness Score |
|---------|-------------------|-----------------|
| Dataset5 | Near Ready | **77.0** |
| Dataset6 | Requires Review | **67.5** |

Scores upstream de referencia: Evidence 82.7/73.3 · Overall Health 77.0/67.5.

---

## 3. Confirmación de alcance — único componente D14

**Extracción D14.2 (obligatoria):**

| Símbolo | Líneas | Rol | Destino D14.2 |
|---------|--------|-----|---------------|
| `ScientificPublicationDashboardProps` | 11006–11008 | Props privadas | `ScientificPublicationDashboard.tsx` (no export barrel) |
| `ScientificPublicationDashboard` | 11010–11238 | Componente React presentacional | `src/components/reports/ScientificPublicationDashboard.tsx` |

**Verificación repo-wide:**

```text
grep "function ScientificPublicationDashboard"
→ Única coincidencia: src/app/page.tsx L11010
```

**Fuera de alcance D14 — cero diffs obligatorios:**

| SCI | Componente inline | Línea | Extracción |
|-----|-------------------|-------|------------|
| SCI-50 | `ScientificConsistencyEngine` | L10488 | Posterior (F5F bis) |
| SCI-51 | `ScientificReportQualityEngine` | L10572 | Posterior (F5F bis) |
| SCI-52 | `ScientificReproducibilityExplorer` | L10647 | Posterior (F5F bis) |
| SCI-53 | `ScientificEvidenceStrengthEngine` | L10730 | Posterior (F5F bis) |
| SCI-54 | `ScientificAssumptionTracker` | L10812 | Posterior (F5F bis) |
| SCI-55 | `ScientificPublicationReadinessAnalyzer` | L10923 | Posterior (F5F bis) |
| SCI-56 | `ScientificMethodologicalDashboard` | L11356 | Posterior (F5F bis) |
| SCI-59 | `GuidedWorkflowPanel` | L11250 | D15 (F5G) |

**Splits internos** (`PublicationStatusPanel`, `PublicationKpiGrid`, etc.): **backlog** — no forman parte de D14.

---

## 4. Inventario funcional UI

### 4.1 Props y contrato

```text
ScientificPublicationDashboardProps = { analysis: PublicationDashboardAnalysis }
```

- Sin callbacks
- Sin hooks
- SSOT: mismo objeto que PDF vía `getPublicationDashboardReportLines(publicationDashboardAnalysis)`

### 4.2 Dependencias del componente (a trasladar con copias move-only)

| Símbolo | Origen actual | Acción D14.2 |
|---------|---------------|--------------|
| `PublicationDashboardAnalysis` | `@/lib/scientific/methodology/publication` | `import type` en componente |
| `getPublicationReadinessAnalyzerClassificationLabel` | `@/lib/scientific/methodology/readiness` | Import directo |
| `getEvidenceStrengthEngineClassificationLabel` | `@/lib/scientific/methodology/evidence` | Import directo |
| `getEffectMagnitudeLabel` | `@/lib/scientific/inference` | Import directo |
| `formatPCAVariancePercent` | `page.tsx` L4136 | **Copy privado** en componente |
| `formatVariableImportanceCoLeaders` | `page.tsx` L6228 | **Copy privado** en componente |
| `contentPanel` | `page.tsx` L336–337 | **Copy privado** en componente |
| `emptyState` | `page.tsx` L338–339 | **Copy privado** en componente |

**Prohibido en componente extraído:**

- Import desde `@/app/page`
- Deep import `publication/build` o `publication/reporting`
- Import helpers desde `publication/` (restricción D14)

### 4.3 Wiring React (permanece en page.tsx)

| Símbolo | Líneas | Hook / patrón |
|---------|--------|---------------|
| `publicationDashboardAnalysis` | 19031–19051 | `useMemo` → `buildPublicationDashboardAnalysis` |
| `hasEnoughSeriesForPublicationDashboard` | 19052+ | Derivado de `canBuildPublicationDashboard` |
| `showPublicationDashboard` | 16842 | `useState` (default `false`) |
| `highlightPublicationDashboards` | 16851 | `useState` (Smart Start / workflow) |
| Highlight auto-dismiss | 17090 | `useEffect` |
| Panel render | 27448–27466 | JSX condicional + `<ScientificPublicationDashboard />` |
| Inspector toggle | 24264–24303 | checkbox + `ToggleVisibilityHint` |
| PDF report | 13081+ | `getPublicationDashboardReportLines` |
| Comparison capture | 19554+ | snapshot vía `publicationDashboardAnalysis` |

---

## 5. Mapa de dependencias

### 5.1 Entradas (UI SCI-60 consume)

```text
                    ┌─────────────────────────────────────┐
                    │  ScientificPublicationDashboard     │
                    │  props: PublicationDashboardAnalysis│
                    └─────────────────────────────────────┘
                                        ▲
                              useMemo page.tsx L19031
                                        ▲
                    ┌─────────────────────────────────────┐
                    │   buildPublicationDashboardAnalysis │
                    │   (methodology/publication/)        │
                    └─────────────────────────────────────┘
```

| Fuente | Símbolos consumidos por UI | Import en D14.2 |
|--------|---------------------------|-----------------|
| `methodology/publication/` | `PublicationDashboardAnalysis` (type) | Barrel type only |
| `methodology/readiness/` | classification label | Sí |
| `methodology/evidence/` | classification label | Sí |
| `inference/` | `getEffectMagnitudeLabel` | Sí |
| `page.tsx` inline helpers | format + CSS constants | Copy move-only |

### 5.2 Salidas (consumidores post-D14.2)

| Consumidor | Ubicación | Qué usa |
|------------|-----------|---------|
| Panel shell render | `page.tsx` L27460 | `<ScientificPublicationDashboard analysis={...} />` |
| Import | `page.tsx` | `@/components/reports` |

**Sin otros consumidores** de `ScientificPublicationDashboard` en repo.

### 5.3 Prohibiciones de grafo (preservar post-D14.2)

- `publication/` → `@/components/*` — **prohibido** (PASS D14.1)
- `components/reports/` → `@/app/page` — **prohibido**
- `components/reports/` → deep import `publication/*` — **prohibido** (solo barrel type)

---

## 6. API Freeze congelada

### 6.1 `methodology/publication/index.ts` — intocable D14

Exports congelados (D13):

1. `PublicationDashboardAnalysis` (type)
2. `PublicationDashboardBuildInput` (type)
3. `buildPublicationDashboardAnalysis`
4. `canBuildPublicationDashboard`
5. `buildPublicationDashboardNormalitySummary`
6. `buildPublicationDashboardMultivariateHighlights`
7. `buildPublicationDashboardInferentialHighlight`
8. `getPublicationDashboardReportLines`

### 6.2 `components/reports/index.ts` — estado D14.1

Exports actuales (D8):

- `PdfExportVisibilityBanner`, `PdfExportVisibilityBannerProps`
- `resolvePdfExportDisclaimer`, `PdfExportDisclaimerMessages`

**Adición planificada D14.2 (única export nueva):**

```text
export { ScientificPublicationDashboard } from "./ScientificPublicationDashboard";
```

**NO exportar en D14.2:**

- `ScientificPublicationDashboardProps` (privada del archivo)

### 6.3 Estructura carpetas congelada D14.2

```text
src/components/reports/
├── index.ts
├── PdfExportVisibilityBanner.tsx          ← D8, intocable
├── resolve-pdf-export-disclaimer.ts       ← D8, intocable
└── ScientificPublicationDashboard.tsx     ← nuevo D14.2 (monolítico)
```

**No crear:** `components/reports/publication/`

---

## 7. Verificación arquitectónica D14.1

### 7.1 Duplicación

```text
grep "ScientificPublicationDashboard" repo-wide
→ Definición única: src/app/page.tsx L11010
→ Uso render: src/app/page.tsx L27460
→ Sin archivo en components/reports/
```

**PASS**

### 7.2 Imports circulares

- `publication/` no importa React ni `@/components` — **PASS**
- Post-D14.2: `page.tsx` → `@/components/reports` → `@/lib/*` (acíclico proyectado)

### 7.3 Hooks fuera de lugar

- `ScientificPublicationDashboard`: **0 hooks** — **PASS**
- Estado/toggles permanecen en boundary — **PASS**

### 7.4 SSOT análisis (R-D14-10)

- UI recibe `analysis` pre-construido
- PDF usa `getPublicationDashboardReportLines(publicationDashboardAnalysis)`
- **PASS** — mismo objeto; no diagnósticos independientes en UI

---

## 8. Criterios de aceptación D14.1

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D14.1-1** | Baseline LOC registrado | **PASS** |
| **CA-D14.1-2** | Mapa de dependencias UI preparado | **PASS** |
| **CA-D14.1-3** | Componente único confirmado (`ScientificPublicationDashboard`) | **PASS** |
| **CA-D14.1-4** | API Freeze `publication/` + barrel `reports/` documentada | **PASS** |
| **CA-D14.1-5** | Paneles SCI-50–56, SCI-59 fuera de alcance confirmados | **PASS** |
| **CA-D14.1-6** | Sin cambios funcionales | **PASS** |
| **CA-D14.1-7** | Sin modificaciones visibles | **PASS** |
| **CA-D14.1-8** | Compilación exitosa (`tsc --noEmit`) | **PASS** |

---

## 9. Handoff → D14.2

Próxima microfase: **D14.2 — Extracción única move-only**

1. Crear `src/components/reports/ScientificPublicationDashboard.tsx` (bloque L11003–11238 + copias CSS/helpers)
2. Añadir `export { ScientificPublicationDashboard }` en `components/reports/index.ts`
3. Import en `page.tsx`; eliminar bloque inline
4. **No** crear subcarpetas ni sub-componentes
5. **No** modificar `methodology/publication/`

Gate D14.2: CA-D14-1…4, CA-D14-9, CA-D14-13 (extracción única).
