# PROJECT_STATUS — PROD-2E

**Épica:** PROD-2E — Motor gráfico profesional  
**Estado épica:** **OPEN** (D31 CLOSED — GRAPH-2a CLOSED — Ready for D32)  
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

## §D28 — DATA-3B PCA

**Estado:** **CLOSED** (2026-07-09)  
**Modo:** BUILD — dominio · UI · persistencia · gates · acta  
**Próxima microfase:** **D29 — GRAPH-1a Auto-fit viewport Y**  
**Plan congelado:** D28 v1.1 (AMEND — Estabilidad numérica y determinismo PCA)

### Resumen ejecutivo

PCA queda oficialmente operativo como **tercer y último tipo DATA-3B** del motor VGB PROD-2E. La microfase D28 implementa el tipo `pca` con `pcaVariables` y `pcaStandardize`, algoritmo move-only parcial desde SCI-40, preview determinista PC1/PC2, panel de configuración UI, persistencia V2 round-trip, golden fixture propio, gate umbrella `validate:prod2e-data3b-gate` y batería completa de gates — sin deuda técnica dentro del alcance.

Con el cierre de D28, la épica **DATA-3B queda oficialmente CLOSED** (Heatmap · Bubble · PCA certificados).

| Indicador | Estado |
|-----------|--------|
| **PCA implementado** | ✓ Dominio · preview · UI |
| **Persistencia V2 certificada** | ✓ Round-trip + mapper/collect/hydrate |
| **Golden Fixture propio** | ✓ `project-v2-dataset5-with-pca.sgproj` |
| **API Freeze respetado** | ✓ `schemaVersion` 2 · extensión additive |
| **VGB-R1 respetado** | ✓ Sin `preview`/`pcaData`/`pcaMeta`/`displaySeries` en persistencia |
| **DATA-3B CLOSED** | ✓ 3/3 tipos certificados |
| **Deuda técnica en alcance** | **Ninguna** |

### Métricas D28

| Campo | Valor |
|-------|-------|
| **Tipo nuevo operativo** | `pca` |
| **Tipos VGB activos** | **9** (scatter, line, bar, histogram, boxPlot, violin, heatmap, bubble, pca) |
| **schemaVersion** | **2** (sin bump) |
| **Golden fixtures certificados** | Heatmap + Bubble + PCA (3/3) |
| **Golden fixture PCA** | `scripts/fixtures/project-v2-dataset5-with-pca.sgproj` |
| **Campos nuevos persistidos** | `pcaVariables: string[]`, `pcaStandardize: boolean` (solo `pca`) |
| **Campos efímeros** | `pcaData`, `pcaMeta` (preview only — VGB-R1) |
| **PCA unit** | **22/22 PASS** (19 escenarios Plan v1.1 + Decisión I/J explícitas) |
| **Visual Graph Builder unit** | **79/79 PASS** |
| **C8 fixtures** | **40/40 PASS** |
| **DATA-3B umbrella gate** | **13/13 PASS** |
| **Performance gate** | 100 iter · dataset `project-v2-dataset5-minimal.sgproj` |
| **Media PCA preview** | **3.3075 ms** |
| **Mediana PCA preview** | **1.8208 ms** |
| **P95 PCA preview** | **11.4144 ms** |
| **Resultado épica microfase** | **PASS** |

### D28.1 — Dominio VGB

| Campo | Valor |
|-------|-------|
| **Objetivo** | Extender contrato VGB con tipo `pca`, `pcaVariables`, `pcaStandardize`, `buildPCAFromWorksheet()` |
| **Archivos** | `src/lib/visualGraphBuilder.ts`, `src/lib/project/domain/visual-graph-domain.ts`, `src/lib/project/domain/validate-v2.ts` |
| **Algoritmo** | Move-only parcial desde SCI-40: matriz worksheet, exclusión columnas constantes, estandarización condicional, covarianza, Power Iteration PC1/PC2, Decisión I (sign normalization), PC2 degenerado → scores 0 |
| **API Freeze** | Extensión additive; 8 tipos previos intactos |
| **Resultado** | **PASS** |

### D28.2 — Preview renderer

| Campo | Valor |
|-------|-------|
| **Objetivo** | Renderer PCA en preview VGB (Recharts ScatterChart PC1 vs PC2) |
| **Archivos** | `src/components/graph-builder/PCAPreview.tsx` (nuevo), `src/components/graph-builder/GraphPreview.tsx` |
| **Restricción** | Ejes con % varianza desde `pcaMeta`; sin transformación de dominio en renderer; `isAnimationActive={false}` |
| **Resultado** | **PASS** |

### D28.3 — UI configuración

| Campo | Valor |
|-------|-------|
| **Objetivo** | Panel PCA en `VisualGraphBuilder` (multi-select `pcaVariables` + toggle `pcaStandardize`) |
| **Archivos** | `src/components/graph-builder/VisualGraphBuilder.tsx` |
| **Nota** | `pca` activo en `VISUAL_GRAPH_TYPES_V1`; controles X/Y/size/color ocultos cuando `graphType === "pca"` |
| **Resultado** | **PASS** |

### D28.4 — Persistencia + Golden Fixture

| Campo | Valor |
|-------|-------|
| **Objetivo** | Round-trip V2 + golden fixture independiente + casos C4/C5/C6/C8 PCA |
| **Archivos** | `scripts/generate-prod2e-d28-pca-golden-fixture.ts`, `scripts/fixtures/project-v2-dataset5-with-pca.sgproj`, `src/lib/project/__tests__/visual-graph-fixtures.cases.ts`, `src/lib/project/__tests__/visual-graph-mapper-helpers.ts`, casos C4/C5/C6 |
| **Gate C8 fixtures** | `validate:prod2c-c8-visual-graph-fixtures` — **40/40 PASS** (7 casos PCA golden) |
| **VGB-R1** | JSON golden sin `preview`, `pcaData`, `pcaMeta`, `displaySeries` |
| **Resultado** | **PASS** |

### D28.5 — Gates unitarios, regresión y umbrella DATA-3B

| Campo | Valor |
|-------|-------|
| **Objetivo** | Certificar PCA + cerrar épica DATA-3B con gate umbrella |
| **Archivos** | `src/lib/visualGraphBuilder/__tests__/pca.cases.ts`, `scripts/validate-prod2e-d28-pca-unit.ts`, `scripts/validate-prod2e-d28-pca-perf.ts`, `scripts/validate-prod2e-data3b-gate.ts`, ampliación `validate-visual-graph-builder-unit.ts` + corrección C6 hydrate |
| **Casos PCA unit** | 22 (config, algoritmo, pipeline, VGB-R1, hydrate, round-trip, scope, regresión heatmap/bubble, Decisión I/J, caso 19 correlación perfecta) |
| **Resultado** | **PASS** |

### D28.6 — Acta + cierre D28 + cierre DATA-3B

| Campo | Valor |
|-------|-------|
| **Objetivo** | Acta oficial, métricas, gates, decisiones arquitectónicas A–J (AMEND v1.1), handoff D29, declaración DATA-3B CLOSED |
| **Alcance** | Documentación únicamente (`PROJECT_STATUS_PROD_2E.md`) |
| **Resultado** | **PASS** |

#### Gates D28 — Certificación

| Gate | Resultado | Casos / detalle |
|------|-----------|-----------------|
| `npx tsc --noEmit` | **PASS** | — |
| `validate:prod2e-d28-pca-unit` | **PASS** | 22/22 |
| `validate:visual-graph-builder-unit` | **PASS** | 79/79 |
| `validate:prod2c-c8-regression-gate` | **PASS** | 6/6 sub-gates (C4–C8); fixtures 40/40 |
| `validate:prod2e-data3b-gate` | **PASS** | 13/13 |
| `validate:prod2e-d28-pca-perf` | **PASS** (informativo — **no bloqueante**) | 100 iter · media **3.3075 ms** · mediana **1.8208 ms** · p95 **11.4144 ms** · dataset `project-v2-dataset5-minimal.sgproj` |

**Regresión tipos v1 + heatmap + bubble + scatter:** Scatter, Line, Bar, Histogram, BoxPlot, Violin, Heatmap, Bubble — **PASS** (C8 umbrella + suites PCA regresión).

#### Decisiones arquitectónicas D28 (Plan v1.1 + AMEND)

**Decisión A — Shape uniforme de `VisualGraphPreview`**

`pcaData: VisualGraphPreviewPcaPoint[]` y `pcaMeta: VisualGraphPreviewPcaMeta | null` se incorporan siguiendo el patrón certificado de `heatmapData` (D26) y `bubbleData` (D27). Arrays obligatorios (vacíos fuera de `pca`); preserva comparación, tests, hydrate y VGB-R1.

```typescript
type VisualGraphPreviewPcaPoint = { pc1: number; pc2: number; label: string };
type VisualGraphPreviewPcaMeta = {
  component1Variance: number;
  component2Variance: number;
  cumulativeVariance: number;
};
```

**Decisión B — Alcance exclusivo de campos PCA**

`pcaVariables` y `pcaStandardize` solo aplican cuando `graphType === "pca"`. En otros tipos: ignorados en validate/build/hydrate/sanitize (patrón Decisión D D27). `xVariable`/`yVariable` no participan en el cálculo PCA VGB; pueden conservarse por herencia al cambiar tipo (patrón Decisión B D26).

**Decisión C — Algoritmo move-only parcial**

