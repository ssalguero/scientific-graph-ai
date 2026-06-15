# Scientific Graph AI — Estado del Proyecto (Cierre SCI-57)

Fecha: 2026-06-15
Versión actual: SCI-56 + SCI-29B + SCI-37B + SCI-57
Commit de referencia: `fe4c6f2` (tag `SCI-56`); SCI-29B, SCI-37B y SCI-57 implementados sobre esta base

---

## 1. Resumen ejecutivo

El proyecto alcanzó el cierre completo del bloque metodológico, su capa ejecutiva de síntesis, la totalidad del backlog técnico histórico y la primera capacidad de la nueva etapa evolutiva SCI-57+. Tras SCI-55 se resolvieron dos deudas técnicas críticas (HOTFIX-SCI-NORMALITY-2 y BUGFIX SCI-19), se implementó SCI-56 — Methodological Summary Dashboard, se cerraron SCI-29B y SCI-37B, y se completó **SCI-57 — Effect Size & Power Engine**, cerrando el principal vacío metodológico identificado en REVIEW-5 (magnitud del efecto, intervalos de confianza y potencia estadística).

**SCI-29B, SCI-37B y SCI-57 están cerrados; el backlog técnico histórico permanece vacío.**

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

Estado de calidad: **Build PASS · TypeScript PASS · Dataset5 PASS · Dataset6 PASS · PDF PASS · t crítico (df=10,18,30) PASS.**

---

## 2. Arquitectura actual

Monolito científico maduro en `src/app/page.tsx` (~29.000 líneas), organizado en capas acumulativas:

| Capa | Rango | Rol |
|------|-------|-----|
| Datos | DATA-1→3 | Importación CSV/TXT/XLSX/ODS en `src/lib/experimentalData.ts` |
| Infraestructura UX | ARCH-1→4 | Workspace (Datos/Análisis/Resultados/Reportes), Inspector contextual, módulos activables, tema |
| Núcleo científico | SCI-1→27 | Estadística descriptiva, distribución, inferencia |
| Inferencia ampliada | SCI-57 | Effect Size & Power Engine (síntesis sobre t-Test, ANOVA, Tukey, no paramétricas) |
| Multivariante | SCI-28→40 | PCA, clustering, redes, proyecciones + dashboard SCI-40 |
| Exploradores avanzados | SCI-41→49 | MANOVA, LDA, CCA, PCR, PLS, Bootstrap, Sensitivity, t-SNE, UMAP |
| Evaluación metodológica | SCI-50→55 | Motores de consistencia, calidad, reproducibilidad, evidencia, supuestos y preparación |
| Síntesis metodológica | SCI-56 | Dashboard ejecutivo del bloque metodológico |

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

### Cascada metodológica

```
SCI-50..54 (motores independientes)
        ↓
SCI-55 Publication Readiness (promedio de 5 motores)
        ↓
SCI-56 Methodological Summary Dashboard (síntesis de los 6)
```

SCI-56 es capa de solo lectura: no recalcula algoritmos ni modifica scores upstream.

SCI-57 es capa de síntesis sobre inferencia: no recalcula tests ni modifica p-valores; deriva effect size, IC y potencia de resultados existentes.

---

## 3. Funcionalidades completadas

### Bloques cerrados

- SCI-1 → SCI-27 — Núcleo científico
- SCI-28 → SCI-40 — Análisis multivariante (incluye Multivariate Dashboard)
- SCI-41 → SCI-49 — Exploradores avanzados
- SCI-50 → SCI-55 — Evaluación metodológica
- SCI-56 — Síntesis metodológica
- SCI-57 — Effect Size & Power Engine

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
- **Effect Size:**
  - Cohen's d (t-Test)
  - Hedges' g (t-Test, corrección para muestras pequeñas)
  - Eta² (ANOVA)
  - Omega² (ANOVA)
  - r effect size (Mann-Whitney)
  - Cliff's Delta — magnitud (Mann-Whitney)
  - Epsilon² (Kruskal-Wallis)
- **Confidence Intervals:**
  - IC95% de Cohen's d (aproximación asintótica)
  - IC95% de la diferencia de medias (t-based, `T_CRITICAL_95_TABLE` con interpolación)
  - IC95% aproximado por par en Tukey (q crítico simplificado)
