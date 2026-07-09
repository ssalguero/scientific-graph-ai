# PROD-3 — Status: Exportación + DATA-3D VGB

**Estado épica:** **OPEN**  
**Fecha apertura:** 2026-07-09  
**Última microfase cerrada:** **D39 — DATA-3D Scatter Plot VGB**  
**Plan:** [`PROJECT_PLAN_PROD_3.md`](PROJECT_PLAN_PROD_3.md)  
**Discovery:** [`PROJECT_DISCOVERY_PROD_3.md`](PROJECT_DISCOVERY_PROD_3.md)

---

## §D39 — DATA-3D Scatter Plot VGB

**Estado:** **CLOSED** (2026-07-09)  
**Modo:** BUILD — dominio · UI · persistencia · gates · acta

### Métricas D39

| Campo | Valor |
|-------|-------|
| **Tipo mejorado** | `scatter` v1 (upgrade profesional) |
| **schemaVersion** | **2** (sin bump) |
| **Golden fixture** | `scripts/fixtures/project-v2-dataset5-with-scatter-pro.sgproj` |
| **Amend API Freeze** | Decisión J — `groupVariable` activo en scatter |
| **C8 fixtures** | **33/33 PASS** (27 baseline + 6 scatter-pro) |

### Decisiones arquitectónicas D39

| ID | Decisión |
|----|----------|
| **A** | Reutilizar `scatterPoints` — sin nuevo array efímero |
| **B** | Paleta determinista por grupo en `ScatterPreview` |
| **C** | `clampScatterMarkerSize` 2–20 |
| **E** | `VisualGraphPreviewPoint` sin campos de estilo en dominio |
| **G** | Scatter VGB ≠ Scatter Matrix SCI-40 |
| **H** | `buildVisualGraphSeries` — serie única flatten (groups solo en preview) |
| **I** | Cross-type `groupVariable` — normalización en `buildGraphSpecification` |
| **J** | Amend API Freeze PROD-3 aprobado |

### Gates D39 — Certificación

| Gate | Resultado | Detalle |
|------|-----------|---------|
| `validate:prod3-d39-scatter-unit` | **PASS** | 22/22 |
| `validate:visual-graph-builder-unit` | **PASS** | incluye scatter suite |
| `validate:prod2c-c8-regression-gate` | **PASS** | 5/5 sub-gates; fixtures 33/33 |
| `validate:prod3-data3d-gate` | **PASS** | gobernanza B1/B2 + gates |
| `validate:prod3-d39-scatter-perf` | **PASS** (informativo) | documental |
| `npx tsc --noEmit` | **PASS** | — |

### CA-D39 — Certificación (10/10)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D39-01 | D39.2 Dominio PASS | **PASS** |
| CA-D39-02 | D39.3 Preview PASS | **PASS** |
| CA-D39-03 | D39.3 UI PASS | **PASS** |
| CA-D39-04 | D39.4 Persistencia + golden PASS | **PASS** |
| CA-D39-05 | Gates PASS | **PASS** |
| CA-D39-06 | VGB-R1 PASS | **PASS** |
| CA-D39-07 | API Freeze PASS (Amend J) | **PASS** |
| CA-D39-08 | Regresión v1+heatmap+bubble PASS | **PASS** |
| CA-D39-09 | Performance documentada | **PASS** |
| CA-D39-10 | TypeScript PASS | **PASS** |

**Total CA-D39: 10/10 PASS**

#### Handoff post-D39

```text
D39 CLOSED — Ready for EXPORT-1 / siguiente DATA-3D
Prerrequisitos verificados:
  ✓ Amend API Freeze PROD-3 (Decisión J)
  ✓ ScatterPreview + buildScatterPointsFromWorksheet
  ✓ Golden scatter-pro + C8 33/33
Next BUILD: EXPORT-1 (según MASTER_ROADMAP)
Nota: D28 PCA permanece en PROD-2E según plan congelado — independiente de D39
```

#### Archivos D39 (producto + gates)

| Acción | Archivo |
|--------|---------|
| **Creado** | `src/components/graph-builder/ScatterPreview.tsx` |
| **Creado** | `src/lib/visualGraphBuilder/__tests__/scatter.cases.ts` |
| **Creado** | `scripts/generate-prod3-d39-scatter-golden-fixture.ts` |
| **Creado** | `scripts/fixtures/project-v2-dataset5-with-scatter-pro.sgproj` |
| **Creado** | `scripts/validate-prod3-d39-scatter-unit.ts` |
| **Creado** | `scripts/validate-prod3-d39-scatter-perf.ts` |
| **Creado** | `scripts/validate-prod3-data3d-gate.ts` |
| **Creado** | `PROJECT_DISCOVERY_PROD_3.md` |
| **Creado** | `PROJECT_PLAN_PROD_3.md` |
| **Modificado** | `src/lib/visualGraphBuilder.ts` |
| **Modificado** | `src/components/graph-builder/GraphPreview.tsx` |
| **Modificado** | `src/components/graph-builder/VisualGraphBuilder.tsx` |
| **Modificado** | `src/app/page.tsx` (wiring scatterStyle) |
| **Modificado** | `src/lib/project/__tests__/visual-graph-fixtures.cases.ts` |
| **Modificado** | `scripts/validate-visual-graph-builder-unit.ts` |
| **Modificado** | `package.json` |
| **Modificado** | `MASTER_ROADMAP_V1.md` (amend DATA-3D) |

---

## Cronología PROD-3

```text
Apertura PROD-3 ✓
  ↓
D39 DATA-3D Scatter ✓ (CLOSED)
  ↓
EXPORT-1 (TBD)
```
