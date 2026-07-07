# D17.1 — Preparación + Baseline Remeasurement — Gate certificación modularización (F5I)

**Estado documento:** **CLOSED · ARCHIVED** (2026-07-07 — acta §D17 certificada)  
**Épica:** ARCH-5 F5I (certificación modularización vs baseline D0.5)  
**Microfase origen:** D17.1 (preparación — gate implementado D17.2–D17.5)  
**Prerequisito:** D16 CLOSED · ARCH-5 F5H certificado  
**Referencia plan:** Plan D17 aprobado · [`PROJECT_BASELINE_PROD_2D.md`](PROJECT_BASELINE_PROD_2D.md) · [`PROJECT_STATUS_PROD_2D.md`](PROJECT_STATUS_PROD_2D.md) §D17

> Documento técnico temporal — **archivado al cierre D17.5**. No modificar contenido técnico; referencia histórica únicamente.

---

## 1. Estado inicial

| Verificación | Resultado D17.1 |
|--------------|-----------------|
| **D16** | **CLOSED** (2026-07-07) |
| **ARCH-5 F5H** | **Certificado** — infraestructura validación consolidada |
| **SSOT** | **Actualizado** — handoff D17 documentado en `PROJECT_STATUS_PROD_2D.md` |
| **Plan D17** | **Aprobado** — microfases D17.1–D17.5 congeladas |
| Gate `validate:arch5-f5-modularization-gate` | **AUSENTE** — correcto para D17.1 |
| Script `validate-arch5-f5-modularization-gate.ts` | **AUSENTE** — correcto para D17.1 |
| Cambios funcionales en D17.1 | **NINGUNO** |
| Cambios de código en D17.1 | **NINGUNO** (solo este documento) |
| `npx tsc --noEmit` | **PASS** (verificado 2026-07-07, pre-D17.1) |

**Secuencia congelada:**

```text
D16 ✓ → D17.1 (esta microfase) → D17.2 …
```

---

## 2. Inventario arquitectónico actual

### 2.1 Dominio — `src/lib/scientific/methodology/`

| Submódulo | SCI | Archivos `.ts` | Barrel (`index.ts`) | Estado |
|-----------|-----|----------------|---------------------|--------|
| `consistency/` | SCI-50 | 6 | ✓ | Operativo (D9) |
| `report-quality/` | SCI-51 | 6 | ✓ | Operativo (D9) |
| `reproducibility/` | SCI-52 | 6 | ✓ | Operativo (D9) |
| `evidence/` | SCI-53 | 6 | ✓ | Operativo (D10) |
| `assumptions/` | SCI-54 | 6 | ✓ | Operativo (D10) |
| `readiness/` | SCI-55 | 6 | ✓ | Operativo (D11) |
| `summary/` | SCI-56 | 5 | ✓ | Operativo (D12) |
| `publication/` | SCI-60 | 5 | ✓ | Operativo (D13) |

| Métrica inventario dominio | Valor D17.1 |
|----------------------------|-------------|
| Submódulos | **8** |
| Archivos `.ts` totales | **46** |
| Barrel raíz `methodology/index.ts` | **AUSENTE** (consumo vía barrels por submódulo — diseño intencional) |
| Barrels por submódulo | **8** |
| Imports React/Next/`@/app`/`@/components` en dominio | **0** (boundary limpio — certificado D16) |

**Exports públicos congelados (API Freeze — referencia D16):**

| Barrel | Exports públicos |
|--------|------------------|
| `consistency/` | 9 |
| `report-quality/` | 9 |
| `reproducibility/` | 9 |
| `evidence/` | 9 |
| `assumptions/` | 11 |
| `readiness/` | 9 |
| `summary/` | 6 |
| `publication/` | 8 |

**Consumo desde `page.tsx`:** 8 import blocks `@/lib/scientific/methodology/*` (L169–235). Cero builders inline SCI-50→60.

### 2.2 UI extraída — SCI-59 (F5G, D15)

