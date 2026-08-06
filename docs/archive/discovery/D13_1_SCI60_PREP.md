# D13.1 — Preparación + Verificación Baseline — SCI-60

**Épica:** ARCH-5 F5E  
**Microfase:** D13.1 (preparación únicamente — sin extracción)  
**Fecha:** 2026-07-06  
**Estado:** COMPLETED — épica D13 / ARCH-5 F5E certificada (2026-07-06)

> Documento técnico temporal para facilitar D13.2–D13.6. Eliminar o archivar al cierre de D13.

---

## 1. Resumen ejecutivo

| Verificación | Resultado |
|--------------|-----------|
| Módulo `methodology/publication/` existe | **NO** — correcto para D13.1 |
| Duplicación `PublicationDashboard*` en repo | **NO** — única fuente: `src/app/page.tsx` |
| Imports circulares (dominio SCI-60) | **NO detectados** — dominio aún inline |
| Helpers muertos en bloque SCI-60 | **NO** — todas las funciones tienen callers |
| `npx tsc --noEmit` | **PASS** (2026-07-06) |
| Cambios funcionales en D13.1 | **NINGUNO** |

---

## 2. Baseline LOC

Medición sobre [`src/app/page.tsx`](src/app/page.tsx) (1-based, inclusive):

| Bloque | Líneas | LOC | Alcance D13 |
|--------|--------|-----|-------------|
| Dominio SCI-60 | 10994–11553 | **559** | Extracción D13.2–D13.5 |
| UI React SCI-60 | 11555–11787 | **232** | Permanece hasta D14 |
| **Total inline SCI-60** | 10994–11787 | **793** | — |

Referencia cruzada: [`PROJECT_DISCOVERY_PROD_2D.md`](PROJECT_DISCOVERY_PROD_2D.md) estimaba ~810 LOC (incluye wiring aproximado).

### Baselines QA-1 congelados (Publication Status)

| Dataset | Publication Status | Readiness Score |
|---------|-------------------|-----------------|
| Dataset5 | Near Ready | **77.0** |
| Dataset6 | Requires Review | **67.5** |

Scores upstream de referencia: Evidence 82.7/73.3 · Overall Health 77.0/67.5.

---

## 3. Inventario funcional

### 3.1 Tipos

| Símbolo | Líneas | Clasificación | Destino D13 |
|---------|--------|---------------|-------------|
| `PublicationDashboardNormalitySummary` | 10995–11003 | Candidata extracción · privada (sub-tipo) | `types.ts` |
| `PublicationDashboardMultivariateHighlights` | 11005–11012 | Candidata extracción · privada | `types.ts` |
| `PublicationDashboardInferentialHighlight` | 11014–11022 | Candidata extracción · privada | `types.ts` |
| `PublicationDashboardAnalysis` | 11024–11039 | Candidata extracción · **pública** | `types.ts` + barrel |
| `ScientificPublicationDashboardProps` | 11555–11557 | Permanece inline (UI) | `page.tsx` hasta D14 |

### 3.2 Funciones de dominio

| Símbolo | Líneas | Rol | Clasificación | Destino D13 |
|---------|--------|-----|---------------|-------------|
| `canBuildPublicationDashboard` | 11041–11052 | Gate de entrada | Candidata · **pública** | `build.ts` + barrel |
| `buildPublicationDashboardNormalitySummary` | 11054–11098 | Builder puro | Candidata · **pública** (comparison L20055) | `build.ts` + barrel |
| `buildPublicationDashboardMultivariateHighlights` | 11100–11116 | Builder puro | Candidata · **pública** (comparison L20058) | `build.ts` + barrel |
| `buildPublicationDashboardInferentialHighlight` | 11118–11134 | Builder puro | Candidata · **pública** (comparison L20061) | `build.ts` + barrel |
| `buildPublicationDashboardCrossDomainDiagnosis` | 11136–11211 | Generador strings | Candidata · **privada** | `build.ts` (no export) |
| `buildPublicationDashboardRisks` | 11213–11285 | Generador strings | Candidata · **privada** | `build.ts` (no export) |
| `buildPublicationDashboardRecommendations` | 11287–11347 | Generador strings | Candidata · **privada** | `build.ts` (no export) |
| `buildPublicationDashboardAnalysis` | 11349–11431 | **Constructor principal** / orquestador | Candidata · **pública** | `build.ts` + barrel |
| `getPublicationDashboardReportLines` | 11433–11553 | Generador PDF/report | Candidata · **pública** | `reporting.ts` + barrel |

### 3.3 Componente UI (fuera de extracción D13 dominio)

| Símbolo | Líneas | Rol | Clasificación |
|---------|--------|-----|---------------|
| `ScientificPublicationDashboard` | 11559–11787 | Componente React presentacional | Permanece inline · D14 |

### 3.4 Helpers externos usados por dominio SCI-60 (no son SCI-60)

