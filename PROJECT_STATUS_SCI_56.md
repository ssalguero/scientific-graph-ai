# Scientific Graph AI — Estado del Proyecto (Cierre QA-1 + UX-1A.1 LITE + ARCH-5 Fase 4 + PROD-2A + HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 + DATA-3A)

Fecha: 2026-06-27 (actualizado)
Versión actual: SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-58 + **SCI-58 v2 (COMPLETED)** + SCI-59 + SCI-60 + ARCH-5 (Fase 1–4 COMPLETED) + PROD-1A + PROD-2A + HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 + **UX-1A.1 LITE** + **DATA-3A / HOTFIX-DATA-3A (COMPLETED)** + **Sprint QA-1 (CERRADO)**
Referencia SCI-58 v2: [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md)
Commit de referencia: `95f2a5e` (HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1); ARCH-5 Fase 4 completada sobre esta base (F4A/F4B/F4C/F4D); **UX-1A.1 LITE** sobre build validado post-F4D

---

## 1. Resumen ejecutivo

El proyecto alcanzó el cierre completo del bloque metodológico, las capas ejecutivas de síntesis (multivariante, metodológica y de publicación), la capa de orquestación UX, la capa de comparación multi-dataset, la totalidad del backlog técnico histórico, la etapa evolutiva SCI-57+, **las fases 1–4 de modularización incremental ARCH-5**, **PROD-1A — Scientific Workbook Import Framework**, **PROD-2A — Project File Core** y el hotfix **HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1** (cierre del incidente BUG-SERIES-RENDER-1: renderizado de series experimentales tras importación y reapertura de proyectos). Tras SCI-55 se resolvieron dos deudas técnicas críticas (HOTFIX-SCI-NORMALITY-2 y BUGFIX SCI-19), se implementó SCI-56 — Methodological Summary Dashboard, se cerraron SCI-29B y SCI-37B, se completó **SCI-57 — Effect Size & Power Engine**, **SCI-57B — Effect-Aware Evidence**, **SCI-60 — Executive Publication Dashboard**, **SCI-59 — Guided Scientific Workflow**, **SCI-58 — Multi-Dataset Comparison Framework**, **ARCH-5 Fases 1–4** (normalidad canónica, workflow SCI-59, inferencia SCI-12–15 + SCI-57, dominio/UI comparison, tests comparison y consolidación de contratos runtime↔persistencia), **PROD-1A** (framework de importación en `src/lib/import/` + wizard UI) y **PROD-2A** (persistencia `.sgproj`), cerrando los vacíos de magnitud inferencial, evidencia effect-aware, síntesis pre-manuscrito, experiencia de uso guiada, comparación estructurada entre datasets, deuda de monolito en los cinco dominios acotados identificados en REVIEW-5, POST-SCI-57B REVIEW, POST-SCI-60 REVIEW, POST-SCI-59 REVIEW, PROJECT REVIEW post-SCI-58, la imposibilidad de importar workbooks científicos reales validados en RW-01→RW-04 y la invisibilidad de series experimentales por clipping del viewport X.

**SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-58, SCI-59, SCI-60, ARCH-5 (Fase 1–4 COMPLETED), PROD-1A, PROD-2A y HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 están cerrados; el backlog técnico histórico permanece vacío.** Se cerró formalmente **ARCH-5 Fase 4 — SCI-58 comparison domain/UI/tests/contracts** (`comparison/`, `components/comparison/`, `validate:comparison-unit` 43/43 y consolidación mínima de tipos runtime↔persistencia; `validate:full` PASS). Se cerró formalmente el incidente **BUG-SERIES-RENDER-1** (series experimentales persistidas pero invisibles en el gráfico por clipping del dominio X fijo `[-10, 10]`). PROD-1B (validación avanzada + reportes completos) queda como evolución aprobada en plan, no implementada.

Hitos cerrados en este ciclo:

| Hito | Estado | Descripción |
|------|--------|-------------|
| SCI-55 | APROBADO | Publication Readiness Analyzer (cierre del bloque SCI-50→55) |
| HOTFIX-SCI-NORMALITY-2 | CERRADO | Fuente canónica única de normalidad; eliminación de la dualidad Consenso/Coherencia |
| BUGFIX SCI-19 | CERRADO | Deduplicación de hallazgos en `generateScientificInterpretation()`; warning React eliminado |
| SCI-56 | COMPLETADO | Dashboard ejecutivo del bloque metodológico SCI-50→55 |
| SCI-29B | COMPLETADO | Exclusión de variables constantes en el pipeline de clustering (consistencia con PCA) |
| SCI-37B | COMPLETADO | Ranking compartido y comunicación explícita de empates en Variable Importance |
| SCI-37B-H1 | COMPLETADO | Epsilon de empate 1e-6 — elimina empates artificiales por ruido numérico |
| SCI-57 | COMPLETADO | Effect Size & Power Engine — magnitud del efecto, IC95% y potencia sobre inferencia existente |
| SCI-57B | COMPLETADO | Inferencia effect-aware en SCI-53 vía `dominantMagnitude` de SCI-57 |
| SCI-60 | COMPLETADO | Executive Publication Dashboard — síntesis read-only pre-manuscrito |
| SCI-59 | COMPLETADO | Guided Scientific Workflow — orquestación UX con templates y wizard |
| SCI-58 | COMPLETADO | Multi-Dataset Comparison Framework basado en DatasetAnalysisProfile y Slots A/B, con dashboard comparativo read-only y sin recalcular motores científicos |
| ARCH-5 Fase 1 | COMPLETADO | Modularización incremental — normalidad canónica y utilidades de texto en `src/lib/scientific/normality/` + `shared/` |
| ARCH-5 Fase 2 | COMPLETADO | Modularización incremental — lógica declarativa SCI-59 Guided Workflow en `src/lib/scientific/workflow/` |
| ARCH-5 Fase 3 | COMPLETADO | Modularización incremental — inferencia SCI-12–15 + SCI-57 Effect Size & Power en `src/lib/scientific/inference/` |
| ARCH-5 Fase 4A | COMPLETADO | SCI-58 domain extraction — dominio comparison move-only a `src/lib/scientific/comparison/` (~653 LOC); `validate:full` PASS |
| ARCH-5 Fase 4B | COMPLETADO | SCI-58 UI dashboard extraction — `ScientificMultiDatasetComparisonDashboard` → `src/components/comparison/` (~152 LOC); `validate:full` PASS |
| ARCH-5 Fase 4C | COMPLETADO | Tests unitarios comparison integrados al gate — `validate:comparison-unit` PASS (43/43) |
| ARCH-5 Fase 4D | COMPLETADO | Consolidación mínima de tipos y contratos runtime↔persistencia sin cambios funcionales ni de `.sgproj`; `validate:full` PASS |
| ARCH-5 Fase 4 | COMPLETED | F4A + F4B + F4C + F4D cerradas; comparison domain/UI/tests/contracts consolidados |
| PROD-1A | COMPLETADO | Scientific Workbook Import Framework — pipeline híbrido fast path + wizard en `src/lib/import/` |
| PROD-2A | COMPLETADO | Project File Core — persistencia local `.sgproj` (F0–F6) |
| HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 | CERRADO | Auto-fit automático del viewport X para series experimentales (importación + hidratación de proyectos) |
| BUG-SERIES-RENDER-1 | CERRADO | Incidente resuelto vía HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 — renderizado de puntos experimentales tras import/reapertura |
| UX-1A.1 LITE | COMPLETADO | Progressive disclosure quick wins — singleton workflow, agrupación toggles Estadística, sidebar/welcome cleanup, contador Análisis, placeholder nombre proyecto (UX-QW-01); sin cambios SCI/PROD-2A schema |
| DATA-3A | COMPLETED | Visual Graph Builder — Constructor Visual (Datos), preview, creación en Resultados (`projectVisualGraphs`) |
| HOTFIX-DATA-3A-1 | PASS | Flujo Preview → Crear gráfico → tarjeta en Resultados |
| HOTFIX-DATA-3A-2 | PASS | Botón y panel de configuración accesibles |
| HOTFIX-DATA-3A-3 | PASS | Render Resultados: `GraphPreview` con `aspect={1.8}` (layout responsive) |
| HOTFIX-DATA-3A-4 | PASS | `projectVisualGraphs` sincronizado con ciclo de vida dataset/proyecto |
| HOTFIX-DATA-3A-5 | PASS | Estado inicial neutro (`INITIAL_VISUAL_GRAPH_BUILDER_DRAFT`, `graphType: null`) |
| **QA-1** | **CERRADO** | Validación manual end-to-end — ver §23 y `QA-1_MANUAL_VALIDATION_PROTOCOL.md` |

Estado de calidad: **Build PASS · TypeScript PASS · Dataset5 PASS · Dataset6 PASS · PDF PASS · SCI-40 PASS · SCI-56 PASS · SCI-57 PASS · SCI-57B PASS · SCI-60 PASS · SCI-59 PASS · SCI-58 PASS · ARCH-5 Fase 1 PASS · ARCH-5 Fase 2 PASS · ARCH-5 Fase 3 PASS · ARCH-5 Fase 4 PASS · validate:comparison-unit PASS (43/43) · validate:full PASS · PROD-1A PASS · PROD-2A PASS · HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 PASS · UX-1A.1 LITE PASS · validate:visual-graph-builder-unit PASS (10/10) · validate:visual-graph-builder-render-unit PASS · RW-01 PASS · RW-02 PASS · RW-03 PASS · RW-04 PASS · t crítico (df=10,18,30) PASS · QA-1 manual PASS.**

