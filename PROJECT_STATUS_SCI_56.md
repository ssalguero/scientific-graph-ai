# Scientific Graph AI — Estado del Proyecto (Cierre SCI-37B)

Fecha: 2026-06-10
Versión actual: SCI-56 + SCI-29B + SCI-37B
Commit de referencia: `fe4c6f2` (tag `SCI-56`); SCI-29B y SCI-37B implementados sobre esta base

---

## 1. Resumen ejecutivo

El proyecto alcanzó el cierre completo del bloque metodológico, su capa ejecutiva de síntesis y la totalidad del backlog técnico histórico. Tras SCI-55 se resolvieron dos deudas técnicas críticas (HOTFIX-SCI-NORMALITY-2 y BUGFIX SCI-19), se implementó SCI-56 — Methodological Summary Dashboard, y se cerraron los dos ítems de backlog pendientes: SCI-29B (variables constantes en clustering) y SCI-37B (empates en Variable Importance). **SCI-29B y SCI-37B están cerrados; el backlog técnico histórico queda vacío.**

Hitos cerrados en este ciclo:

| Hito | Estado | Descripción |
|------|--------|-------------|
| SCI-55 | APROBADO | Publication Readiness Analyzer (cierre del bloque SCI-50→55) |
| HOTFIX-SCI-NORMALITY-2 | CERRADO | Fuente canónica única de normalidad; eliminación de la dualidad Consenso/Coherencia |
| BUGFIX SCI-19 | CERRADO | Deduplicación de hallazgos en `generateScientificInterpretation()`; warning React eliminado |
| SCI-56 | COMPLETADO | Dashboard ejecutivo del bloque metodológico SCI-50→55 |
| SCI-29B | COMPLETADO | Exclusión de variables constantes en el pipeline de clustering (consistencia con PCA) |
| SCI-37B | COMPLETADO | Ranking compartido y comunicación explícita de empates en Variable Importance |

Estado de calidad: Build OK, TypeScript OK, Dataset5 PASS, Dataset6 PASS, PDF OK, repositorio sincronizado con origin.

---

## 2. Arquitectura actual

Monolito científico maduro en `src/app/page.tsx` (~28.000 líneas), organizado en capas acumulativas:

| Capa | Rango | Rol |
|------|-------|-----|
| Datos | DATA-1→3 | Importación CSV/TXT/XLSX/ODS en `src/lib/experimentalData.ts` |
| Infraestructura UX | ARCH-1→4 | Workspace (Datos/Análisis/Resultados/Reportes), Inspector contextual, módulos activables, tema |
| Núcleo científico | SCI-1→27 | Estadística descriptiva, distribución, inferencia |
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

---

## 3. Funcionalidades completadas

### Bloques cerrados

- SCI-1 → SCI-27 — Núcleo científico
- SCI-28 → SCI-40 — Análisis multivariante (incluye Multivariate Dashboard)
- SCI-41 → SCI-49 — Exploradores avanzados
- SCI-50 → SCI-55 — Evaluación metodológica
- SCI-56 — Síntesis metodológica

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
- Exclusión de variables constantes en Distance Matrix
- Exclusión en Hierarchical Clustering
- Exclusión en MDS
- Exclusión heredada en SCI-38 (Cluster Heatmap) y SCI-39 (Clustered Distance Heatmap)
- Consistencia metodológica con PCA (`CLUSTERING_CONSTANT_EPSILON`, partición activas/constantes)
- Gate: < 2 variables no constantes → análisis `null`
- Aviso explícito de exclusión en interpretación, SCI-17/19/20 y PDF
- Dataset6 validado con exclusión de pH (clustering pasa de 4 a 3 variables)
- SCI-40 actualizado automáticamente (Clustering 3 grupos, Similaridad 0.73 → 0.67)
- SCI-56 sin impacto funcional relevante (variación de redondeo en Reproducibility 67.7 → 67.6)
- Dataset5 como control negativo: comportamiento idéntico pre/post