- **Prospective Power:** n por grupo recomendado para detectar el efecto observado con potencia 80% (α = 0.05) — métrica principal
- **Observed Power:** potencia observada aproximada con **disclaimer explícito** (no usar para justificar resultados no significativos; no participa en scoring)
- Toggle "Mostrar Effect Size & Power" + panel 📏 Effect Size & Power Engine
- Integraciones: SCI-17 (sección propia), SCI-19 (`pushUniqueFinding`/`pushUniqueWarning`), SCI-20, PDF (vía `report.sections`)
- Priorización de métricas no paramétricas cuando la normalidad canónica es `non-normal`/`contradictory`
- **Sin cambios en SCI-53** (Evidence Strength Engine — `inferenceScore` binario intacto)
- **Sin cambios en SCI-55** (Publication Readiness Analyzer)
- **Sin cambios en SCI-56** (Overall Health Score Dataset5 77.2 / Dataset6 67.7 idénticos pre/post)
- **Sin cambios en Advisor Estadístico**
- Validación t crítico: df=10 → 2.2280, df=18 → 2.1010, df=30 → 2.0420 (script `validate-t-quantile.mjs`, tolerancia < 0.01)
- Dataset5: Cohen's d ≈ −1.36 (efecto grande), IC95% excluye 0, potencia prospectiva presente
- Dataset6: métricas coherentes; control negativo de regresión en SCI-56

---

## 4. Dashboards disponibles

| Dashboard | ID | Bloque sintetizado | Ubicación UI |
|-----------|----|--------------------|--------------|
| 📊 Multivariate Summary Dashboard | SCI-40 | SCI-28→39 | Resultados → Resultados matemáticos |
| 🔬 Evaluación integrada de normalidad | HOTFIX | SCI-11/21/22/26 | Resultados → Resultados matemáticos |
| 📋 Methodological Summary Dashboard | SCI-56 | SCI-50→55 | Resultados → Resultados matemáticos |

SCI-56 muestra: Overall Health Score, número de motores evaluados, 6 tarjetas (Consistency, Quality, Reproducibility, Evidence, Assumptions, Publication) con score y clasificación, y diagnóstico global por reglas.

SCI-57 no es dashboard ejecutivo: es motor inferencial con panel propio (📏 Effect Size & Power Engine).

---

## 5. Backlog pendiente

**Backlog técnico histórico: vacío.** SCI-29B, SCI-37B y SCI-57 están cerrados y validados.

### Deuda menor documentada

- Commit `69a140d` contiene la implementación de SCI-56 bajo mensaje "HOTFIX-SCI-NORMALITY-2" (trazabilidad corregida vía tag `SCI-56`).
- Dataset6 no produce series `contradictory` con su perfil actual; regla D1 del motor canónico validada solo a nivel de código.
- `overallHealthScore` de SCI-56 promedia 6 scores donde Readiness ya es promedio de los otros 5.
- SCI-53 aún no incorpora effect size en su `inferenceScore` (candidato SCI-57B, no backlog histórico).

---

## 6. Candidatos SCI-57+

Propuestas no aprobadas para la siguiente fase evolutiva. Sin priorización definitiva ni análisis de impacto.

| Candidato | Descripción breve |
|-----------|-------------------|
| **SCI-57B — Effect-Aware Evidence & Readiness** | Enriquecer SCI-53 y SCI-55 para que el score de evidencia y publication readiness incorpore magnitud del efecto y potencia, consumiendo SCI-57 como fuente. |
| **SCI-58 — Multi-Dataset Comparison Framework** | Modo de sesión con 2+ datasets: comparación lado a lado de estadísticas, normalidad, estructuras multivariantes y health scores. |
| **SCI-59 — Guided Scientific Workflow** | Wizard orientado por pregunta de investigación que activa módulos, ejecuta el camino analítico correcto y explica cada decisión metodológica. |
| **SCI-60 — Executive Publication Dashboard** | Capa ejecutiva de síntesis orientada a publicación: consolidación de SCI-40, SCI-56, normalidad integrada y SCI-57 en vista de manuscrito. |
| **ARCH-5 — Modular Architecture Refactor** | Extraer motores, builders y tipos de `page.tsx` (~29K líneas) a módulos independientes para sostenibilidad del monolito. |

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
| SCI-56 dashboard (6 tarjetas + diagnóstico) | PASS | PASS |
| SCI-29B (exclusión de constantes en clustering) | PASS (control negativo) | PASS (pH excluida) |
| SCI-37B (ranking compartido + empates) | PASS (empate top) | PASS (control negativo) |
| SCI-57 (Effect Size & Power Engine) | PASS (d ≈ −1.36, efecto grande) | PASS (sin regresiones) |
| Export PDF (SCI-56 + SCI-57) | PASS | PASS |
| t crítico IC95% (df=10, 18, 30) | PASS (2.228 / 2.101 / 2.042) | — |