---

## 2. Arquitectura actual

Monolito científico maduro en `src/app/page.tsx` (~27.200 líneas), con módulos incrementales en `src/lib/scientific/`, organizado en capas acumulativas:

| Capa | Rango | Rol |
|------|-------|-----|
| Datos | DATA-1→3 + PROD-1A | Importación CSV/TXT/XLSX/XLS/ODS; fast path legacy en `experimentalData.ts`; framework workbook en `src/lib/import/` + wizard UI |
| Persistencia | PROD-2A | Proyectos `.sgproj` — `src/lib/project/` + sidebar Nuevo/Guardar/Abrir |
| Viewport gráfico | HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 | `src/app/chartViewport.ts` — auto-fit dominio X con padding 10% tras import/hidratación |
| Modularización | ARCH-5 F1–4 COMPLETED | `shared/`, `normality/`, `workflow/`, `inference/`, `comparison/` + UI `components/comparison/` + tests/contracts comparison |
| Importación workbook | PROD-1A | `src/lib/import/` — lectura, discovery, detección tabla/encabezados, mapeo X/Y, validación mínima, reporte mínimo |
| Infraestructura UX | ARCH-1→4 | Workspace (Datos/Análisis/Resultados/Reportes), Inspector contextual, módulos activables, tema |
| Orquestación UX | SCI-59 | Guided Scientific Workflow — templates, wizard, auto-toggle y navegación |
| Comparación multi-dataset | SCI-58 | Dominio `comparison/` + dashboard `components/comparison/`; slots A/B y captura read-only |
| Núcleo científico | SCI-1→27 | Estadística descriptiva, distribución, inferencia (calculadores SCI-12–15 en `inference/`) |
| Inferencia ampliada | SCI-57 + SCI-57B | Effect Size & Power Engine (`inference/effect-size.ts`) + evidencia effect-aware en SCI-53 |
| Multivariante | SCI-28→40 | PCA, clustering, redes, proyecciones + dashboard SCI-40 |
| Exploradores avanzados | SCI-41→49 | MANOVA, LDA, CCA, PCR, PLS, Bootstrap, Sensitivity, t-SNE, UMAP |
| Evaluación metodológica | SCI-50→55 | Motores de consistencia, calidad, reproducibilidad, evidencia, supuestos y preparación |
| Síntesis metodológica | SCI-56 | Dashboard ejecutivo del bloque metodológico |
| Síntesis de publicación | SCI-60 | Executive Publication Dashboard (read-only, pre-manuscrito) |

### Fuente canónica de normalidad (post-hotfix)

```
SCI-11 / SCI-21 / SCI-22 / SCI-26 (algoritmos intactos en page.tsx)
        ↓
buildCanonicalNormalityAssessment()   ← src/lib/scientific/normality/ (ARCH-5 Fase 1)
        ↓
┌────────────────┬──────────────┬──────────────┬──────────────────┐
Scoring          SCI-17 (1      SCI-19/20      Panel UI único
(SCI-46/51/52/54) sección)      (1 append)     + footers por serie
```

- Conclusiones: normal / probably-normal / questionable / contradictory / non-normal
- Score de `contradictory` = 40; SCI-51 lo trata explícitamente como criterio 0.5
- Cero vocabulario legacy (Consenso/Coherencia eliminados de UI, reporte y PDF)

### Cascada metodológica, publicación y workflow

```
SCI-59 Guided Workflow (orquestación UX)
        ↓ activa toggles + navega workspace
SCI-50..54 (motores independientes)
        ↓
SCI-55 Publication Readiness (promedio de 5 motores)
        ↓
SCI-56 Methodological Summary Dashboard (síntesis de los 6)
        ↓
SCI-60 Executive Publication Dashboard (síntesis editorial read-only)
```

SCI-59 es capa de solo orquestación: no recalcula algoritmos, no crea scores ni modifica builders upstream.

SCI-56 y SCI-60 son capas de solo lectura: no recalculan algoritmos ni modifican scores upstream.

SCI-57 es capa de síntesis sobre inferencia: no recalcula tests ni modifica p-valores; deriva effect size, IC y potencia de resultados existentes (`buildEffectSizePowerAnalysis` en `src/lib/scientific/inference/`).

SCI-57B integra `dominantMagnitude` de SCI-57 en el componente `inferenceScore` de SCI-53 (mapeo 55/70/80/95); SCI-55 y SCI-56 heredan el delta vía cascada.

SCI-60 consume SCI-55 (status primario), SCI-56, SCI-53, SCI-40, SCI-57 y normalidad canónica sin score ejecutivo nuevo.

SCI-59 consume normalidad canónica, `buildStatisticalRecommendation` y contexto de series para ramificar templates; conduce hacia SCI-40 (T2) y SCI-60 (T3).

SCI-58 es capa de comparación read-only (Opción D): captura snapshots `DatasetAnalysisProfile` desde los `useMemo` existentes (SCI-53/55/56/57, normalidad canónica) sin recalcular motores; los slots A/B persisten entre imports de dataset. Dominio de builders, cálculos e interpretación en `src/lib/scientific/comparison/` (ARCH-5 F4A).

**ARCH-5 (Fases 1–4 COMPLETED):** extracción incremental move-only; scores, clasificaciones, PDF y builders SCI-11→60 sin cambios semánticos. Fase 1: normalidad canónica + utilidades `shared/`. Fase 2: plan builders SCI-59 (`buildGuidedWorkflowPlan`, templates T1/T2/T3, resolvers); handlers React y `GuidedWorkflowPanel` permanecen en `page.tsx`. Fase 3: calculadores SCI-12–15 + motor SCI-57 (`calculateIndependentTTest`, `calculateOneWayAnova`, `calculateTukeyComparisons`, `calculateMannWhitney`, `calculateKruskalWallis`, `buildEffectSizePowerAnalysis`); toggles, `useMemo` e UI inferencial permanecen en `page.tsx`. Fase 4: dominio SCI-58 en `comparison/`, dashboard `ScientificMultiDatasetComparisonDashboard` en `src/components/comparison/`, tests unitarios comparison en gate y consolidación mínima de contratos runtime↔persistencia; adaptador de captura, panel slots Datos, estado React y wrapper Resultados permanecen en `page.tsx`.

**PROD-1A:** capa de importación dominio-agnóstica; no recalcula motores SCI. Pipeline híbrido: CSV/TXT simples → fast path legacy (`importExperimentalDataFile`); workbooks XLSX/XLS/ODS complejos → `WorkbookImportWizard` (hoja → tabla → columnas X/Y → confirmación). Salida: `ExperimentalSeries[]` + `ImportReport` mínimo. **Sin cambios** en SCI-53→60, PDF, Advisor, ARCH-5 ni builders inferenciales.

---

## 3. Funcionalidades completadas

### Bloques cerrados

- SCI-1 → SCI-27 — Núcleo científico
- SCI-28 → SCI-40 — Análisis multivariante (incluye Multivariate Dashboard)
- SCI-41 → SCI-49 — Exploradores avanzados
- SCI-50 → SCI-55 — Evaluación metodológica
- SCI-56 — Síntesis metodológica
- SCI-57 — Effect Size & Power Engine
- SCI-57B — Effect-Aware Evidence (SCI-53)
- SCI-60 — Executive Publication Dashboard
- SCI-59 — Guided Scientific Workflow
- SCI-58 — Multi-Dataset Comparison Framework
- ARCH-5 Fase 1 — Normalidad canónica modularizada
- ARCH-5 Fase 2 — Workflow SCI-59 modularizado
- ARCH-5 Fase 3 — Inferencia SCI-12–15 + SCI-57 modularizada
- ARCH-5 Fase 4A — SCI-58 comparison domain modularizado
- ARCH-5 Fase 4B — SCI-58 comparison dashboard UI modularizado
- ARCH-5 Fase 4C — Tests unitarios comparison integrados al gate
- ARCH-5 Fase 4D — Tipos y contratos comparison/persistencia consolidados
- ARCH-5 Fase 4 — COMPLETED
- PROD-1A — Scientific Workbook Import Framework
- PROD-2A — Project File Core
- HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 — Auto-fit viewport X series experimentales

### Post-SCI-55 (este ciclo)

**HOTFIX-SCI-NORMALITY-2**
- `CanonicalNormalityAssessment` como única fuente de verdad
- `useMemo` único en runtime (`canonicalNormalityAssessment`)
- SCI-17: una sola sección "Evaluación integrada de normalidad"
- SCI-19/20: un solo `appendCanonicalNormalityFindings()`
- Panel UI único "🔬 Evaluación integrada de normalidad"
- Eliminados todos los builders y tipos duplicados

**BUGFIX SCI-19**
- `pushUniqueTextLine()` global + `pushUniqueFinding`/`pushUniqueWarning` en generación
- Deduplicación en origen (no claves por índice); red de seguridad con `deduplicateTextLines` al retornar
- Warning React "Encountered two children with the same key" eliminado