**SCI-37B — Tie-Aware Variable Importance Ranking (COMPLETED)**
- Ranking compartido (competition ranking 1, 1, 3) con detección por `VARIABLE_IMPORTANCE_TIE_EPSILON` (0.05, tolerante al ruido numérico de power iteration en contribuciones PCA)
- Scores y `normalizedScore` intactos: solo cambian `rank` y la comunicación
- Frase explícita de empate en la interpretación de SCI-37
- SCI-40 tie-aware: tarjeta "Variable líder" con co-líderes ("Control1 / Tratamiento2 — 100% — empate") y diagnóstico "comparten la posición dominante"
- SCI-19/SCI-20 tie-aware: findings de dominancia y consistencia cruzada (PCA/correlación/similitud) evaluados sobre el grupo de co-líderes
- Propagación a SCI-17 y PDF vía report lines ("(empate)" en el ranking)
- Corrección de bug latente: key React del ranking por variable (antes por rank, que habría duplicado claves)
- Helpers nuevos: `areVariableImportanceScoresTied`, `getTopVariableImportanceEntries`, `hasVariableImportanceTopTie`, `formatVariableImportanceCoLeaders`
- Tipos: `VariableImportanceEntry.isSharedRank`, `summaryCards.topVariableTied`

---

## 4. Dashboards disponibles

| Dashboard | ID | Bloque sintetizado | Ubicación UI |
|-----------|----|--------------------|--------------|
| 📊 Multivariate Summary Dashboard | SCI-40 | SCI-28→39 | Resultados → Resultados matemáticos |
| 🔬 Evaluación integrada de normalidad | HOTFIX | SCI-11/21/22/26 | Resultados → Resultados matemáticos |
| 📋 Methodological Summary Dashboard | SCI-56 | SCI-50→55 | Resultados → Resultados matemáticos |

SCI-56 muestra: Overall Health Score, número de motores evaluados, 6 tarjetas (Consistency, Quality, Reproducibility, Evidence, Assumptions, Publication) con score y clasificación, y diagnóstico global por reglas.

---

## 5. Backlog pendiente

**Backlog técnico histórico: vacío.** SCI-29B y SCI-37B, los dos últimos ítems documentados, están cerrados y validados.

### Deuda menor documentada

- Commit `69a140d` contiene la implementación de SCI-56 bajo mensaje "HOTFIX-SCI-NORMALITY-2" (ya en remoto; trazabilidad corregida vía tag `SCI-56` y commit de docs `fe4c6f2`).
- Dataset6 no produce series `contradictory` con su perfil actual; la regla D1 del motor canónico queda validada solo a nivel de código (pendiente dataset alternativo).
- `overallHealthScore` de SCI-56 promedia 6 scores donde Readiness ya es promedio de los otros 5 (sobreponderación leve y deliberada de la media global).

---

## 6. Posibles candidatos SCI-57+

Propuestas no aprobadas, ordenadas por valor estimado:

| Candidato | Tipo | Justificación |
|-----------|------|---------------|
| Dataset de regresión con caso `contradictory` | Validación | Cubrir la regla D1 del motor canónico con evidencia funcional |
| ARCH-5 — Modularización de `page.tsx` | Arquitectura | ~28K líneas en un archivo; extraer motores y builders a módulos |
| Drill-down en SCI-56 | UX | Click en tarjeta → navegar/expandir el panel del motor correspondiente |
| Export ejecutivo del dashboard | Reportes | PDF/PNG de una página con SCI-40 + SCI-56 + normalidad integrada |
| Suite de validación automatizada | Calidad | Formalizar el script Playwright usado en las validaciones de este ciclo |

---

## 7. Estado de validación

| Verificación | Dataset5 | Dataset6 |
|--------------|----------|----------|
| Evaluación integrada de normalidad | PASS | PASS |
| SCI-17 (sección única, sin legacy) | PASS | PASS |
| SCI-19 (sin duplicados, sin warnings React) | PASS | PASS |
| SCI-20 | PASS | PASS |
| Motores SCI-46/51/52/54/55 | PASS | PASS |
| SCI-56 dashboard (6 tarjetas + diagnóstico) | PASS | PASS |
| SCI-29B (exclusión de constantes en clustering) | PASS (control negativo, sin cambios) | PASS (pH excluida) |
| SCI-37B (ranking compartido + empates explícitos) | PASS (empate top Control1/Tratamiento2) | PASS (líder único + empate intermedio) |
| Export PDF (incluye sección SCI-56) | PASS | PASS |

Resultados observados de SCI-56:

| Métrica | Dataset5 | Dataset6 |
|---------|----------|----------|
| Overall Health Score | 77.2 | 67.7 |
| Consistency | 91.7 (Very Strong) | 66.7 (Moderate) |
| Quality | 80.0 (Good) | 60.0 (Acceptable) |
| Reproducibility | 70.5 (High) | 67.7 (Moderate) |
| Evidence | 83.7 (Strong) | 74.3 (Strong) |
| Assumptions | 60.0 (Moderate) | 70.0 (Good) |
| Publication | 77.2 (Near Ready) | 67.7 (Requires Review) |

