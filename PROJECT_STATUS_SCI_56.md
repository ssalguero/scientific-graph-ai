# Scientific Graph AI — Estado del Proyecto (Cierre SCI-56)

Fecha: 2026-06-09
Versión actual: SCI-56
Commit de referencia: `fe4c6f2` (tag `SCI-56`)

---

## 1. Resumen ejecutivo

El proyecto alcanzó el cierre completo del bloque metodológico y su capa ejecutiva de síntesis. Tras SCI-55 se resolvieron dos deudas técnicas críticas (HOTFIX-SCI-NORMALITY-2 y BUGFIX SCI-19) y se implementó SCI-56 — Methodological Summary Dashboard, completando el patrón arquitectónico de dashboards por bloque.

Hitos cerrados en este ciclo:

| Hito | Estado | Descripción |
|------|--------|-------------|
| SCI-55 | APROBADO | Publication Readiness Analyzer (cierre del bloque SCI-50→55) |
| HOTFIX-SCI-NORMALITY-2 | CERRADO | Fuente canónica única de normalidad; eliminación de la dualidad Consenso/Coherencia |
| BUGFIX SCI-19 | CERRADO | Deduplicación de hallazgos en `generateScientificInterpretation()`; warning React eliminado |
| SCI-56 | COMPLETADO | Dashboard ejecutivo del bloque metodológico SCI-50→55 |

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

### SCI-29B — Variables constantes en clustering

Excluir variables constantes del clustering jerárquico o tratarlas separadamente. Hoy una variable sin varianza puede distorsionar distancias y agrupamientos.

### SCI-37B — Empates en Variable Importance

Mejorar el manejo de empates al 100% en Variable Importance: criterio de desempate estable y comunicación explícita del empate en la interpretación.

### Deuda menor documentada

- Commit `69a140d` contiene la implementación de SCI-56 bajo mensaje "HOTFIX-SCI-NORMALITY-2" (ya en remoto; trazabilidad corregida vía tag `SCI-56` y commit de docs `fe4c6f2`).
- Dataset6 no produce series `contradictory` con su perfil actual; la regla D1 del motor canónico queda validada solo a nivel de código (pendiente dataset alternativo).
- `overallHealthScore` de SCI-56 promedia 6 scores donde Readiness ya es promedio de los otros 5 (sobreponderación leve y deliberada de la media global).

---

## 6. Posibles candidatos SCI-57+

Propuestas no aprobadas, ordenadas por valor estimado:

| Candidato | Tipo | Justificación |
|-----------|------|---------------|
| SCI-29B / SCI-37B | Corrección | Promover el backlog existente antes de nuevas features |
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

Build: Compilación OK · TypeScript OK · Exportación PDF OK.

Git: `main` sincronizado con origin; tags `SCI-55`, `HOTFIX-SCI-NORMALITY-2`, `SCI-56` publicados.

---

## 8. Próximos pasos recomendados

1. **Definir SCI-57** a partir de los candidatos de la sección 6 (recomendado: SCI-29B + SCI-37B como par de correcciones, o ARCH-5 si se prioriza sostenibilidad).
2. **Validar la regla `contradictory`** con un dataset diseñado para producir contradicción SCI-11 vs. diagnósticos visuales.
3. **Formalizar la suite de validación** (script Playwright) como herramienta de regresión para futuros bloques.
4. **Evaluar ARCH-5** antes de que el monolito supere las ~30K líneas, para mantener la velocidad de implementación de bloques futuros.

---

Documento generado al cierre de SCI-56. Reemplaza a `PROJECT_STATUS_SCI_1-55.md` como referencia de estado actual.
