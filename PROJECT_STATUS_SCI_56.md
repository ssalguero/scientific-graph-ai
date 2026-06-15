# Scientific Graph AI — Estado del Proyecto (Cierre SCI-59)

Fecha: 2026-06-15
Versión actual: SCI-56 + SCI-29B + SCI-37B + SCI-57 + SCI-57B + SCI-60 + SCI-59
Commit de referencia: `fe4c6f2` (tag `SCI-56`); SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-60 y SCI-59 implementados sobre esta base

---

## 1. Resumen ejecutivo

El proyecto alcanzó el cierre completo del bloque metodológico, las capas ejecutivas de síntesis (multivariante, metodológica y de publicación), la capa de orquestación UX, la totalidad del backlog técnico histórico y la etapa evolutiva SCI-57+. Tras SCI-55 se resolvieron dos deudas técnicas críticas (HOTFIX-SCI-NORMALITY-2 y BUGFIX SCI-19), se implementó SCI-56 — Methodological Summary Dashboard, se cerraron SCI-29B y SCI-37B, se completó **SCI-57 — Effect Size & Power Engine**, **SCI-57B — Effect-Aware Evidence**, **SCI-60 — Executive Publication Dashboard** y **SCI-59 — Guided Scientific Workflow**, cerrando los vacíos de magnitud inferencial, evidencia effect-aware, síntesis pre-manuscrito y experiencia de uso guiada identificados en REVIEW-5, POST-SCI-57B REVIEW y POST-SCI-60 REVIEW.

**SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-60 y SCI-59 están cerrados; el backlog técnico histórico permanece vacío.**

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

Estado de calidad: **Build PASS · TypeScript PASS · Dataset5 PASS · Dataset6 PASS · PDF PASS · SCI-40 PASS · SCI-56 PASS · SCI-57 PASS · SCI-57B PASS · SCI-60 PASS · SCI-59 PASS · t crítico (df=10,18,30) PASS.**

---

## 2. Arquitectura actual

Monolito científico maduro en `src/app/page.tsx` (~30.730 líneas), organizado en capas acumulativas:

| Capa | Rango | Rol |
|------|-------|-----|
| Datos | DATA-1→3 | Importación CSV/TXT/XLSX/ODS en `src/lib/experimentalData.ts` |
| Infraestructura UX | ARCH-1→4 | Workspace (Datos/Análisis/Resultados/Reportes), Inspector contextual, módulos activables, tema |
| Orquestación UX | SCI-59 | Guided Scientific Workflow — templates, wizard, auto-toggle y navegación |
| Núcleo científico | SCI-1→27 | Estadística descriptiva, distribución, inferencia |
| Inferencia ampliada | SCI-57 + SCI-57B | Effect Size & Power Engine + evidencia effect-aware en SCI-53 |
| Multivariante | SCI-28→40 | PCA, clustering, redes, proyecciones + dashboard SCI-40 |
| Exploradores avanzados | SCI-41→49 | MANOVA, LDA, CCA, PCR, PLS, Bootstrap, Sensitivity, t-SNE, UMAP |
| Evaluación metodológica | SCI-50→55 | Motores de consistencia, calidad, reproducibilidad, evidencia, supuestos y preparación |
| Síntesis metodológica | SCI-56 | Dashboard ejecutivo del bloque metodológico |
| Síntesis de publicación | SCI-60 | Executive Publication Dashboard (read-only, pre-manuscrito) |

### Fuente canónica de normalidad (post-hotfix)