| Artefacto | Ubicación | LOC (`Measure-Object -Line`) | Estado |
|-----------|-----------|------------------------------|--------|
| `GuidedWorkflowPanel` | `src/components/workflow/GuidedWorkflowPanel.tsx` | **78** | Extraído |
| Barrel | `src/components/workflow/index.ts` | **1** | Exporta `GuidedWorkflowPanel` |
| `WorkflowSessionIndicator` | `src/components/workflow/WorkflowSessionIndicator.tsx` | (D5, fuera barrel D15) | Presente |
| Inline en `page.tsx` | — | **0** | Import L133 `@/components/workflow` |

**Mount sites `<GuidedWorkflowPanel />`:** 3 (Análisis, Resultados, Reportes — sin cambio post-D15).

### 2.3 UI extraída — SCI-60 (F5F, D14)

| Artefacto | Ubicación | LOC (`Measure-Object -Line`) | Estado |
|-----------|-----------|------------------------------|--------|
| `ScientificPublicationDashboard` | `src/components/reports/ScientificPublicationDashboard.tsx` | **233** | Extraído |
| Barrel | `src/components/reports/index.ts` | **9** | Exporta dashboard + PDF helpers |
| Inline en `page.tsx` | — | **0** | Import L138–142 `@/components/reports` |

**Nota path:** destino discovery original era `components/methodology/`; desviación aceptada D14 → `components/reports/`.

### 2.4 UI inline — SCI-50–56 (F5F bis backlog)

| Componente | SCI | Línea inicio | Estado |
|------------|-----|--------------|--------|
| `ScientificConsistencyEngine` | SCI-50 | L10489 | **INLINE** |
| `ScientificReportQualityEngine` | SCI-51 | L10573 | **INLINE** |
| `ScientificReproducibilityExplorer` | SCI-52 | L10648 | **INLINE** |
| `ScientificEvidenceStrengthEngine` | SCI-53 | L10731 | **INLINE** |
| `ScientificAssumptionTracker` | SCI-54 | L10813 | **INLINE** |
| `ScientificPublicationReadinessAnalyzer` | SCI-55 | L10924 | **INLINE** |
| `ScientificMethodologicalDashboard` | SCI-56 | L11044 | **INLINE** |

**Props types asociados:** L10485 (`ScientificConsistencyEngineProps`) — incluidos en bloque UI.

**Bloque UI contiguo:** L10485–L11195 (inclusive).

### 2.5 `src/components/methodology/`

| Verificación | Resultado |
|--------------|-----------|
| Directorio existe | **NO** (0 archivos) |
| Objetivo discovery | Paneles SCI-50–56 — **pendiente F5F bis** |

### 2.6 Infraestructura validación existente (D16 — solo referencia, sin re-ejecución D17.1)

| Gate | Script | caseCount (acta D16) | Estado registro npm |
|------|--------|----------------------|---------------------|
| F5A | `validate-methodology-f5a-unit.ts` | **208** | ✓ |
| F5B | `validate-methodology-f5b-unit.ts` | **65** | ✓ |
| F5C | `validate-methodology-f5c-unit.ts` | **37** | ✓ |
| F5D | `validate-methodology-f5d-unit.ts` | **27** | ✓ |
| F5E | `validate-methodology-f5e-unit.ts` | **40** | ✓ |
| Umbrella | `validate-methodology-unit.ts` | **377** | ✓ |
| Workflow | `validate-workflow-unit.ts` | **9** | ✓ |
| **F5I (D17)** | `validate-arch5-f5-modularization-gate.ts` | — | **AUSENTE** |

---

## 3. Métricas baseline D17.1

### 3.1 Metodología de medición (congelada)

| Métrica | Comando / método | Notas |
|---------|------------------|-------|
| LOC archivo | `(Get-Content '<path>' \| Measure-Object -Line).Lines` | Igual que [`PROJECT_BASELINE_PROD_2D.md`](PROJECT_BASELINE_PROD_2D.md) §2.1 — **excluye líneas vacías** |
| LOC bloque inline | Rango 1-based inclusive: `fin − inicio + 1` | Anclajes verificados en `page.tsx` |
| LOC total física (referencia actas) | `(Get-Content '<path>').Count` | Incluye líneas vacías — trazabilidad D14/D15 |

