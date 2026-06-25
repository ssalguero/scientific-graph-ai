# QA-1 — Protocolo de Validación Manual

**Sprint:** QA-1 (Validación Manual)  
**Estado:** CERRADO (2026-06-24)  
**Alcance:** Flujo end-to-end sobre arquitectura actual (post UX-1A.1 LITE, DATA-3A, ARCH-5 F4, PROD-1A/2A)  
**Gate automatizado de referencia:** `npm run validate:full` — **PASS**

---

## 1. Principios de la arquitectura actual

### 1.1 Progressive disclosure (UX-1A.1 LITE)

Los paneles científicos y dashboards **no aparecen automáticamente** al importar un dataset ni al navegar entre pestañas del workspace. La visualización depende de **toggles manuales** en el Inspector de Análisis (pestaña **Análisis** → panel lateral **Estadística**).

**Estado inicial de toggles metodológicos y de dashboards:** `false` (OFF).

> **Nota histórica:** versiones anteriores podían mostrar dashboards metodológicos sin activación explícita. Ese comportamiento **ya no aplica**. Toda validación manual debe activar los toggles correspondientes o usar el Guided Scientific Workflow (SCI-59) para activarlos paso a paso.

### 1.2 Cálculo vs visualización

Los motores SCI-50→60 **siguen calculándose en runtime** (`useMemo` en `page.tsx`) cuando existen inputs suficientes, **aunque el toggle de visualización esté desactivado**. La desactivación del toggle solo oculta el panel en Resultados; no detiene el cálculo ni afecta reportes PDF, perfiles SCI-58 ni cascadas downstream.

### 1.3 Guided Scientific Workflow (SCI-59)

El workflow puede **activar toggles de forma acumulativa** al aplicar cada paso (`applyGuidedWorkflowToggles`). No recalcula motores; solo orquesta visibilidad y navegación. El estado de la sesión workflow **persiste entre navegación** de pestañas (Datos / Análisis / Resultados / Reportes) hasta cancelar o resetear sesión.

---

## 2. Flujo de validación (orden obligatorio)

```
Importación
    ↓
Worksheet
    ↓
Resultados (pestaña workspace)
    ↓
Workflow (opcional — SCI-59)
    ↓
Inspector (toggles manuales)
    ↓
Activación de motores
    ↓
Validación de dashboards
```

---

## 3. Fase 1 — Importación

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1.1 | Importar Dataset5 (CSV fast path) | Series visibles en gráfico; viewport X auto-fit (HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1) |
| 1.2 | Importar Dataset6 (CSV fast path) | Idem; baseline scores distintos a D5 |
| 1.3 | (Opcional) Importar RW-01→RW-04 vía wizard | ≥ puntos mínimos; informe de importación accesible |
| 1.4 | Guardar / reabrir `.sgproj` (PROD-2A) | Dataset, toggles, workflow session y slots SCI-58 restaurados |

**Criterio PASS:** datos importados, series renderizadas, persistencia funcional.

---

## 4. Fase 2 — Worksheet

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 2.1 | Abrir panel Worksheet (Datos) | Columnas y filas del dataset activo visibles |
| 2.2 | Verificar edición / historial de columnas | Cambios reflejados sin pérdida de series |
| 2.3 | (Opcional) Constructor Visual (DATA-3A) | Preview vacía hasta seleccionar tipo; gráfico creado aparece en Resultados |

**Criterio PASS:** Worksheet operativa; ciclo de vida dataset/proyecto coherente con DATA-3A.

---

## 5. Fase 3 — Resultados (workspace)

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 3.1 | Navegar a pestaña **Resultados** | Secciones visibles **solo** para toggles activos |
| 3.2 | Sin toggles activos | Paneles metodológicos **ausentes** (comportamiento esperado, no bug) |
| 3.3 | Evaluación integrada de normalidad | Visible cuando motores de normalidad están activos en Análisis |

**Criterio PASS:** Resultados reflejan exactamente el estado de toggles; no se espera contenido metodológico sin activación previa.

