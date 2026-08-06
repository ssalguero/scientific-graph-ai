# D16.1 — Preparación + Verificación Baseline — Gates metodología (F5H)

**Épica:** ARCH-5 F5H (consolidación infraestructura validación)  
**Microfase:** D16.1 (preparación únicamente — sin implementación de gates)  
**Fecha:** 2026-07-07  
**Prerequisito:** D15 CLOSED — `GuidedWorkflowPanel` en `components/workflow/`

> Documento técnico temporal para facilitar D16.2–D16.5. Eliminar o archivar al cierre de D16.

---

## 1. Resumen ejecutivo

| Verificación | Resultado |
|--------------|-----------|
| Gate F5A (`validate-methodology-f5a-unit.ts`) | **EXISTE — PASS** (208 casos, 2026-07-07) |
| Gate workflow (`validate-workflow-unit.ts`) | **EXISTE — PASS** (9 casos W1–W9); **NO registrado** en `package.json` |
| Gates F5B–F5E | **AUSENTES** — correcto para D16.1 |
| Gate umbrella (`validate-methodology-unit.ts`) | **AUSENTE** — correcto para D16.1 |
| Util compartido (`scripts/lib/methodology-gate-utils.ts`) | **AUSENTE** — correcto para D16.1 |
| `src/lib/scientific/methodology/` sin React / `@/app` / `@/components` / `next` | **PASS** (grep repo-wide) |
| Dominio SCI-50→60 builders fuera de `page.tsx` | **PASS** — solo imports + `useMemo` |
| UI SCI-50–56 inline en `page.tsx` | **PRESENTE** — F5F bis backlog (fuera D16) |
| `npx tsc --noEmit` | **PASS** (2026-07-07) |
| Cambios funcionales en D16.1 | **NINGUNO** |
| Cambios de código en D16.1 | **NINGUNO** (solo este documento) |

---

## 2. Inventario de infraestructura

### 2.1 Gates existentes

| Gate | Archivo | npm script | Estado ejecución D16.1 |
|------|---------|------------|------------------------|
| **F5A** | [`scripts/validate-methodology-f5a-unit.ts`](scripts/validate-methodology-f5a-unit.ts) | `validate:methodology-f5a-unit` | **PASS** — `caseCount: 208`, `pass: true` |
| **Workflow (SCI-59)** | [`scripts/validate-workflow-unit.ts`](scripts/validate-workflow-unit.ts) | *(ausente)* | **PASS** — `npx tsx scripts/validate-workflow-unit.ts`; 9/9 W1–W9 |

### 2.2 Gates ausentes (planificados D16.2–D16.4)

| Gate | Archivo planificado | npm script planificado | Microfase |
|------|---------------------|------------------------|-----------|
| **F5B** | `scripts/validate-methodology-f5b-unit.ts` | `validate:methodology-f5b-unit` | D16.2 |
| **F5C** | `scripts/validate-methodology-f5c-unit.ts` | `validate:methodology-f5c-unit` | D16.3 |
| **F5D** | `scripts/validate-methodology-f5d-unit.ts` | `validate:methodology-f5d-unit` | D16.3 |
| **F5E** | `scripts/validate-methodology-f5e-unit.ts` | `validate:methodology-f5e-unit` | D16.4 |
| **Umbrella** | `scripts/validate-methodology-unit.ts` | `validate:methodology-unit` | D16.4 |
| **Util compartido** | `scripts/lib/methodology-gate-utils.ts` | — | D16.2 |

**No planificado (CA-D16.4-11):** `validate-publication-unit` — alias redundante; SCI-60 dominio se certifica vía `validate:methodology-f5e-unit`.

### 2.3 Scripts npm — estado actual vs pendiente

**Registrados hoy (`package.json` L22):**

```json
"validate:methodology-f5a-unit": "npx tsx scripts/validate-methodology-f5a-unit.ts"
```

**Pendientes de registro (D16.4, salvo F5B en D16.2):**