**BUG-SERIES-RENDER-1 → HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 (CERRADO)**
- **Incidente:** series experimentales importadas persistían e hidrataban correctamente, pero no aparecían en el gráfico principal tras importar o reabrir proyectos.
- **Root cause:** viewport X fijo en `[-10, 10]` mientras los valores X de las series quedaban fuera de ese dominio (clipping visual; datos, dashboards y persistencia intactos).
- **Solución:** helper `chartViewport.ts` — `collectExperimentalXExtent`, `computeXViewportWithPadding` (10%), `fitXViewportToExperimentalSeries`, `applyExperimentalXViewportFit`.
- **Aplicación:** importación rápida (`page.tsx`), importación wizard (`page.tsx`), apertura de `.sgproj` cuando `graphContext == null` (`projectFileActions.ts`).
- **Archivos:** `src/app/chartViewport.ts`, `src/app/page.tsx`, `src/app/projectFileActions.ts`.
- **Validación E2E manual:** import Excel → 11 puntos visibles → guardar → cerrar navegador → reabrir → abrir `.sgproj` → puntos visibles sin intervención manual. **PASS.**

**SCI-56 — Methodological Summary Dashboard**
- `MethodologicalDashboardAnalysis` (summaryCards, overallHealthScore, evaluatedEngines, diagnosis)
- Builder puro que consume los 6 motores vía useMemo
- Toggle dedicado + reset en `resetAnalysisSession()`
- Integraciones: SCI-17 (sección propia), SCI-19/20 (diagnóstico con dedup), PDF (vía sections)

**SCI-29B — Constant Variable Exclusion in Clustering (COMPLETED)**
- Exclusión de variables constantes en Distance Matrix, Hierarchical Clustering y MDS
- Exclusión heredada en SCI-38 (Cluster Heatmap) y SCI-39 (Clustered Distance Heatmap)
- Consistencia metodológica con PCA; aviso explícito en SCI-17/19/20 y PDF
- Dataset6 validado con exclusión de pH; Dataset5 como control negativo

**SCI-37B — Tie-Aware Variable Importance Ranking (COMPLETED)**
- Ranking compartido (1, 1, 3) con comunicación explícita de empates
- SCI-40, SCI-19 y SCI-20 tie-aware; Dataset5 como caso positivo de empate

**SCI-37B-H1 — Tight Tie Epsilon (COMPLETED)**
- Cambio: `VARIABLE_IMPORTANCE_TIE_EPSILON` `0.05` → `1e-6`
- Motivo: eliminar empates producidos por ruido numérico manteniendo soporte para empates reales
- Validación: `validate:variable-importance-unit` PASS · Dataset5 PASS (líder único top) · Dataset6 PASS (sin cambio)

**SCI-57 — Effect Size & Power Engine (COMPLETED)**
- Motor único de síntesis sobre la capa de inferencia existente (patrón SCI-50→56)
- **Effect Size:** Cohen's d, Hedges' g, Eta², Omega², r, Cliff's Delta (magnitud), Epsilon²
- **Confidence Intervals:** IC95% de Cohen's d, diferencia de medias (t-based), Tukey aproximado
- **Prospective Power:** n por grupo recomendado (80%, α = 0.05) — métrica principal
- **Observed Power:** con disclaimer explícito; no participa en scoring
- Toggle "Mostrar Effect Size & Power" + panel 📏 Effect Size & Power Engine
- Integraciones: SCI-17, SCI-19/20, PDF
- Validación t crítico: df=10 → 2.2280, df=18 → 2.1010, df=30 → 2.0420
- Dataset5: Cohen's d ≈ −1.36 (efecto grande); Dataset6: d ≈ −1.98 (efecto grande)

**SCI-57B — Effect-Aware Evidence (COMPLETED)**
- Reemplazo del `inferenceScore` binario de SCI-53 por score graduado vía `getEvidenceStrengthEffectAwareInferenceScore()`
- Mapeo aprobado: trivial→55, small→70, medium→80, large→95; fallback sin SCI-57→50; penalización −10 si `insufficientSampleWarning`
- Consume exclusivamente `effectSizePowerAnalysis` (SCI-57); sin fórmulas duplicadas
- SCI-55 y SCI-56 heredan delta vía cascada; builders SCI-40/56/57 intactos
- Dataset5: Evidence 83.7→82.7, Readiness 77.2→77.0, Overall Health 77.2→77.0; clasificaciones preservadas
- Dataset6: Evidence 74.3→73.3, Readiness 67.5→67.5, Overall Health 67.5→67.5; clasificaciones preservadas

**SCI-60 — Executive Publication Dashboard (COMPLETED)**
- Capa read-only de síntesis editorial (Opción A + C aprobada); sin `publicationExecutiveScore`
- `PublicationDashboardAnalysis`: status primario SCI-55, KPIs referenciales (Readiness, Overall Health SCI-56, Evidence SCI-53, Effect dominante SCI-57)
- Resumen normalidad canónica, highlights SCI-40, potencia prospectiva SCI-57
- Diagnóstico editorial cruzado, riesgos pre-publicación y recomendaciones
- Toggle "Mostrar Executive Publication Dashboard" + panel 📰 Executive Publication Dashboard
- Integraciones: SCI-17 (sección propia), PDF (vía `getPublicationDashboardReportLines`)
- **Sin cambios** en SCI-40, SCI-56, SCI-57, SCI-57B builders, SCI-19, SCI-20, Advisor
- Dataset5: Publication Status Near Ready (77.0); Dataset6: Requires Review (67.5)
- Scores upstream idénticos post-SCI-60 (Evidence 82.7 / 73.3; Overall 77.0 / 67.5)

**SCI-59 — Guided Scientific Workflow (COMPLETED)**
- Capa de orquestación UX (Opción D aprobada: Templates + Wizard + Advisor pasivo); sin motor científico ni score propio
- **3 templates declarativos:**
  - T1 *Comparar grupos* (7 pasos): descriptiva → normalidad → inferencia (branch paramétrico/no paramétrico) → SCI-57 → Advisor → interpretación
  - T2 *Explorar estructura* (6 pasos): correlación → heatmap → PCA → clustering → SCI-40
  - T3 *Evaluar publicación* (5 pasos): SCI-50→55 → SCI-57 → SCI-56 → SCI-60 → reporte
- **State machine:** `idle | active | completed | cancelled` vía `guidedWorkflowSession`
- **Builders puros:** `buildGuidedWorkflowPlan()`, `resolveGuidedWorkflowStepToggles()`, `applyGuidedWorkflowToggles()`
- **Componente:** `GuidedWorkflowPanel` con *Aplicar paso* / *Omitir paso* / *Cancelar workflow*
- **UI:** card de entrada en Datos + banner persistente en Análisis/Resultados
- **Integración SCI-60:** T3 activa `showPublicationDashboard` y navega a Resultados sin modificar `buildPublicationDashboardAnalysis`
- **Modo experto intacto:** toggles manuales siempre disponibles; auto-toggle acumulativo (solo activa)
- Reset en `resetAnalysisSession()`; **sin cambios** en builders SCI-11→60, SCI-19/20, Advisor, `exportScientificReportPdf()`
- Validación: T1/T2/T3 PASS Dataset5; T3 PASS Dataset6; scores upstream sin delta (Evidence 82.7/73.3; Overall 77.0/67.5)

**SCI-58 — Multi-Dataset Comparison Framework (COMPLETED)**
- Capa de comparación read-only (Opción D aprobada); sin motor científico ni score comparativo global
- **Dominio modularizado (ARCH-5 F4A):** `src/lib/scientific/comparison/` — tipos, profile builders, análisis KPI, interpretación, formateo (~653 LOC, 9 archivos)
- **Arquitectura Slots A/B:** dos slots independientes del dataset activo; captura / actualización / limpieza desde Datos
- **`DatasetAnalysisProfile`:** snapshot inmutable de KPIs en instante de captura (`fileName`, `capturedAt`, series, observaciones, completitud)
- **Dashboard comparativo:** `ScientificMultiDatasetComparisonDashboard` en `src/components/comparison/` (ARCH-5 F4B); wrapper Resultados en `page.tsx`
- **Comparación de KPIs:**
  - Evidence (SCI-53)
  - Readiness (SCI-55)
  - Overall Health (SCI-56)
  - Publication Status (SCI-55/60)
  - Effect Size dominante (SCI-57)
  - Normalidad integrada (canónica)
- Deltas numéricos B−A, advertencias de comparabilidad, diagnóstico cruzado y recomendaciones
- **Persistencia de slots:** perfiles A/B conservados al importar un nuevo dataset; toggle comparativo resetea en `resetAnalysisSession()`; limpieza manual por slot
- **Sin cambios** en builders SCI-11→60, SCI-17/19/20, Advisor, `exportScientificReportPdf()` (PDF mono-dataset)
- Validación: `npm run validate:full` PASS · `validate-hotfix-sci-normality-2.mjs` sci58.pass

**ARCH-5 Fase 4B — SCI-58 UI Dashboard Extraction (COMPLETED)**
- Extracción move-only de `ScientificMultiDatasetComparisonDashboard` a `src/components/comparison/ScientificMultiDatasetComparisonDashboard.tsx` (~152 LOC)
- Componente presentacional: prop única `analysis: MultiDatasetComparisonAnalysis`; sin hooks; formatters desde `@/lib/scientific/comparison`
- Constantes UI `contentPanel` / `emptyState` duplicadas localmente (mismos strings que `page.tsx`)
- **Permanece en page.tsx:** wrapper Resultados (heading, empty state, `subsectionCard`), panel slots Datos, toggle Análisis, adaptador `buildCurrentDatasetAnalysisProfile`, estado `comparisonSlots`
- **Sin cambios** en dominio `comparison/`, persistencia, importación, motores SCI-53→60, textos, formatos ni estructura visual
- Reducción neta en `page.tsx`: ~156 LOC
- Validación: `npm run validate:full` PASS · `validate-hotfix-sci-normality-2.mjs` sci58.comparison PASS (Δ −9.5, KPIs 77.0/67.5)