**Medición D17.1:** 2026-07-07 · working tree post-D16 · commit ref `page.tsx`: `a929442` (D15).

### 3.2 Métricas registradas

| Métrica | Valor D17.1 | Detalle |
|---------|-------------|---------|
| **LOC `page.tsx`** (`Measure-Object -Line`) | **26.340** | Líneas no vacías |
| **LOC `page.tsx`** (total física `.Count`) | **28.661** | Incluye **2.321** líneas vacías |
| **LOC UI metodología inline (SCI-50–56)** | **711** | L10485–L11195 |
| **LOC useMemo wiring metodología** | **361** | L18386–L18746 (cadena SCI-50→60 + guards `hasEnough*` / `canBuild*`) |
| **LOC dominio SCI-50→60 inline en `page.tsx`** | **0** | Sin `const build*Analysis` inline metodología |
| **Submódulos `methodology/*`** | **8** | Ver §2.1 |
| **Barrels `methodology/*/index.ts`** | **8** | Ver §2.1 |
| **Archivos `.ts` dominio metodología** | **46** | Suma verificada |
| **LOC dominio extraído (suma submódulos)** | **2.564** | Por submódulo: 333+307+240+264+376+189+272+583 |
| **`function` top-level en `page.tsx`** | **45** | vs baseline D0.5: 50 |
| **`useMemo(` en `page.tsx`** | **100** | vs baseline D0.5: 120 |
| **`useState(` en `page.tsx`** | **92** | vs baseline D0.5: 144 |
| **Componentes workflow (`components/workflow/`)** | **3** archivos | GuidedWorkflowPanel + WorkflowSessionIndicator + index |
| **Componentes reports SCI-60 relevantes** | **1** dashboard | `ScientificPublicationDashboard.tsx` (+ barrel compartido con PDF) |

### 3.3 Cadena useMemo metodológica (referencia wiring)

Orden verificado L18386–L18739:

1. `consistencyEngineAnalysis` (L18386)
2. `effectSizePowerAnalysis` (L18554) — upstream SCI-57/inferencia, alimenta evidence
3. `reportQualityEngineAnalysis` (L18573)
4. `reproducibilityExplorerAnalysis` (L18596)
5. `evidenceStrengthEngineAnalysis` (L18617)
6. `assumptionTrackerAnalysis` (L18642)
7. `publicationReadinessAnalyzerAnalysis` (L18663)
8. `methodologicalDashboardAnalysis` (L18682)
9. `publicationDashboardAnalysis` (L18719)

Guards: L18504–L18746 (`hasEnoughSeriesFor*Engine`, `canBuildMethodologicalDashboard`, `canBuildPublicationDashboard`).

---

## 4. Comparación contra D0.5

Referencia inmutable: [`PROJECT_BASELINE_PROD_2D.md`](PROJECT_BASELINE_PROD_2D.md) §1, §2, §8.

| Métrica | Baseline D0.5 | Estado actual D17.1 | Δ | Objetivo D17 |
|---------|---------------|---------------------|---|--------------|
| LOC `page.tsx` (`Measure-Object -Line`) | **28.862** | **26.340** | **−2.522** | ↓ (indicador secundario) |
| LOC `page.tsx` (total física `.Count`) | *(no registrado D0.5)* | **28.661** | — | Referencia actas D14/D15 |
| Dominio SCI-50→60 inline | Presente (~**2.716** LOC) | **Ausente** (0 LOC) | **−2.716** | **Ausente** — en `methodology/*` |
| UI metodología inline | Presente (~**1.703** LOC) | **711** LOC (solo SCI-50–56) | **−992*** | **Ausente** — `components/methodology/` |
| `GuidedWorkflowPanel` inline | Presente (**122** LOC) | **Ausente** (0 LOC) | **−122** | **Ausente** — `components/workflow/` |
| SCI-60 UI inline | Incluido en subtotal UI | **Extraído** (`components/reports/`) | **MET** | Extraído |
| Módulos `methodology/*` operativos | **0** | **8** submódulos | **+8** | ≥8 con gates PASS |
| Acoplamiento dominio inline | Alto | **Reducido** — wiring `useMemo` 361 LOC | **MET** | Solo wiring |
| Barrels metodología | 0 | **8** | **+8** | Operativos |
| Gates methodology acumulados | 0 | **377** casos | **+377** | PASS (D16) |

