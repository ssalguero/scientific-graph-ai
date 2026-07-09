# PROJECT_STATUS — PROD-2E

**Épica:** PROD-2E — Motor gráfico profesional  
**Estado épica:** **OPEN** (D27 CLOSED — Ready for D28)  
**SSOT Plan:** [`PROJECT_PLAN_PROD_2E.md`](PROJECT_PLAN_PROD_2E.md)  
**Discovery:** [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md)  
**Baseline:** [`PROJECT_BASELINE_PROD_2E.md`](PROJECT_BASELINE_PROD_2E.md)

---

## §D25 — Discovery + Baseline + Plan Freeze + API Freeze + Acta

**Estado:** **CLOSED** (2026-07-09)  
**Modo:** BUILD STRICT — documentación únicamente  
**Próxima microfase:** **D26 — DATA-3B Heatmap**

### D25.1 — Discovery

| Campo | Valor |
|-------|-------|
| **Entregable** | [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) |
| **Alcance IN** | DATA-3B (heatmap, bubble, pca) · GRAPH-1 · GRAPH-2 · ARCH-5 F5F-BIS + SCI-40 |
| **Alcance OUT** | EXPORT-* · PROD-1B · QA-2 · schemaVersion bump |
| **Decisión tipo #3** | **pca** (vs clustering) — menor acoplamiento VGB |
| **Amend SCI-40** | **Escenario B** activo (8.532 LOC > 1.000) |
| **Resultado** | **PASS** |

### D25.2 — Baseline

| Campo | Valor |
|-------|-------|
| **Entregable** | [`PROJECT_BASELINE_PROD_2E.md`](PROJECT_BASELINE_PROD_2E.md) |
| **LOC page.tsx** | 26.476 |
| **LOC visualGraphBuilder.ts** | 637 |
| **SCI-40 inline** | ~8.532 LOC |
| **F5F-BIS inline** | ~718 LOC |
| **Script medición** | `scripts/measure-prod2e-baseline-perf.ts` |
| **Preview scatter median** | 0.0474 ms |
| **Hydrate mono median** | 0.5591 ms |
| **Resultado** | **PASS** |

### D25.3 — Plan Freeze

| Campo | Valor |
|-------|-------|
| **Entregable** | [`PROJECT_PLAN_PROD_2E.md`](PROJECT_PLAN_PROD_2E.md) |
| **Calendario** | D25 → D36 (Escenario B SCI-40) |
| **Checklist cierre épica** | 0/9 (OPEN) |
| **Resultado** | **PASS** |

### D25.4 — API Freeze VGB

| Campo | Valor |
|-------|-------|
| **SSOT** | [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) §6 |
| **Tipos nuevos** | `heatmap`, `bubble`, `pca` |
| **Campos opcionales** | `sizeVariable`, `colorVariable`, `pcaVariables`, `pcaStandardize`, `publicationPresetId` |
| **schemaVersion** | **NO bump** |
| **VGB-R1** | Reafirmado |
| **Compatibilidad V2** | Proyectos existentes sin pérdida |
| **Resultado** | **PASS** |

### D25.5 — Acta + cierre D25

#### CA-D25 — Certificación (7/7)

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D25-01** | Discovery PASS | `PROJECT_DISCOVERY_PROD_2E.md` completo | **PASS** |
| **CA-D25-02** | Baseline PASS | LOC + SCI-40 + rendimiento gráfico | **PASS** |
| **CA-D25-03** | API Freeze PASS | §6 Discovery + Plan § D25.4 | **PASS** |
| **CA-D25-04** | Plan congelado PASS | `PROJECT_PLAN_PROD_2E.md` D25→D36 | **PASS** |
| **CA-D25-05** | Sanity Gate PASS | VGB gates PASS; prod2d-gate ver nota | **PASS CONDICIONADO** |
| **CA-D25-06** | Handoff D26 autorizado | Prerequisitos verificados abajo | **PASS** |
| **CA-D25-07** | 0 cambios funcionales | Sin cambios `src/` producto | **PASS** |

**Total CA-D25: 7/7 PASS** (CA-D25-05 condicionado per L-D23-2)