---

## 6. Fase 4 — Workflow (SCI-59)

| Template | Pasos clave | Toggles que activa |
|----------|-------------|-------------------|
| **T1 — Comparar grupos** | Descriptiva → Normalidad → Inferencia → SCI-57 → Advisor → Interpretación | `showStatistics`, `showErrorBars`, `showNormality`, `showQQPlot`, inferencia condicional, `showEffectSizePower`, `showCorrelation`, `showStatisticalAdvisor`, `showScientificInterpretation` |
| **T2 — Explorar estructura** | Correlación → Heatmap → PCA → Clustering → SCI-40 | `showStatistics`, `showCorrelation`, `showHeatmap`, `showPCA`, `showHierarchicalClustering`, `showMultivariateDashboard` |
| **T3 — Evaluar publicación** | Motores → SCI-57 → SCI-56 → SCI-60 → Reporte | Ver §7 y §8 |

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 4.1 | Iniciar workflow desde Datos | Panel wizard visible; banner persistente en Análisis/Resultados |
| 4.2 | Aplicar pasos T1/T2/T3 | Toggles se activan acumulativamente; navegación automática a pestaña del paso |
| 4.3 | Cambiar pestaña y volver | Sesión workflow **mantiene estado** (paso actual, template activo) |
| 4.4 | Cancelar / reset sesión | Toggles persisten (auto-toggle acumulativo no revierte); reset completo vía nuevo proyecto |

**Criterio PASS:** orquestación funcional; estado workflow estable entre navegación.

---

## 7. Fase 5 — Inspector (activación manual de motores)

**Ubicación:** Análisis → Inspector → grupos **Metodología y publicación**, **Inferencia avanzada**, **Dashboards**.

### 7.1 Motores que requieren toggle manual (default OFF)

| Toggle (Inspector) | Motor | ID | Ubicación panel (Resultados) |
|--------------------|-------|-----|------------------------------|
| Mostrar Consistency Engine | Consistency Engine | SCI-50 | Resultados matemáticos |
| Mostrar Report Quality Engine | Report Quality Engine | SCI-51 | Resultados matemáticos |
| Mostrar Reproducibility Explorer | Reproducibility Explorer | SCI-52 | Resultados matemáticos |
| Mostrar Evidence Strength Engine | Evidence Strength Engine | SCI-53 | Resultados matemáticos |
| Mostrar Assumption Tracker | Assumption Tracker | SCI-54 | Inferencia avanzada |
| Mostrar Publication Readiness Analyzer | Publication Readiness Analyzer | SCI-55 | Resultados matemáticos |

> **SCI-54 (Assumption Tracker)** está en el grupo **Inferencia avanzada**, no en Metodología y publicación.

### 7.2 Dashboards que requieren toggle manual (default OFF)

| Toggle (Inspector → Dashboards) | Dashboard | ID |
|---------------------------------|-----------|-----|
| Mostrar Methodological Summary Dashboard | Methodological Summary Dashboard | SCI-56 |
| Mostrar Executive Publication Dashboard | Executive Publication Dashboard | SCI-60 |
| Mostrar Dashboard Multivariante | Multivariate Summary Dashboard | SCI-40 |
| Mostrar Multi-Dataset Comparison Dashboard | Multi-Dataset Comparison Dashboard | SCI-58 |

### 7.3 Activación vía Workflow T3 (alternativa al modo experto)

El paso **“Motores metodológicos”** de T3 activa en un solo paso:

- `showConsistencyEngine`
- `showReportQualityEngine`
- `showReproducibilityExplorer`
- `showEvidenceStrengthEngine`
- `showAssumptionTracker`
- `showPublicationReadinessAnalyzer`

Pasos posteriores de T3 activan `showEffectSizePower`, `showMethodologicalDashboard`, `showPublicationDashboard`, `showScientificReport`.

**Criterio PASS:** cada motor/dashboard visible **solo** tras toggle ON o paso workflow correspondiente.

---