\* Δ UI parcial: baseline incluía SCI-60 UI inline (~240 LOC) ya extraído en D14; subtotal comparable SCI-50–56 únicamente.

### 4.1 Evaluación responsabilidades (criterio primario D17)

| Responsabilidad | Baseline D0.5 | D17.1 | Certificable D17 |
|-----------------|---------------|-------|------------------|
| Dominio builders SCI-50→60 | En `page.tsx` | En `methodology/*` barrels | **SÍ** |
| UI SCI-60 | En `page.tsx` | En `components/reports/` | **SÍ** |
| UI SCI-59 | En `page.tsx` | En `components/workflow/` | **SÍ** |
| UI SCI-50–56 | En `page.tsx` | En `page.tsx` (711 LOC) | **Deuda F5F bis** |
| Wiring runtime `useMemo` | En `page.tsx` | En `page.tsx` (361 LOC) | **Esperado** |

---

## 5. GAP Registry

Solo gaps pendientes documentados — **sin deuda nueva**.

| ID | Gap | Severidad | Responsable futuro | Notas |
|----|-----|-----------|-------------------|-------|
| **GAP-1** | Gate `validate:arch5-f5-modularization-gate` ausente | **Alta** | D17.2 | Script + npm |
| **GAP-2** | F5F bis — UI SCI-50–56 inline (711 LOC) | **LOW** | PROD-2E / microfase ARCH-5 dedicada | Fuera D17 per handoff D16 |
| **GAP-3** | `src/components/methodology/` inexistente | **LOW** | F5F bis | Discovery target path |
| **GAP-4** | `validate:full` no incluye gates methodology | **Media** | D22 | GAP-8 D16 — `validate:prod2d-gate` |
| **GAP-5** | Baseline §8 UI target vs F5F bis deferido | **Documental** | D17.5 acta | Excepción formal CA-D17.4-4 |
| **GAP-6** | SCI-60 UI en `components/reports/` vs `components/methodology/` | **Documental** | — | Desviación aceptada D14 |
| **GAP-7** | Template picker SCI-59 inline en `page.tsx` | **Baja** | Post-D17 | Fuera alcance F5G D15 |
| **GAP-8** | useMemo wiring 361 LOC permanece en monolito | **Baja** | Post-2D | Evolución hook dedicado — fuera D17 |

---

## 6. Diseño del gate (sin implementación)

### 6.1 Objetivo

Certificar automatizadamente que ARCH-5 F5 (D9–D16) produjo **disminución efectiva de responsabilidades arquitectónicas** vs baseline D0.5, mediante orquestación de sub-gates existentes + aserciones globales `certification.*`.

### 6.2 Responsabilidades del orquestador

**Principio de delegación estricta** (plan D17 §3):

El orquestador `validate-arch5-f5-modularization-gate.ts`:

1. Ejecuta sub-gates;
2. Verifica que todos finalicen correctamente;
3. Ejecuta **únicamente** casos `certification.*` de nivel arquitectónico global;
4. Consolida resumen JSON versionado.

**NO reimplementa** comprobaciones ya certificadas por F5A–F5E ni `validate:workflow-unit`.

### 6.3 Qué certificará (IN)

| Capa | Mecanismo |
|------|-----------|
| Dominio SCI-50→60 behavioral + structural | Delegado → `validate:methodology-unit` (377 casos) |
| SCI-59 workflow | Delegado → `validate:workflow-unit` (9 casos) |
| Regresión PROD-2C | Delegado → `validate:prod2c-c8-regression-gate` (5 sub-gates) |
| Sub-gates ejecutados | `certification.subgates.executed` (expected=3, actual=3) |
| Presencia 8 submódulos | `certification.modules.all-present` |
| UI SCI-60 extraída | `certification.ui.sci60-extracted` |
| UI SCI-59 extraída | `certification.ui.sci59-extracted` |
| Orquestador sin imports dominio | `certification.orchestrator.no-domain-imports` |
| Schema JSON + métricas | `certification.metrics.schema-valid`, `certification.known-debts.schema-valid` |
| Deuda F5F bis registrada | `certification.ui.f5f-bis-registry` (soft) |
| LOC informativo | `certification.baseline.loc-page-reduced` (soft) |
| Sanity wiring | `certification.wiring.usememo-present` (soft) |