#### Nota CA-D25-05 — Sanity Gate

| Gate | Resultado | Detalle |
|------|-----------|---------|
| `validate:prod2c-c8-regression-gate` | **PASS** | 5/5 sub-gates |
| `validate:visual-graph-builder-unit` | **PASS** | 10/10 |
| `validate:chart-viewport` | **PASS** | 9/9 |
| `validate:arch5-f5-modularization-gate` | **PASS** | 11 casos (prod2d-gate sub) |
| `validate:visibility-unit` | **PASS** | 30 casos |
| `validate:project-history-unit` | **PASS** | 26 casos |
| `validate:prod2b-b2-gate` | **PASS** (standalone, 18 sub-gates) | Ejecutado post-D25; no regresión persistencia |
| `validate:prod2d-gate` | **FAIL infra** | Solo `validate:full` en contexto umbrella — política L-D23-2 |

D25 no modifica código; fallo umbrella atribuido a infraestructura E2E preexistente, no regresión PROD-2E.

#### Handoff D26

```text
D25 CLOSED — Ready for D26
Prerequisitos D26:
  ✓ API Freeze §6 congelado (heatmap, bubble, pca)
  ✓ Baseline LOC + rendimiento capturado
  ✓ Plan D26–D36 congelado
  ✓ 0 cambios funcionales D25
  ✓ Gates VGB C4–C8 PASS
Next BUILD: D26 — DATA-3B Heatmap
```

#### Archivos D25

| Acción | Archivo |
|--------|---------|
| **Creado** | `PROJECT_DISCOVERY_PROD_2E.md` |
| **Creado** | `PROJECT_BASELINE_PROD_2E.md` |
| **Creado** | `PROJECT_PLAN_PROD_2E.md` |
| **Creado** | `PROJECT_STATUS_PROD_2E.md` |
| **Creado** | `scripts/measure-prod2e-baseline-perf.ts` (medición read-only) |

**No modificados:** `src/**`, README, ROADMAP, MASTER (sync en D36.5).

---

## §D26 — DATA-3B Heatmap

**Estado:** **CLOSED** (2026-07-09)  
**Modo:** BUILD — dominio · UI · persistencia · gates · acta  
**Próxima microfase:** **D27 — DATA-3B Bubble**

### Métricas D26

| Campo | Valor |
|-------|-------|
| **Tipo nuevo operativo** | `heatmap` |
| **Tipos VGB activos** | **7** (scatter, line, bar, histogram, boxPlot, violin, heatmap) |
| **schemaVersion** | **2** (sin bump) |
| **Golden fixture** | `scripts/fixtures/project-v2-dataset5-with-heatmap.sgproj` |
| **Campo nuevo persistido** | `colorVariable` (opcional, solo heatmap) |
| **Campo efímero** | `heatmapData` (preview only — VGB-R1) |
| **Performance gate** | 100 iter · dataset `project-v2-dataset5-minimal.sgproj` |
| **Mediana heatmap preview** | **0.0781 ms** |
| **P95 heatmap preview** | **0.7736 ms** |
| **Resultado épica microfase** | **PASS** |

### D26.1 — Dominio VGB

| Campo | Valor |
|-------|-------|
| **Objetivo** | Extender contrato VGB con tipo `heatmap`, `colorVariable`, matriz Pearson determinista |
| **Archivos** | `src/lib/visualGraphBuilder.ts`, `src/lib/project/domain/visual-graph-domain.ts`, `src/lib/project/domain/validate-v2.ts` |
| **Algoritmo** | `buildHeatmapMatrixFromWorksheet()` — Pearson propio, ε=1e-12, diagonal=1, NaN→0 |
| **API Freeze** | Extensión additive; 6 tipos v1 intactos |
| **Resultado** | **PASS** |

### D26.2 — Preview renderer

| Campo | Valor |
|-------|-------|
| **Objetivo** | Renderer Heatmap en preview VGB (CSS Grid, escala −1..1) |
| **Archivos** | `src/components/graph-builder/HeatmapPreview.tsx` (nuevo), `src/components/graph-builder/GraphPreview.tsx` |
| **Restricción** | Sin transformación de datos en renderer; valores del dominio |
| **Resultado** | **PASS** |