```
SCI-11 / SCI-21 / SCI-22 / SCI-26 (algoritmos intactos)
        ↓
buildCanonicalNormalityAssessment()   ← único motor de decisión
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

SCI-57 es capa de síntesis sobre inferencia: no recalcula tests ni modifica p-valores; deriva effect size, IC y potencia de resultados existentes.

SCI-57B integra `dominantMagnitude` de SCI-57 en el componente `inferenceScore` de SCI-53 (mapeo 55/70/80/95); SCI-55 y SCI-56 heredan el delta vía cascada.

SCI-60 consume SCI-55 (status primario), SCI-56, SCI-53, SCI-40, SCI-57 y normalidad canónica sin score ejecutivo nuevo.

SCI-59 consume normalidad canónica, `buildStatisticalRecommendation` y contexto de series para ramificar templates; conduce hacia SCI-40 (T2) y SCI-60 (T3).

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

---

## 4. Dashboards y capas de síntesis disponibles

| Capa | ID | Rol | Ubicación UI |
|------|----|-----|--------------|
| 🧭 Guided Scientific Workflow | SCI-59 | Orquestación UX (templates + wizard) | Datos · Análisis · Resultados |
| 📊 Multivariate Summary Dashboard | SCI-40 | SCI-28→39 | Resultados → Resultados matemáticos |
| 🔬 Evaluación integrada de normalidad | HOTFIX | SCI-11/21/22/26 | Resultados → Resultados matemáticos |
| 📋 Methodological Summary Dashboard | SCI-56 | SCI-50→55 | Resultados → Resultados matemáticos |
| 📰 Executive Publication Dashboard | SCI-60 | SCI-55 + SCI-56 + SCI-53/57B + SCI-40 + SCI-57 + normalidad | Resultados → Resultados matemáticos |

SCI-59 no es dashboard analítico: orquesta toggles, navegación workspace e inspector hacia motores y dashboards existentes.

SCI-56 muestra: Overall Health Score, 6 tarjetas metodológicas y diagnóstico global.

SCI-60 muestra: Publication Status (SCI-55), KPIs referenciales, normalidad, highlights multivariantes, effect dominante, diagnóstico editorial, riesgos y recomendaciones.

SCI-57 no es dashboard ejecutivo: es motor inferencial con panel propio (📏 Effect Size & Power Engine).

---

## 5. Backlog pendiente

**Backlog técnico histórico: vacío.** SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-60 y SCI-59 están cerrados y validados.

### Deuda menor documentada

- Commit `69a140d` contiene la implementación de SCI-56 bajo mensaje "HOTFIX-SCI-NORMALITY-2" (trazabilidad corregida vía tag `SCI-56`).
- Dataset6 no produce series `contradictory` con su perfil actual; regla D1 del motor canónico validada solo a nivel de código.
- `overallHealthScore` de SCI-56 promedia 6 scores donde Readiness ya es promedio de los otros 5.
- Falsos negativos Playwright en visibilidad de tarjetas individuales SCI-50→55 (no fallos funcionales).

---

## 6. Candidatos post-SCI-59

Propuestas no aprobadas para la siguiente fase evolutiva. Sin priorización definitiva.

| Candidato | Descripción breve |
|-----------|-------------------|
| **SCI-58 — Multi-Dataset Comparison Framework** | Modo de sesión con 2+ datasets: comparación lado a lado de estadísticas, normalidad, estructuras multivariantes y health scores. |
| **ARCH-5 — Modular Architecture Refactor** | Extraer motores, builders y tipos de `page.tsx` (~31K líneas) a módulos independientes para sostenibilidad del monolito. |

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

Build: Compilación OK · TypeScript OK · Exportación PDF OK · `validate-hotfix-sci-normality-2.mjs` (sci59.pass) OK · `validate-t-quantile.mjs` OK · scores upstream sin regresión post-SCI-59.

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
- **Workflow guiado (SCI-59):** 3 templates con wizard, auto-toggle y navegación hacia el camino analítico correcto
- Estadística descriptiva, distribución, normalidad canónica unificada, outliers y correlación
- Inferencia paramétrica y no paramétrica con magnitud del efecto, IC95% y potencia (SCI-57)
- Evidencia metodológica effect-aware en SCI-53 (SCI-57B)
- Análisis multivariante completo (PCA, clustering, MDS, redes, Variable Importance con empates explícitos)
- Exploradores avanzados (MANOVA, LDA, CCA, PCR, PLS, Bootstrap, Sensitivity, t-SNE, UMAP)
- Evaluación metodológica automatizada (SCI-50→55) con dashboard ejecutivo (SCI-56)
- Síntesis pre-manuscrito read-only (SCI-60): status de publicación, KPIs referenciales, diagnóstico editorial cruzado
- Advisor Estadístico, interpretación científica (SCI-19/20) y exportación PDF completa
- Modo experto: todos los toggles y módulos permanecen accesibles independientemente del workflow

### Backlog técnico

**Vacío.** Los candidatos de la sección 6 (SCI-58, ARCH-5) son evolución futura, no backlog pendiente.

### Áreas abiertas para evolución futura

- Comparación entre datasets (SCI-58)
- Modularización arquitectónica del monolito (ARCH-5)
- Enriquecimiento narrativo SCI-57B en SCI-55/56 (opcional, no bloqueante)
- SCI-59 v1.1: branching condicional avanzado, persistencia de workflow, orquestación SCI-41→49
- Validación formal con dataset `contradictory` y suite Playwright como CI de regresión

---

## 12. Próximos pasos recomendados

1. **Definir la siguiente fase evolutiva** a partir de los candidatos de la sección 6 (SCI-58, ARCH-5).
2. **Formalizar la suite de validación** (Playwright + `validate-t-quantile.mjs`) como herramienta de regresión continua.
3. **Validar la regla `contradictory`** con un dataset diseñado para el caso D1 del motor canónico.
4. **Evaluar ARCH-5** antes de que el monolito supere las ~31K líneas.

---

Documento generado al cierre de SCI-56 y actualizado tras SCI-29B, SCI-37B, SCI-57, SCI-57B, SCI-60 y SCI-59. Reemplaza a `PROJECT_STATUS_SCI_1-55.md` como referencia de estado actual.