### 6.4 Qué NO certificará (OUT — delegado o fuera alcance)

| Comprobación | Motivo |
|--------------|--------|
| Anti-inline dominio por SCI | F5A–F5E |
| API Freeze por barrel | F5A–F5E |
| `structure.methodology.boundary-clean` | F5B–F5E |
| Baselines QA-1 Dataset5/6 | F5E |
| Behavioral builders | F5A–F5E |
| Extracción UI SCI-50–56 | F5F bis — fuera D17 |
| `validate:full` | D22 |
| Cambios funcionales runtime | D17 no modifica `src/` |

### 6.5 Composición planificada

```text
validate:arch5-f5-modularization-gate
  ├── spawn → validate:methodology-unit
  ├── spawn → validate:workflow-unit
  ├── spawn → validate:prod2c-c8-regression-gate
  └── local → certification.* (~10–12 casos, solo nivel global)
```

### 6.6 JSON de salida (especificación congelada D17.1)

```json
{
  "schemaVersion": 1,
  "phase": "arch5-f5-modularization-gate",
  "generatedAt": "2026-07-08T14:18:32Z",
  "pass": true,
  "caseCount": 0,
  "subGates": [],
  "metrics": {
    "pageTsxLOC": 26340,
    "methodologyModuleCount": 8,
    "workflowModuleCount": 3,
    "reportModuleCount": 1,
    "knownDebtCount": 1
  },
  "knownDebts": [
    {
      "id": "F5F-BIS",
      "severity": "LOW",
      "description": "SCI-50–56 UI permanece inline por decisión arquitectónica."
    }
  ]
}
```

- `generatedAt`: UTC ISO-8601, instante exacto de conclusión del gate.
- `metrics`: estructura fija — 5 claves obligatorias.
- `knownDebts`: array tipado `{ id, severity, description }`.

---

## 7. Umbrales PASS / WARNING / INFO

| Nivel | Criterio | Acción gate |
|-------|----------|-------------|
| **PASS (hard)** | Sub-gates 3/3 PASS; casos `certification.*` hard PASS; `pass: true` en JSON | Exit 0 |
| **PASS (soft)** | Deuda F5F bis registrada en `knownDebts[]`; LOC ≤ baseline o documentado | No bloquea |
| **WARNING** | `metrics.pageTsxLOC` > 28.862 (baseline) — regresión LOC | Registrar en JSON; no FAIL automático |
| **WARNING** | Tiempo sub-gates > baseline §4.5 + 25% | Investigar; no FAIL D17 |
| **INFO** | LOC `page.tsx` reducido vs D0.5 | Métrica informativa — no criterio único de cierre |
| **INFO** | Δ dominio −2.716 LOC inline → 0 | Criterio primario responsabilidades |
| **FAIL (hard)** | Cualquier sub-gate FAIL | Exit 1, fail-fast |
| **FAIL (hard)** | `certification.subgates.executed` actual ≠ 3 | Exit 1 |
| **FAIL (hard)** | Orquestador importa `@/lib/scientific/methodology/*` | Exit 1 |
| **FAIL (hard)** | Dominio re-inline detectado (vía sub-gates F5A–F5E) | Exit 1 |

**Nota LOC (plan §10):** la reducción de LOC en `page.tsx` es **únicamente métrica informativa**. El criterio principal de certificación D17 es la **disminución de responsabilidades arquitectónicas** mediante extracción y encapsulación del dominio.

---

## 8. Checklist pre-BUILD (D17.2)