### D26.3 — UI configuración

| Campo | Valor |
|-------|-------|
| **Objetivo** | Panel Heatmap en `VisualGraphBuilder` (X/Y/colorVariable opcionales) |
| **Archivos** | `src/components/graph-builder/VisualGraphBuilder.tsx` |
| **Nota** | `GraphTypeSelector` ya incluía `heatmap` en `VISUAL_GRAPH_TYPES_V1` |
| **Resultado** | **PASS** |

### D26.4 — Persistencia + Golden Fixture

| Campo | Valor |
|-------|-------|
| **Objetivo** | Round-trip V2 + golden fixture independiente + casos C8 heatmap |
| **Archivos** | `scripts/generate-prod2e-d26-heatmap-golden-fixture.ts`, `scripts/fixtures/project-v2-dataset5-with-heatmap.sgproj`, `src/lib/project/__tests__/visual-graph-fixtures.cases.ts`, `src/lib/project/__tests__/visual-graph-mapper-helpers.ts` |
| **Gate C8 fixtures** | `validate:prod2c-c8-visual-graph-fixtures` — **20/20 PASS** |
| **VGB-R1** | JSON golden sin `preview`, `heatmapData`, `displaySeries` |
| **Resultado** | **PASS** |

### D26.5 — Gates unitarios y regresión

| Campo | Valor |
|-------|-------|
| **Objetivo** | Certificar Heatmap mediante gates dedicados + regresión C4–C8 |
| **Archivos** | `src/lib/visualGraphBuilder/__tests__/heatmap.cases.ts`, `scripts/validate-prod2e-d26-heatmap-unit.ts`, `scripts/validate-prod2e-d26-heatmap-perf.ts`, ampliación `validate-visual-graph-builder-unit` + casos C4/C5/C6 |
| **Casos heatmap unit** | 14 (config, columnas, colorVariable, matriz, determinismo, build/apply/incorporate, VGB-R1, hydrate, scatter regression) |
| **Resultado** | **PASS** |

### D26.6 — Acta + cierre D26

| Campo | Valor |
|-------|-------|
| **Objetivo** | Acta oficial, métricas, gates, decisiones arquitectónicas, handoff D27 |
| **Alcance** | Documentación únicamente (`PROJECT_STATUS_PROD_2E.md`) |
| **Resultado** | **PASS** |

#### Gates D26 — Certificación

| Gate | Resultado | Casos / detalle |
|------|-----------|-----------------|
| `validate:prod2e-d26-heatmap-unit` | **PASS** | 14/14 |
| `validate:visual-graph-builder-unit` | **PASS** | 14/14 |
| `validate:prod2c-c4-visual-graph-mapper` | **PASS** | 22/22 |
| `validate:prod2c-c5-visual-graph-collect` | **PASS** | 13/13 |
| `validate:prod2c-c6-visual-graph-hydrate` | **PASS** | 18/18 |
| `validate:prod2c-c8-regression-gate` | **PASS** | 5/5 sub-gates (C4–C8); fixtures 20/20 |
| `validate:prod2e-d26-heatmap-perf` | **PASS** (informativo) | 100 iter · mediana **0.0781 ms** · p95 **0.7736 ms** · dataset `project-v2-dataset5-minimal.sgproj` |
| `npx tsc --noEmit` | **PASS** | — |

**Regresión tipos v1:** Scatter, Line, Bar, Histogram, BoxPlot, Violin — **PASS** (C8 umbrella sin reducción de cobertura).

#### Decisiones arquitectónicas D26

**Decisión A — Shape uniforme de `VisualGraphPreview`**

`VisualGraphPreview` mantiene un shape uniforme con todos los arrays presentes. `heatmapData` se incorpora como un array obligatorio (vacío para tipos no Heatmap) para preservar el patrón histórico del Visual Graph Builder. Esta decisión es deliberada, no afecta la persistencia (VGB-R1) y simplifica renderizado, comparación, tests y la futura incorporación de Bubble y PCA.