Impacto observado de SCI-29B (Dataset6 pre/post):

| Métrica | Pre | Post |
|---------|-----|------|
| Variables en clustering | 4 (incluía pH constante) | 3 (pH excluida con aviso) |
| SCI-40 · Clustering | 4 grupos | 3 grupos |
| SCI-40 · Similaridad | 0.73 | 0.67 |
| SCI-56 · Overall Health Score | 67.7 | 67.7 |
| SCI-56 · Reproducibility | 67.7 | 67.6 |

Impacto observado de SCI-37B (pre/post):

| Punto | Pre | Post |
|-------|-----|------|
| Dataset5 · SCI-37 ranking | 1, 2, 3, 4 (arbitrario por orden de columna) | 1, 1, 3, 3 + "(empate)" + frase de empate explícita |
| Dataset5 · SCI-40 Variable líder | "Control1 — 100%" + "domina la estructura informativa" | "Control1 / Tratamiento2 — 100% — empate" + "comparten la posición dominante" |
| Dataset5 · SCI-19/20 | Dominancia única arbitraria | Findings tie-aware sobre el grupo de co-líderes |
| Dataset6 · SCI-37 ranking | 1, 2, 3, 4 | 1, 2, 2, 4 (empate intermedio Temperatura/Presion comunicado) |
| Dataset6 · SCI-40 / SCI-56 | — | Sin cambios (líder único Humedad; Overall 67.7) — control negativo |
| Scores numéricos (ambos datasets) | — | Intactos |

Build: Compilación OK · TypeScript OK · Exportación PDF OK.

Git: `main` sincronizado con origin; tags `SCI-55`, `HOTFIX-SCI-NORMALITY-2`, `SCI-56` publicados.

---

## 8. Estado del proyecto al cierre de SCI-37B

Inventario completo de hitos al cierre formal del backlog técnico histórico:

| Bloque / Hito | Estado |
|---------------|--------|
| SCI-1 → SCI-55 | COMPLETADOS |
| HOTFIX-SCI-NORMALITY-2 | COMPLETADO |
| BUGFIX SCI-19 | COMPLETADO |
| SCI-56 — Methodological Summary Dashboard | COMPLETADO |
| SCI-29B — Constant Variable Exclusion in Clustering | COMPLETADO |
| SCI-37B — Tie-Aware Variable Importance Ranking | COMPLETADO |

No queda ningún ítem de backlog técnico histórico abierto. Toda la funcionalidad científica planificada hasta la fecha está implementada, validada con Dataset5 y Dataset6, e integrada en SCI-17, SCI-19, SCI-20 y la exportación PDF.

---

## 9. Preparación para SCI-57+

El proyecto queda formalmente listo para abrir una nueva etapa evolutiva:

- Base de código estable: Build OK, TypeScript OK, sin warnings React, sin regresiones detectadas.
- Pipeline de validación funcional reproducible (Playwright + Dataset5/Dataset6 + verificación de PDF) disponible como punto de partida para regresión.
- Arquitectura de dashboards por bloque completa (SCI-40, normalidad integrada, SCI-56) como patrón de referencia para futuras capas de síntesis.
- Backlog técnico histórico vacío: cualquier trabajo nuevo parte de una definición SCI-57+ y no de deuda heredada.

Esta sección no define funcionalidades nuevas; los candidatos de la sección 6 permanecen como propuestas no aprobadas a evaluar al definir SCI-57.

---

## 10. Próximos pasos recomendados

1. **Definir SCI-57** a partir de los candidatos de la sección 6 (ARCH-5 si se prioriza sostenibilidad del monolito).
2. **Validar la regla `contradictory`** con un dataset diseñado para producir contradicción SCI-11 vs. diagnósticos visuales.
3. **Formalizar la suite de validación** (script Playwright) como herramienta de regresión para futuros bloques.
4. **Evaluar ARCH-5** antes de que el monolito supere las ~30K líneas, para mantener la velocidad de implementación de bloques futuros.

---

Documento generado al cierre de SCI-56 y actualizado tras SCI-29B y SCI-37B (cierre del backlog técnico histórico). Reemplaza a `PROJECT_STATUS_SCI_1-55.md` como referencia de estado actual.