**ARCH-5 Fase 4A — SCI-58 Domain Extraction (COMPLETED)**
- Extracción move-only del dominio SCI-58 a `src/lib/scientific/comparison/` (~653 LOC, 9 archivos)
- Módulos: `types.ts`, `input-types.ts`, `constants.ts`, `profile.ts`, `analysis.ts`, `interpretation.ts`, `format.ts`, `labels.ts`, `index.ts`
- API pública: `buildDatasetAnalysisProfile`, `buildMultiDatasetComparisonAnalysis`, `canBuildDatasetAnalysisProfile`, `canBuildMultiDatasetComparisonAnalysis`, `createEmptyComparisonSlots`, mappers normality/inferential, interpretación cruzada, formateo KPI
- **Permanece en page.tsx:** adaptador `buildCurrentDatasetAnalysisProfile`, estado `comparisonSlots`, paneles Datos/Análisis/Resultados (wrapper)
- Dependencias: `inference/` (EffectSizePowerAnalysis, labels), `shared/text` (deduplicateTextLines)
- **Sin cambios** en persistencia PROD-2A, schema V1, importación PROD-1, motores SCI-53/55/56/57/60, scores, interpretaciones ni diagnósticos
- Reducción neta en `page.tsx`: ~517 LOC (dominio extraído)
- Validación: `npm run validate:full` PASS (TypeScript · Build · baseline D5/D6 · RW Suite · PROD-2A E2E · SCI-58 reload); `validate-hotfix-sci-normality-2.mjs` sci58.comparison PASS (Δ Readiness −9.5, KPIs 77.0/67.5)

**ARCH-5 Fase 1 — Canonical Normality Modularization (COMPLETED)**
- Extracción de normalidad canónica (HOTFIX-SCI-NORMALITY-2) a `src/lib/scientific/normality/` (~548 LOC, 10 archivos)
- Utilidades compartidas `deduplicateTextLines` / `pushUniqueTextLine` en `src/lib/scientific/shared/text.ts`
- API pública: `buildCanonicalNormalityAssessment`, `getCanonicalNormalityScore`, tipos `CanonicalNormalityAssessment` / `NormalityConsensus`, reporting (`appendCanonicalNormalityFindings`, footers UI)
- Algoritmos SCI-11/21/22/26 permanecen en `page.tsx`; **sin cambios** en scores, SCI-17/19/20, PDF, SCI-58/59/60
- Validación: TypeScript · Build · score-check baselineMatch D5/D6 · E2E completo exit 0

**ARCH-5 Fase 2 — SCI-59 Workflow Modularization (COMPLETED)**
- Extracción de lógica declarativa SCI-59 a `src/lib/scientific/workflow/` (~411 LOC, 9 archivos)
- Módulos: tipos, toggles, context, catalog (idle session + template catalog), inferential resolver, templates T1/T2/T3, plan builder, apply helper
- API pública: `buildGuidedWorkflowPlan`, `resolveGuidedWorkflowStepToggles`, `applyGuidedWorkflowToggles`, `GUIDED_WORKFLOW_IDLE_SESSION`, `GUIDED_WORKFLOW_TEMPLATE_CATALOG`
- **Permanece en page.tsx:** `guidedWorkflowSession`, handlers, `guidedWorkflowToggleSetters`, `GuidedWorkflowPanel`, UI Datos/Análisis/Resultados
- Dependencia Fase 1: `GuidedWorkflowContext` consume `CanonicalNormalityAssessment` desde `@/lib/scientific/normality`
- **Sin cambios** en templates T1/T2/T3, ramificación inferencial, scores, PDF, SCI-58/60, Advisor
- Validación: TypeScript · Build · score-check baselineMatch D5/D6 · sci59.pass (T1/T2/T3) · E2E completo exit 0

**ARCH-5 Fase 3 — Inferential Engine Modularization (COMPLETED)**
- Extracción de inferencia SCI-12–15 + SCI-57 a `src/lib/scientific/inference/` (~1.210 LOC, 11 archivos)
- Extensión mínima de `shared/`: `series.ts` (`getSeriesYValues`), `stats.ts` (`getSampleMeanAndStdDev`), además de `text.ts`
- **SCI-12 t-Test:** `calculateIndependentTTest`, `TTestResult`, labels UI
- **SCI-13 ANOVA:** `calculateOneWayAnova`, `AnovaAnalysis`
- **SCI-14 Tukey:** `calculateTukeyComparisons`, `PostHocComparison`
- **SCI-15 No paramétricas:** `calculateMannWhitney`, `calculateKruskalWallis`
- **SCI-57 Effect Size & Power:** `buildEffectSizePowerAnalysis`, `getEffectSizePowerReportLines`, `getEffectMagnitudeLabel`; distribuciones internas en `distribution.ts`
- API pública vía `@/lib/scientific/inference`: calculadores, builders SCI-57, tipos, labels y `resolveTTestSeriesSelection`
- **Permanece en page.tsx:** toggles inferenciales, `useMemo` chain, paneles UI (t-Test/ANOVA/Tukey/NonParam/SCI-57), `formatPValue`, Advisor, adaptadores SCI-17/19/20
- Dependencias: `NormalityConsensus` desde `normality/`; `ExperimentalSeries` desde `experimentalData.ts`
- **Sin cambios** en scores SCI-57B (Evidence 82.7/73.3), Readiness (77.0/67.5), PDF, SCI-58/59/60, motores SCI-50→56
- Validación: TypeScript · Build · score-check baselineMatch D5/D6 · sci57.pass · sci58.pass · sci59.pass · sci60.pass · PDF · E2E completo exit 0

**PROD-1A — Scientific Workbook Import Framework (COMPLETED)**
- Framework dominio-agnóstico de importación de workbooks científicos (Opción D aprobada: pipeline híbrido fast path + wizard); sin motor científico ni score propio
- **Módulo `src/lib/import/`:** lectura XLSX/XLS/ODS, discovery/ranking de hojas, detección de tabla y encabezados, sugerencias y mapeo X/Y, validación mínima (≥2 puntos), builder → `ExperimentalSeries[]`, reporte mínimo
- **Pipeline:** `attemptExperimentalImport()` — fast path legacy para CSV/TXT (Dataset5/6); wizard path para workbooks multi-hoja con metadatos pre-tabla
- **UI:** `WorkbookImportWizard` (4 pasos: hoja · tabla · columnas · confirmar) + panel informe mínimo post-import en Datos
- **Bridge:** `experimentalData.ts` conserva contrato `ExperimentalSeries`; accept ampliado a `.xls`
- **Real World Validation Suite:** RW-01, RW-02, RW-03, RW-04 PASS vía `scripts/validate-prod1-rw-suite.mjs`
- **Sin cambios** en SCI-53→60, PDF, Advisor, ARCH-5, motores inferenciales ni recálculo de scores
- Validación: TypeScript · Build · score-check baselineMatch D5/D6 (Evidence 82.7/73.3; Overall 77.0/67.5) · RW-Suite 4/4 PASS

---

## 4. Dashboards y capas de síntesis disponibles

| Capa | ID | Rol | Ubicación UI |
|------|----|-----|--------------|
| 🧭 Guided Scientific Workflow | SCI-59 | Orquestación UX (templates + wizard) | Datos · Análisis · Resultados |
| 📊 Multivariate Summary Dashboard | SCI-40 | SCI-28→39 | Resultados → Resultados matemáticos |
| 🔬 Evaluación integrada de normalidad | HOTFIX | SCI-11/21/22/26 | Resultados → Resultados matemáticos |
| 📋 Methodological Summary Dashboard | SCI-56 | SCI-50→55 | Resultados → Resultados matemáticos |
| 📰 Executive Publication Dashboard | SCI-60 | SCI-55 + SCI-56 + SCI-53/57B + SCI-40 + SCI-57 + normalidad | Resultados → Resultados matemáticos |
| 📊 Multi-Dataset Comparison Dashboard | SCI-58 | Perfiles A/B (SCI-53/55/56/57 + normalidad) | Datos (slots) · Resultados (comparación) |

SCI-59 no es dashboard analítico: orquesta toggles, navegación workspace e inspector hacia motores y dashboards existentes.

**Progressive disclosure (post UX-1A.1 LITE):** todos los motores metodológicos (SCI-50→55) y dashboards de síntesis (SCI-40, SCI-56, SCI-58, SCI-60) requieren **activación manual via toggle** en el Inspector de Análisis (default **OFF**). El Guided Workflow (SCI-59) puede activarlos paso a paso de forma acumulativa. Los paneles **no aparecen automáticamente** al importar un dataset ni al navegar a Resultados.

SCI-56 muestra: Overall Health Score, 6 tarjetas metodológicas y diagnóstico global — **solo con toggle `showMethodologicalDashboard` activo**.

SCI-60 muestra: Publication Status (SCI-55), KPIs referenciales, normalidad, highlights multivariantes, effect dominante, diagnóstico editorial, riesgos y recomendaciones — **solo con toggle `showPublicationDashboard` activo**.

SCI-57 no es dashboard ejecutivo: es motor inferencial con panel propio (📏 Effect Size & Power Engine).

SCI-58 no recalcula motores: compara snapshots capturados; el dataset activo sigue alimentando el análisis mono-dataset y el PDF.

---

## 5. Backlog pendiente

**Backlog técnico histórico: vacío.** SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-58, SCI-59, SCI-60, ARCH-5 (Fase 1–4 COMPLETED), PROD-1A, PROD-2A, HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1, **DATA-3A / HOTFIX-DATA-3A (COMPLETED)** están cerrados y validados. BUG-SERIES-RENDER-1 cerrado sin deuda bloqueante.