| Script npm | Archivo | Notas |
|------------|---------|-------|
| `validate:methodology-f5b-unit` | `validate-methodology-f5b-unit.ts` | D16.2 |
| `validate:methodology-f5c-unit` | `validate-methodology-f5c-unit.ts` | D16.3 |
| `validate:methodology-f5d-unit` | `validate-methodology-f5d-unit.ts` | D16.3 |
| `validate:methodology-f5e-unit` | `validate-methodology-f5e-unit.ts` | D16.4 |
| `validate:methodology-unit` | `validate-methodology-unit.ts` | D16.4 — orquestador puro |
| `validate:workflow-unit` | `validate-workflow-unit.ts` | D16.4 — script **pre-existente**, solo registro |

**Convención congelada:** prefijo `validate:methodology-*` para gates metodología; excepción documentada `validate:workflow-unit`.

### 2.4 Estructura `scripts/` relevante

```text
scripts/
  validate-methodology-f5a-unit.ts     ← EXISTE (515 LOC aprox.)
  validate-workflow-unit.ts            ← EXISTE (17 LOC)
  lib/
    gate-runner.mjs                    ← EXISTE (validate:full)
    validation-env.mjs                 ← EXISTE
    methodology-gate-utils.ts          ← AUSENTE (D16.2)
  validate-methodology-f5b-unit.ts     ← AUSENTE
  validate-methodology-f5c-unit.ts     ← AUSENTE
  validate-methodology-f5d-unit.ts     ← AUSENTE
  validate-methodology-f5e-unit.ts     ← AUSENTE
  validate-methodology-unit.ts         ← AUSENTE
```

**Total scripts `validate-methodology*` repo-wide:** 1 (solo F5A).

### 2.5 Contrato JSON de salida (F5A — referencia congelada)

```typescript
{
  phase: "methodology-f5a-unit";
  pass: boolean;
  caseCount: number;  // métrica observada — no objetivo fijo
  cases: { id: string; pass: boolean; detail?: string }[];
}
```

Exit code: `0` si `pass`, `1` si fallo.

**Umbrella planificado (D16.4):** agrega `subGates[]`; **prohibido** behavioral propio.

---

## 3. Baseline verificado

### 3.1 `validate-methodology-f5a-unit`

| Campo | Valor D16.1 |
|-------|-------------|
| Comando | `npm run validate:methodology-f5a-unit` |
| Resultado | **PASS** |
| `caseCount` | **208** |
| Alcance | SCI-50/51/52 behavioral + structural (no-inline, barrels, acyclic, module files) |
| Nota | Acta D9 documentaba 124 casos; baseline D16.1 mide **208** — script evolucionó post-D9 sin alterar dominio |

### 3.2 `validate-workflow-unit`

| Campo | Valor D16.1 |
|-------|-------------|
| Comando | `npx tsx scripts/validate-workflow-unit.ts` |
| Resultado | **PASS** |
| `caseCount` | **9** (W1–W9) |
| Registro npm | **AUSENTE** — gap explícito para D16.4 |
| Suite | `src/lib/scientific/workflow/__tests__/workflow-visibility-snapshot.cases` |

### 3.3 Ausencias confirmadas

| Artefacto | Existe | Correcto D16.1 |
|-----------|--------|----------------|
| `scripts/validate-methodology-f5b-unit.ts` | **NO** | ✓ |
| `scripts/validate-methodology-f5c-unit.ts` | **NO** | ✓ |
| `scripts/validate-methodology-f5d-unit.ts` | **NO** | ✓ |
| `scripts/validate-methodology-f5e-unit.ts` | **NO** | ✓ |
| `scripts/validate-methodology-unit.ts` | **NO** | ✓ |
| `scripts/lib/methodology-gate-utils.ts` | **NO** | ✓ |

### 3.4 Baseline `page.tsx`

| Métrica | Valor D16.1 |
|---------|-------------|
| LOC total | **28.661** |
| Dominio inline SCI-50→60 builders | **AUSENTE** — consumo vía barrels L169–235 |
| UI inline SCI-50–56 | **PRESENTE** — 7 componentes (L10489–L11195 aprox.) |
| `useMemo` cadena metodología | L18386–L18739 (boundary — permanece) |

**Verificación no-inline dominio F5B–E (grep):**

