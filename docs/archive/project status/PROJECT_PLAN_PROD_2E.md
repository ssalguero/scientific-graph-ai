# Plan PROD-2E — Motor gráfico profesional

**Estado:** **CLOSED** (2026-07-16 — acta [`PROJECT_STATUS_PROD_2E.md`](PROJECT_STATUS_PROD_2E.md) §D36)  
**Fecha de cierre:** 2026-07-16  
**Identificador:** PROD-2E (continúa PROD-2D CLOSED)  
**Próxima fase:** **PROD-3** — [`PROJECT_PLAN_PROD_3.md`](PROJECT_PLAN_PROD_3.md)  
**Baseline:** [`PROJECT_BASELINE_PROD_2E.md`](PROJECT_BASELINE_PROD_2E.md) — D25.2 COMPLETED  
**Discovery:** [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) — D25.1 COMPLETED  
**API Freeze:** [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) §6 — D25.4 COMPLETED

**Referencias:**

- Estrategia: [`MASTER_ROADMAP_V1.md`](MASTER_ROADMAP_V1.md) §13, §7B, §10
- Handoff: [`PROJECT_STATUS_PROD_2D.md`](PROJECT_STATUS_PROD_2D.md) §D24.5
- Persistencia VGB: [`PROJECT_STATUS_PROD_2C.md`](PROJECT_STATUS_PROD_2C.md)

---

## Principios arquitectónicos (obligatorios)

### 1. API Freeze VGB (D25.4)

PROD-2E **extiende** el contrato VGB según [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) §6. **No modifica** semántica de tipos v1 ni `schemaVersion`. Campos nuevos son opcionales en `graphSpec`.

### 2. Domain First + VGB-R1

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Dominio VGB** | `src/lib/visualGraphBuilder.ts` (+ submódulos D28+) | Preview builders puros |
| **Dominio viewport** | `src/lib/graph/viewport.ts` (D29) | Auto-fit X+Y |
| **Dominio curvas** | `src/lib/graph/curves/` (D31) | Sampling mathjs |
| **Dominio series** | `src/lib/graph/series/` (D32) | Series/Datasets parsers + transforms |
| **Dominio presets** | `src/lib/graph/publication-presets/` (D30) | Estilos publicación |
| **UI VGB** | `src/components/graph-builder/` | Constructor + preview |
| **Persistencia VGB** | `src/lib/project/domain/visual-graph-*` | Round-trip V2 |
| **Multivariante** | `src/lib/scientific/multivariate/` | SCI-40 — **DEFERRED** (amend D33.1 → ARCH-5) |
| **Boundary** | `src/app/page.tsx` | Wiring mínimo |

### 3. Extracción move-only (ARCH-5 gráfico)

> Toda extracción desde `page.tsx` es **move-only**: mismos inputs, mismos outputs, scores QA-1 inalterados.

### 4. Definition of Done (Master Roadmap §2)

Cada microfase D26–D36 cumple: implementación · gates PASS · tests · docs · commit · push (cierre) · cero deuda en alcance.

### 5. Rollback Rule

Si BUILD de microfase D{N} falla Gate → revertir **solo** D{N}. Microfases certificadas CLOSED intocables salvo amend documentado.

---

## Épicas y microfases

| Épica | Microfases | Objetivo |
|-------|------------|----------|
| **Discovery** | D25.1–D25.5 | Bloqueo alcance + baseline + API Freeze + plan |
| **DATA-3B** | D26, D27, D28 | ≥3 tipos VGB avanzados + golden fixtures |
| **GRAPH-1** | D29, D30 | Auto-fit Y + presets publicación |
| **GRAPH-2** | D31, D32, D33, D34, D35 | Motor curvas + series + axes + interaction + rendering |
| **GRAPH-2c (prep EXPORT-1)** | Post-D32 (diferido) | Calidad vectorial · sampleStep · SHIM-NL — no bloquea cierre |
| **ARCH-5 gráfico (deferred)** | post-GRAPH-3 | F5F-BIS + SCI-40 (amend D33.1 — fuera alcance PROD-2E) |
| **Cierre** | D36 | Gate umbrella + acta + sync docs |

---

## Roadmap microfases D25→D36 (D37 amend opcional)

### D25 — Discovery + Baseline + Plan + API Freeze

| Campo | Contenido |
|-------|-----------|
| **Estado** | **COMPLETED** |
| **Entregables** | Discovery · Baseline · Plan · API Freeze · Acta |
| **Gate** | Sanity VGB gates + `validate:prod2d-gate` read-only |
| **Código** | **0 cambios funcionales** |

#### D25.4 — API Freeze VGB (congelado)

Ver [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) §6.

| Ítem | Decisión congelada |
|------|-------------------|
| Tipos nuevos | `heatmap`, `bubble`, `pca` |
| Campos opcionales | `sizeVariable`, `colorVariable`, `pcaVariables`, `pcaStandardize`, `publicationPresetId` |
| schemaVersion | **NO bump** |
| VGB-R1 | Reafirmado |
| Tipos v1 (6) | Semántica inmutable |

