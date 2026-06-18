# Scientific Graph AI — Estado del Proyecto (Cierre PROD-1A)

Fecha: 2026-06-16
Versión actual: SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-58 + SCI-59 + SCI-60 + ARCH-5 (Fase 1–3) + PROD-1A
Commit de referencia: `fe4c6f2` (tag `SCI-56`); SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-58, SCI-59, SCI-60, ARCH-5 Fases 1–3 y PROD-1A implementados sobre esta base

---

## 1. Resumen ejecutivo

El proyecto alcanzó el cierre completo del bloque metodológico, las capas ejecutivas de síntesis (multivariante, metodológica y de publicación), la capa de orquestación UX, la capa de comparación multi-dataset, la totalidad del backlog técnico histórico, la etapa evolutiva SCI-57+, **las tres primeras fases de modularización incremental ARCH-5** y **PROD-1A — Scientific Workbook Import Framework** (importación robusta de workbooks científicos con pipeline híbrido fast path + wizard). Tras SCI-55 se resolvieron dos deudas técnicas críticas (HOTFIX-SCI-NORMALITY-2 y BUGFIX SCI-19), se implementó SCI-56 — Methodological Summary Dashboard, se cerraron SCI-29B y SCI-37B, se completó **SCI-57 — Effect Size & Power Engine**, **SCI-57B — Effect-Aware Evidence**, **SCI-60 — Executive Publication Dashboard**, **SCI-59 — Guided Scientific Workflow**, **SCI-58 — Multi-Dataset Comparison Framework**, **ARCH-5 Fases 1–3** (normalidad canónica, workflow SCI-59 e inferencia SCI-12–15 + SCI-57 en `src/lib/scientific/`) y **PROD-1A** (framework de importación en `src/lib/import/` + wizard UI), cerrando los vacíos de magnitud inferencial, evidencia effect-aware, síntesis pre-manuscrito, experiencia de uso guiada, comparación estructurada entre datasets, deuda de monolito en los cuatro dominios acotados identificados en REVIEW-5, POST-SCI-57B REVIEW, POST-SCI-60 REVIEW, POST-SCI-59 REVIEW, PROJECT REVIEW post-SCI-58 y la imposibilidad de importar workbooks científicos reales validados en RW-01→RW-04.

**SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-58, SCI-59, SCI-60, ARCH-5 (Fase 1–3) y PROD-1A están cerrados; el backlog técnico histórico permanece vacío. PROD-1B (validación avanzada + reportes completos) queda como evolución aprobada en plan, no implementada.**

Hitos cerrados en este ciclo:

| Hito | Estado | Descripción |
|------|--------|-------------|
| SCI-55 | APROBADO | Publication Readiness Analyzer (cierre del bloque SCI-50→55) |
| HOTFIX-SCI-NORMALITY-2 | CERRADO | Fuente canónica única de normalidad; eliminación de la dualidad Consenso/Coherencia |
| BUGFIX SCI-19 | CERRADO | Deduplicación de hallazgos en `generateScientificInterpretation()`; warning React eliminado |
| SCI-56 | COMPLETADO | Dashboard ejecutivo del bloque metodológico SCI-50→55 |
| SCI-29B | COMPLETADO | Exclusión de variables constantes en el pipeline de clustering (consistencia con PCA) |
| SCI-37B | COMPLETADO | Ranking compartido y comunicación explícita de empates en Variable Importance |
| SCI-57 | COMPLETADO | Effect Size & Power Engine — magnitud del efecto, IC95% y potencia sobre inferencia existente |
| SCI-57B | COMPLETADO | Inferencia effect-aware en SCI-53 vía `dominantMagnitude` de SCI-57 |
| SCI-60 | COMPLETADO | Executive Publication Dashboard — síntesis read-only pre-manuscrito |
| SCI-59 | COMPLETADO | Guided Scientific Workflow — orquestación UX con templates y wizard |
| SCI-58 | COMPLETADO | Multi-Dataset Comparison Framework basado en DatasetAnalysisProfile y Slots A/B, con dashboard comparativo read-only y sin recalcular motores científicos |
| ARCH-5 Fase 1 | COMPLETADO | Modularización incremental — normalidad canónica y utilidades de texto en `src/lib/scientific/normality/` + `shared/` |
| ARCH-5 Fase 2 | COMPLETADO | Modularización incremental — lógica declarativa SCI-59 Guided Workflow en `src/lib/scientific/workflow/` |
| ARCH-5 Fase 3 | COMPLETADO | Modularización incremental — inferencia SCI-12–15 + SCI-57 Effect Size & Power en `src/lib/scientific/inference/` |
| PROD-1A | COMPLETADO | Scientific Workbook Import Framework — pipeline híbrido fast path + wizard en `src/lib/import/` |