### Deuda menor documentada

- Commit `69a140d` contiene la implementación de SCI-56 bajo mensaje "HOTFIX-SCI-NORMALITY-2" (trazabilidad corregida vía tag `SCI-56`).
- Dataset6 no produce series `contradictory` con su perfil actual; regla D1 del motor canónico validada solo a nivel de código.
- `overallHealthScore` de SCI-56 promedia 6 scores donde Readiness ya es promedio de los otros 5.
- Falsos negativos Playwright en visibilidad de tarjetas individuales SCI-50→55 (no fallos funcionales).
- **Viewport (post HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1):** auto-fit implementado solo en eje X; eje Y sigue con dominio por defecto. Proyectos `.sgproj` guardados con `graphContext` que contenga un viewport X obsoleto (p. ej. `[-10, 10]` pre-hotfix) no recalculan auto-fit al abrir — solo cuando `graphContext == null`. Sin tests automatizados en gate CI para `chartViewport.ts`.

---

## 6. Roadmap — Próxima etapa

**Sprint QA-1:** **CERRADO** (2026-06-24). El núcleo científico SCI-1 → SCI-60 se considera **validado** (manual + `validate:full` PASS). Protocolo: [`QA-1_MANUAL_VALIDATION_PROTOCOL.md`](./QA-1_MANUAL_VALIDATION_PROTOCOL.md). Roadmap detallado: [`ROADMAP.md`](./ROADMAP.md).

### SCI-58 v2 — Comparación científica ampliada

**Estado:** **COMPLETADO** (2026-06-27). Documentación de cierre: [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md).

Entregables: A1 (modelo enriquecido), A2 (dashboard), A3 (PDF), HOTFIX PDF-1/2/3. Gates finales PASS (`validate:comparison-unit` 92/92, `validate-pdf-export-unit` 14/14, `validate:full`).

### Candidatos posteriores (sin priorización definitiva)

| Candidato | Descripción breve |
|-----------|-------------------|
| **PROD-1B — Validación avanzada + reportes** | Preview expandido, warnings estructurados, `ImportReport` completo, script RW en CI; plan aprobado, no implementado. |
| **ARCH-5 Fase 4+ — Metodología / reporting** | Metodología SCI-50→56, reporting, PDF (roadmap ARCH-5). |
| **PROD-1 v1.1 — Multi-serie side-by-side** | Importación de layouts `grafico q vs t` (RW-04) como múltiples series en un paso. |
| **ARCH-6 — Mejoras UX post-QA-1** | Estado persistente Constructor Visual por dataset; refinamiento progressive disclosure (ver §23 Observaciones UX). |

---

## 7. Estado de validación

| Verificación | Dataset5 | Dataset6 |
|--------------|----------|----------|
| TypeScript | PASS | PASS |
| Build | PASS | PASS |
| Evaluación integrada de normalidad | PASS | PASS |
| SCI-17 (sección única, sin legacy) | PASS | PASS |
| SCI-19 (sin duplicados, sin warnings React) | PASS | PASS |
| SCI-20 | PASS | PASS |
| Motores SCI-46/51/52/54/55 | PASS | PASS |
| SCI-40 (Multivariate Summary Dashboard) | PASS | PASS |
| SCI-56 dashboard | PASS | PASS |
| SCI-29B (exclusión de constantes en clustering) | PASS (control negativo) | PASS (pH excluida) |
| SCI-37B (ranking compartido + empates) | PASS (líder único top, SCI-37B-H1) | PASS (control negativo) |
| SCI-57 (Effect Size & Power Engine) | PASS (d ≈ −1.36, efecto grande) | PASS (d ≈ −1.98, efecto grande) |
| SCI-57B (evidencia effect-aware) | PASS (Evidence 82.7, Strong) | PASS (Evidence 73.3, Strong) |
| SCI-60 (Executive Publication Dashboard) | PASS (Near Ready, 77.0) | PASS (Requires Review, 67.5) |
| SCI-59 T1 Comparar grupos | PASS | — |
| SCI-59 T2 Explorar estructura (SCI-40) | PASS | — |
| SCI-59 T3 Evaluar publicación (SCI-56/57/60) | PASS | PASS |
| SCI-58 Multi-Dataset Comparison (slots A/B, delta Readiness) | PASS (Slot A 77.0) | PASS (Slot B 67.5, Δ −9.5) |
| ARCH-5 Fase 4A (SCI-58 domain extraction) | PASS | PASS |
| ARCH-5 Fase 4B (SCI-58 UI dashboard extraction) | PASS | PASS |
| ARCH-5 Fase 4C (comparison unit tests) | PASS (43/43) | PASS (43/43) |
| ARCH-5 Fase 4D (runtime↔persistencia contracts) | PASS | PASS |
| ARCH-5 Fase 4 COMPLETED | PASS | PASS |
| validate:full (gate unificado Fase A) | PASS | PASS |
| ARCH-5 Fase 3 (inferencia modularizada) | PASS | PASS |
| PROD-1A Workbook Import (fast path CSV) | PASS (baselineMatch) | PASS (baselineMatch) |
| PROD-1A RW-Suite (RW-01→RW-04) | PASS | PASS |
| PROD-2A Project File (save/reload D5/D6, SCI-58/59) | PASS | PASS |
| HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 (render series post-import/reopen) | PASS | PASS |
| DATA-3A / HOTFIX-DATA-3A (Visual Graph Builder + hotfixes 3A-1→3A-5) | PASS (10/10 + render) | PASS (10/10 + render) |
| Sprint QA-1 (validación manual end-to-end) | PASS | PASS |
| Export PDF (SCI-56 + SCI-57 + SCI-60) | PASS | PASS |
| t crítico IC95% (df=10, 18, 30) | PASS (2.228 / 2.101 / 2.042) | — |

Resultados observados post-SCI-57B / SCI-60 / SCI-59 (scores upstream referencia):

| Métrica | Dataset5 | Dataset6 |
|---------|----------|----------|
| Overall Health Score (SCI-56) | 77.0 | 67.5 |
| Evidence Score (SCI-53) | 82.7 (Strong) | 73.3 (Strong) |
| Readiness Score (SCI-55) | 77.0 (Near Ready) | 67.5 (Requires Review) |
| Publication Status (SCI-60) | Near Ready | Requires Review |
| Effect dominante (SCI-57) | large, d ≈ −1.36 | large, d ≈ −1.98 |

Build: Compilación OK · TypeScript OK · Exportación PDF OK · `npm run validate:comparison-unit` OK (43/43) · `npm run validate:prod2a-gate` OK · `npm run validate:full` OK · `validate-hotfix-sci-normality-2.mjs` (sci57.pass · sci58.pass · sci59.pass · sci60.pass) OK · `validate-t-quantile.mjs` OK · `validate-prod1-rw-suite.mjs` (RW-01→RW-04) OK · scores upstream sin regresión post-ARCH-5 Fase 4 y PROD-1A (baselineMatch D5/D6).

---

## 8. Estado del proyecto al cierre de SCI-37B

Inventario de hitos al cierre del backlog técnico histórico (referencia intermedia):

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |

---

## 9. Estado del proyecto al cierre de SCI-57

Inventario al cierre de la etapa SCI-57 (referencia intermedia):

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |
| SCI-57 — Effect Size & Power Engine | COMPLETADO |

---

## 10. Estado del proyecto al cierre de SCI-60

Inventario al cierre de la etapa SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-60 (referencia intermedia):

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |
| SCI-57 — Effect Size & Power Engine | COMPLETADO |
| SCI-57B — Effect-Aware Evidence (SCI-53) | COMPLETADO |
| SCI-60 — Executive Publication Dashboard | COMPLETADO |

---

## 11. Estado del proyecto al cierre de SCI-59

Inventario completo de hitos al cierre de la etapa SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-60 + SCI-59:

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |
| SCI-57 — Effect Size & Power Engine | COMPLETADO |
| SCI-57B — Effect-Aware Evidence (SCI-53) | COMPLETADO |
| SCI-60 — Executive Publication Dashboard | COMPLETADO |
| SCI-59 — Guided Scientific Workflow | COMPLETADO |

### Capacidades científicas actuales

Scientific Graph AI resuelve hoy el ciclo completo de análisis de un dataset experimental tabular:

- Importación multi-formato y workspace científico (Datos → Análisis → Resultados → Reportes)
- **Importación robusta de workbooks (PROD-1A):** fast path CSV/TXT + wizard para XLSX/XLS/ODS con detección de hoja/tabla y mapeo X/Y; validado RW-01→RW-04
- **Workflow guiado (SCI-59):** 3 templates con wizard, auto-toggle y navegación hacia el camino analítico correcto (builders en `src/lib/scientific/workflow/`)
- **Modularización incremental (ARCH-5):** Fases 1–4 COMPLETED; cinco módulos dominio + UI comparison en `src/components/comparison/` + tests/contratos comparison — sin cambio funcional ni de scores
- **Comparación multi-dataset (SCI-58):** dominio en `comparison/`; dashboard en `components/comparison/`; captura Slots A/B read-only
- Estadística descriptiva, distribución, normalidad canónica unificada, outliers y correlación
- Inferencia paramétrica y no paramétrica con magnitud del efecto, IC95% y potencia (SCI-57; calculadores en `inference/`)
- Evidencia metodológica effect-aware en SCI-53 (SCI-57B)
- Análisis multivariante completo (PCA, clustering, MDS, redes, Variable Importance con empates explícitos)
- Exploradores avanzados (MANOVA, LDA, CCA, PCR, PLS, Bootstrap, Sensitivity, t-SNE, UMAP)
- Evaluación metodológica automatizada (SCI-50→55) con dashboard ejecutivo (SCI-56)
- Síntesis pre-manuscrito read-only (SCI-60): status de publicación, KPIs referenciales, diagnóstico editorial cruzado
- Advisor Estadístico, interpretación científica (SCI-19/20) y exportación PDF completa
- Modo experto: todos los toggles y módulos permanecen accesibles independientemente del workflow