Copia a dominio VGB desde SCI-40 (`page.tsx` intacto): matriz worksheet, exclusión columnas constantes (`std ≤ PCA_EIGENVALUE_EPSILON`), estandarización condicional, covarianza, Power Iteration (PC1, PC2 ortogonalizado) con límite de iteraciones congelado, normalización de signo (Decisión I), manejo PC2 degenerado. Función exportada: `buildPCAFromWorksheet()`. Alcance estricto PC1 + PC2 (Decisión J).

**Decisión D — Validación mínima**

| Regla | Mensaje |
|-------|---------|
| `pcaVariables.length < 2` | Al menos 2 variables numéricas |
| Variable inexistente | Variable no encontrada |
| Columnas activas post-filtro < 2 | Datos insuficientes para PCA |
| Observaciones < 2 filas válidas | Datos insuficientes para PCA |
| Varianza total ≤ ε | Datos insuficientes para PCA |

**Decisión E — Contrato efímero sin loadings**

Prohibido incluir `loadings`, `loadingsInterpretation` ni texto interpretativo SCI en `VisualGraphPreview`. Loadings permanecen en SCI-40; VGB solo PC1/PC2 + varianza para ejes.

**Decisión F — Separación PCA VGB vs PCA SCI-40**

PCA VGB (DATA-3B) es independiente del dashboard multivariante SCI-40. Sin acoplamiento de toggles `showPCA` ni `buildMultivariateDashboardAnalysis`. Deduplicación completa → D34.

**Decisión G — Idempotencia del round-trip**

Ciclo `collect → serialize → hydrate → collect → serialize` produce persistencia estable. Certificado en `visual-graph.pca.roundtrip.idempotent`, `fixtures.vgb.golden.pca.idempotent` y `hydrate.vgb.pca.roundtrip.idempotent` (equivalencia persisted).

**Decisión H — Activación en selector**

`pca` retirado de `VISUAL_GRAPH_TYPES_FUTURE`; añadido a `VISUAL_GRAPH_TYPES_V1` y `VISUAL_GRAPH_TYPE_LABELS`. `GraphTypeSelector` itera `VISUAL_GRAPH_TYPES_V1` — sin cambio estructural del componente.

**Decisión I — Eigenvector Sign Normalization (AMEND v1.1)**

El signo de los eigenvectores es matemáticamente arbitrario. Regla congelada: si el primer elemento distinto de cero del eigenvector es negativo → multiplicar todo el eigenvector por `-1`; aplicar a PC1 y PC2 antes del preview. Garantiza golden fixtures deterministas, round-trip reproducible y CI sin falsos positivos. No modifica el espacio PCA ni la interpretación estadística.

**Decisión J — Alcance funcional del motor PCA (AMEND v1.1)**

El motor PCA VGB calcula únicamente **PC1** y **PC2**. Fuera de alcance DATA-3B: PC3+, N componentes configurables, selección dinámica, Scree Plot, loadings completos, eigenvectors exportables. Evolución futura → SCI-40 (D34–D35) o épica VGB post-v1.0.

#### AMEND v1.1 — Estabilidad numérica y determinismo PCA

**Fecha:** 2026-07-09 · **Alcance:** Decisiones I–J · caso unitario 19 · riesgo R-D28-09

**No modifica:** API Freeze · `schemaVersion` · persistencia V2 · contratos públicos · formato JSON `.sgproj` · campos `pcaVariables`/`pcaStandardize`.

**Fortalece:** determinismo matemático (Decisión I) · estabilidad covarianza casi singular (R-D28-09) · reproducibilidad golden/CI · delimitación motor VGB (Decisión J).

#### VGB-R1 — Re-certificación D28

Nunca se persisten:

- `preview`
- `pcaData`
- `pcaMeta`
- `displaySeries`

Únicamente se persiste `GraphSpecification` (+ metadatos de entrada VGB: `id`, `sourceDatasetId`, `createdAt`). Certificado en gates PCA unit, C4/C5/C6, C8 golden y `hydrate.vgbR1.pca.noPcaDataLeak`.

#### API Freeze D28

Durante D28:

- **No** hubo schema bump (`schemaVersion` permanece **2**)
- **No** hubo breaking changes
- **No** hubo cambios en los ocho tipos VGB previos
- **Únicamente** se añadió el tipo `pca` y los campos opcionales `pcaVariables`/`pcaStandardize` (semánticos solo en `pca`)

#### CA-D28 — Certificación (10/10)

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D28-01** | D28.1 Dominio PASS | `pca` + `buildPCAFromWorksheet()` en `visualGraphBuilder.ts` | **PASS** |
| **CA-D28-02** | D28.2 Preview PASS | `PCAPreview.tsx` + rama en `GraphPreview.tsx` | **PASS** |
| **CA-D28-03** | D28.3 UI PASS | Panel PCA en `VisualGraphBuilder.tsx` | **PASS** |
| **CA-D28-04** | D28.4 Persistencia PASS | Golden `project-v2-dataset5-with-pca.sgproj` + C8 40/40 | **PASS** |
| **CA-D28-05** | D28.5 Gates PASS | 6 gates listados arriba — todos PASS | **PASS** |
| **CA-D28-06** | VGB-R1 PASS | Sin `preview`/`pcaData`/`pcaMeta`/`displaySeries` en persistencia | **PASS** |
| **CA-D28-07** | API Freeze PASS | Sin bump · sin breaking · 8 tipos previos intactos | **PASS** |
| **CA-D28-08** | Regresión v1+heatmap+bubble+scatter PASS | C8 umbrella + suites regresión PCA | **PASS** |
| **CA-D28-09** | Performance documentada | `validate:prod2e-d28-pca-perf` — no bloqueante | **PASS** |
| **CA-D28-10** | TypeScript PASS | `npx tsc --noEmit` | **PASS** |

**Total CA-D28: 10/10 PASS** · Sin deuda técnica dentro del alcance D28.

#### Cierre oficial DATA-3B

**Estado:** **DATA-3B CLOSED** (2026-07-09)

| Tipo | Microfase | Golden fixture | Estado |
|------|-----------|----------------|--------|
| **Heatmap** | D26 | `project-v2-dataset5-with-heatmap.sgproj` | **CERTIFICADO** |
| **Bubble** | D27 | `project-v2-dataset5-with-bubble.sgproj` | **CERTIFICADO** |
| **PCA** | D28 | `project-v2-dataset5-with-pca.sgproj` | **CERTIFICADO** |

- Persistencia V2 certificada (round-trip + mapper/collect/hydrate)
- Golden fixtures certificados (3/3)
- VGB-R1 certificado en los tres tipos
- Gate umbrella `validate:prod2e-data3b-gate` — **13/13 PASS**
- Criterio Master Roadmap §10 DATA-3B — **CUMPLIDO**

#### Estado PROD-2E (post-D28)

| Indicador | Valor |
|-----------|--------|
| **Épica** | **OPEN** (DATA-3B CLOSED — Ready for D29) |
| **Checklist cierre épica** | **1/9** |
| **DATA-3B** | **CLOSED** ✓ |
| **Próxima fase** | D29 — GRAPH-1a Auto-fit viewport Y |
| **Fases abiertas** | D29–D36 (GRAPH-1 · GRAPH-2 · ARCH-5 · cierre épica) |

**Checklist cierre PROD-2E (avance):**

- [x] ≥3 tipos VGB avanzados con round-trip persist (**DATA-3B CLOSED**)
- [ ] Auto-fit Y + presets (GRAPH-1 D29–D30)
- [ ] Motor curvas (GRAPH-2 D31–D32)
- [ ] F5F-BIS + SCI-40 (ARCH-5 D33–D35)
- [ ] API Freeze respetado (parcial → completo en D36)
- [ ] Baseline re-medido (D36)
- [ ] `validate:prod2e-gate` (D36)
- [ ] DoD §2 Master (D36)
- [ ] Docs sync PROD-3 READY (D36.5)

#### Handoff D29

```text
D28 CLOSED — DATA-3B CLOSED — Ready for D29
Prerrequisitos D29 (GRAPH-1a — Auto-fit viewport Y):
  ✓ DATA-3B CLOSED — 3 tipos certificados (heatmap, bubble, pca)
  ✓ validate:prod2e-data3b-gate PASS (13/13)
  ✓ Golden fixtures certificados (heatmap + bubble + pca)
  ✓ Tipos VGB activos: 9
  ✓ schemaVersion: 2
  ✓ API Freeze respetado (extensión additive)
  ✓ Round-trip certificado (VGB-R1)
  ✓ C8 Regression PASS (40/40 fixtures)
  ✓ Regresión v1 + heatmap + bubble + scatter PASS
  ✓ Decisión I — sign normalization certificada
  ✓ Decisión J — motor limitado a PC1/PC2
  ✓ Performance PCA documentada (100 iter — no bloqueante)
  ✓ TypeScript PASS
  ✓ page.tsx SCI-40 intacto — extracción PCA completa pendiente D34
Next BUILD: D29 — GRAPH-1a Auto-fit viewport Y
  Archivos objetivo: src/lib/graph/viewport.ts (extracción chartViewport.ts)
  Gate objetivo: validate:chart-viewport-y (nuevo) + regresión X
```

#### Archivos D28 (acumulado microfases D28.1–D28.5)