Resultados observados de SCI-56 (sin cambios post-SCI-57):

| Métrica | Dataset5 | Dataset6 |
|---------|----------|----------|
| Overall Health Score | 77.2 | 67.7 |
| Consistency | 91.7 (Very Strong) | 66.7 (Moderate) |
| Quality | 80.0 (Good) | 60.0 (Acceptable) |
| Reproducibility | 70.5 (High) | 67.7 (Moderate) |
| Evidence | 83.7 (Strong) | 74.3 (Strong) |
| Assumptions | 60.0 (Moderate) | 70.0 (Good) |
| Publication | 77.2 (Near Ready) | 67.7 (Requires Review) |

Impacto observado de SCI-57 (Dataset5):

| Punto | Resultado |
|-------|-----------|
| Cohen's d | ≈ −1.36 (efecto grande) |
| IC95% diferencia de medias | Excluye 0 |
| Potencia prospectiva | Presente en panel, SCI-17, SCI-19 y PDF |
| SCI-56 Overall Health Score | 77.2 (sin cambios) |

Build: Compilación OK · TypeScript OK · Exportación PDF OK · `validate-t-quantile.mjs` OK.

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

Inventario completo de hitos al cierre de la etapa SCI-56 + SCI-29B + SCI-37B + SCI-57:

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |
| SCI-57 — Effect Size & Power Engine | COMPLETADO |

### Capacidades científicas actuales

Scientific Graph AI resuelve hoy el ciclo completo de análisis de un dataset experimental tabular:

- Importación multi-formato y workspace científico (Datos → Análisis → Resultados → Reportes)
- Estadística descriptiva, distribución, normalidad canónica unificada, outliers y correlación
- Inferencia paramétrica y no paramétrica (t-Test, ANOVA, Tukey, Mann-Whitney, Kruskal-Wallis) con **magnitud del efecto, intervalos de confianza y potencia** (SCI-57)
- Análisis multivariante completo (PCA, clustering, MDS, redes, Variable Importance con empates explícitos)
- Exploradores avanzados (MANOVA, LDA, CCA, PCR, PLS, Bootstrap, Sensitivity, t-SNE, UMAP)
- Evaluación metodológica automatizada (SCI-50→55) con dashboard ejecutivo (SCI-56)
- Advisor Estadístico, interpretación científica (SCI-19/20) y exportación PDF completa

### Backlog técnico

**Vacío.** No quedan ítems de deuda histórica abiertos. SCI-57B y los candidatos de la sección 6 son evolución futura, no backlog pendiente.

### Áreas abiertas para evolución futura

- Enriquecimiento effect-aware de SCI-53/55 (SCI-57B)
- Comparación entre datasets (SCI-58)
- Workflow científico guiado (SCI-59)
- Dashboard ejecutivo de publicación (SCI-60)
- Modularización arquitectónica del monolito (ARCH-5)
- Validación formal con dataset `contradictory` y suite Playwright como CI de regresión

---

## 10. Próximos pasos recomendados

1. **Definir la siguiente fase evolutiva** a partir de los candidatos de la sección 6 (SCI-57B, SCI-58, ARCH-5 u otros).
2. **Formalizar la suite de validación** (Playwright + `validate-t-quantile.mjs`) como herramienta de regresión continua.
3. **Validar la regla `contradictory`** con un dataset diseñado para el caso D1 del motor canónico.
4. **Evaluar ARCH-5** antes de que el monolito supere las ~30K líneas.

---

Documento generado al cierre de SCI-56 y actualizado tras SCI-29B, SCI-37B y SCI-57. Reemplaza a `PROJECT_STATUS_SCI_1-55.md` como referencia de estado actual.