Estado de calidad: **Build PASS · TypeScript PASS · Dataset5 PASS · Dataset6 PASS · PDF PASS · SCI-40 PASS · SCI-56 PASS · SCI-57 PASS · SCI-57B PASS · SCI-60 PASS · SCI-59 PASS · SCI-58 PASS · ARCH-5 Fase 1 PASS · ARCH-5 Fase 2 PASS · ARCH-5 Fase 3 PASS · PROD-1A PASS · RW-01 PASS · RW-02 PASS · RW-03 PASS · RW-04 PASS · t crítico (df=10,18,30) PASS.**

---

## 2. Arquitectura actual

Monolito científico maduro en `src/app/page.tsx` (~27.200 líneas), con módulos incrementales en `src/lib/scientific/`, organizado en capas acumulativas:

| Capa | Rango | Rol |
|------|-------|-----|
| Datos | DATA-1→3 + PROD-1A | Importación CSV/TXT/XLSX/XLS/ODS; fast path legacy en `experimentalData.ts`; framework workbook en `src/lib/import/` + wizard UI |
| Modularización | ARCH-5 F1–3 | `shared/`, `normality/`, `workflow/`, `inference/` — dominios extraídos sin cambio funcional |
| Importación workbook | PROD-1A | `src/lib/import/` — lectura, discovery, detección tabla/encabezados, mapeo X/Y, validación mínima, reporte mínimo |
| Infraestructura UX | ARCH-1→4 | Workspace (Datos/Análisis/Resultados/Reportes), Inspector contextual, módulos activables, tema |
| Orquestación UX | SCI-59 | Guided Scientific Workflow — templates, wizard, auto-toggle y navegación |
| Comparación multi-dataset | SCI-58 | Slots A/B, `DatasetAnalysisProfile` y dashboard comparativo read-only |
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

SCI-58 es capa de comparación read-only (Opción D): captura snapshots `DatasetAnalysisProfile` desde los `useMemo` existentes (SCI-53/55/56/57, normalidad canónica) sin recalcular motores; los slots A/B persisten entre imports de dataset.

**ARCH-5 (Fases 1–3):** extracción incremental move-only; scores, clasificaciones, PDF y builders SCI-11→60 sin cambios semánticos. Fase 1: normalidad canónica + utilidades `shared/`. Fase 2: plan builders SCI-59 (`buildGuidedWorkflowPlan`, templates T1/T2/T3, resolvers); handlers React y `GuidedWorkflowPanel` permanecen en `page.tsx`. Fase 3: calculadores SCI-12–15 + motor SCI-57 (`calculateIndependentTTest`, `calculateOneWayAnova`, `calculateTukeyComparisons`, `calculateMannWhitney`, `calculateKruskalWallis`, `buildEffectSizePowerAnalysis`); toggles, `useMemo` e UI inferencial permanecen en `page.tsx`.

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
- PROD-1A — Scientific Workbook Import Framework

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
- **Arquitectura Slots A/B:** dos slots independientes del dataset activo; captura / actualización / limpieza desde Datos
- **`DatasetAnalysisProfile`:** snapshot inmutable de KPIs en instante de captura (`fileName`, `capturedAt`, series, observaciones, completitud)
- **Dashboard comparativo:** `ScientificMultiDatasetComparisonDashboard` en Resultados con toggle dedicado
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
- Validación: Slot A Dataset5 (Readiness 77.0), Slot B Dataset6 (Readiness 67.5), delta Readiness ≈ −9.5; scores upstream sin regresión

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

SCI-56 muestra: Overall Health Score, 6 tarjetas metodológicas y diagnóstico global.

SCI-60 muestra: Publication Status (SCI-55), KPIs referenciales, normalidad, highlights multivariantes, effect dominante, diagnóstico editorial, riesgos y recomendaciones.

SCI-57 no es dashboard ejecutivo: es motor inferencial con panel propio (📏 Effect Size & Power Engine).

SCI-58 no recalcula motores: compara snapshots capturados; el dataset activo sigue alimentando el análisis mono-dataset y el PDF.

---

## 5. Backlog pendiente

**Backlog técnico histórico: vacío.** SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-58, SCI-59, SCI-60, ARCH-5 (Fase 1–3) y PROD-1A están cerrados y validados.

### Deuda menor documentada

- Commit `69a140d` contiene la implementación de SCI-56 bajo mensaje "HOTFIX-SCI-NORMALITY-2" (trazabilidad corregida vía tag `SCI-56`).
- Dataset6 no produce series `contradictory` con su perfil actual; regla D1 del motor canónico validada solo a nivel de código.
- `overallHealthScore` de SCI-56 promedia 6 scores donde Readiness ya es promedio de los otros 5.
- Falsos negativos Playwright en visibilidad de tarjetas individuales SCI-50→55 (no fallos funcionales).

---

## 6. Candidatos post-ARCH-5 Fase 3 / PROD-1A

Propuestas no aprobadas para la siguiente fase evolutiva. Sin priorización definitiva.