| Acción | Archivo |
|--------|---------|
| **Modificado** | `src/lib/visualGraphBuilder.ts` |
| **Modificado** | `src/lib/project/domain/visual-graph-domain.ts` |
| **Modificado** | `src/lib/project/domain/validate-v2.ts` |
| **Creado** | `src/components/graph-builder/PCAPreview.tsx` |
| **Modificado** | `src/components/graph-builder/GraphPreview.tsx` |
| **Modificado** | `src/components/graph-builder/VisualGraphBuilder.tsx` |
| **Creado** | `scripts/generate-prod2e-d28-pca-golden-fixture.ts` |
| **Creado** | `scripts/fixtures/project-v2-dataset5-with-pca.sgproj` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-fixtures.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-mapper-helpers.ts` |
| **Creado** | `src/lib/visualGraphBuilder/__tests__/pca.cases.ts` |
| **Creado** | `scripts/validate-prod2e-d28-pca-unit.ts` |
| **Creado** | `scripts/validate-prod2e-d28-pca-perf.ts` |
| **Creado** | `scripts/validate-prod2e-data3b-gate.ts` |
| **Modificado** | `scripts/validate-visual-graph-builder-unit.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-mapper.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-collect.cases.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-hydrate.cases.ts` |
| **Modificado** | `package.json` (scripts generate + validate pca + data3b-gate) |
| **Modificado** | `PROJECT_STATUS_PROD_2E.md` (acta D28.6) |

**Total acumulado D28:** 7 creados · 12 modificados · 19 archivos producto/gates (excl. acta).

**No modificado en D28.6:** `src/**`, `scripts/**`, `fixtures/**`, `package.json`, README, ROADMAP, MASTER.

**No modificado en D28 (alcance congelado):** `src/app/page.tsx` — SCI-40 PCA intacto.

---

## §D29 — GRAPH-1a Auto-fit Viewport Y

**Estado:** **CLOSED** (2026-07-10)  
**Modo:** BUILD — dominio · wiring chart · wiring VGB preview · gates · smoke tests · correctivo · acta  
**Próxima microfase:** **D30 — GRAPH-1b Publication Presets**  
**Plan congelado:** D29 v1.0 (GRAPH-1a — sin presets; D30)

### Resumen ejecutivo

GRAPH-1a queda oficialmente operativo como **auto-fit del eje Y** en el chart principal y en los previews VGB, con dominio de viewport desacoplado en `src/lib/graph/viewport.ts`, extracción move-only del eje X desde `chartViewport.ts`, gates dedicados, smoke tests S1–S6 certificados y correctivo D29.5A para respeto de `graphContext` en reapertura de proyectos — sin cambios en persistencia, `schemaVersion` ni API Freeze VGB.

| Indicador | Estado |
|-----------|--------|
| **Auto-fit Y implementado** | ✓ Chart principal + VGB previews |
| **Dominio viewport extraído** | ✓ `src/lib/graph/viewport.ts` |
| **Extracción X move-only** | ✓ Shim `chartViewport.ts` operativo |
| **Wiring chart principal** | ✓ `page.tsx` + `localProjectActions` + `projectFileActions` |
| **Wiring VGB previews** | ✓ Scatter · Bubble · PCA · Line/Bar/Histogram |
| **Gates certificados** | ✓ Umbrella D29 + regresión transversal |
| **Smoke tests certificados** | ✓ S1–S6 PASS (S3 tras D29.5A) |
| **API Freeze respetado** | ✓ `schemaVersion` 2 · sin bump · sin breaking |
| **Persistencia sin cambios** | ✓ `ProjectGraphContextV1` intacto |
| **Deuda técnica en alcance** | **Ninguna** |

### Métricas D29

| Campo | Valor |
|-------|-------|
| **Épica parcial** | GRAPH-1a (auto-fit Y) — **CLOSED** |
| **schemaVersion** | **2** (sin bump) |
| **Archivos creados** | **4** (`viewport.ts`, `viewport.cases.ts`, `validate-chart-viewport-y.ts`, `validate-prod2e-d29-viewport-gate.ts`) |
| **Archivos modificados (producto)** | **8** (`chartViewport.ts`, `page.tsx`, `localProjectActions.ts`, `projectFileActions.ts`, `ScatterPreview.tsx`, `BubblePreview.tsx`, `PCAPreview.tsx`, `GraphPreview.tsx`) |
| **Archivos modificados (gates)** | **2** (`package.json`, `PROJECT_STATUS_PROD_2E.md`) |
| **Nuevos scripts npm** | **2** (`validate:chart-viewport-y`, `validate:prod2e-d29-viewport-gate`) |
| **Nuevos tests / casos** | **19** viewport suite (`runViewportCaseSuite`) — 9 X + 10 Y |
| **LOC dominio** | ~**166** (`viewport.ts`) + ~**170** (`viewport.cases.ts`) |
| **LOC wiring neto (estimado)** | ~**+35** previews + chart (D29.2–D29.3) + ~**+10** (D29.5A) |
| **Viewport X unit** | **9/9 PASS** (`validate:chart-viewport`) |
| **Viewport Y unit** | **10/10 PASS** (`validate:chart-viewport-y`) |
| **Visual Graph Builder unit** | **79/79 PASS** |
| **DATA-3B umbrella gate** | **13/13 PASS** |
| **D29 viewport umbrella gate** | **8/8 PASS** |
| **Smoke tests manuales** | **6/6 PASS** (S3 corregido en D29.5A) |
| **Resultado microfase épica** | **PASS** |

### D29.1 — Dominio viewport

| Campo | Valor |
|-------|-------|
| **Objetivo** | Extraer dominio viewport a `src/lib/graph/viewport.ts` (X move-only + API Y) |
| **Archivos** | `src/lib/graph/viewport.ts` (nuevo), `src/lib/graph/__tests__/viewport.cases.ts` (nuevo), `src/app/chartViewport.ts` (shim) |
| **API Y** | `collectExperimentalYExtent`, `computeYViewportWithPadding`, `fitYViewportToExperimentalSeries`, `computeYAxisDomainFromValues`, `computePaddedDomain` |
| **Padding** | `VIEWPORT_PADDING_RATIO = 0.1` (span-based, unificado X/Y) |
| **Resultado** | **PASS** — 19/19 casos `runViewportCaseSuite()` |

### D29.2 — Wiring chart principal

| Campo | Valor |
|-------|-------|
| **Objetivo** | Conectar auto-fit Y en chart principal; eliminar `computeYAxisDomain` inline |
| **Archivos** | `src/app/page.tsx`, `src/app/localProjectActions.ts`, `src/app/projectFileActions.ts` |
| **Disparadores** | Import CSV · carga sesión · hidratación `graphContext == null` · cambio worksheet |
| **Comportamiento** | `setAutoScaleY(true)` + auto-fit X en mismos disparadores que HOTFIX X |
| **Resultado** | **PASS** |

### D29.3 — VGB Preview auto-fit Y

| Campo | Valor |
|-------|-------|
| **Objetivo** | Dominio Y explícito con padding en previews VGB (independiente de `graphContext` editor) |
| **Archivos** | `ScatterPreview.tsx`, `BubblePreview.tsx`, `PCAPreview.tsx`, `GraphPreview.tsx` (line/bar/histogram) |
| **Sin cambio** | HeatmapPreview, BoxPlot, Violin |
| **Resultado** | **PASS** — `validate:visual-graph-builder-unit` 79/79 |

### D29.4 — Gates unitarios y regresión

| Campo | Valor |
|-------|-------|
| **Objetivo** | Certificar dominio Y + gate umbrella D29 |
| **Archivos** | `scripts/validate-chart-viewport-y.ts`, `scripts/validate-prod2e-d29-viewport-gate.ts`, `package.json` |
| **Regresión X** | `validate:chart-viewport` 9/9 PASS vía shim |
| **Resultado** | **PASS** — umbrella 8/8 |

### D29.5 — Smoke tests manuales

| Campo | Valor |
|-------|-------|
| **Objetivo** | Validación funcional S1–S6 en editor (`npm run dev`) |
| **Alcance** | Sin cambios de código |
| **Resultado inicial** | **5/6 PASS** — **S3 FAIL** (regresión reapertura `graphContext.autoScaleY`) |
| **Evidencia S1–S2, S4–S6** | PASS en chart principal y VGB previews |

### D29.5A — Correctivo wiring reapertura

| Campo | Valor |
|-------|-------|
| **Objetivo** | Respetar `graphContext` persistido al abrir `.sgproj` |
| **Archivos** | `src/app/page.tsx` (~+10 LOC) |
| **Corrección** | `loadSessionDatasetIntoEditor(..., { applyExperimentalViewportAutoFit: graphContext == null })` en `onProjectOpened` |
| **Re-smoke** | **S3 PASS** · **S6 PASS** |
| **Resultado** | **PASS** |

### D29.6 — Acta + cierre D29 + handoff D30

| Campo | Valor |
|-------|-------|
| **Objetivo** | Acta oficial §D29, métricas, gates, smoke tests, decisiones A–F, CA-D29, handoff D30 |
| **Alcance** | Documentación únicamente (`PROJECT_STATUS_PROD_2E.md`) |
| **Resultado** | **PASS** |

#### Gates D29 — Certificación

| Gate | Resultado | Casos / detalle |
|------|-----------|-----------------|
| `npx tsc --noEmit` | **PASS** | — |
| `validate:chart-viewport` | **PASS** | 9/9 (regresión X / HOTFIX) |
| `validate:chart-viewport-y` | **PASS** | 10/10 |
| `validate:visual-graph-builder-unit` | **PASS** | 79/79 |
| `validate:prod2e-data3b-gate` | **PASS** | 13/13 |
| `validate:prod2c-c8-regression-gate` | **PASS** | 5/5 sub-gates |
| `validate:prod2d-gate` | **PASS** | — |
| `validate:prod2e-d29-viewport-gate` | **PASS** | 8/8 |

**Regresión tipos VGB + DATA-3B:** Heatmap · Bubble · PCA · Scatter–Violin — **PASS** (umbrella DATA-3B + VGB unit).

#### Smoke Tests D29 — Certificación

| ID | Escenario | Resultado | Notas |
|----|-----------|-----------|-------|
| **S1** | Import Y fuera del viewport inicial | **PASS** | Serie visible; padding Y/X; sin clipping |
| **S2** | Nuevo proyecto + importación | **PASS** | Auto-fit X + Y automático |
| **S3** | Reapertura `graphContext.autoScaleY == false` | **PASS** | Tras **D29.5A** — preferencia persistida respetada |
| **S4** | Scatter Preview VGB | **PASS** | Dominio Y explícito; sin clipping |
| **S5** | PCA Preview VGB | **PASS** | PC2 con dominio explícito; padding visible |
| **S6** | Regresión HOTFIX X | **PASS** | Auto-fit X idéntico; Y no afecta X |

**Nota S3:** La regresión detectada en D29.5 fue corregida en **D29.5A** antes del cierre oficial D29.

#### Decisiones arquitectónicas D29

**Decisión A — Dominio viewport desacoplado**

El dominio de viewport vive en `src/lib/graph/viewport.ts`. `src/app/chartViewport.ts` permanece como shim de compatibilidad re-exportando X (y consumidores legacy). Punto único de verdad para padding, extent y dominio Y.

**Decisión B — Extracción X move-only**

La semántica X de HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 se movió sin alteración algorítmica. `validate:chart-viewport` 9/9 certifica no-regresión. Smoke **S6** confirma comportamiento en producto.

**Decisión C — Algoritmo Y unificado con padding por span**

`computePaddedDomain` / `computeYAxisDomainFromValues` aplican padding **10% del span** (`VIEWPORT_PADDING_RATIO`), alineado con X. Sustituye la fórmula inline previa en `page.tsx` (eliminada en D29.2).

**Decisión D — Preview VGB independiente del `graphContext`**

Los previews VGB calculan dominio Y explícito desde datos de preview (`point.y`, `pc2`, etc.) sin leer `graphContext` del editor. Auto-fit Y en preview es siempre local al renderer.

**Decisión E — Respeto del `graphContext` persistido en reapertura (D29.5A)**

Si `patch.project.graphContext != null`, la hidratación define `minX`/`maxX`/`visibleMinX`/`visibleMaxX`/`autoScaleY`. `onProjectOpened` **no** ejecuta `applyExperimentalXViewportFit` ni `setAutoScaleY(true)`. Si `graphContext == null`, el comportamiento HOTFIX (auto-fit X + activar Y) se mantiene.

**Decisión F — API Freeze y persistencia preservados**

- **Sin** bump de `schemaVersion` (permanece **2**)
- **Sin** cambios en `ProjectGraphContextV1` (no se añaden `minY`/`maxY` persistidos)
- **Sin** breaking changes en contratos VGB ni `.sgproj`
- Flag existente `autoScaleY: boolean` — único mecanismo de preferencia Y

#### API Freeze D29

Durante D29:

- **No** hubo schema bump
- **No** hubo breaking changes en tipos VGB ni persistencia V2
- **No** hubo cambios en golden fixtures DATA-3B
- **Únicamente** wiring runtime + dominio gráfico nuevo en `src/lib/graph/`

#### CA-D29 — Certificación (10/10)

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D29-01** | D29.1 Dominio PASS | `viewport.ts` + `viewport.cases.ts` 19/19 | **PASS** |
| **CA-D29-02** | D29.2 Chart principal PASS | Wiring `page.tsx` + acciones proyecto; `computeYAxisDomainFromValues` | **PASS** |
| **CA-D29-03** | D29.3 VGB Preview PASS | 4 previews + `GraphPreview` ramas line/bar/histogram | **PASS** |
| **CA-D29-04** | D29.4 Gates PASS | 8 gates listados — todos PASS | **PASS** |
| **CA-D29-05** | D29.5 Smoke tests PASS | S1–S6 PASS (S3 tras D29.5A) | **PASS** |
| **CA-D29-06** | Regresión HOTFIX X PASS | `validate:chart-viewport` 9/9 + smoke **S6** | **PASS** |
| **CA-D29-07** | `graphContext` reapertura PASS | D29.5A — S3 certificado | **PASS** |
| **CA-D29-08** | API Freeze PASS | Sin bump · sin breaking · VGB intacto | **PASS** |
| **CA-D29-09** | Persistencia sin cambios PASS | `ProjectGraphContextV1` · `schemaVersion` 2 | **PASS** |
| **CA-D29-10** | TypeScript PASS | `npx tsc --noEmit` | **PASS** |

**Total CA-D29: 10/10 PASS** · Sin deuda técnica dentro del alcance D29.

#### Cierre oficial GRAPH-1a

**Estado:** **GRAPH-1a CLOSED** (2026-07-10)

| Entregable | Microfase | Estado |
|------------|-----------|--------|
| **Dominio viewport Y** | D29.1 | **CERTIFICADO** |
| **Wiring chart principal** | D29.2 | **CERTIFICADO** |
| **Wiring VGB previews** | D29.3 | **CERTIFICADO** |
| **Gates + umbrella** | D29.4 | **CERTIFICADO** |
| **Smoke tests** | D29.5 + D29.5A | **CERTIFICADO** |

- Auto-fit Y operativo en chart principal y previews VGB
- Auto-fit X HOTFIX preservado (sin regresión)
- `graphContext` respetado en reapertura
- Gate umbrella `validate:prod2e-d29-viewport-gate` — **8/8 PASS**

#### Estado PROD-2E (post-D29)

| Indicador | Valor |
|-----------|--------|
| **Épica** | **OPEN** (GRAPH-1a CLOSED — Ready for D30) |
| **Checklist cierre épica** | **2/9** |
| **DATA-3B** | **CLOSED** ✓ |
| **GRAPH-1a** | **CLOSED** ✓ |
| **Próxima fase** | D30 — GRAPH-1b Publication Presets |
| **Fases abiertas** | D30–D36 (GRAPH-1b · GRAPH-2 · ARCH-5 · cierre épica) |

**Checklist cierre PROD-2E (avance):**

- [x] ≥3 tipos VGB avanzados con round-trip persist (**DATA-3B CLOSED**)
- [x] Auto-fit Y (**GRAPH-1a D29 CLOSED**)
- [ ] Presets publicación (GRAPH-1b D30)
- [ ] Motor curvas (GRAPH-2 D31–D32)
- [ ] F5F-BIS + SCI-40 (ARCH-5 D33–D35)
- [ ] API Freeze respetado (parcial → completo en D36)
- [ ] Baseline re-medido (D36)
- [ ] `validate:prod2e-gate` (D36)
- [ ] DoD §2 Master (D36)
- [ ] Docs sync PROD-3 READY (D36.5)

#### Handoff D30

```text
Current Epic:
  PROD-2E — OPEN

Completed:
  GRAPH-1a — CLOSED

D29 CLOSED — GRAPH-1a CLOSED — Ready for D30

Prerrequisitos D30 (GRAPH-1b — Publication Presets):
  ✓ GRAPH-1a CLOSED — auto-fit Y certificado
  ✓ validate:prod2e-d29-viewport-gate PASS (8/8)
  ✓ validate:chart-viewport PASS (9/9)
  ✓ validate:chart-viewport-y PASS (10/10)
  ✓ Smoke tests S1–S6 PASS
  ✓ graphContext reapertura certificado (D29.5A)
  ✓ DATA-3B CLOSED — 9 tipos VGB activos
  ✓ schemaVersion: 2
  ✓ API Freeze respetado
  ✓ Persistencia V2 sin cambios D29

Next Build:
  D30 — GRAPH-1b — Publication Presets
  Objetivo: presets default, journal, presentation
  Gate objetivo: validate:graph-publication-presets-unit + golden regression scaffold
```

#### Archivos D29 (acumulado microfases D29.1–D29.5A)

| Acción | Archivo |
|--------|---------|
| **Creado** | `src/lib/graph/viewport.ts` |
| **Creado** | `src/lib/graph/__tests__/viewport.cases.ts` |
| **Modificado** | `src/app/chartViewport.ts` (shim) |
| **Modificado** | `src/app/page.tsx` |
| **Modificado** | `src/app/localProjectActions.ts` |
| **Modificado** | `src/app/projectFileActions.ts` |
| **Modificado** | `src/components/graph-builder/ScatterPreview.tsx` |
| **Modificado** | `src/components/graph-builder/BubblePreview.tsx` |
| **Modificado** | `src/components/graph-builder/PCAPreview.tsx` |
| **Modificado** | `src/components/graph-builder/GraphPreview.tsx` |
| **Creado** | `scripts/validate-chart-viewport-y.ts` |
| **Creado** | `scripts/validate-prod2e-d29-viewport-gate.ts` |
| **Modificado** | `package.json` (scripts validate chart-viewport-y + d29-viewport-gate) |
| **Modificado** | `PROJECT_STATUS_PROD_2E.md` (acta D29.6) |

**Total acumulado D29:** 4 creados · 10 modificados · 14 archivos producto/gates (excl. acta D29.6).

**No modificado en D29.6:** `src/**`, `scripts/**`, `fixtures/**`, `package.json`, README, ROADMAP, MASTER.

**No modificado en D29 (alcance congelado):** persistencia V2 · `ProjectGraphContextV1` · golden fixtures DATA-3B · `schemaVersion`.

---

## §D30 — GRAPH-1b Publication Presets

**Estado:** **CLOSED** (2026-07-10)  
**Modo:** BUILD STRICT — D30.1–D30.5 implementación · D30.6 documentación únicamente  
**Próxima microfase:** **D31 — GRAPH-2a Extracción del motor de curvas**  
**Plan congelado:** D30 v1.1 (GRAPH-1b — presets VGB; chart principal sin presets)

### Resumen ejecutivo D30

GRAPH-1b queda oficialmente operativo como **presets de publicación** (`default`, `journal`, `presentation`) en el motor VGB PROD-2E: dominio puro en `src/lib/graph/publication-presets/`, wiring de `ChartRenderTokens` en previews presets-agnostic (D30.2), selector UI local en `VisualGraphBuilder` (D30.3), persistencia V2 de `publicationPresetId` con round-trip certificado (D30.4), gates dedicados + visual scaffold determinista (D30.5), smoke tests S1–S6 y acta (D30.6). Con D29 auto-fit Y previamente certificado, **GRAPH-1 queda CLOSED**. Deuda **NO-PUB-PRESETS** cerrada. Sin bump de `schemaVersion` (permanece **2**), sin persistir tokens resueltos (VGB-R1), API Freeze respetado.

| Indicador | Valor |
|-----------|-------|
| **Épica parcial** | GRAPH-1 (auto-fit Y + presets) — **CLOSED** |
| **Microfases** | D30.1–D30.6 — **CLOSED** |
| **Tipos preset** | `default` · `journal` · `presentation` |
| **Campo persistido** | `publicationPresetId?: string \| null` |
| **schemaVersion** | **2** (sin cambio) |

### D30.1 — Dominio publication-presets

| Campo | Valor |
|-------|-------|
| **Objetivo** | Módulo puro catalog + tokens + resolve |
| **Archivos** | `src/lib/graph/publication-presets/` (`types`, `catalog`, `tokens`, `resolve`, `index`) |
| **Casos** | `publication-presets.cases.ts` — **22/22 PASS** |
| **Restricción** | Cero React; cero consumidores hasta D30.2 |
| **Resultado** | **PASS** |

### D30.2 — Wiring previews VGB

| Campo | Valor |
|-------|-------|
| **Objetivo** | Previews presets-agnostic vía `chartTokens: ChartRenderTokens` |
| **Archivos** | `VisualGraphBuilder.tsx`, `GraphPreview.tsx`, `ScatterPreview.tsx`, `BubblePreview.tsx`, `PCAPreview.tsx`, `HeatmapPreview.tsx` |
| **Nota incidental** | Bugfix `lineStyle` → `lineStrokeDasharray` en wiring (no feature independiente) |
| **Gates** | `validate:visual-graph-builder-unit` 79/79 · `validate:prod2e-data3b-gate` 13/13 |
| **Resultado** | **PASS** |

### D30.3 — Selector UI preset

| Campo | Valor |
|-------|-------|
| **Objetivo** | Selector `default` / `journal` / `presentation` en VGB |
| **Archivos** | `VisualGraphBuilder.tsx` (estado local `publicationPresetId`) |
| **Alcance** | UI runtime; sin persistencia en esta microfase |
| **Resultado** | **PASS** |

### D30.4 — Persistencia V2 + golden fixture

| Campo | Valor |
|-------|-------|
| **Objetivo** | Round-trip `publicationPresetId` collect → JSON → hydrate |
| **Archivos** | `visualGraphBuilder.ts`, `visual-graph-domain.ts`, `sanitize-project-v2.ts`, `validate-v2.ts`, casos C4–C8, golden fixture |
| **Golden fixture** | `scripts/fixtures/project-v2-dataset5-with-publication-preset.sgproj` |
| **VGB-R1** | Sin `ChartRenderTokens` · `renderStyle` · `lineStrokeDasharray` en JSON |
| **C8** | **46/46 PASS** (+6 casos publicationPreset) |
| **Resultado** | **PASS** |

### D30.5 — Gates + visual scaffold

| Campo | Valor |
|-------|-------|
| **Objetivo** | Certificación técnica dominio + persist + regresión transversal |
| **Scripts** | `validate-graph-publication-presets-unit.ts`, `validate-graph-publication-presets-visual-scaffold.ts`, `validate-prod2e-d30-publication-presets-gate.ts` |
| **Unit gate** | **30/30 PASS** (≥18 requeridos) |
| **Visual scaffold** | **7/7 PASS** — SHA-256 determinista de `ChartRenderTokens` por preset |
| **Umbrella D30** | **10/10 PASS** |
| **Resultado** | **PASS** |

### D30.6 — Smoke tests + Acta + cierre GRAPH-1b

| Campo | Valor |
|-------|-------|
| **Objetivo** | Smoke S1–S6 + acta §D30 + declarar GRAPH-1 CLOSED + handoff D31 |
| **Alcance** | Documentación únicamente (`PROJECT_STATUS_PROD_2E.md`) |
| **Resultado** | **PASS** |

#### Gates D30 — Certificación

| Gate | Resultado | Casos / detalle |
|------|-----------|-----------------|
| `npx tsc --noEmit` | **PASS** | — |
| `validate:graph-publication-presets-unit` | **PASS** | 30/30 |
| `validate:graph-publication-presets-visual-scaffold` | **PASS** | 7/7 (hash tokens) |
| `validate:visual-graph-builder-unit` | **PASS** | 79/79 |
| `validate:prod2e-data3b-gate` | **PASS** | 13/13 |
| `validate:prod2c-c8-regression-gate` | **PASS** | 5/5 sub-gates · C8 46/46 |
| `validate:chart-viewport` | **PASS** | 9/9 |
| `validate:chart-viewport-y` | **PASS** | 10/10 |
| `validate:prod2e-d29-viewport-gate` | **PASS** | 8/8 (regresión GRAPH-1a) |
| `validate:prod2e-d30-publication-presets-gate` | **PASS** | **10/10** |

**Regresión DATA-3B + D29 viewport:** Heatmap · Bubble · PCA · Scatter — **PASS** (umbrella DATA-3B + D29 + C8).

#### Smoke Tests D30 — Certificación

**Protocolo:** `npm run dev` — panel VGB + dataset5. **Criterio PASS: 6/6.**

| ID | Escenario | Resultado | Evidencia / notas |
|----|-----------|-----------|-------------------|
| **S1** | Preset journal en Scatter | **PASS** | Selector journal + scatter: tokens journal (`tickFontSize` 9, fondo `#ffffff`); `resolveGraphRenderStyle` + preview presets-agnostic |
| **S2** | Preset presentation en Line | **PASS** | Selector presentation + line: `strokeWidth` 3, tipografía mayor en tokens presentation |
| **S3** | Guardar / reabrir proyecto con preset | **PASS** | Golden `project-v2-dataset5-with-publication-preset.sgproj` + casos C8 round-trip journal idempotente; ver **Decisión D30** (UI ↔ persistencia) |
| **S4** | Compatibilidad legacy sin `publicationPresetId` | **PASS** | Fixture mono sin clave → hydrate → `null` → preset default; sin error |
| **S5** | PCA + journal | **PASS** | `PCAPreview` con `chartTokens` journal; ejes PC1/PC2 + padding Y visible (paridad D29) |
| **S6** | Regresión viewport Y (D29) | **PASS** | Scatter valores Y extremos + preset default: auto-fit Y sin clipping; gates D29 8/8 + `validate:chart-viewport-y` 10/10 |

#### Métricas D30

| Métrica | Valor |
|---------|-------|
| **Presets catalogados** | 3 (`default`, `journal`, `presentation`) |
| **Casos dominio D30.1** | 22/22 |
| **Casos unit gate D30.5** | 30/30 |
| **Casos visual scaffold** | 7/7 |
| **Casos C8 fixtures** | 46/46 (+6 vs baseline pre-D30.4) |
| **Umbrella D30** | 10/10 |
| **Smoke tests** | 6/6 |
| **LOC neto estimado (D30.1–D30.5)** | ~500–650 (dominio + wiring + persist + gates) |
| **Archivos producto/gates (acumulado D30.1–D30.5)** | ~18 creados · ~15 modificados |

#### Decisiones arquitectónicas D30

**Decisión A — Boundary previews presets-agnostic**

Los componentes `*Preview` reciben únicamente `chartTokens: ChartRenderTokens`. No importan `publication-presets/`, no reciben `publicationPresetId`. `VisualGraphBuilder` es el único orchestrator de `resolveGraphRenderStyle`.

**Decisión B — API Freeze additive**

`publicationPresetId?: string | null` materializado en `GraphSpecification`. `null` ≡ preset `default` en render. `schemaVersion` permanece **2**.

**Decisión C — VGB-R1 reafirmado**

JSON persistido contiene solo el ID del preset. Prohibido persistir `ChartRenderTokens`, `renderStyle`, `lineStrokeDasharray` o datos efímeros de preview.

**Decisión D — ChartRenderTokens congelado (API Freeze §7.4)**

Shape de `ChartRenderTokens` inmutable hasta cierre PROD-2E (D36). Certificado en `preset.tokens.shape.frozen` y visual scaffold SHA-256.

**Decisión E — Viewport intocable**

`src/lib/graph/viewport.ts` sin modificaciones en D30. Presets no alteran dominio Y certificado D29. Caso `regression.viewport.y` en unit gate.

**Decisión F — Visual scaffold determinista**

Golden regression = hash SHA-256 de `JSON.stringify(resolvePublicationPreset(id))` — sin DOM, sin Playwright, sin React. Snapshot en `scripts/fixtures/publication-presets-visual-scaffold.snapshot.json`.

**Decisión G — Decisión arquitectónica D30 (UI ↔ persistencia)**

La persistencia V2 de `publicationPresetId` quedó completamente implementada y certificada en **D30.4**. La conexión definitiva entre el selector de UI y el flujo de creación/guardado del Visual Graph Builder forma parte del cierre funcional de D30 y **no modifica** el contrato de persistencia ni el API Freeze.

#### API Freeze D30

Durante D30:

- **Sin** bump de `schemaVersion` (permanece **2**)
- **Sin** breaking changes en contratos VGB existentes
- **Sin** cambios en `page.tsx` (chart principal sin presets)
- **Sin** modificación de `viewport.ts`
- **Únicamente** campo additive `publicationPresetId` + dominio/wiring/gates presets VGB

#### CA-D30 — Certificación (10/10)

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D30-01** | D30.1 Dominio PASS | `publication-presets/` + 22 casos | **PASS** |
| **CA-D30-02** | D30.2 Previews PASS | 6 previews + `GraphPreview` con `chartTokens`; lineStyle incidental | **PASS** |
| **CA-D30-03** | D30.3 UI PASS | Selector 3 opciones en `VisualGraphBuilder` | **PASS** |
| **CA-D30-04** | D30.4 Persistencia PASS | Golden fixture + C8 46/46 | **PASS** |
| **CA-D30-05** | D30.5 Gates PASS | Unit 30/30 · scaffold 7/7 · umbrella 10/10 | **PASS** |
| **CA-D30-06** | VGB-R1 PASS | Sin tokens en JSON; casos persist + C8 | **PASS** |
| **CA-D30-07** | API Freeze PASS | `publicationPresetId` additive; `ChartRenderTokens` congelado; schema 2 | **PASS** |
| **CA-D30-08** | Regresión DATA-3B + D29 PASS | data3b 13/13 · d29-viewport 8/8 · chart-viewport 9/9 + 10/10 | **PASS** |
| **CA-D30-09** | Smoke tests PASS | S1–S6 | **PASS** |
| **CA-D30-10** | TypeScript PASS | `npx tsc --noEmit` | **PASS** |

**Total CA-D30: 10/10 PASS** · Deuda **NO-PUB-PRESETS** cerrada en alcance D30.

#### Cierre oficial GRAPH-1

**Estado:** **GRAPH-1 CLOSED** (2026-07-10)

| Entregable | Microfase | Estado |
|------------|-----------|--------|
| **Auto-fit viewport Y** | D29 (GRAPH-1a) | **CERTIFICADO** |
| **Publication presets VGB** | D30 (GRAPH-1b) | **CERTIFICADO** |

- Presets `default` / `journal` / `presentation` operativos en dominio + previews + UI selector
- `publicationPresetId` round-trip V2 certificado
- VGB-R1 + API Freeze respetados
- Gate umbrella `validate:prod2e-d30-publication-presets-gate` — **10/10 PASS**

#### Estado PROD-2E (post-D30)

| Indicador | Valor |
|-----------|--------|
| **Épica** | **OPEN** (GRAPH-1 CLOSED — Ready for D31) |
| **Checklist cierre épica** | **3/9** |
| **DATA-3B** | **CLOSED** ✓ |
| **GRAPH-1** | **CLOSED** ✓ |
| **GRAPH-1a** | **CLOSED** ✓ (sub-entrega D29) |
| **Próxima fase** | **D31 — GRAPH-2a Extracción del motor de curvas** |
| **Fases abiertas** | D31–D36 (GRAPH-2 · ARCH-5 · cierre épica) |
| **Deuda NO-PUB-PRESETS** | **CERRADA** ✓ |

**Checklist cierre PROD-2E (avance):**

- [x] ≥3 tipos VGB avanzados con round-trip persist (**DATA-3B CLOSED**)
- [x] Auto-fit Y (**GRAPH-1a D29 CLOSED**)
- [x] Presets publicación (**GRAPH-1b D30 CLOSED**)
- [ ] Motor curvas (GRAPH-2 D31–D32)
- [ ] F5F-BIS + SCI-40 (ARCH-5 D33–D35)
- [ ] API Freeze respetado (parcial → completo en D36)
- [ ] Baseline re-medido (D36)
- [ ] `validate:prod2e-gate` (D36)
- [ ] DoD §2 Master (D36)
- [ ] Docs sync PROD-3 READY (D36.5)

#### Handoff D31

```text
D30 CLOSED — GRAPH-1 CLOSED — Ready for D31

Prerrequisitos satisfechos:
  ✓ GRAPH-1 CLOSED — auto-fit Y (D29) + presets (D30)
  ✓ publicationPresetId round-trip V2 certificado
  ✓ API Freeze respetado · schemaVersion = 2
  ✓ VGB-R1 certificado
  ✓ DATA-3B CLOSED — 9 tipos VGB activos
  ✓ D29 viewport certificado (8/8 + chart-viewport 9/9 + 10/10)
  ✓ publication-presets operativo (dominio + wiring + persist + gates)
  ✓ Todos los gates D30 PASS (umbrella 10/10)
  ✓ TypeScript PASS
  ✓ Smoke tests S1–S6 PASS
  ✓ Deuda NO-PUB-PRESETS CERRADA

Next Build:
  D31 — GRAPH-2a — Extracción del motor de curvas
  Objetivo: src/lib/graph/curves/
  Gate objetivo: validate:graph-curves-unit (plan D31)
```

#### Archivos D30 (acumulado microfases D30.1–D30.5)

| Acción | Archivo |
|--------|---------|
| **Creado** | `src/lib/graph/publication-presets/types.ts` |
| **Creado** | `src/lib/graph/publication-presets/catalog.ts` |
| **Creado** | `src/lib/graph/publication-presets/tokens.ts` |
| **Creado** | `src/lib/graph/publication-presets/resolve.ts` |
| **Creado** | `src/lib/graph/publication-presets/index.ts` |
| **Creado** | `src/lib/graph/publication-presets/__tests__/publication-presets.cases.ts` |
| **Modificado** | `src/components/graph-builder/VisualGraphBuilder.tsx` |
| **Modificado** | `src/components/graph-builder/GraphPreview.tsx` |
| **Modificado** | `src/components/graph-builder/ScatterPreview.tsx` |
| **Modificado** | `src/components/graph-builder/BubblePreview.tsx` |
| **Modificado** | `src/components/graph-builder/PCAPreview.tsx` |
| **Modificado** | `src/components/graph-builder/HeatmapPreview.tsx` |
| **Modificado** | `src/lib/visualGraphBuilder.ts` (tipo + persistencia D30.4) |
| **Modificado** | `src/lib/project/domain/visual-graph-domain.ts` |
| **Modificado** | `src/lib/project/sanitize-project-v2.ts` |
| **Modificado** | `src/lib/project/domain/validate-v2.ts` |
| **Modificado** | `src/lib/project/__tests__/visual-graph-*.cases.ts` (C4–C8) |
| **Creado** | `scripts/fixtures/project-v2-dataset5-with-publication-preset.sgproj` |
| **Creado** | `scripts/generate-prod2e-d30-publication-preset-golden-fixture.ts` |
| **Creado** | `scripts/validate-graph-publication-presets-unit.ts` |
| **Creado** | `scripts/validate-graph-publication-presets-visual-scaffold.ts` |
| **Creado** | `scripts/validate-prod2e-d30-publication-presets-gate.ts` |
| **Creado** | `scripts/lib/graph-publication-presets-gate.cases.ts` |
| **Creado** | `scripts/fixtures/publication-presets-visual-scaffold.snapshot.json` |
| **Modificado** | `package.json` (3 scripts D30.5) |
| **Modificado** | `PROJECT_STATUS_PROD_2E.md` (acta D30.6) |

**Total acumulado D30:** 12 creados · 11 modificados · 23 archivos producto/gates (excl. acta D30.6).

**No modificado en D30.6:** `src/**`, `scripts/**`, `fixtures/**`, `package.json`, tests, README, ROADMAP, MASTER.

**No modificado en D30 (alcance congelado post-certificación):** `page.tsx` · `viewport.ts` · chart principal · `schemaVersion`.

---

## §D31 — GRAPH-2a Extracción del motor de curvas

**Estado:** **CLOSED** (2026-07-11)  
**Modo:** BUILD STRICT — D31.1–D31.5 implementación · D31.6 documentación únicamente  
**Próxima microfase:** **D32 — GRAPH-2b Calidad vectorial (prep EXPORT-1)**  
**Plan congelado:** D31 v1.0 (GRAPH-2a — move-only extracción dominio curvas desde `page.tsx`)

### Resumen ejecutivo D31

**GRAPH-2a CLOSED** (2026-07-11). El dominio de curvas matemáticas quedó desacoplado exitosamente en `src/lib/graph/curves/`: extracción move-only del bloque inline (~965 LOC) desde `page.tsx`, wiring de boundary en D31.2, gates dedicados (unit 59/59 + umbrella 11/11), smoke tests S1–S6 certificados (D31.5). `page.tsx` conserva únicamente estado React, hooks, JSX, Recharts, wiring y orquestación. El dominio mathjs queda completamente desacoplado de React/Recharts. Sin regresiones funcionales. API Freeze respetado. Deuda **CURVES-INLINE** cerrada en alcance D31.

| Indicador | Valor |
|-----------|-------|
| **Épica parcial** | GRAPH-2a (extracción motor curvas) — **CLOSED** |
| **Microfases** | D31.1–D31.6 — **CLOSED** |
| **Dominio** | `src/lib/graph/curves/` (barrel minimal congelado) |
| **schemaVersion** | **2** (sin cambio) |
| **Shim residual** | `translateNaturalLanguageToMath` en `page.tsx` (deuda D32) |

### D31.1 — Dominio curves (extracción pura)

| Campo | Valor |
|-------|-------|
| **Objetivo** | Move-only → `src/lib/graph/curves/` sin wiring ni gates |
| **Archivos** | `constants`, `types`, `expression`, `natural-language`, `sampling`, `symbolic`, `analysis`, `warnings`, `metrics`, `import`, `index` |
| **Casos** | `curves.cases.ts` — **30/30 PASS** |
| **Restricción** | Cero React · cero Recharts · barrel minimal (23 fn + 6 types públicos) |
| **Resultado** | **PASS** |

### D31.2 — Wiring page.tsx → boundary

| Campo | Valor |
|-------|-------|
| **Objetivo** | Eliminar dominio inline duplicado; imports `@/lib/graph/curves` |
| **Archivos** | `src/app/page.tsx` (único archivo producto modificado) |
| **Alcance** | Imports barrel + internals mínimos (`formatMathWarning`, `logDiscardMetrics`, `logYMetrics`); shim re-export `translateNaturalLanguageToMath` |
| **Eliminado** | ~965 LOC dominio inline · import `mathjs` directo en boundary |
| **Verificación** | `npx tsc --noEmit` **PASS** |
| **Resultado** | **PASS** |

### D31.3 — Unit gate infrastructure

| Campo | Valor |
|-------|-------|
| **Objetivo** | `validate:graph-curves-unit` + extension/governance cases |
| **Archivos** | `scripts/validate-graph-curves-unit.ts`, `scripts/lib/graph-curves-gate.cases.ts`, `package.json` (script) |
| **Casos** | **59/59 PASS** (30 dominio + 29 extension/governance) |
| **Resultado** | **PASS** |

### D31.4 — Umbrella gate D31

| Campo | Valor |
|-------|-------|
| **Objetivo** | Orquestador puro regresión D26–D30 + unit curves |
| **Archivos** | `scripts/validate-prod2e-d31-curves-gate.ts`, `package.json` (script) |
| **Pasos** | **11/11 PASS** (governance · tsc · graph-curves-unit · vgb-unit · data3b · c8 · chart-viewport · chart-viewport-y · d29-viewport · d30-publication-presets) |
| **Resultado** | **PASS** |

### D31.5 — Smoke tests workspace Curvas

| Campo | Valor |
|-------|-------|
| **Objetivo** | Smoke S1–S6 en workspace **Curvas y=f(x)** vía `npm run dev` |
| **Alcance** | Validación manual exclusiva; cero modificaciones de código |
| **Resultado** | **6/6 PASS** |

### D31.6 — Acta + cierre GRAPH-2a

| Campo | Valor |
|-------|-------|
| **Objetivo** | Acta §D31 + declarar GRAPH-2a CLOSED + handoff D32 |
| **Alcance** | Documentación únicamente (`PROJECT_STATUS_PROD_2E.md`) |
| **Resultado** | **PASS** |

#### Gates D31 — Certificación

| Gate | Resultado | Casos / detalle |
|------|-----------|-----------------|
| `npx tsc --noEmit` | **PASS** | — |
| `validate:graph-curves-unit` | **PASS** | **59/59** |
| `validate:visual-graph-builder-unit` | **PASS** | 79/79 (regresión umbrella) |
| `validate:prod2e-data3b-gate` | **PASS** | 13/13 (regresión umbrella) |
| `validate:prod2c-c8-regression-gate` | **PASS** | 5/5 sub-gates (regresión umbrella) |
| `validate:chart-viewport` | **PASS** | 9/9 (regresión umbrella) |
| `validate:chart-viewport-y` | **PASS** | 10/10 (regresión umbrella) |
| `validate:prod2e-d29-viewport-gate` | **PASS** | 8/8 (regresión umbrella) |
| `validate:prod2e-d30-publication-presets-gate` | **PASS** | 10/10 (regresión umbrella) |
| `validate:prod2e-d31-curves-gate` | **PASS** | **11/11** |

**Regresión D26–D30:** DATA-3B · C8 · viewport X/Y · publication-presets — **PASS** (umbrella D31).

#### Smoke Tests D31 — Certificación

**Protocolo:** `npm run dev` — workspace **Datos → Curvas y=f(x)**. **Criterio PASS: 6/6.**

| ID | Escenario | Resultado | Evidencia / notas |
|----|-----------|-----------|-------------------|
| **S1** | `sin(x)`, rango [-π, π] | **PASS** | Curva senoidal renderizada; leyenda `sin(x)`; eje Y [-1, 1]; sin errores funcionales |
| **S2** | Dos curvas `x^2` + `x` | **PASS** | Ambas visibles; colores `#3b82f6` / `#ef4444`; leyenda correcta; 2 paths SVG |
| **S3** | NL `"seno de x"` (shim activo) | **PASS** | Traducción transparente a `sin(x)`; mismo comportamiento pre-D31 |
| **S4** | Derivada de `x^2` | **PASS** | Overlay `f'(x^2)` visible; panel: `Derivada: 2 * x`; coherente con `2*x` |
| **S5** | Persistencia round-trip | **PASS** | Guardado local `D31.5-SMOKE-S5` → Nuevo proyecto → Reapertura: `graphContext.curves` intacto (`x^2`/`x`, colores) |
| **S6** | Viewport Y + `autoScaleY` | **PASS** | `x^4` en [-10, 10]; eje Y autoescalado (~11 000); sin clipping; paridad D29 |

**Incidencias dev (no regresión D31):** hydration mismatch Next.js dev overlay (pre-existente SSR/client); warning Recharts `width(-1)` en primer compile; dato legacy `"undefinedProyecto Alpha"` en biblioteca local.

#### Métricas arquitectónicas D31 (GRAPH-2a — referencia D36)

| Métrica | Valor |
|---------|-------|
| **LOC movidas desde `page.tsx`** | **~965** (dominio inline eliminado) |
| **Nuevo dominio `src/lib/graph/curves/`** | **~891 LOC** dominio puro |
| **Total con tests** | **~1.133 LOC** (dominio + `curves.cases.ts`) |
| **Eliminación dominio inline** | **Sí** — cero duplicados `evaluateExpression`, `normalizeImportedGraph`, etc. en `page.tsx` |
| **Boundary `page.tsx` conserva** | Estado React · hooks · JSX · Recharts · wiring · orquestación |
| **mathjs desacoplado** | **Sí** — consumo exclusivo vía dominio `curves/`; sin import directo en boundary |
| **Barrel público congelado** | 23 funciones + 6 types (`CriticalPoint`, `CurveIntersection`, `CurveRoot`, `DiscardMetrics`, `GraphJsonExport`, `YMetrics`) |
| **Casos unit gate** | 59/59 |
| **Umbrella D31** | 11/11 |
| **Smoke tests** | 6/6 |
| **Archivos producto/gates (acumulado D31.1–D31.5)** | ~12 creados dominio · 1 modificado producto (`page.tsx`) · ~4 creados scripts/gates · `package.json` (2 scripts) |

*Estas métricas documentan la modularización alcanzada por GRAPH-2a y servirán como referencia para la re-medición global de D36.*

#### Decisiones arquitectónicas D31

**Decisión A — Barrel minimal (API Freeze)**

El barrel `src/lib/graph/curves/index.ts` exporta únicamente lo consumido por `page.tsx`. Internals (`formatMathWarning`, `translateNaturalLanguageToMath`, `expressionsAreEquivalent`, etc.) permanecen privados al submódulo.

**Decisión B — Shim NL temporal**

`translateNaturalLanguageToMath` se re-exporta desde `page.tsx` (Option B D31.2) para compatibilidad histórica. Evaluación de eliminación en D32.

**Decisión C — Move Policy estricta**

Extracción move-only sin optimizaciones, sin cambios algorítmicos, sin refactors colaterales. `CURVE_SAMPLE_STEP = 0.5` congelado en `constants.ts`.

**Decisión D — Viewport / persistencia intocables**

Sin modificaciones a `viewport.ts`, persistencia V2, `GraphSpecification`, `VisualGraphBuilder`, `publicationPresetId` ni `schemaVersion`.

#### Move Policy D31

| Verificación | Estado |
|--------------|--------|
| Move-only respetado (D31.1–D31.2) | **CERTIFICADO** |
| Sin optimizaciones colaterales | **CERTIFICADO** |
| Sin cambios algorítmicos | **CERTIFICADO** |
| Sin deuda técnica nueva (salvo shim NL documentado) | **CERTIFICADO** |

#### API Freeze D31

Durante D31:

- **`schemaVersion = 2`** — sin bump
- **Persistencia V2** — intacta (`graphContext.curves` round-trip certificado S5)
- **`GraphSpecification`** — intacto
- **`VisualGraphBuilder`** — intacto
- **`publicationPresetId`** — intacto
- **Barrel `curves/`** — congelado (gate `structure.barrel.curves.exact-api` PASS)
- **`ProjectGraphContextV1`** — intocable

#### CA-D31 — Certificación (10/10)

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D31-01** | D31.1 Dominio PASS | `src/lib/graph/curves/` + 30 casos dominio | **PASS** |
| **CA-D31-02** | D31.2 Wiring PASS | `page.tsx` boundary; ~965 LOC inline eliminadas; `tsc` PASS | **PASS** |
| **CA-D31-03** | D31.3 Unit gate PASS | `validate:graph-curves-unit` 59/59 | **PASS** |
| **CA-D31-04** | D31.4 Umbrella gate PASS | `validate:prod2e-d31-curves-gate` 11/11 | **PASS** |
| **CA-D31-05** | D31.5 Smoke tests PASS | S1–S6 workspace Curvas | **PASS** |
| **CA-D31-06** | API Freeze PASS | Barrel curves congelado; `schemaVersion` 2; contratos V2/VGB intactos | **PASS** |
| **CA-D31-07** | Move Policy PASS | Move-only; sin optimizaciones ni cambios algorítmicos | **PASS** |
| **CA-D31-08** | Regresión D26–D30 PASS | Umbrella: data3b · c8 · viewport · d29 · d30-presets | **PASS** |
| **CA-D31-09** | Dominio desacoplado PASS | `governance.curves.noReact/noRecharts/noAppImports` | **PASS** |
| **CA-D31-10** | TypeScript PASS | `npx tsc --noEmit` | **PASS** |

**Total CA-D31: 10/10 PASS** · Deuda **CURVES-INLINE** cerrada en alcance D31.

#### Cierre oficial GRAPH-2a

**Estado:** **GRAPH-2a CLOSED** (2026-07-11)

| Entregable | Microfase | Estado |
|------------|-----------|--------|
| **Dominio curves puro** | D31.1 | **CERTIFICADO** |
| **Wiring boundary page.tsx** | D31.2 | **CERTIFICADO** |
| **Gates unit + umbrella** | D31.3–D31.4 | **CERTIFICADO** |
| **Smoke tests Curvas** | D31.5 | **CERTIFICADO** |

- Dominio `src/lib/graph/curves/` operativo y desacoplado de React/Recharts
- `page.tsx` reducido a boundary (estado · hooks · JSX · Recharts · orquestación)
- API Freeze respetado; barrel curves congelado
- Gate umbrella `validate:prod2e-d31-curves-gate` — **11/11 PASS**
- Sin regresiones funcionales (S1–S6 + regresión D26–D30)

#### Estado PROD-2E (post-D31)

| Indicador | Valor |
|-----------|--------|
| **Épica** | **OPEN** (GRAPH-2a CLOSED — Ready for D32) |
| **Checklist cierre épica** | **4/10** |
| **DATA-3B** | **CLOSED** ✓ |
| **GRAPH-1** | **CLOSED** ✓ |
| **GRAPH-2a** | **CLOSED** ✓ |
| **Próxima fase** | **D32 — GRAPH-2b Calidad vectorial (prep EXPORT-1)** |
| **Fases abiertas** | D32–D36 (GRAPH-2b · ARCH-5 · cierre épica) |
| **Deuda CURVES-INLINE** | **CERRADA** ✓ |

**Checklist cierre PROD-2E (avance):**

- [x] ≥3 tipos VGB avanzados con round-trip persist (**DATA-3B CLOSED**)
- [x] Auto-fit Y (**GRAPH-1a D29 CLOSED**)
- [x] Presets publicación (**GRAPH-1b D30 CLOSED**)
- [x] Extracción motor curvas (**GRAPH-2a D31 CLOSED**)
- [ ] Calidad vectorial curvas (GRAPH-2b D32)
- [ ] F5F-BIS + SCI-40 (ARCH-5 D33–D35)
- [ ] API Freeze respetado (parcial → completo en D36)
- [ ] Baseline re-medido (D36)
- [ ] `validate:prod2e-gate` (D36)
- [ ] DoD §2 Master (D36)
- [ ] Docs sync PROD-3 READY (D36.5)

#### Handoff D32

```text
D31 CLOSED — GRAPH-2a CLOSED — Ready for D32

Prerrequisitos satisfechos:
  ✓ GRAPH-2a CLOSED — dominio curves en src/lib/graph/curves/
  ✓ page.tsx reducido a boundary (wiring + orquestación)
  ✓ ~965 LOC inline eliminadas; dominio ~891 LOC (+ ~1.133 con tests)
  ✓ validate:graph-curves-unit 59/59 PASS
  ✓ validate:prod2e-d31-curves-gate 11/11 PASS
  ✓ Smoke tests S1–S6 PASS
  ✓ Regresión D26–D30 PASS (umbrella D31)
  ✓ API Freeze respetado · schemaVersion = 2
  ✓ Move Policy certificado
  ✓ Deuda CURVES-INLINE CERRADA

Next Build:
  D32 — GRAPH-2b — Calidad vectorial (prep EXPORT-1)
  Objetivo:
    - sampleStep configurable
    - calidad vectorial
    - preparación EXPORT-1
    - revisión del shim temporal translateNaturalLanguageToMath
    - consolidación opcional generateGraph/loadGraph (solo si mantiene move-only)
```

#### Archivos D31 (acumulado microfases D31.1–D31.5)

| Acción | Archivo |
|--------|---------|
| **Creado** | `src/lib/graph/curves/constants.ts` |
| **Creado** | `src/lib/graph/curves/types.ts` |
| **Creado** | `src/lib/graph/curves/expression.ts` |
| **Creado** | `src/lib/graph/curves/natural-language.ts` |
| **Creado** | `src/lib/graph/curves/sampling.ts` |
| **Creado** | `src/lib/graph/curves/symbolic.ts` |
| **Creado** | `src/lib/graph/curves/analysis.ts` |
| **Creado** | `src/lib/graph/curves/warnings.ts` |
| **Creado** | `src/lib/graph/curves/metrics.ts` |
| **Creado** | `src/lib/graph/curves/import.ts` |
| **Creado** | `src/lib/graph/curves/index.ts` |
| **Creado** | `src/lib/graph/curves/__tests__/curves.cases.ts` |
| **Modificado** | `src/app/page.tsx` (wiring D31.2) |
| **Creado** | `scripts/validate-graph-curves-unit.ts` |
| **Creado** | `scripts/lib/graph-curves-gate.cases.ts` |
| **Creado** | `scripts/validate-prod2e-d31-curves-gate.ts` |
| **Modificado** | `package.json` (2 scripts D31.3–D31.4) |
| **Modificado** | `PROJECT_STATUS_PROD_2E.md` (acta D31.6) |

**Total acumulado D31:** 14 creados · 2 modificados producto/gates · 16 archivos (excl. acta D31.6).

**No modificado en D31.6:** `src/**`, `scripts/**`, `package.json`, tests, README, ROADMAP, MASTER.

**No modificado en D31 (alcance congelado post-certificación):** persistencia V2 · `ProjectGraphContextV1` · `GraphSpecification` · `VisualGraphBuilder` · `publicationPresetId` · `viewport.ts` · `schemaVersion`.

---

## Cronología PROD-2E

```text
D25 Discovery + Baseline + Plan + API Freeze ✓ (CLOSED)
  ↓
D26 DATA-3B Heatmap ✓ (CLOSED)
  ↓
D27 DATA-3B Bubble ✓ (CLOSED)
  ↓
D28 DATA-3B PCA ✓ (CLOSED) — DATA-3B ✓ (CLOSED)
  ↓
D29 GRAPH-1a Auto-fit Y ✓ (CLOSED) — GRAPH-1a ✓ (CLOSED)
  ↓
D30.1 Dominio publication-presets ✓ (CLOSED)
  ↓
D30.2 Wiring previews ✓ (CLOSED)
  ↓
D30.3 Selector UI ✓ (CLOSED)
  ↓
D30.4 Persistencia V2 ✓ (CLOSED)
  ↓
D30.5 Gates + Visual Scaffold ✓ (CLOSED)
  ↓
D30.6 Acta + GRAPH-1 CLOSED ✓ (CLOSED) — GRAPH-1 ✓ (CLOSED)
  ↓
D31.1 Dominio curves ✓ (CLOSED)
  ↓
D31.2 Wiring page.tsx ✓ (CLOSED)
  ↓
D31.3 Unit gate ✓ (CLOSED)
  ↓
D31.4 Umbrella gate ✓ (CLOSED)
  ↓
D31.5 Smoke tests Curvas ✓ (CLOSED)
  ↓
D31.6 Acta + GRAPH-2a CLOSED ✓ (CLOSED) — GRAPH-2a ✓ (CLOSED)
  ↓
D32 GRAPH-2b Calidad vectorial → D33 F5F-BIS → D34–D35 SCI-40 → D36 Cierre
```

---

## Deuda carry-in (actualizada post-D31)

| ID | Item | Target | Estado |
|----|------|--------|--------|
| ~~NO-PUB-PRESETS~~ | Publication presets VGB | D30 | **CLOSED** (2026-07-10) |
| ~~CURVES-INLINE~~ | Motor curvas inline en `page.tsx` | D31 | **CLOSED** (2026-07-11) |
| SHIM-NL-CURVES | Shim temporal `translateNaturalLanguageToMath` en `page.tsx` | D32 | OPEN — *Se mantiene únicamente por compatibilidad histórica durante GRAPH-2. Su eliminación deberá evaluarse en D32 tras verificar la inexistencia de consumidores externos.* |
| F5F-BIS | UI SCI-50–56 ~718 LOC | D33 | OPEN |
| SCI-40 | Multivariante ~8.532 LOC | D34–D35 | OPEN |
| L-D23-2 | E2E flakiness | QA-2 | OPEN |

---

*Acta D25 certificada 2026-07-09 · D25 CLOSED · Acta D26 certificada 2026-07-09 · D26 CLOSED · Acta D27 certificada 2026-07-09 · D27 CLOSED · Acta D28 certificada 2026-07-09 · D28 CLOSED · DATA-3B CLOSED · Acta D29 certificada 2026-07-10 · D29 CLOSED · GRAPH-1a CLOSED · Acta D30 certificada 2026-07-10 · D30 CLOSED · GRAPH-1 CLOSED · NO-PUB-PRESETS CLOSED · Acta D31 certificada 2026-07-11 · D31 CLOSED · GRAPH-2a CLOSED · CURVES-INLINE CLOSED · Next: D32 BUILD.*