```text
buildEvidenceStrengthEngineAnalysis      → import barrel only (L196, L18619)
buildAssumptionTrackerAnalysis           → import barrel only (L204, L18644)
buildPublicationReadinessAnalyzerAnalysis → import barrel only (L214, L18665)
buildMethodologicalDashboardAnalysis     → import barrel only (L222, L18684)
buildPublicationDashboardAnalysis        → import barrel only (L228, L18721)
```

**PASS** — ningún `const build*Analysis =` inline para SCI-53→60.

---

## 4. API Freeze — inventario barrels (solo lectura)

### 4.1 Módulos F5A (certificados por gate existente)

#### `consistency/` — SCI-50

| Export | Tipo |
|--------|------|
| `ConsistencyEngineAnalysis` | type |
| `ConsistencyEngineClassification` | type |
| `ConsistencyEngineBuildInput` | type |
| `buildConsistencyEngineAnalysis` | function |
| `hasConsistencyEngineInput` | function |
| `hasConsistencyEngineVeryStrong` | function |
| `hasConsistencyEngineWeak` | function |
| `getConsistencyEngineClassificationLabel` | function |
| `getConsistencyEngineReportLines` | function |

#### `report-quality/` — SCI-51

| Export | Tipo |
|--------|------|
| `ReportQualityEngineAnalysis` | type |
| `ReportQualityEngineClassification` | type |
| `ReportQualityEngineBuildInput` | type |
| `buildReportQualityEngineAnalysis` | function |
| `hasReportQualityEngineInput` | function |
| `hasReportQualityEngineExcellent` | function |
| `hasReportQualityEngineLimited` | function |
| `getReportQualityEngineClassificationLabel` | function |
| `getReportQualityEngineReportLines` | function |

#### `reproducibility/` — SCI-52

| Export | Tipo |
|--------|------|
| `ReproducibilityExplorerAnalysis` | type |
| `ReproducibilityExplorerClassification` | type |
| `ReproducibilityExplorerBuildInput` | type |
| `buildReproducibilityExplorerAnalysis` | function |
| `hasReproducibilityExplorerInput` | function |
| `hasReproducibilityExplorerVeryHigh` | function |
| `hasReproducibilityExplorerLow` | function |
| `getReproducibilityExplorerClassificationLabel` | function |
| `getReproducibilityExplorerReportLines` | function |

### 4.2 Módulos F5B — pendientes gate D16.2

#### `evidence/` — SCI-53 (9 exports)

| Export | Tipo | Dimensión cobertura D16.2 |
|--------|------|---------------------------|
| `EvidenceStrengthEngineAnalysis` | type | API Freeze |
| `EvidenceStrengthEngineClassification` | type | API Freeze |
| `EvidenceStrengthEngineBuildInput` | type | API Freeze |
| `buildEvidenceStrengthEngineAnalysis` | builder | nominal + límite (null input) |
| `hasEvidenceStrengthEngineInput` | helper | true/false |
| `hasEvidenceStrengthEngineVeryStrong` | helper | true/false |
| `hasEvidenceStrengthEngineLimited` | helper | true/false |
| `getEvidenceStrengthEngineClassificationLabel` | label | por clasificación |
| `getEvidenceStrengthEngineReportLines` | report | presencia + formato |

**Upstream:** `consistency`, `report-quality`, `reproducibility` (types en `build.ts`).

#### `assumptions/` — SCI-54 (11 exports)

| Export | Tipo | Dimensión cobertura D16.2 |
|--------|------|---------------------------|
| `AssumptionTrackerAnalysis` | type | API Freeze |
| `AssumptionTrackerClassification` | type | API Freeze |
| `AssumptionTrackerBuildInput` | type | API Freeze |
| `buildAssumptionTrackerAnalysis` | builder | nominal + límite |
| `hasAssumptionTrackerInput` | helper | true/false |
| `hasAssumptionTrackerExcellent` | helper | true/false |
| `hasAssumptionTrackerLimited` | helper | true/false |
| `getAssumptionTrackerClassificationLabel` | label | por clasificación |
| `getAssumptionTrackerStatusLabel` | label | por status |
| `getAssumptionTrackerStatusIcon` | label | por status |
| `getAssumptionTrackerReportLines` | report | presencia + formato |