**Decisión B — Herencia de X/Y**

Al cambiar desde Scatter o Line hacia Heatmap, `xVariable` e `yVariable` pueden conservar sus valores anteriores por diseño. El dominio solo restringe el Heatmap cuando ambas variables corresponden a columnas numéricas válidas del Worksheet. El comportamiento es compatible con el contrato de D26 y no constituye una regresión. Cualquier mejora de UX (por ejemplo, limpiar automáticamente X/Y al cambiar de tipo) queda fuera del alcance de D26 y podrá evaluarse en una fase futura.

#### VGB-R1 — Re-certificación D26

Nunca se persisten:

- `preview`
- `heatmapData`
- `displaySeries`

Únicamente se persiste `GraphSpecification` (+ metadatos de entrada VGB: `id`, `sourceDatasetId`, `createdAt`). Certificado en gates heatmap unit, C4/C5/C6, C8 golden y `hydrate.vgbR1.reCollectNoPreviewLeak` (incluye rechazo de `"heatmapData"` en JSON serializado).

#### API Freeze D26

Durante D26:

- **No** hubo schema bump (`schemaVersion` permanece **2**)
- **No** hubo breaking changes
- **No** hubo cambios en los seis tipos VGB existentes
- **Únicamente** se añadió el tipo `heatmap` y el campo opcional `colorVariable`

#### CA-D26 — Certificación (10/10)

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D26-01** | D26.1 Dominio PASS | `heatmap` + `colorVariable` + matriz Pearson en `visualGraphBuilder.ts` | **PASS** |
| **CA-D26-02** | D26.2 Preview PASS | `HeatmapPreview.tsx` + rama en `GraphPreview.tsx` | **PASS** |
| **CA-D26-03** | D26.3 UI PASS | Panel Heatmap en `VisualGraphBuilder.tsx` | **PASS** |
| **CA-D26-04** | D26.4 Persistencia PASS | Golden `project-v2-dataset5-with-heatmap.sgproj` + C8 20/20 | **PASS** |
| **CA-D26-05** | D26.5 Gates PASS | 8 gates listados arriba — todos PASS | **PASS** |
| **CA-D26-06** | VGB-R1 PASS | Sin `preview`/`heatmapData`/`displaySeries` en persistencia | **PASS** |
| **CA-D26-07** | API Freeze PASS | Sin bump · sin breaking · 6 tipos v1 intactos | **PASS** |
| **CA-D26-08** | Regresión v1 PASS | Scatter–Violin PASS en C8 umbrella | **PASS** |
| **CA-D26-09** | Performance documentada | `validate:prod2e-d26-heatmap-perf` mediana 0.0781 ms | **PASS** |
| **CA-D26-10** | TypeScript PASS | `npx tsc --noEmit` | **PASS** |

**Total CA-D26: 10/10 PASS** · Sin deuda técnica dentro del alcance D26.

#### Handoff D27

```text
D26 CLOSED — Ready for D27
Prerrequisitos D27:
  ✓ Heatmap operativo (tipo #1 DATA-3B)
  ✓ Persistencia V2 certificada (round-trip + golden)
  ✓ Golden fixture certificado (project-v2-dataset5-with-heatmap.sgproj)
  ✓ VGB-R1 certificado (preview/heatmapData/displaySeries excluidos)
  ✓ API Freeze respetado (schemaVersion 2, extensión additive)
  ✓ C8 regression PASS (20/20 fixtures)
  ✓ Performance registrada (mediana 0.0781 ms, 100 iter)
  ✓ TypeScript PASS
Next BUILD: D27 — DATA-3B Bubble (sizeVariable)
```

#### Archivos D26 (acumulado microfases D26.1–D26.5)