| # | Item | Estado D17.1 |
|---|------|--------------|
| 1 | Baseline D17.1 registrado (§3) | **PASS** |
| 2 | Inventario arquitectónico completo (§2) | **PASS** |
| 3 | Comparación D0.5 documentada (§4) | **PASS** |
| 4 | GAP Registry completo — sin deuda nueva (§5) | **PASS** |
| 5 | Diseño gate documentado — sin implementación (§6) | **PASS** |
| 6 | Umbrales PASS/WARNING/INFO definidos (§7) | **PASS** |
| 7 | JSON schemaVersion + generatedAt + metrics + knownDebts especificados | **PASS** |
| 8 | Principio delegación estricta documentado | **PASS** |
| 9 | Cero diffs en `src/` | **PASS** |
| 10 | Cero diffs en `scripts/` | **PASS** |
| 11 | Cero diffs en `package.json` | **PASS** |
| 12 | SSOT no modificado | **PASS** |
| 13 | `npx tsc --noEmit` baseline PASS | **PASS** |
| 14 | Listo para D17.2 | **PASS** |

---

## 9. Criterios CA-D17.1

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D17.1-1** | `D17_1_MODULARIZATION_GATE_PREP.md` creado con inventario completo | **PASS** |
| **CA-D17.1-2** | Métricas LOC baseline D17.1 registradas (page.tsx, UI inline, wiring useMemo) | **PASS** |
| **CA-D17.1-3** | Matriz comparación vs PROJECT_BASELINE_PROD_2D §8 documentada | **PASS** |
| **CA-D17.1-4** | Gaps vs objetivos D17 identificados (F5F bis, components/methodology ausente) | **PASS** |
| **CA-D17.1-5** | Cero cambios en `src/` durante D17.1 | **PASS** |

---

## 10. Rollback D17.1

Microfase **completamente reversible:**

```text
git rm D17_1_MODULARIZATION_GATE_PREP.md
```

Sin impacto en código, gates, npm ni SSOT.

---

*Prep D17 — **CLOSED · ARCHIVED** 2026-07-07. Acta §D17 en `PROJECT_STATUS_PROD_2D.md`. Handoff → **D18**.*

---

## 11. D17.4 — Verificación integral + registro de métricas

**Fecha certificación:** 2026-07-07  
**Microfase:** D17.4 (verificación únicamente — cero cambios en `src/`, scripts, `package.json`, SSOT)

### 11.1 Ejecuciones obligatorias

| Comando | PASS/FAIL | Exit | Duración | Observaciones |
|---------|-----------|------|----------|---------------|
| `npx tsc --noEmit` | **PASS** | 0 | **~31,4 s** | Sin errores TypeScript |
| `npm run validate:arch5-f5-modularization-gate` | **PASS** | 0 | **~102,5 s** | `pass: true`, `caseCount: 11`, 3 sub-gates PASS |
| `npm run validate:prod2c-c8-regression-gate` | **PASS** | 0 | **~56,7 s** | 5/5 sub-gates PASS |
| `npm run validate:full` | **FAIL** *(no bloqueante)* | 1 | **~288,3 s** | **8/10 steps PASS** — ver §11.1.1 |

#### 11.1.1 `validate:full` — verificación manual no bloqueante

| Campo | Valor D17.4 |
|-------|-------------|
| Resultado global | **FAIL** (exit 1) |
| Steps PASS | **8 / 10** |
| Condición D17 | **No bloquea certificación F5I** (plan D17 §7; baseline D0.5 §4.1) |

| Step | ID | Resultado | Notas |
|------|-----|-----------|-------|
| 1 | `t-quantile` | PASS | — |
| 2 | `chart-viewport-unit` | PASS | — |
| 3 | `comparison-unit` | PASS | — |
| 4 | `f0` | PASS | — |
| 5 | `unit` | PASS | — |
| 6 | `f6` | PASS | — |
| 7 | `typescript` | PASS | — |
| 8 | `build` | PASS | ~133 s |
| 9 | `baseline` | **FAIL** | `net::ERR_CONNECTION_REFUSED` en `http://localhost:3000/` — entorno sin servidor activo |
| 10 | `prod1-gate` | PASS | — |
| 11 | `e2e` | **FAIL** | Servidor E2E / F5 no completó — mismo patrón baseline D0.5 |