### 4.3 Módulo F5C — pendiente gate D16.3

#### `readiness/` — SCI-55 (9 exports)

| Export | Tipo | Dimensión cobertura D16.3 |
|--------|------|---------------------------|
| `PublicationReadinessAnalyzerAnalysis` | type | API Freeze |
| `PublicationReadinessAnalyzerClassification` | type | API Freeze |
| `PublicationReadinessAnalyzerBuildInput` | type | API Freeze |
| `buildPublicationReadinessAnalyzerAnalysis` | builder | nominal + límite |
| `hasPublicationReadinessAnalyzerInput` | helper | true/false |
| `hasPublicationReadinessAnalyzerReady` | helper | true/false |
| `hasPublicationReadinessAnalyzerNotReady` | helper | true/false |
| `getPublicationReadinessAnalyzerClassificationLabel` | label | por clasificación |
| `getPublicationReadinessAnalyzerReportLines` | report | presencia + formato |

**Upstream:** `assumptions`, `consistency`, `evidence`, `report-quality`, `reproducibility`.

### 4.4 Módulo F5D — pendiente gate D16.3

#### `summary/` — SCI-56 (6 exports)

| Export | Tipo | Dimensión cobertura D16.3 |
|--------|------|---------------------------|
| `MethodologicalDashboardAnalysis` | type | API Freeze |
| `MethodologicalDashboardBuildInput` | type | API Freeze |
| `buildMethodologicalDashboardAnalysis` | builder | nominal + límite |
| `canBuildMethodologicalDashboard` | helper | true/false |
| `getMethodologicalDashboardReportLines` | report | presencia + formato |

**Upstream:** cadena SCI-50→55 vía `MethodologicalDashboardBuildInput`.

### 4.5 Módulo F5E — pendiente gate D16.4

#### `publication/` — SCI-60 (8 exports — API Freeze D13)

| Export | Tipo | Dimensión cobertura D16.4 |
|--------|------|---------------------------|
| `PublicationDashboardAnalysis` | type | API Freeze |
| `PublicationDashboardBuildInput` | type | API Freeze |
| `buildPublicationDashboardAnalysis` | builder | nominal + baselines QA-1 |
| `canBuildPublicationDashboard` | helper | true/false |
| `buildPublicationDashboardNormalitySummary` | builder | sub-builder exportado |
| `buildPublicationDashboardMultivariateHighlights` | builder | sub-builder exportado |
| `buildPublicationDashboardInferentialHighlight` | builder | sub-builder exportado |
| `getPublicationDashboardReportLines` | report | presencia + formato |

**Baselines QA-1 congelados (referencia move-only):**

| Dataset | Publication Status | Readiness Score |
|---------|-------------------|-----------------|
| Dataset5 | Near Ready | **77.0** |
| Dataset6 | Requires Review | **67.5** |

**Upstream:** `readiness`, `summary`, `evidence`, `normality`, `inference`.

---

## 5. Helpers reutilizables — inventario F5A (migración D16.2)

Análisis de [`scripts/validate-methodology-f5a-unit.ts`](scripts/validate-methodology-f5a-unit.ts). **No extraídos en D16.1.**

| Helper | Líneas | Rol | Destino planificado |
|--------|--------|-----|---------------------|
| `assertCase(id, pass, detail?)` | 37–38 | Registro caso PASS/FAIL | `methodology-gate-utils.ts` |
| `approxEqual(actual, expected, ε)` | 41–43 | Comparación scores numéricos | idem |
| `extractBarrelExports(source)` | 379–399 | Parse exports barrel para API Freeze | idem |
| `collectTsFiles(dir)` | 424–433 | Recorrido árbol `.ts` | idem |
| Loop `allowedBarrelExports` | 402–417 | Verificación API exacta | Patrón reutilizable; mapa **por gate** |
| `forbiddenImportPatterns` + loop | 437–453 | Anti React/page en methodology | Evolucionar → `structure.methodology.boundary-clean` |
| Loop `inlineDomainPatterns` | 305–326 | Anti-inline dominio en page.tsx | Patrón por gate (SCI específico) |
| Loop `structure.module.*` | 490–504 | Presencia archivos canónicos | Patrón reutilizable con params |
| Checks `structure.acyclic.*` | 462–486 | Grafo imports | Patrón por gate (deps específicas) |