---

### D26 — DATA-3B tipo #1: Heatmap

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Tipo `heatmap` operativo con round-trip |
| **Archivos** | `visualGraphBuilder.ts`, `validate-v2.ts`, `GraphPreview.tsx`, `GraphTypeSelector.tsx` |
| **Golden fixture** | `scripts/fixtures/project-v2-dataset5-with-heatmap.sgproj` |
| **Gate** | `validate:prod2e-d26-heatmap-unit` + C4–C6 regresión |

---

### D27 — DATA-3B tipo #2: Bubble

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Tipo `bubble` con `sizeVariable` (API Freeze) |
| **Golden fixture** | `project-v2-dataset5-with-bubble.sgproj` |
| **Gate** | unit bubble + C6 hydrate + fixture PASS |

---

### D28 — DATA-3B tipo #3: PCA + gate umbrella DATA-3B

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Tipo `pca` (decisión D25 — no clustering) |
| **Dominio** | Reutilizar `buildPCAAnalysis` move-only parcial |
| **Golden fixture** | `project-v2-dataset5-with-pca.sgproj` |
| **Gate** | `validate:prod2e-data3b-gate` (compone D26–D28 + C8) |

---

### D29 — GRAPH-1a: Auto-fit viewport Y

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Auto-fit Y en chart principal + VGB preview |
| **Archivos** | `src/lib/graph/viewport.ts` (extracción desde `chartViewport.ts`) |
| **Gate** | `validate:chart-viewport-y` (nuevo) + regresión X |

---

### D30 — GRAPH-1b: Presets de publicación

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Presets `default`, `journal`, `presentation` |
| **Gate** | `validate:graph-publication-presets-unit` + golden regression scaffold |

---

### D31 — GRAPH-2a: Extracción motor curvas

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Move-only → `src/lib/graph/curves/` |
| **Gate** | `validate:graph-curves-unit` |

---

### D32 — GRAPH-2b: Extracción dominio Series/Datasets

| Campo | Contenido |
|-------|-----------|
| **Estado** | **COMPLETED** (2026-07-11) |
| **Objetivo** | Move-only → `src/lib/graph/series/` + shims legacy |
| **Gate** | `validate:graph-series-unit` (44/44) + `validate:prod2e-d32-series-gate` (15/15) |
| **Amend** | Alcance original *Calidad vectorial* → diferido a **GRAPH-2c** (post-D32) |

---

### D32c — GRAPH-2c: Calidad vectorial (prep EXPORT-1) — DIFERIDO

| Campo | Contenido |
|-------|-----------|
| **Estado** | **OPEN** — no bloquea D33 |
| **Objetivo** | Densidad muestreo configurable; prep SVG; revisión SHIM-NL-CURVES |
| **Fuera alcance PROD-2E** | PNG 300dpi → PROD-3 |

---

### D33 — GRAPH-2c: Axes & Viewport (Amend D33.1)

| Campo | Contenido |
|-------|-----------|
| **Estado** | **COMPLETED** (2026-07-13) |
| **Objetivo** | Move-only → `src/lib/graph/axes/` + SSOT D29 |
| **Gate** | `validate:graph-axes-unit` (89/89) + `validate:prod2e-d33-axes-gate` (15/15) |
| **Amend D33.1** | Sustituye plan original D33=F5F-BIS — ver STATUS §D36 Resolution Note |

---

### D34 — GRAPH-2d: Chart Interaction (Amend D33.1)

| Campo | Contenido |
|-------|-----------|
| **Estado** | **COMPLETED** (2026-07-15) |
| **Objetivo** | React boundary → `src/components/graph/chart-interaction/` |
| **Gate** | `validate:graph-interaction-unit` (35/35) + `validate:prod2e-d34-interaction-gate` |

---

### D35 — GRAPH-2e: Chart Rendering (Amend D33.1)

| Campo | Contenido |
|-------|-----------|
| **Estado** | **COMPLETED** (2026-07-16) |
| **Objetivo** | React/Recharts boundary → `src/components/graph/chart-rendering/` |
| **Gate** | `validate:graph-rendering-unit` (59/59) + `validate:prod2e-d35-rendering-gate` |

---

### D33-orig — ARCH-5: F5F-BIS (~718 LOC) — DEFERRED (Amend D33.1)

| Campo | Contenido |
|-------|-----------|
| **Estado** | **DEFERRED** — post-GRAPH-3 / ARCH-5 |
| **Objetivo original D25** | UI SCI-50–56 → `src/components/methodology/` |
| **Nota** | Ítem checklist #5 certificado PASS (deferred) en cierre D36 |

---

### D34-orig — ARCH-5: SCI-40 dominio (Escenario B) — DEFERRED (Amend D33.1)