| Acción | Archivo |
|--------|---------|
| **Modificado** | `src/lib/visualGraphBuilder.ts` |
| **Modificado** | `src/lib/project/domain/visual-graph-domain.ts` |
| **Modificado** | `src/lib/project/domain/validate-v2.ts` |
| **Creado** | `src/components/graph-builder/HeatmapPreview.tsx` |
| **Modificado** | `src/components/graph-builder/GraphPreview.tsx` |
| **Modificado** | `src/components/graph-builder/VisualGraphBuilder.tsx` |
| **Creado** | `scripts/generate-prod2e-d26-heatmap-golden-fixture.ts` |
| **Creado** | `scripts/fixtures/project-v2-dataset5-with-heatmap.sgproj` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-fixtures.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-mapper-helpers.ts` |
| **Creado** | `src/lib/visualGraphBuilder/__tests__/heatmap.cases.ts` |
| **Creado** | `scripts/validate-prod2e-d26-heatmap-unit.ts` |
| **Creado** | `scripts/validate-prod2e-d26-heatmap-perf.ts` |
| **Modificado** | `scripts/validate-visual-graph-builder-unit.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-mapper.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-collect.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-hydrate.cases.ts` |
| **Modificado** | `package.json` (scripts generate + validate heatmap) |
| **Modificado** | `PROJECT_STATUS_PROD_2E.md` (acta D26.6) |

**No modificado en D26.6:** `src/**`, `scripts/**`, `fixtures/**`, `package.json`, README (no documenta conteo explícito de tipos VGB).

---

## §D27 — DATA-3B Bubble

**Estado:** **CLOSED** (2026-07-09)  
**Modo:** BUILD — dominio · UI · persistencia · gates · acta  
**Próxima microfase:** **D28 — DATA-3B PCA**

### Resumen ejecutivo

Bubble queda oficialmente operativo como **segundo tipo DATA-3B** del motor VGB PROD-2E. La microfase D27 implementa el tipo `bubble` con `sizeVariable`, preview determinista, panel de configuración UI, persistencia V2 round-trip, golden fixture propio y batería completa de gates — sin deuda técnica dentro del alcance.

| Indicador | Estado |
|-----------|--------|
| **Bubble implementado** | ✓ Dominio · preview · UI |
| **Persistencia V2 certificada** | ✓ Round-trip + mapper/collect/hydrate |
| **Golden Fixture propio** | ✓ `project-v2-dataset5-with-bubble.sgproj` |
| **API Freeze respetado** | ✓ `schemaVersion` 2 · extensión additive |
| **VGB-R1 respetado** | ✓ Sin `preview`/`bubbleData`/`displaySeries` en persistencia |
| **Deuda técnica en alcance** | **Ninguna** |

### Métricas D27

| Campo | Valor |
|-------|-------|
| **Tipo nuevo operativo** | `bubble` |
| **Tipos VGB activos** | **8** (scatter, line, bar, histogram, boxPlot, violin, heatmap, bubble) |
| **schemaVersion** | **2** (sin bump) |
| **Golden fixtures certificados** | Heatmap + Bubble |
| **Golden fixture Bubble** | `scripts/fixtures/project-v2-dataset5-with-bubble.sgproj` |
| **Campo nuevo persistido** | `sizeVariable` (opcional, solo bubble) |
| **Campo efímero** | `bubbleData` (preview only — VGB-R1) |
| **Bubble unit** | **20/20 PASS** |
| **Visual Graph Builder unit** | **35/35 PASS** |
| **C8 fixtures** | **27/27 PASS** |
| **Performance gate** | 100 iter · dataset `project-v2-dataset5-minimal.sgproj` |
| **Mediana bubble preview** | **0.0294 ms** |
| **P95 bubble preview** | **0.0858 ms** |
| **Resultado épica microfase** | **PASS** |

### D27.1 — Dominio VGB

| Campo | Valor |
|-------|-------|
| **Objetivo** | Extender contrato VGB con tipo `bubble`, `sizeVariable`, `buildBubblePointsFromWorksheet()` |
| **Archivos** | `src/lib/visualGraphBuilder.ts`, `src/lib/project/domain/visual-graph-domain.ts`, `src/lib/project/domain/validate-v2.ts` |
| **Algoritmo** | Normalización fija `BUBBLE_SIZE_MIN=0.25` · `BUBBLE_SIZE_MAX=1.00` · `BUBBLE_SIZE_FIXED=1.00`; Política C (negativos sin `Math.abs`); NaN/±Infinity → fila descartada |
| **API Freeze** | Extensión additive; 7 tipos previos intactos |
| **Resultado** | **PASS** |

### D27.2 — Preview renderer

| Campo | Valor |
|-------|-------|
| **Objetivo** | Renderer Bubble en preview VGB (Recharts ScatterChart + shape custom) |
| **Archivos** | `src/components/graph-builder/BubblePreview.tsx` (nuevo), `src/components/graph-builder/GraphPreview.tsx` |
| **Restricción** | Radio visual = `point.size * 12` (escala UI); sin transformación de dominio en renderer |
| **Resultado** | **PASS** |

### D27.3 — UI configuración

| Campo | Valor |
|-------|-------|
| **Objetivo** | Panel Bubble en `VisualGraphBuilder` (X/Y/sizeVariable/grupo) |
| **Archivos** | `src/components/graph-builder/VisualGraphBuilder.tsx` |
| **Nota** | `sizeVariable` y `groupVariable` solo en bubble; controles color/marker permanecen scatter/line |
| **Resultado** | **PASS** |

### D27.4 — Persistencia + Golden Fixture

| Campo | Valor |
|-------|-------|
| **Objetivo** | Round-trip V2 + golden fixture independiente + casos C8 bubble |
| **Archivos** | `scripts/generate-prod2e-d27-bubble-golden-fixture.ts`, `scripts/fixtures/project-v2-dataset5-with-bubble.sgproj`, `src/lib/project/__tests__/visual-graph-fixtures.cases.ts`, `src/lib/project/__tests__/visual-graph-mapper-helpers.ts` |
| **Gate C8 fixtures** | `validate:prod2c-c8-visual-graph-fixtures` — **27/27 PASS** |
| **VGB-R1** | JSON golden sin `preview`, `bubbleData`, `displaySeries` |
| **Resultado** | **PASS** |

### D27.5 — Gates unitarios y regresión

| Campo | Valor |
|-------|-------|
| **Objetivo** | Certificar Bubble mediante gates dedicados + regresión C4–C8 |
| **Archivos** | `src/lib/visualGraphBuilder/__tests__/bubble.cases.ts`, `scripts/validate-prod2e-d27-bubble-unit.ts`, `scripts/validate-prod2e-d27-bubble-perf.ts`, ampliación `validate-visual-graph-builder-unit` + casos C4/C5/C6 |
| **Casos bubble unit** | 20 (config, preview, algoritmo, determinismo, orden, round-trip idempotente, sizeVariable scope, VGB-R1, hydrate, scatter regression) |
| **Resultado** | **PASS** |

### D27.6 — Acta + cierre D27

| Campo | Valor |
|-------|-------|
| **Objetivo** | Acta oficial, métricas, gates, decisiones arquitectónicas, handoff D28 |
| **Alcance** | Documentación únicamente (`PROJECT_STATUS_PROD_2E.md`) |
| **Resultado** | **PASS** |

#### Gates D27 — Certificación

| Gate | Resultado | Casos / detalle |
|------|-----------|-----------------|
| `validate:prod2e-d27-bubble-unit` | **PASS** | 20/20 |
| `validate:visual-graph-builder-unit` | **PASS** | 35/35 |
| `validate:prod2c-c4-visual-graph-mapper` | **PASS** | 25/25 |
| `validate:prod2c-c5-visual-graph-collect` | **PASS** | 15/15 |
| `validate:prod2c-c6-visual-graph-hydrate` | **PASS** | 20/20 |
| `validate:prod2c-c8-regression-gate` | **PASS** | 5/5 sub-gates (C4–C8); fixtures 27/27 |
| `validate:prod2e-d27-bubble-perf` | **PASS** (informativo) | 100 iter · mediana **0.0294 ms** · p95 **0.0858 ms** · dataset `project-v2-dataset5-minimal.sgproj` |
| `npx tsc --noEmit` | **PASS** | — |

**Regresión tipos v1 + heatmap:** Scatter, Line, Bar, Histogram, BoxPlot, Violin, Heatmap — **PASS** (C8 umbrella sin reducción de cobertura).

#### Decisiones arquitectónicas D27

**Decisión A — Shape uniforme de `VisualGraphPreview`**

`bubbleData: VisualGraphPreviewBubblePoint[]` se incorpora como array obligatorio (vacío para tipos no-bubble), siguiendo el patrón certificado de `heatmapData` en D26. Preserva comparación, tests, hydrate y prepara D28 (PCA).

**Decisión B — Normalización fija de tamaño**

Constantes congeladas: `BUBBLE_SIZE_MIN = 0.25`, `BUBBLE_SIZE_MAX = 1.00`, `BUBBLE_SIZE_FIXED = 1.00`. Columna constante o vacía → tamaño fijo. NaN/±Infinity en X/Y/size → fila omitida.

**Decisión C — Política C para valores negativos**

Min-max directo sobre `sizeVariable` sin `Math.abs()`. Ejemplo congelado: `[-10, 0, 10]` → `[0.25, 0.625, 1.00]`.

**Decisión D — Alcance exclusivo de `sizeVariable`**

`sizeVariable` solo tiene significado cuando `graphType === "bubble"`. En cualquier otro tipo: no participa en validaciones, no modifica previews, no altera builders; JSON legacy con `sizeVariable` fuera de bubble se ignora en hydrate/sanitize.

**Decisión E — Contrato `VisualGraphPreviewBubblePoint` congelado**

```typescript
type VisualGraphPreviewBubblePoint = {
  x: number;
  y: number;
  size: number;
  group?: string;
};
```

Prohibido añadir `color`, `label`, `opacity`, `radius` u otros campos efímeros al contrato de dominio.

**Decisión F — Idempotencia del round-trip**

Ciclo `collect → serialize → hydrate → collect → serialize` produce `JSON1 === JSON2` (igualdad estructural). Certificado en `visual-graph.bubble.roundtrip.idempotent` y `fixtures.vgb.golden.bubble.idempotent`.

**Decisión G — Separación Bubble VGB vs Bubble SCI**

Bubble VGB (DATA-3B) es independiente del módulo Bubble SCI (multivariante, SCI-40). Sin acoplamiento entre ambos dominios en D27.

#### VGB-R1 — Re-certificación D27

Nunca se persisten:

- `preview`
- `bubbleData`
- `displaySeries`

Únicamente se persiste `GraphSpecification` (+ metadatos de entrada VGB: `id`, `sourceDatasetId`, `createdAt`). Certificado en gates bubble unit, C4/C5/C6, C8 golden y `hydrate.vgbR1.bubble.noBubbleDataLeak`.

#### API Freeze D27

Durante D27:

- **No** hubo schema bump (`schemaVersion` permanece **2**)
- **No** hubo breaking changes
- **No** hubo cambios en los siete tipos VGB previos
- **Únicamente** se añadió el tipo `bubble` y el campo opcional `sizeVariable` (semántico solo en bubble)

#### CA-D27 — Certificación (10/10)

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D27-01** | D27.1 Dominio PASS | `bubble` + `sizeVariable` + `buildBubblePointsFromWorksheet()` en `visualGraphBuilder.ts` | **PASS** |
| **CA-D27-02** | D27.2 Preview PASS | `BubblePreview.tsx` + rama en `GraphPreview.tsx` | **PASS** |
| **CA-D27-03** | D27.3 UI PASS | Panel Bubble en `VisualGraphBuilder.tsx` | **PASS** |
| **CA-D27-04** | D27.4 Persistencia PASS | Golden `project-v2-dataset5-with-bubble.sgproj` + C8 27/27 | **PASS** |
| **CA-D27-05** | D27.5 Gates PASS | 8 gates listados arriba — todos PASS | **PASS** |
| **CA-D27-06** | VGB-R1 PASS | Sin `preview`/`bubbleData`/`displaySeries` en persistencia | **PASS** |
| **CA-D27-07** | API Freeze PASS | Sin bump · sin breaking · 7 tipos previos intactos | **PASS** |
| **CA-D27-08** | Regresión v1+heatmap PASS | Scatter–Violin + Heatmap PASS en C8 umbrella | **PASS** |
| **CA-D27-09** | Performance documentada | `validate:prod2e-d27-bubble-perf` mediana 0.0294 ms | **PASS** |
| **CA-D27-10** | TypeScript PASS | `npx tsc --noEmit` | **PASS** |

**Total CA-D27: 10/10 PASS** · Sin deuda técnica dentro del alcance D27.

#### Handoff D28

```text
D27 CLOSED — Ready for D28
Prerrequisitos D28:
  ✓ Heatmap operativo (tipo #1 DATA-3B)
  ✓ Bubble operativo (tipo #2 DATA-3B)
  ✓ Persistencia V2 certificada (round-trip + golden)
  ✓ Golden Fixtures certificados (heatmap + bubble)
  ✓ API Freeze respetado (schemaVersion 2, extensión additive)
  ✓ VGB-R1 certificado (preview/bubbleData/displaySeries excluidos)
  ✓ C8 Regression PASS (27/27 fixtures)
  ✓ Performance registrada (mediana 0.0294 ms, 100 iter)
  ✓ TypeScript PASS
Next BUILD: D28 — DATA-3B PCA (pcaVariables, pcaStandardize)
```

#### Archivos D27 (acumulado microfases D27.1–D27.5)

| Acción | Archivo |
|--------|---------|
| **Modificado** | `src/lib/visualGraphBuilder.ts` |
| **Modificado** | `src/lib/project/domain/visual-graph-domain.ts` |
| **Modificado** | `src/lib/project/domain/validate-v2.ts` |
| **Creado** | `src/components/graph-builder/BubblePreview.tsx` |
| **Modificado** | `src/components/graph-builder/GraphPreview.tsx` |
| **Modificado** | `src/components/graph-builder/VisualGraphBuilder.tsx` |
| **Creado** | `scripts/generate-prod2e-d27-bubble-golden-fixture.ts` |
| **Creado** | `scripts/fixtures/project-v2-dataset5-with-bubble.sgproj` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-fixtures.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-mapper-helpers.ts` |
| **Creado** | `src/lib/visualGraphBuilder/__tests__/bubble.cases.ts` |
| **Creado** | `scripts/validate-prod2e-d27-bubble-unit.ts` |
| **Creado** | `scripts/validate-prod2e-d27-bubble-perf.ts` |
| **Modificado** | `scripts/validate-visual-graph-builder-unit.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-mapper.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-collect.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-hydrate.cases.ts` |
| **Modificado** | `package.json` (scripts generate + validate bubble) |
| **Modificado** | `PROJECT_STATUS_PROD_2E.md` (acta D27.6) |

**Total acumulado D27:** 8 creados · 11 modificados · 19 archivos producto/gates (excl. acta).

**No modificado en D27.6:** `src/**`, `scripts/**`, `fixtures/**`, `package.json`, README, ROADMAP, MASTER.

---

## Cronología PROD-2E

```text
D25 Discovery + Baseline + Plan + API Freeze ✓ (CLOSED)
  ↓
D26 DATA-3B Heatmap ✓ (CLOSED)
  ↓
D27 DATA-3B Bubble ✓ (CLOSED)
  ↓
D28 PCA → D29–D30 GRAPH-1 → D31–D32 GRAPH-2
  ↓
D33 F5F-BIS → D34–D35 SCI-40 (Escenario B) → D36 Cierre
```

---

## Deuda carry-in (sin cambio D26)

| ID | Item | Target |
|----|------|--------|
| F5F-BIS | UI SCI-50–56 ~718 LOC | D33 |
| SCI-40 | Multivariante ~8.532 LOC | D34–D35 |
| CURVES-INLINE | Motor curvas page.tsx | D31–D32 |
| L-D23-2 | E2E flakiness | QA-2 |

---

*Acta D25 certificada 2026-07-09 · D25 CLOSED · Acta D26 certificada 2026-07-09 · D26 CLOSED · Acta D27 certificada 2026-07-09 · D27 CLOSED · Next: D28 BUILD.*