| Candidato | Descripción breve |
|-----------|-------------------|
| **PROD-1B — Validación avanzada + reportes** | Preview expandido, warnings estructurados, `ImportReport` completo, script RW en CI; plan aprobado, no implementado. |
| **ARCH-5 Fase 4+ — Modularización incremental** | Comparison SCI-58, metodología SCI-50→56, reporting, PDF (roadmap ARCH-5). |
| **SCI-58 v2 — Comparación ampliada** | N>2 slots, integración SCI-17/PDF, persistencia entre sesiones o comparación de series completas. |
| **PROD-1 v1.1 — Multi-serie side-by-side** | Importación de layouts `grafico q vs t` (RW-04) como múltiples series en un paso. |

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
| SCI-37B (ranking compartido + empates) | PASS (empate top) | PASS (control negativo) |
| SCI-57 (Effect Size & Power Engine) | PASS (d ≈ −1.36, efecto grande) | PASS (d ≈ −1.98, efecto grande) |
| SCI-57B (evidencia effect-aware) | PASS (Evidence 82.7, Strong) | PASS (Evidence 73.3, Strong) |
| SCI-60 (Executive Publication Dashboard) | PASS (Near Ready, 77.0) | PASS (Requires Review, 67.5) |
| SCI-59 T1 Comparar grupos | PASS | — |
| SCI-59 T2 Explorar estructura (SCI-40) | PASS | — |
| SCI-59 T3 Evaluar publicación (SCI-56/57/60) | PASS | PASS |
| SCI-58 Multi-Dataset Comparison (slots A/B, delta Readiness) | PASS (Slot A 77.0) | PASS (Slot B 67.5, Δ −9.5) |
| ARCH-5 Fase 3 (inferencia modularizada) | PASS | PASS |
| PROD-1A Workbook Import (fast path CSV) | PASS (baselineMatch) | PASS (baselineMatch) |
| PROD-1A RW-Suite (RW-01→RW-04) | PASS | PASS |
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

Build: Compilación OK · TypeScript OK · Exportación PDF OK · `validate-hotfix-sci-normality-2.mjs` (sci57.pass · sci58.pass · sci59.pass · sci60.pass) OK · `validate-t-quantile.mjs` OK · `validate-prod1-rw-suite.mjs` (RW-01→RW-04) OK · scores upstream sin regresión post-ARCH-5 Fase 3 y PROD-1A (baselineMatch D5/D6).

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
- **Modularización incremental (ARCH-5):** cuatro módulos cerrados en `src/lib/scientific/` — `shared/`, `normality/`, `workflow/`, `inference/` — sin cambio funcional ni de scores
- **Comparación multi-dataset (SCI-58):** captura de perfiles en Slots A/B y dashboard comparativo read-only entre datasets
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

**Vacío.** Los candidatos de la sección 6 (PROD-1B, ARCH-5 Fase 4+, SCI-58 v2, PROD-1 v1.1) son evolución futura, no backlog pendiente.

### Áreas abiertas para evolución futura

- PROD-1B — validación avanzada, reportes completos y preview expandido
- ARCH-5 Fase 4 — comparison SCI-58, metodología SCI-50→56, reporting, PDF
- Comparación ampliada N>2 slots o integración reporte/PDF (SCI-58 v2)
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

Cuatro dominios modulares extraídos del monolito; todos **COMPLETADOS** y validados con baseline D5/D6 idéntico.

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
- Motores SCI-50→60, SCI-58 comparison, Advisor
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

## 16. PROD-2A — Project File Core (cerrado)

Persistencia local de proyectos científicos en `.sgproj` (F0–F6 completados).

| Entregable | Estado |
|------------|--------|
| Dominio `src/lib/project/` | ✅ |
| Boundary `collectProjectSnapshot` / `applyHydrateProjectPatch` | ✅ |
| UX sidebar (Nuevo / Guardar / Abrir) | ✅ F4 |
| E2E save→reload Dataset5/6 + SCI-58/59 | ✅ F5 |
| Hardening UX + mensajes + gate final | ✅ F6 |

**Persiste:** dataset, toggles/modos/selecciones, SCI-59 session, SCI-58 slot KPIs, workspace, graphContext opcional.

**No persiste:** outputs SCI-53→60, PDF, Advisor, Supabase graphs.

**Validación:**

```bash
npm run validate:prod2a-gate
```

---

## 17. Próximos pasos recomendados

1. **Implementar PROD-1B** — validación avanzada + reportes completos sobre `src/lib/import/`.
2. **Continuar ARCH-5 Fase 4** — extracción comparison SCI-58, metodología SCI-50→56 o reporting según roadmap.
3. **Formalizar la suite de validación** (Playwright + `validate-t-quantile.mjs` + `validate-prod1-rw-suite.mjs` + `validate-prod2a-gate`) como herramienta de regresión continua.
4. **Validar la regla `contradictory`** con un dataset diseñado para el caso D1 del motor canónico.
5. **Evaluar SCI-58 v2** tras completar dominios upstream modularizados.

---

Documento generado al cierre de SCI-56 y actualizado tras SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-58, SCI-59, SCI-60, ARCH-5 (Fase 1–3), PROD-1A y **PROD-2A**. Reemplaza a `PROJECT_STATUS_SCI_1-55.md` como referencia de estado actual.