**Comparación tiempo vs baseline D0.5:** `validate:full` **~288 s** vs baseline **~364 s** — por debajo del umbral alerta **~480 s**.

### 11.2 JSON gate F5I (referencia acta — última ejecución D17.4)

```json
{
  "schemaVersion": 1,
  "phase": "arch5-f5-modularization-gate",
  "generatedAt": "2026-07-07T13:52:56.891Z",
  "pass": true,
  "caseCount": 11,
  "subGates": [
    { "gate": "methodology-unit", "pass": true, "exitCode": 0, "caseCount": 377 },
    { "gate": "workflow-unit", "pass": true, "exitCode": 0, "caseCount": 9 },
    { "gate": "prod2c-c8-regression-gate", "pass": true, "exitCode": 0 }
  ],
  "metrics": {
    "pageTsxLOC": 26340,
    "methodologyModuleCount": 8,
    "workflowModuleCount": 3,
    "reportModuleCount": 1,
    "knownDebtCount": 1
  },
  "knownDebts": [
    {
      "id": "F5F-BIS",
      "severity": "LOW",
      "description": "SCI-50–56 UI permanece inline por decisión arquitectónica."
    }
  ]
}
```

### 11.3 Métricas remeasurement D17.4

| Métrica | Baseline D0.5 | D17.1 | D17.4 | Δ vs D0.5 | Δ vs D17.1 |
|---------|---------------|-------|-------|-----------|------------|
| LOC `page.tsx` (`Measure-Object -Line`) | 28.862 | 26.340 | **26.340** | **−2.522** | **0** (sin cambio) |
| LOC `page.tsx` (total física `.Count`) | — | 28.661 | **28.661** | — | **0** |
| UI metodología inline SCI-50–56 | ~1.703 (total) | 711 | **711** | — | **0** |
| LOC wiring useMemo metodología | ~361 (ref. plan) | 361 | **361** | — | **0** |
| Submódulos `methodology/*` | 0 | 8 | **8** | **+8** | **0** |
| Barrels `methodology/*/index.ts` | 0 | 8 | **8** | **+8** | **0** |
| Dominio SCI-50→60 inline | ~2.716 | 0 | **0** | **−2.716** | **0** |

**Conclusión métricas:** sin drift entre D17.1 y D17.4 — ningún cambio en `src/` durante D17.

### 11.4 Verificación arquitectónica D17.4

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Dominio SCI-50→60 extraído | **PASS** | Sub-gate `methodology-unit` 377 casos PASS; cero builders inline |
| SCI-59 UI extraído | **PASS** | `GuidedWorkflowPanel` en `components/workflow/`; `workflow-unit` 9 casos PASS |
| SCI-60 UI extraído | **PASS** | `ScientificPublicationDashboard` en `components/reports/` |
| F5F-BIS deuda conocida | **PASS** | `knownDebts[]` con id `F5F-BIS`; 7 componentes inline L10485–L11195 |
| Regresiones arquitectónicas | **NINGUNA** | `git diff -- src/` vacío |
| Delegación estricta orquestador | **INTACTA** | 3 sub-gates exactos; sin imports dominio; 11 casos `certification.*` globales |
| Cambios funcionales D17 | **NINGUNO** en `src/` | Solo infraestructura scripts + 1 línea npm (D17.3) |

### 11.5 Tiempos gates (referencia baseline §4.5)

| Gate | Baseline D0.5 | D17.4 | Δ |
|------|---------------|-------|---|
| `validate:full` | ~364 s | **~288 s** | −76 s |
| `validate:prod2c-c8-regression-gate` | ~59 s | **~57 s** | −2 s |
| `validate:arch5-f5-modularization-gate` | — | **~103 s** | *(nuevo D17)* |
| `npx tsc --noEmit` | *(incl. en full ~45 s)* | **~31 s** | — |