| Símbolo | Línea origen | Usado en SCI-60 | Acción D13 |
|---------|--------------|-----------------|------------|
| `formatPCAVariancePercent` | 4127 | reporting L11489, recommendations (indirecto), UI | Copy move-only → `format-helpers.ts` (privado) |
| `formatVariableImportanceCoLeaders` | 6219 | recommendations L11326, reporting L11506, UI | Copy move-only → `format-helpers.ts` (privado) |
| `getStatisticalAdvisorConfidenceLabel` | 12844 | reporting L11529 | Copy move-only → `advisor-labels.ts` (privado) |
| `deduplicateTextLines` | `@/lib/scientific/shared/text` | builders + reporting | Import barrel shared |
| `pushUniqueTextLine` | `@/lib/scientific/shared/text` | diagnosis/risks/recommendations | Import barrel shared |

### 3.5 Wiring React (permanece en page.tsx)

| Símbolo | Líneas | Hook / patrón |
|---------|--------|---------------|
| `publicationDashboardAnalysis` | 19580–19599 | `useMemo` → `buildPublicationDashboardAnalysis` |
| `hasEnoughSeriesForPublicationDashboard` | 19601–19607 | Derivado de `canBuildPublicationDashboard` |
| `showPublicationDashboard` | 17391 | `useState` (default `false`) |
| `highlightPublicationDashboards` | 17400 | `useState` (Smart Start) |
| Highlight auto-dismiss | 17633–17639 | `useEffect` |
| Reset on project clear | 18174 | handler |
| Comparison sub-builders | 20055–20063 | dentro de `buildCurrentDatasetAnalysisProfile` |
| Panel render | 27997–28015 | JSX condicional + `ScientificPublicationDashboard` |
| Inspector toggle | 24779–24851 | checkbox + `ToggleVisibilityHint` |

---

## 4. Mapa de dependencias

### 4.1 Entradas (SCI-60 consume)

```text
                    ┌─────────────────────────────────────┐
                    │   buildPublicationDashboardAnalysis │
                    └─────────────────────────────────────┘
                                        ▲
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
  methodology/readiness          methodology/summary              methodology/evidence
  (SCI-55)                       (SCI-56)                         (SCI-53)
        │                               │                               │
  normality/                     inference/ (SCI-57)              page.tsx inline
  CanonicalNormalityAssessment   EffectSizePowerAnalysis          MultivariateDashboardAnalysis (SCI-40)
                                                                 StatisticalRecommendation (advisor)
```

| Fuente | Símbolos consumidos | Módulo extraído |
|--------|---------------------|-----------------|
| `@/lib/scientific/methodology/readiness` | `PublicationReadinessAnalyzerAnalysis`, `getPublicationReadinessAnalyzerClassificationLabel` | Sí (D11) |
| `@/lib/scientific/methodology/summary` | `MethodologicalDashboardAnalysis` | Sí (D12) |
| `@/lib/scientific/methodology/evidence` | `EvidenceStrengthEngineAnalysis`, `getEvidenceStrengthEngineClassificationLabel` | Sí (D10) |
| `@/lib/scientific/normality` | `CanonicalNormalityAssessment` | Sí (ARCH-5 F1) |
| `@/lib/scientific/inference` | `EffectSizePowerAnalysis`, `EffectMagnitude`, `getEffectMagnitudeLabel` | Sí |
| `@/lib/scientific/shared/text` | `deduplicateTextLines`, `pushUniqueTextLine` | Sí |
| `page.tsx` inline | `MultivariateDashboardAnalysis`, `StatisticalRecommendation`, `StatisticalRecommendationConfidence` | **No** → tipos estructurales en `input-types.ts` |
| `page.tsx` inline helpers | `formatPCAVariancePercent`, `formatVariableImportanceCoLeaders`, `getStatisticalAdvisorConfidenceLabel` | **No** → copy privado en `publication/` |

### 4.2 Salidas (consumidores de SCI-60)

| Consumidor | Ubicación | Qué usa |
|------------|-----------|---------|
| `ScientificPublicationDashboard` | page.tsx L11559+ | `PublicationDashboardAnalysis` (props) |
| `useMemo` wiring | page.tsx L19580 | `buildPublicationDashboardAnalysis` |
| Gate UI toggle | page.tsx L19601 | `canBuildPublicationDashboard` |
| `buildScientificReport` | page.tsx L13628–13632 | `getPublicationDashboardReportLines` |
| `buildCurrentDatasetAnalysisProfile` | page.tsx L20055–20123 | 3 sub-builders + `publicationDashboardAnalysis` vía `mapPublicationToProfileSnapshot` |
| Visibility registry | `visibility/registry.ts` | toggle key `showPublicationDashboard`, sciId SCI-60 |
| Workflow SCI-59 T3 | `workflow/templates.ts` | activa toggle |
| Comparison UI | `components/comparison/ComparisonPublicationSection.tsx` | snapshot derivado (no importa builders) |
| E2E validation | `scripts/validate-hotfix-sci-normality-2.mjs` | panel, banner, PDF |
| Baseline script | `scripts/.score-check-sci60.mjs` | scores Dataset5/6 |