**Regla D16.2:** al crear F5B + refactor F5A, ≥3 helpers idénticos → extracción **obligatoria** a util agnóstico (sin imports `@/lib/scientific/methodology/*`).

**Gap identificado vs plan D16:** F5A verifica `react` y `@/app/page` pero **no** `next/*` ni `@/components/*`. El gate unificado `structure.methodology.boundary-clean` (D16.2+) debe cubrir:

- `react`, `react/*`
- `next`, `next/*`
- `@/app/*`, `src/app/*`
- `@/components/*`, `src/components/*`

**Baseline boundary D16.1 (grep estático):** cero coincidencias en `src/lib/scientific/methodology/` — dominio ya aislado.

---

## 6. Boundary — confirmación documental

| Regla | Verificación D16.1 | Resultado |
|-------|---------------------|-----------|
| Cero imports React en `methodology/` | `rg 'from ["\']react'` | **PASS** — 0 matches |
| Cero imports Next en `methodology/` | `rg 'from ["\']next'` | **PASS** — 0 matches |
| Cero imports `@/app/*` | `rg '@/app'` | **PASS** — 0 matches |
| Cero imports `@/components/*` | `rg '@/components'` | **PASS** — 0 matches |
| Dominio sin UI | Inspección manual 46 archivos `.ts` | **PASS** |
| Scripts F5A no importan React/UI | Inspección F5A imports | **PASS** — solo `node:*` + barrels |
| `page.tsx` no redefine dominio F5B–E | grep builders inline | **PASS** |

**Sin cambios realizados** — solo verificación.

---

## 7. Matriz de cobertura funcional (documental — sin tests)

Regla: cada gate debe cubrir **100% API pública** del alcance. `caseCount` = consecuencia, no objetivo fijo.

### 7.1 F5B — `validate-methodology-f5b-unit` (D16.2)

| Dimensión | `evidence/` | `assumptions/` |
|-----------|-------------|----------------|
| Builders públicos | `buildEvidenceStrengthEngineAnalysis` | `buildAssumptionTrackerAnalysis` |
| Helpers públicos | `has*Input`, `has*VeryStrong`, `has*Limited` | `has*Input`, `has*Excellent`, `has*Limited` |
| Labels públicos | `getEvidenceStrengthEngineClassificationLabel` | `getAssumptionTrackerClassificationLabel`, `getAssumptionTrackerStatusLabel`, `getAssumptionTrackerStatusIcon` |
| Report lines | `getEvidenceStrengthEngineReportLines` | `getAssumptionTrackerReportLines` |
| Casos nominales | Fixture upstream SCI-50→52 poblado | Fixture assumptions poblado |
| Casos límite | Input vacío → null | Input vacío → null |
| API Freeze | 9 exports barrel exactos | 11 exports barrel exactos |
| Structural | no-inline SCI-53; imports barrel page | no-inline SCI-54; imports barrel page |
| boundary-clean | `structure.methodology.boundary-clean` | idem |
| Acyclic | evidence → consistency/report-quality/reproducibility | assumptions acyclic vs downstream |

### 7.2 F5C — `validate-methodology-f5c-unit` (D16.3)

| Dimensión | `readiness/` |
|-----------|--------------|
| Builders | `buildPublicationReadinessAnalyzerAnalysis` |
| Helpers | `hasPublicationReadinessAnalyzerInput`, `Ready`, `NotReady` |
| Labels | `getPublicationReadinessAnalyzerClassificationLabel` |
| Report lines | `getPublicationReadinessAnalyzerReportLines` |
| Nominal | Readiness score representativo con upstream completo |
| Límite | Upstream ausente → null o clasificación mínima |
| API Freeze | 9 exports exactos |
| Structural | no-inline SCI-55; import barrel page |
| boundary-clean | PASS global methodology |

### 7.3 F5D — `validate-methodology-f5d-unit` (D16.3)