### 11.6 Criterios CA-D17.5 (verificación D17.4)

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D17.5-1** | `npx tsc --noEmit` PASS | **PASS** |
| **CA-D17.5-2** | `validate:prod2c-c8-regression-gate` PASS | **PASS** |
| **CA-D17.5-3** | `validate:arch5-f5-modularization-gate` PASS end-to-end | **PASS** |
| **CA-D17.5-4** | LOC `page.tsx` registrada vs baseline | **PASS** (26.340 vs 28.862) |
| **CA-D17.5-5** | Tiempos gates registrados | **PASS** |
| **CA-D17.5-6** | Cero diffs funcionales en `src/` durante D17 | **PASS** |

---

## 12. Evidencia preparada para acta D17.5 (copiar directo)

### 12.1 Resumen ejecutivo

D17 certifica que ARCH-5 F5 (D9–D16) produjo **disminución efectiva de responsabilidades arquitectónicas** en el monolito: dominio SCI-50→60 completamente extraído a `src/lib/scientific/methodology/` (8 submódulos, 377 casos metodológicos PASS), UI SCI-59 y SCI-60 extraídas, gate F5I `validate:arch5-f5-modularization-gate` operativo y PASS. Deuda documentada **F5F-BIS** (UI SCI-50–56 inline, 711 LOC). Criterio primario: responsabilidades, no LOC absoluto.

### 12.2 Resultados gates D17.4

| Gate | PASS | Casos / sub-gates | Duración |
|------|------|-------------------|----------|
| `npx tsc --noEmit` | ✓ | — | ~31 s |
| `validate:arch5-f5-modularization-gate` | ✓ | 11 certification + 377+9 sub | ~103 s |
| `validate:prod2c-c8-regression-gate` | ✓ | 5/5 | ~57 s |
| `validate:full` | ✗ *(no bloqueante)* | 8/10 steps | ~288 s |

### 12.3 Comparación vs D0.5

| Dimensión | D0.5 | Post-D17 |
|-----------|------|----------|
| Dominio inline | ~2.716 LOC | **0** |
| Módulos methodology | 0 | **8** |
| UI SCI-59/60 inline | Presente | **Extraído** |
| UI SCI-50–56 | Inline | **Inline (F5F-BIS)** |
| LOC page (non-empty) | 28.862 | **26.340** |

### 12.4 Métricas finales gate JSON

- `pageTsxLOC`: **26.340**
- `methodologyModuleCount`: **8**
- `workflowModuleCount`: **3**
- `reportModuleCount`: **1**
- `knownDebtCount`: **1**

### 12.5 Riesgos residuales

| Riesgo | Severidad | Estado |
|--------|-----------|--------|
| F5F bis UI SCI-50–56 inline | LOW | Deuda registrada |
| `validate:full` E2E/baseline sin servidor | INFO | No bloqueante; patrón D0.5 |
| useMemo wiring 361 LOC en monolito | LOW | Esperado post-F5 |
| Methodology gates fuera de `validate:full` | MEDIA | D22 `validate:prod2d-gate` |

### 12.6 Deuda conocida

```json
{
  "id": "F5F-BIS",
  "severity": "LOW",
  "description": "SCI-50–56 UI permanece inline por decisión arquitectónica."
}
```

### 12.7 Conclusión certificación (borrador acta)

**ARCH-5 F5I — certificación modularización: PASS.** Gate `validate:arch5-f5-modularization-gate` PASS; sub-gates methodology (377), workflow (9), prod2c-c8 (5/5) PASS; dominio encapsulado; delegación estricta verificada; excepción formal baseline §8 UI por F5F-BIS. Listo para cierre acta §D17 y handoff D18.

---

## 13. Checklist pre-D17.5

| # | Item | Estado D17.4 |
|---|------|--------------|
| 1 | Suite certificación ejecutada | **PASS** |
| 2 | Resultados documentados (PASS y FAIL) | **PASS** |
| 3 | Métricas D17.4 = D17.1 (sin drift) | **PASS** |
| 4 | Evidencia acta §12 preparada | **PASS** |
| 5 | SSOT no modificado | **PASS** |
| 6 | Listo para D17.5 | **PASS** |