| Campo | Contenido |
|-------|-----------|
| **Estado** | **DEFERRED** — ARCH-5 |
| **Objetivo original D25** | Dominio → `src/lib/scientific/multivariate/` |

---

### D35-orig — ARCH-5: SCI-40 UI/wiring — DEFERRED (Amend D33.1)

| Campo | Contenido |
|-------|-----------|
| **Estado** | **DEFERRED** — ARCH-5 |
| **Objetivo original D25** | UI → `src/components/analysis/` + wiring |

---

### D36 — Gate umbrella + cierre PROD-2E

| Campo | Contenido |
|-------|-------|
| **Estado** | **COMPLETED** (2026-07-16) |
| **Objetivo** | `validate:prod2e-gate` + acta + sync roadmaps → PROD-3 READY |
| **Subfases** | D36.1 baseline · D36.2 gate · D36.3 métricas · D36.4 CA · D36.5 smoke · D36.6 acta |
| **Gate épica** | `validate:prod2e-gate` **PASS** |
| **Checklist** | **9/9** |

**Amend Escenario A (no activo):** si SCI-40 ≤1.000 LOC → secuencia original D33–D35 ARCH-5.

**Amend D33.1 (activo):** D33–D35 ejecutados como GRAPH-2c/2d/2e — ver STATUS §D36 Resolution Note.

---

## Secuencia lineal

```text
D25 Discovery/Baseline/Plan/API Freeze
  ↓
D26 Heatmap (+ golden)
  ↓
D27 Bubble (+ golden)
  ↓
D28 PCA (+ validate:prod2e-data3b-gate)
  ↓
D29 Auto-fit Y
  ↓
D30 Presets publicación
  ↓
D31 Curvas extracción ✓
  ↓
D32 Series/Datasets extracción ✓
  ↓
D33 GRAPH-2c Axes ✓ (Amend D33.1 — sustituye F5F-BIS planificado)
  ↓
D34 GRAPH-2d Interaction ✓ (Amend D33.1 — sustituye SCI-40 dominio planificado)
  ↓
D35 GRAPH-2e Rendering ✓ (Amend D33.1 — sustituye SCI-40 UI planificado)
  ↓
D36 Gate umbrella + cierre documental ✓
```

**Secuencia ejecutada (Amend D33.1 — certificada):**  
`D25 → D26 → D27 → D28 → D29 → D30 → D31 → D32 → D33(GRAPH-2c) → D34(GRAPH-2d) → D35(GRAPH-2e) → D36`

**Secuencia original D25 (Escenario B — no ejecutada para D33–D35):**  
`D33(F5F-BIS) → D34(SCI-40 dominio) → D35(SCI-40 UI)` — **deferred** a ARCH-5/post-GRAPH-3.

---

## Gates de regresión obligatorios (transversal)

| Gate | Cuándo |
|------|--------|
| `validate:prod2c-c8-regression-gate` | Tras cualquier cambio VGB persist |
| `validate:visual-graph-builder-unit` | Tras cambios dominio VGB |
| `validate:prod2d-gate` | Sanity semanal / pre-GATE |
| `validate:prod2e-gate` | Cierre épica D36 |
| Golden fixtures per-type | Desde D26 (no acumular en D28) |

---

## Estimación relativa de esfuerzo

| Bloque | Microfases | % esfuerzo |
|--------|------------|------------|
| Discovery + Baseline + API Freeze | D25 | 8% |
| DATA-3B | D26–D28 | 28% |
| GRAPH-1 | D29–D30 | 18% |
| GRAPH-2 | D31–D32 | 14% |
| ARCH-5 gráfico (deferred) | D33–D35 orig | 0% (amend D33.1) |
| Cierre | D36 | 8% |

---

## Fuera de alcance PROD-2E

Ver [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) §3 y Master Roadmap §12.

---

## Criterio de cierre PROD-2E (Master Roadmap §13)

- [x] ≥3 tipos VGB avanzados con round-trip persist (DATA-3B)
- [x] Auto-fit Y + presets publicación (GRAPH-1)
- [x] Motor curvas + series + ejes + interaction + rendering (GRAPH-2 D31–D35)
- [x] F5F-BIS + SCI-40 — **PASS (deferred certificado)** — amend D33.1; carry-in ARCH-5
- [x] API Freeze D25–D35 respetado
- [x] Baseline rendimiento re-medido vs D25 (D36.1/D36.3)
- [x] `validate:prod2e-gate` PASS
- [x] Definition of Done §2 completa (D36.6)
- [x] Documentación sincronizada → PROD-3 READY

**Checklist cierre PROD-2E: 9/9** — épica **CLOSED** (2026-07-16).

---

*Plan operativo PROD-2E — aprobado D25.3 (2026-07-09) · Amend SCI-40 Escenario B · Amend D32 Series · Amend D33.1 GRAPH-2c/2d/2e · Cierre D36.6 (2026-07-16) · **PROD-2E CLOSED** · **PROD-3 READY**.*