| Dimensión | `summary/` |
|-----------|------------|
| Builders | `buildMethodologicalDashboardAnalysis` |
| Helpers | `canBuildMethodologicalDashboard` |
| Report lines | `getMethodologicalDashboardReportLines` |
| Nominal | Dashboard con inputs SCI-50→55 |
| Límite | `canBuild` false → null builder |
| API Freeze | 6 exports exactos |
| Structural | no-inline SCI-56; import barrel page |
| Upstream chain | Verificar dependencia SCI-50→55 en build input |
| boundary-clean | PASS global methodology |

### 7.4 F5E — `validate-methodology-f5e-unit` (D16.4)

| Dimensión | `publication/` |
|-----------|----------------|
| Builders | `buildPublicationDashboardAnalysis` + 3 sub-builders exportados |
| Helpers | `canBuildPublicationDashboard` |
| Report lines | `getPublicationDashboardReportLines` |
| Nominal | Dataset5 → score **77.0** / Near Ready |
| Nominal | Dataset6 → score **67.5** / Requires Review |
| Límite | `canBuild` false; upstream parcial |
| API Freeze | 8 exports exactos (D13 congelado) |
| Structural | no-inline SCI-60 dominio; import barrel page |
| boundary-clean | PASS global methodology |

### 7.5 Umbrella — `validate-methodology-unit` (D16.4)

| Permitido | Prohibido |
|-----------|-----------|
| Ejecutar F5A–F5E | Casos behavioral propios |
| Agregar `cases[]` / `caseCount` | Duplicar validaciones sub-gates |
| Calcular PASS/FAIL global | Import `@/lib/scientific/methodology/*` |
| Emitir JSON uniforme + `subGates[]` | Fixtures SCI propios |

---

## 8. Gaps identificados (handoff D16.2)

| ID | Gap | Severidad | Resolución |
|----|-----|-----------|------------|
| GAP-1 | F5B–F5E scripts ausentes | Alta | D16.2–D16.4 |
| GAP-2 | `methodology-gate-utils.ts` ausente | Alta | D16.2 |
| GAP-3 | `validate:workflow-unit` sin registro npm | Media | D16.4 |
| GAP-4 | Umbrella ausente | Alta | D16.4 |
| GAP-5 | F5A helpers duplicables (no extraídos) | Media | D16.2 refactor move-only |
| GAP-6 | F5A boundary parcial (sin next/components check unificado) | Baja | D16.2 `boundary-clean` |
| GAP-7 | UI SCI-50–56 inline (~669 LOC) | Baja (fuera D16) | F5F bis post-D16/D17 |
| GAP-8 | `validate:full` no incluye gates methodology | Info | Fuera alcance D16 salvo amend explícito |

---

## 9. Criterios de aceptación D16.1

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D16.1-1 | Existe `D16_1_METHODOLOGY_GATE_PREP.md` con inventario F5A–E | **PASS** |
| CA-D16.1-2 | Confirmado F5A PASS | **PASS** (208 casos) |
| CA-D16.1-3 | Confirmado F5B–E scripts y util ausentes | **PASS** |
| CA-D16.1-4 | Confirmado `validate:workflow-unit` existe pero no en `package.json` | **PASS** |
| CA-D16.1-5 | Matriz cobertura funcional documentada (§7) | **PASS** |
| CA-D16.1-6 | Cero diffs en `src/` | **PASS** |

---

## 10. Handoff → D16.2

**D16.1 — CLOSED.** Próxima microfase:

**D16.2 — Util compartido + Gate F5B (SCI-53/54)**

Entregables D16.2:
1. Crear `scripts/lib/methodology-gate-utils.ts` (agnóstico dominio)
2. Refactor move-only F5A → import util
3. Crear `scripts/validate-methodology-f5b-unit.ts` — cobertura API completa `evidence/` + `assumptions/`
4. Registrar `validate:methodology-f5b-unit` en `package.json`
5. Incluir `structure.methodology.boundary-clean` en F5B

**Sin deuda pendiente de prep** — inventario, baseline, API Freeze y matriz cobertura listos para BUILD.

---

*Prep D16.1 — 2026-07-07 · Solo documentación · Cero diffs `src/` · `tsc --noEmit` PASS*