### Backlog técnico

**Vacío.** Sprint QA-1 cerrado. **SCI-58 v2 COMPLETED** (ver [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md)). Candidatos PROD-1B, ARCH-5 Fase 4+, ARCH-6 son evolución futura, no backlog pendiente.

### Áreas abiertas para evolución futura

- PROD-1B — validación avanzada, reportes completos y preview expandido
- ARCH-5 Fase 4+ — metodología SCI-50→56, reporting, PDF
- Comparación N>2 slots o persistencia extendida (evolución post SCI-58 v2)
- Enriquecimiento narrativo SCI-57B en SCI-55/56 (opcional, no bloqueante)
- SCI-59 v1.1: branching condicional avanzado, persistencia de workflow, orquestación SCI-41→49
- Validación formal con dataset `contradictory` y suite Playwright como CI de regresión

---

## 12. Estado del proyecto al cierre de SCI-58

Inventario completo de hitos al cierre de la etapa SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-58 + SCI-59 + SCI-60:

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |
| SCI-57 — Effect Size & Power Engine | COMPLETADO |
| SCI-57B — Effect-Aware Evidence (SCI-53) | COMPLETADO |
| SCI-60 — Executive Publication Dashboard | COMPLETADO |
| SCI-59 — Guided Scientific Workflow | COMPLETADO |
| SCI-58 — Multi-Dataset Comparison Framework | COMPLETADO |

---

## 13. Estado del proyecto al cierre de ARCH-5 Fase 2

Inventario completo de hitos al cierre de la etapa SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-58 + SCI-59 + SCI-60 + ARCH-5 (Fase 1–2):

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |
| SCI-57 — Effect Size & Power Engine | COMPLETADO |
| SCI-57B — Effect-Aware Evidence (SCI-53) | COMPLETADO |
| SCI-60 — Executive Publication Dashboard | COMPLETADO |
| SCI-59 — Guided Scientific Workflow | COMPLETADO |
| SCI-58 — Multi-Dataset Comparison Framework | COMPLETADO |
| ARCH-5 Fase 1 — Canonical Normality Modularization | COMPLETADO |
| ARCH-5 Fase 2 — SCI-59 Workflow Modularization | COMPLETADO |

### Módulos `src/lib/scientific/` (post ARCH-5 Fase 2)

| Módulo | Contenido | LOC aprox. |
|--------|-----------|------------|
| `shared/text.ts` | `deduplicateTextLines`, `pushUniqueTextLine` | ~12 |
| `normality/` | Normalidad canónica HOTFIX (builders, scoring, reporting, labels) | ~548 |
| `workflow/` | SCI-59 declarative (templates T1/T2/T3, plan, apply) | ~411 |

---

## 14. Estado del proyecto al cierre de ARCH-5 Fase 3

Inventario completo de hitos al cierre de la etapa SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-58 + SCI-59 + SCI-60 + ARCH-5 (Fase 1–3):

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |
| SCI-57 — Effect Size & Power Engine | COMPLETADO |
| SCI-57B — Effect-Aware Evidence (SCI-53) | COMPLETADO |
| SCI-60 — Executive Publication Dashboard | COMPLETADO |
| SCI-59 — Guided Scientific Workflow | COMPLETADO |
| SCI-58 — Multi-Dataset Comparison Framework | COMPLETADO |
| ARCH-5 Fase 1 — Canonical Normality Modularization | COMPLETADO |
| ARCH-5 Fase 2 — SCI-59 Workflow Modularization | COMPLETADO |
| ARCH-5 Fase 3 — Inferential Engine Modularization | COMPLETADO |

### Módulos `src/lib/scientific/` — inventario cerrado (ARCH-5 Fase 3)

Cuatro dominios modulares extraídos del monolito; todos **COMPLETADOS** y validados con baseline D5/D6 idéntico. *(Actualizado post-F4A: ver sección 19 para quinto dominio `comparison/`.)*

| Módulo | Estado | Contenido | Archivos | LOC aprox. |
|--------|--------|-----------|----------|------------|
| **`shared/`** | COMPLETADO | Utilidades transversales: texto (`deduplicateTextLines`, `pushUniqueTextLine`), series (`getSeriesYValues`), estadística muestral (`getSampleMeanAndStdDev`) | 4 | ~31 |
| **`normality/`** | COMPLETADO | Normalidad canónica HOTFIX-SCI-NORMALITY-2: builders, scoring, reporting, labels, reglas, input-types | 10 | ~548 |
| **`workflow/`** | COMPLETADO | SCI-59 declarative: templates T1/T2/T3, plan builder, toggle resolver, apply, catalog, inferential resolver | 9 | ~411 |
| **`inference/`** | COMPLETADO | SCI-12 t-Test, SCI-13 ANOVA, SCI-14 Tukey, SCI-15 Mann-Whitney/Kruskal-Wallis, SCI-57 Effect Size & Power; distribuciones, labels, reporting | 11 | ~1.210 |

**Total modularizado:** ~2.200 LOC en `src/lib/scientific/` · **Reducción neta en `page.tsx`:** ~2.500 LOC acumuladas (Fases 1–3).

#### API pública por módulo

| Módulo | Export principal |
|--------|------------------|
| `shared/` | `deduplicateTextLines`, `pushUniqueTextLine`, `getSeriesYValues`, `getSampleMeanAndStdDev` |
| `normality/` | `buildCanonicalNormalityAssessment`, `getCanonicalNormalityScore`, tipos `NormalityConsensus`, reporting SCI-17/19/20 |
| `workflow/` | `buildGuidedWorkflowPlan`, `resolveGuidedWorkflowStepToggles`, `applyGuidedWorkflowToggles`, `GUIDED_WORKFLOW_TEMPLATE_CATALOG` |
| `inference/` | `calculateIndependentTTest`, `calculateOneWayAnova`, `calculateTukeyComparisons`, `calculateMannWhitney`, `calculateKruskalWallis`, `buildEffectSizePowerAnalysis`, `getEffectSizePowerReportLines`, tipos inferenciales |

#### Permanece en `page.tsx` (post Fase 3)

- Algoritmos SCI-11/21/22/26 (normalidad por serie)
- Motores SCI-50→60, adaptador SCI-58 capture, Advisor
- Estado React, toggles, `useMemo`, UI panels, adaptadores SCI-17/19/20/PDF
- `exportScientificReportPdf()`

---

## 15. Estado del proyecto al cierre de PROD-1A

Inventario completo de hitos al cierre de la etapa SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-58 + SCI-59 + SCI-60 + ARCH-5 (Fase 1–3) + PROD-1A:

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |
| SCI-57 — Effect Size & Power Engine | COMPLETADO |
| SCI-57B — Effect-Aware Evidence (SCI-53) | COMPLETADO |
| SCI-60 — Executive Publication Dashboard | COMPLETADO |
| SCI-59 — Guided Scientific Workflow | COMPLETADO |
| SCI-58 — Multi-Dataset Comparison Framework | COMPLETADO |
| ARCH-5 Fase 1 — Canonical Normality Modularization | COMPLETADO |
| ARCH-5 Fase 2 — SCI-59 Workflow Modularization | COMPLETADO |
| ARCH-5 Fase 3 — Inferential Engine Modularization | COMPLETADO |
| PROD-1A — Scientific Workbook Import Framework | COMPLETADO |
| PROD-2A — Project File Core | COMPLETADO |
| HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 | COMPLETADO |
| BUG-SERIES-RENDER-1 | CERRADO |

### Módulo `src/lib/import/` — inventario PROD-1A

Framework de importación dominio-agnóstico; **COMPLETADO** y validado con baseline D5/D6 idéntico + RW-Suite 4/4.

| Submódulo | Contenido | Rol |
|-----------|-----------|-----|
| `types.ts` | Contratos (`WorkbookSnapshot`, `TableRegion`, `ColumnMapping`, `ImportReport`, wizard state) | API del framework |
| `read/` | XLSX, XLS, ODS; detección de formato | Lectura robusta |
| `discover/` | `SheetSummary`, ranking, clasificación heurística de hojas | Discovery |
| `detect-table/` | Región tabular, metadatos pre-tabla | Detección de tabla |
| `detect-header/` | Encabezados, `ColumnDescriptor` | Detección de encabezados |
| `map/` | Sugerencias de roles, mapeo X/Y, extracción de puntos | Mapeo |
| `validate/` | Preview, validación mínima (≥2 puntos) | Validación PROD-1A |
| `build/` | Builder → `ExperimentalSeries[]` | Transformación |
| `report/` | Reporte mínimo, `formatImportReportSummary` | Trazabilidad |
| `pipeline.ts` | `attemptExperimentalImport`, wizard build, fast path | Orquestación |
| `shared/` | `cell`, `matrix`, `text` helpers | Utilidades agnósticas |

**UI:** `src/components/import/WorkbookImportWizard.tsx` · integración en `page.tsx` (handler, estado wizard, panel informe).