## 8. Fase 6 — Validación de dashboards metodológicos

**Precondición:** Dataset5 o Dataset6 importado; motores SCI-50→54 con inputs suficientes (toggles ON o T3 aplicado).

### 8.1 SCI-53 — Evidence Strength Engine

| Check | Dataset5 | Dataset6 |
|-------|----------|----------|
| Evidence Score visible | ~82.7 | ~73.3 |
| Clasificación | Strong | Strong |
| Panel accesible tras toggle ON | PASS | PASS |

### 8.2 SCI-55 — Publication Readiness Analyzer

| Check | Dataset5 | Dataset6 |
|-------|----------|----------|
| Readiness Score | ~77.0 | ~67.5 |
| Clasificación | Near Ready | Requires Review |
| Toggle requerido | `showPublicationReadinessAnalyzer` | idem |

### 8.3 SCI-56 — Methodological Summary Dashboard

| Check | Dataset5 | Dataset6 |
|-------|----------|----------|
| Overall Health Score | ~77.0 | ~67.5 |
| Tarjetas metodológicas (hasta 6) | PASS | PASS |
| Toggle requerido | `showMethodologicalDashboard` | idem |

### 8.4 SCI-60 — Executive Publication Dashboard

| Check | Dataset5 | Dataset6 |
|-------|----------|----------|
| Publication Status | Near Ready | Requires Review |
| KPI Readiness + Overall Health (ref.) | PASS | PASS |
| Toggle requerido | `showPublicationDashboard` | idem |

### 8.5 Baselines de regresión

| Verificación | Comando | Estado QA-1 |
|--------------|---------|-------------|
| Gate unificado | `npm run validate:full` | **PASS** |
| Baseline D5/D6 scores | score-check en gate | **PASS** |
| SCI-58 comparación A/B | Δ Readiness −9.5 | **PASS** |

---

## 9. Checklist de cierre QA-1

| Área | Validado QA-1 |
|------|---------------|
| Constructor Visual (DATA-3A) | ✅ |
| Worksheet | ✅ |
| Guided Scientific Workflow (SCI-59) | ✅ |
| Inspector de Análisis (toggles) | ✅ |
| SCI-53 Evidence Strength Engine | ✅ |
| SCI-55 Publication Readiness Analyzer | ✅ |
| SCI-56 Methodological Summary Dashboard | ✅ |
| SCI-60 Executive Publication Dashboard | ✅ |
| `validate:full` | ✅ PASS |

---

## 10. Observaciones UX (no bugs — candidatas ARCH-6)

Registradas para evolución futura; **no bloquean** el cierre de QA-1:

1. **Estado workflow persistente:** la sesión SCI-59 sobrevive a cambios de pestaña; puede sorprender si el usuario espera reset al salir de Análisis.
2. **Toggles default OFF:** los dashboards metodológicos requieren activación explícita; el reporte PDF incluye secciones metodológicas aunque los paneles estén ocultos.
3. **Cálculo vs visualización:** motores calculan en background con toggles OFF; útil para SCI-58 capture y cascadas, pero no evidente para el usuario.
4. **Auto-toggle acumulativo:** el workflow activa toggles pero no los desactiva al cancelar.

---

## 11. Plantilla de informe de sesión QA

```
Fecha:
Ejecutor:
Dataset:
Commit / branch:

[ ] Importación PASS
[ ] Worksheet PASS
[ ] Resultados (sin toggles → vacío metodológico) PASS
[ ] Workflow T1/T2/T3 PASS
[ ] Inspector toggles manuales PASS
[ ] SCI-53 PASS — Evidence: ___
[ ] SCI-55 PASS — Readiness: ___
[ ] SCI-56 PASS — Overall Health: ___
[ ] SCI-60 PASS — Publication Status: ___
[ ] validate:full PASS

Observaciones:
```

---

*Protocolo alineado con `PROJECT_STATUS_SCI_56.md` §23 (cierre QA-1) y arquitectura toggle-based post UX-1A.1 LITE.*