### 4.3 Dependencias prohibidas para futuro `build.ts`

Confirmado explícitamente — **build.ts solo podrá depender de:**

- `./types.ts`
- `./input-types.ts`
- Módulos metodológicos ya extraídos (`readiness`, `summary`, `evidence`, etc.)
- Utilidades puras (`@/lib/scientific/shared`, `@/lib/scientific/normality`, `@/lib/scientific/inference`)

**Prohibido importar:**

- React, JSX, hooks, CSS
- `@/app/page` / `page.tsx`
- `@/components/*`
- Tipos inline del monolito (usar tipos estructurales en `input-types.ts`)

---

## 5. Verificación arquitectónica D13.1

### 5.1 Duplicación

```text
grep "buildPublicationDashboard|getPublicationDashboard|canBuildPublicationDashboard|type PublicationDashboard"
→ Única coincidencia de implementación: src/app/page.tsx
→ comparison/profile.ts: mapPublicationToProfileSnapshot (consumidor, no duplicado)
```

**PASS** — cero implementaciones duplicadas fuera de `page.tsx`.

### 5.2 Imports circulares

- `methodology/publication/` **no existe** — imposible circular hacia publication.
- Upstream (`readiness`, `summary`, `evidence`) **no importan** `PublicationDashboard*`.
- **PASS** — grafo acíclico preservable post-extracción.

### 5.3 Helpers muertos

Todas las funciones del bloque dominio L10994–11553 tienen al menos un caller:

| Función | Callers |
|---------|---------|
| `canBuildPublicationDashboard` | `buildPublicationDashboardAnalysis`, `hasEnoughSeriesForPublicationDashboard` |
| Sub-builders normality/multivariate/inferential | orquestador + comparison capture |
| crossDomain/risks/recommendations | orquestador únicamente |
| `buildPublicationDashboardAnalysis` | useMemo L19582 |
| `getPublicationDashboardReportLines` | buildScientificReport L13630 |

**PASS** — sin helpers muertos.

### 5.4 SSOT análisis (R-D13-10)

- UI `ScientificPublicationDashboard` recibe `analysis: PublicationDashboardAnalysis` ya construido.
- PDF usa `getPublicationDashboardReportLines(publicationDashboardAnalysis)`.
- **PASS** — ambos consumen el mismo objeto; no construyen diagnósticos independientemente.

---

## 6. Candidatos de extracción por archivo destino (D13.2+)

| Archivo destino | Contenido |
|-----------------|-----------|
| `types.ts` | 4 tipos dominio (L10995–11039) |
| `input-types.ts` | `PublicationDashboardBuildInput` + `PublicationDashboardMultivariateSource` + `PublicationDashboardAdvisorInput` |
| `build.ts` | L11041–11431 (9 funciones) |
| `reporting.ts` | L11433–11553 |
| `format-helpers.ts` | copy privado L4127, L6219 |
| `advisor-labels.ts` | copy privado L12844–12847 |
| `index.ts` | 8 exports API Freeze (plan D13) |

**No crear en D13.1:** ninguno de los archivos anteriores.

---

## 7. API Freeze congelada (referencia D13.2+)

Exports planificados en barrel (sin implementar aún):

1. `PublicationDashboardAnalysis` (type)
2. `PublicationDashboardBuildInput` (type)
3. `buildPublicationDashboardAnalysis`
4. `canBuildPublicationDashboard`
5. `buildPublicationDashboardNormalitySummary`
6. `buildPublicationDashboardMultivariateHighlights`
7. `buildPublicationDashboardInferentialHighlight`
8. `getPublicationDashboardReportLines`

---

## 8. Criterios de aceptación D13.1

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D13.1-1** | Baseline registrado | **PASS** |
| **CA-D13.1-2** | Mapa completo de dependencias preparado | **PASS** |
| **CA-D13.1-3** | Inventario funcional completo | **PASS** |
| **CA-D13.1-4** | Candidatos de extracción identificados | **PASS** |
| **CA-D13.1-5** | Restricciones arquitectónicas confirmadas | **PASS** |
| **CA-D13.1-6** | Sin cambios funcionales | **PASS** |
| **CA-D13.1-7** | Sin modificaciones visibles | **PASS** |
| **CA-D13.1-8** | Compilación exitosa (`tsc --noEmit`) | **PASS** |

---

## 9. Handoff → D13.2

Próxima microfase: **D13.2 — Extracción tipos + input-types**

- Mover L10995–11039 → `types.ts`
- Crear `input-types.ts` con tipos estructurales boundary
- Sin wiring en `page.tsx` hasta D13.5
- Estrategia move-only; aislamiento del dominio según §4.3