#### API pública principal

| Export | Rol |
|--------|-----|
| `attemptExperimentalImport` | Entrada única: success \| wizard \| error |
| `buildInitialWizardState` / `refreshWizardState` / `runWizardImport` | Flujo wizard |
| `analyzeWorkbookFile` | Análisis previo de workbook |
| `formatImportReportSummary` | Resumen legible del reporte mínimo |

#### Validación PROD-1A

| Verificación | Resultado |
|--------------|-----------|
| TypeScript | PASS |
| Build | PASS |
| Dataset5 fast path | PASS (Evidence 82.7 · Readiness 77.0 · Overall 77.0) |
| Dataset6 fast path | PASS (Evidence 73.3 · Readiness 67.5 · Overall 67.5) |
| RW-01 (`Pb`) | PASS (≥8 puntos) |
| RW-02 (`Lang_Up`) | PASS (≥8 puntos) |
| RW-03 (`resultados_Up`) | PASS (≥8 puntos) |
| RW-04 (`Up_PH3`, `.xls`) | PASS (≥10 puntos) |
| SCI-53→60 / PDF / Advisor | Sin cambios |

#### Pendiente PROD-1B (no implementado)

- Validación avanzada con severidades estructuradas
- `ImportReport` completo en UI
- Preview expandido con auditoría de filas omitidas
- Integración RW-Suite en CI de regresión continua

---

## 16. PROD-2A — Project File Core — **COMPLETED**

**Status: PASS**

Persistencia local de proyectos científicos en `.sgproj` (F0–F6 completados).

### Validación funcional (E2E)

| Check | Resultado |
|-------|-----------|
| Save/Reload Dataset5 | **PASS** |
| Save/Reload Dataset6 | **PASS** |
| SCI-58 Restore | **PASS** |
| SCI-59 Restore | **PASS** |
| Graph context restore | **PASS** |
| Nuevo proyecto (reset limpio) | **PASS** |
| Dataset5 baselineMatch (post-reload) | **PASS** |
| Dataset6 baselineMatch (post-reload) | **PASS** |
| RW-Suite (sin regresión) | **PASS** |

### Entregables

| Entregable | Estado |
|------------|--------|
| Dominio `src/lib/project/` | ✅ |
| Boundary `collectProjectSnapshot` / `applyHydrateProjectPatch` | ✅ |
| UX sidebar (Nuevo / Guardar / Abrir) | ✅ F4 |
| E2E save→reload Dataset5/6 + SCI-58/59 | ✅ F5 |
| Hardening UX + mensajes + gate final | ✅ F6 |

**Persiste:** dataset, toggles/modos/selecciones, SCI-59 session, SCI-58 slot KPIs, workspace, graphContext opcional.

**No persiste:** outputs SCI-53→60, PDF, Advisor, Supabase graphs.

**Gate:**

```bash
npm run validate:prod2a-gate
```

**Nota post-hotfix:** la reapertura de proyectos con series experimentales y `graphContext == null` aplica auto-fit del viewport X vía HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 (ver §17).

---

## 17. BUG-SERIES-RENDER-1 / HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 — **CLOSED**

**Status: PASS**

### Resumen ejecutivo (historial)

Las series experimentales importadas se persistían y hidrataban correctamente, pero no aparecían en el gráfico principal. La causa no era pérdida de datos ni fallo de PROD-2A: el dominio X del viewport permanecía en `[-10, 10]` mientras los puntos importados tenían coordenadas X fuera de ese rango. El gráfico recortaba visualmente las series sin error explícito.

### Solución

| Componente | Rol |
|------------|-----|
| `src/app/chartViewport.ts` | Helper de auto-fit: extent X, padding 10%, aplicación a setters de viewport |
| `src/app/page.tsx` | Auto-fit tras importación rápida y tras wizard |
| `src/app/projectFileActions.ts` | Auto-fit al abrir `.sgproj` si `graphContext == null` y hay series |

### Validación funcional (E2E manual)

| Paso | Resultado |
|------|-----------|
| Importación Excel | **PASS** |
| Renderizado inmediato (11 puntos experimentales) | **PASS** |
| Guardado de proyecto | **PASS** |
| Cierre completo del navegador | **PASS** |
| Reapertura de la aplicación | **PASS** |
| Apertura archivo `.sgproj` | **PASS** |
| Puntos visibles sin intervención manual | **PASS** |

**Subsystems verificados:** persistencia OK · hidratación OK · dashboards OK · renderizado OK · reapertura OK.

### Deuda técnica residual (no bloqueante)

| Ítem | Severidad | Notas |
|------|-----------|-------|
| Auto-fit solo eje X | Baja | Dominio Y no se ajusta automáticamente |
| `graphContext` persistido con viewport obsoleto | Baja | Auto-fit en apertura solo si `graphContext == null`; proyectos legacy con `[-10, 10]` guardado pueden requerir reset manual de viewport |
| Sin gate CI para `chartViewport.ts` | Baja | Validación manual E2E; candidato a test unitario en suite de regresión |
| Re-import con viewport usuario | Info | Nueva importación recalcula viewport; comportamiento esperado |

---

## 18. Próximos pasos recomendados

1. **Implementar PROD-1B** — validación avanzada + reportes completos sobre `src/lib/import/`.
2. **Continuar ARCH-5 Fase 4+** — metodología SCI-50→56 o reporting según roadmap.
3. **ARCH-6** — abordar observaciones UX registradas en §23 (no bloqueantes).
4. **Validar la regla `contradictory`** con un dataset diseñado para el caso D1 del motor canónico.

---

## 19. Estado del proyecto al cierre de ARCH-5 Fase 4A

Inventario al cierre formal de **ARCH-5 F4A — SCI-58 domain extraction**:

| Bloque / Hito | Estado |
|---------------|--------|
| ARCH-5 Fase 4A — SCI-58 Domain Extraction | **COMPLETADO** |
| SCI-58 — Multi-Dataset Comparison Framework (dominio) | **COMPLETADO** (modularizado) |

### Módulo `src/lib/scientific/comparison/` — inventario F4A

Dominio SCI-58 extraído move-only; **COMPLETADO** y validado con baseline D5/D6 idéntico + comparación A/B (Δ Readiness −9.5).

| Archivo | Rol | LOC aprox. |
|---------|-----|------------|
| `types.ts` | Tipos de dominio (`DatasetAnalysisProfile`, `MultiDatasetComparisonAnalysis`, KPI rows) | 69 |
| `input-types.ts` | Inputs builders y clasificaciones | 39 |
| `constants.ts` | Umbral delta estable, labels slots | 5 |
| `profile.ts` | `buildDatasetAnalysisProfile`, guards, mappers | 93 |
| `analysis.ts` | KPI rows, deltas, `buildMultiDatasetComparisonAnalysis` | 150 |
| `interpretation.ts` | Warnings, diagnóstico cruzado, recomendaciones | 139 |
| `format.ts` | Formateo ejecutivo y mini-summary | 86 |
| `labels.ts` | Labels Evidence/Readiness | 20 |
| `index.ts` | Barrel export | 52 |
| **Total** | | **~653** |

**Reducción neta en `page.tsx`:** ~517 LOC (dominio extraído; UI y adaptador permanecen).

#### Validación F4A

| Verificación | Resultado |
|--------------|-----------|
| `npm run validate:full` | **PASS** |
| TypeScript | PASS |
| Build | PASS |
| Dataset5 baseline (Evidence 82.7 · Readiness 77.0 · Overall 77.0) | PASS |
| Dataset6 baseline (Evidence 73.3 · Readiness 67.5 · Overall 67.5) | PASS |
| RW Suite | PASS |
| PROD-2A E2E (save/reload, SCI-58 slot restore) | PASS |
| SCI-58 comparison (`validate-hotfix-sci-normality-2.mjs`) | PASS (Δ −9.5, KPIs 77.0/67.5) |

#### Resolución post-F4A/F4B (F4C/F4D)

- F4C: unit tests `comparison/` en gate — **COMPLETADO**
- F4D: unificación mínima de contratos `comparison/` ↔ persistencia — **COMPLETADO**
- Panel slots Datos (opcional extracción UI futura)

---

## 20. Estado del proyecto al cierre de ARCH-5 Fase 4B

Inventario al cierre formal de **ARCH-5 F4B — SCI-58 UI dashboard extraction**:

| Bloque / Hito | Estado |
|---------------|--------|
| ARCH-5 Fase 4B — SCI-58 UI Dashboard Extraction | **COMPLETADO** |
| `ScientificMultiDatasetComparisonDashboard` | **COMPLETADO** (`src/components/comparison/`) |

### Componente `src/components/comparison/` — inventario F4B

| Archivo | Rol | LOC aprox. |
|---------|-----|------------|
| `ScientificMultiDatasetComparisonDashboard.tsx` | Dashboard comparativo KPI (Slots A/B, tabla, normality, warnings, diagnóstico, recomendaciones) | 152 |

**Reducción neta en `page.tsx`:** ~156 LOC.

#### Validación F4B

| Verificación | Resultado |
|--------------|-----------|
| `npm run validate:full` | **PASS** |
| `validate-hotfix-sci-normality-2.mjs` sci58 | **PASS** |
| SCI-58 comparison panel | PASS |
| Δ Readiness −9.5 | PASS |
| KPIs 77.0 / 67.5 | PASS |

---

## 21. Estado del proyecto al cierre de ARCH-5 Fase 4

Inventario al cierre formal de **ARCH-5 Fase 4 — SCI-58 comparison domain/UI/tests/contracts**:

| Bloque / Hito | Estado |
|---------------|--------|
| ARCH-5 Fase 4A — SCI-58 Domain Extraction | **COMPLETADO** |
| ARCH-5 Fase 4B — SCI-58 UI Dashboard Extraction | **COMPLETADO** |
| ARCH-5 Fase 4C — Comparison Unit Tests | **COMPLETADO** |
| ARCH-5 Fase 4D — Runtime/Persistence Contract Consolidation | **COMPLETADO** |
| ARCH-5 Fase 4 | **COMPLETED** |

### Cierre Fase 4

- Dominio SCI-58 consolidado en `src/lib/scientific/comparison/`.
- Dashboard comparativo consolidado en `src/components/comparison/`.
- Tests unitarios comparison integrados y validados: `validate:comparison-unit` PASS (43/43).
- Tipos duplicados exactos reducidos entre `comparison/`, `project/`, `graphEditorProjectIntegration.ts` y `page.tsx`.
- `DatasetAnalysisProfileV1` y `ComparisonSlotV1` permanecen como frontera de persistencia PROD-2A; sin cambios de `schemaVersion`, migraciones, validadores, sanitización, serialización ni formato `.sgproj`.
- Validación final: TypeScript PASS · `validate:comparison-unit` PASS · `validate:prod2a-gate` PASS · `validate:full` PASS.

---

## 22. Estado del proyecto al cierre de UX-1A.1 LITE

Inventario al cierre formal de **UX-1A.1 LITE — Progressive Disclosure Quick Wins**:

| Ítem | Estado | Descripción |
|------|--------|-------------|
| UX-QW-01 — Nombre de proyecto | **COMPLETADO** | Placeholder `"Nombre del proyecto"`; campo vacío para default; fallback interno `"Proyecto sin título"` al guardar |
| GuidedWorkflowPanel singleton | **COMPLETADO** | Una instancia DOM por host tab (`data` / `analysis` / `results` / `reports`); navegación al iniciar y al hidratar sesión activa |
| Sidebar cleanup | **COMPLETADO** | Reportes y Asistente científico navegables; eliminados placeholders contradictorios |
| Welcome cleanup | **COMPLETADO** | Eliminadas tarjetas disabled; panel solo en estado vacío inicial (sin CTAs de scroll/focus) |
| Contador análisis activos | **COMPLETADO** | Badge numérico únicamente en pestaña **Análisis** (`VISIBILITY_KEYS_V1`) |
| Agrupación toggles Estadística | **COMPLETADO** | 6 headers visuales (Descriptiva, Distribución y normalidad, Multivariante, Metodología y publicación, Inferencia, Dashboards); mismos toggles, sin acordeones |

### Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/app/page.tsx` | Workflow singleton, sidebar, welcome, badge Análisis, `InspectorToggleGroup`, agrupación inspector Estadística |
| `src/app/ProjectScientificFilePanel.tsx` | UX-QW-01 placeholder |
| `src/app/projectFileActions.ts` | Fallback `DEFAULT_PROJECT_NAME` al guardar |
| `scripts/validate-prod2a-project-persistence.mjs` | Ajustes E2E alineados a singleton workflow y placeholder (sin cambio de schema `.sgproj`) |

### Restricciones respetadas

- Sin cambios en motores SCI-1→60, PROD-1A/B schema, PROD-2A persistencia/schema, dominios ARCH-5.
- Sin `complexityMode`, Start Screen ni nuevos flujos.
- `npm run validate:full` **PASS** (baseline D5/D6, PROD-2A F5, comparison-unit 43/43).

---

## 22. DATA-3A — Visual Graph Builder + HOTFIX-DATA-3A — **COMPLETED**

Bloque funcional del **Constructor Visual** (Datos → 📊 Constructor Visual): diseño de gráficos desde columnas de la Worksheet, vista previa, creación en Resultados (`projectVisualGraphs`).

| Hito | Estado | Notas |
|------|--------|-------|
| DATA-3A — Visual Graph Builder (v1) | **COMPLETED** | Scatter, Line, Bar, Histogram, Box Plot, Violin |
| HOTFIX-DATA-3A-1 | **PASS** | Flujo Preview → Crear gráfico → tarjeta en Resultados |
| HOTFIX-DATA-3A-2 | **PASS** | Botón y panel de configuración accesibles |
| HOTFIX-DATA-3A-3 | **PASS** | Render Resultados: `GraphPreview` con `aspect={1.8}` (layout responsive) |
| HOTFIX-DATA-3A-4 | **PASS** | `projectVisualGraphs` se vacía en nuevo/restablecer proyecto, eliminar/cambiar/importar dataset |
| HOTFIX-DATA-3A-5 | **PASS** | Estado inicial neutro (`INITIAL_VISUAL_GRAPH_BUILDER_DRAFT`, `graphType: null`) |

**Validación manual (2026-06):** ciclo de vida dataset/proyecto, estado neutro del Builder, preview vacía hasta seleccionar tipo — confirmados.

**Tests:** `npm run validate:visual-graph-builder-unit` (10/10) · `npm run validate:visual-graph-builder-render-unit` PASS

**Archivos principales:** `src/lib/visualGraphBuilder.ts` · `src/components/graph-builder/*` · `src/app/page.tsx`

**Alcance explícito (sesión actual):** gráficos del Constructor en memoria de sesión; **no** persistidos en `.sgproj` por dataset. Evolución futura: **ARCH-6** (§6).

---

## 23. Sprint QA-1 — Validación Manual — **CERRADO**

**Status:** PASS · **Fecha de cierre:** 2026-06-24  
**Protocolo:** [`QA-1_MANUAL_VALIDATION_PROTOCOL.md`](./QA-1_MANUAL_VALIDATION_PROTOCOL.md)  
**Gate automatizado:** `npm run validate:full` — **PASS**

### Alcance validado

| Área | Resultado QA-1 |
|------|----------------|
| Validación manual end-to-end | **COMPLETADA** |
| Constructor Visual (DATA-3A) | **VALIDADO** |
| Worksheet | **VALIDADA** |
| Guided Scientific Workflow (SCI-59) | **VALIDADO** |
| Inspector de Análisis (toggles progressive disclosure) | **VALIDADO** |
| SCI-53 — Evidence Strength Engine | **VALIDADO** (D5: 82.7 · D6: 73.3) |
| SCI-55 — Publication Readiness Analyzer | **VALIDADO** (D5: 77.0 · D6: 67.5) |
| SCI-56 — Methodological Summary Dashboard | **VALIDADO** (D5: Overall 77.0 · D6: 67.5) |
| SCI-60 — Executive Publication Dashboard | **VALIDADO** (D5: Near Ready · D6: Requires Review) |
| `npm run validate:full` | **PASS** |

### Flujo de validación aplicado

```
Importación → Worksheet → Resultados → Workflow → Inspector → Activación de motores → Validación de dashboards
```

La validación confirmó la arquitectura actual post UX-1A.1 LITE: paneles metodológicos visibles **únicamente** tras activación de toggles (default OFF) o pasos del Guided Workflow (SCI-59).

### Observaciones UX

Registradas para futuras mejoras (**ARCH-6**). **No constituyen bugs** ni bloquean el cierre de QA-1:

1. **Estado workflow persistente:** el Guided Scientific Workflow (SCI-59) mantiene su sesión activa (template, paso actual) al navegar entre pestañas Datos / Análisis / Resultados / Reportes, hasta cancelación explícita o reset de sesión/proyecto.

2. **Toggles default OFF:** los dashboards metodológicos (SCI-56, SCI-60) y motores SCI-50→55 requieren activación manual en el Inspector de Análisis o via pasos del workflow T3. El comportamiento histórico donde los dashboards aparecían automáticamente **ya no aplica**.

3. **Cálculo vs visualización:** los motores científicos continúan calculándose en runtime (`useMemo`) aunque la visualización esté desactivada. Esto alimenta cascadas downstream (SCI-55→56→60), captura SCI-58 y secciones del reporte PDF, pero no es evidente para el usuario sin activar toggles.

4. **Auto-toggle acumulativo:** el workflow SCI-59 activa toggles al aplicar pasos pero no los revierte al cancelar el workflow.

### Cierre formal

El **Sprint QA-1 queda cerrado**. El núcleo científico **SCI-1 → SCI-60** se considera validado. **SCI-58 v2 queda COMPLETADO** (ver [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md), §6, `ROADMAP.md`).

**Restricciones de este cierre:** documentación únicamente; sin cambios funcionales, motores SCI, workflow, UI ni lógica científica.

---

Documento generado al cierre de SCI-56 y actualizado tras SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-58, SCI-59, SCI-60, ARCH-5 (Fase 1–4 COMPLETED), PROD-1A, **PROD-2A**, **HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1** (cierre BUG-SERIES-RENDER-1), **ARCH-5 F4A** (SCI-58 domain extraction), **ARCH-5 F4B** (SCI-58 UI dashboard extraction), **ARCH-5 F4C** (comparison unit tests), **ARCH-5 F4D** (runtime/persistence contract consolidation), **UX-1A.1 LITE** (`validate:full` PASS), **DATA-3A / HOTFIX-DATA-3A (COMPLETED)**, **Sprint QA-1 (CERRADO)** y **SCI-58 v2 (COMPLETED)** — ver [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md). Reemplaza a `PROJECT_STATUS_SCI_1-55.md` como referencia de estado general; el cierre SCI-58 v2 tiene documento dedicado.
