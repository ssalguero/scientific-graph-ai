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

---

## §D38 — Architecture Freeze PROD-3

**Fecha:** 2026-07-17  
**Microfase:** D38 — Architecture Freeze (documental)  
**Modo:** BUILD DOCUMENTAL — APPEND-ONLY · cero código · cero BUILD de producto  
**Estado:** **Architecture Freeze COMPLETE** · **PROD-3 NOT CLOSED** · **NO BUILD STARTED**

### 1. Resumen ejecutivo

| Entregable | Estado |
|------------|--------|
| Architecture Freeze (D38.2) | **Emitido — OFFICIAL** |
| Governance (D38.3) | **Emitida — OFFICIAL** |
| Roadmap Official (D38.4) | **Emitido — OFFICIAL** |
| Quality Gates (D38.5) | **Definidos — OFFICIAL (QG-PROD3 v1.0)** |
| BUILD de producto | **No iniciado** |

### 2. Estado — declaraciones

```text
PROD-3 ARCHITECTURE FREEZE COMPLETE
PROD-3 NOT CLOSED
NO BUILD STARTED
```

### 3. Referencias

| Microfase | Documento |
|-----------|-----------|
| D38.1 | [`docs/D38.1-freeze-validation.md`](docs/D38.1-freeze-validation.md) — **CONSISTENT** |
| D38.2 | [`docs/D38.2-architecture-freeze.md`](docs/D38.2-architecture-freeze.md) — **OFFICIAL** |
| D38.3 | [`docs/D38.3-governance.md`](docs/D38.3-governance.md) — **OFFICIAL** |
| D38.4 | [`docs/D38.4-roadmap-final.md`](docs/D38.4-roadmap-final.md) — **OFFICIAL** |
| D38.5 | [`docs/D38.5-quality-gates.md`](docs/D38.5-quality-gates.md) — **OFFICIAL** |

### 4. Checklist D38

- [x] D38.1 Freeze Validation — CA PASS · **CONSISTENT**
- [x] D38.2 Architecture Freeze — CA PASS · **OFFICIAL**
- [x] D38.3 Governance — CA PASS · **OFFICIAL**
- [x] D38.4 Roadmap Final — CA PASS · **OFFICIAL**
- [x] D38.5 Quality Gates — CA PASS · **OFFICIAL**

### 5. CA-D38 — Certificación

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D38-01** | Validation | D38.1 CONSISTENT · CA-D38.1 7/7 | **PASS** |
| **CA-D38-02** | Architecture Freeze | D38.2 OFFICIAL · CA-D38.2 9/9 | **PASS** |
| **CA-D38-03** | Governance | D38.3 OFFICIAL · CA-D38.3 7/7 | **PASS** |
| **CA-D38-04** | Roadmap | D38.4 OFFICIAL · CA-D38.4 8/8 | **PASS** |
| **CA-D38-05** | Quality Gates | D38.5 OFFICIAL · CA-D38.5 10/10 | **PASS** |
| **CA-D38-06** | STATUS actualizado | Este §D38 APPEND-ONLY | **PASS** |
| **CA-D38-07** | Integridad documental | Append Integrity + Verification Record | **PASS** |

**Total CA-D38: 7/7 PASS**

### 6. Handoff

```text
NEXT
D39 — EXPORT-1 Discovery & BUILD

Prerequisites
✓ Architecture Freeze OFFICIAL
✓ Governance OFFICIAL
✓ Roadmap OFFICIAL
✓ Quality Gates OFFICIAL

No implementation has started.
```

### 7. Hallazgos

```text
Hallazgos
No Findings
```

### 8. Archivos NO modificados (D38)

**No modificado:** `src/**` · `scripts/**` · `package.json` · tests · `docs/D37.*` · contenido histórico de este archivo (§D39 · Cronología previa) · D38.1–D38.5 tras su emisión

**Creados en D38:** `docs/D38.1-freeze-validation.md` · `docs/D38.2-architecture-freeze.md` · `docs/D38.3-governance.md` · `docs/D38.4-roadmap-final.md` · `docs/D38.5-quality-gates.md`

**Actualizado (APPEND-ONLY):** `PROJECT_STATUS_PROD_3.md` (solo este §D38)

### 9. Append Integrity Rules

| Regla | Cumplimiento |
|-------|--------------|
| Actualización únicamente al final del documento | **Sí** |
| Sin modificar secciones previas | **Sí** |
| Sin alterar contenido histórico | **Sí** |
| Sin cambiar numeración existente | **Sí** |

### 10. Append Verification Record

| Verificación | Resultado |
|--------------|-----------|
| Append realizado al EOF | **PASS** |
| Secciones previas sin cambios | **PASS** |
| §D39 histórico intacto | **PASS** |
| Numeración preservada | **PASS** |
| Diff = solo líneas añadidas | **PASS** |

### 11. STATUS Integrity Declaration

```text
Este registro histórico mantiene íntegramente su contenido previo.
La sección §D38 constituye un agregado APPEND-ONLY conforme a la Governance D38.3.
No se ha modificado ninguna sección histórica.
```

### 12. CA-D38 Exit Criteria

| Criterio | Estado |
|----------|--------|
| D38.1–D38.5 PASS | **Cumple** |
| Append realizado correctamente | **Cumple** |
| Integridad histórica preservada | **Cumple** |
| Handoff emitido | **Cumple** |
| Sin inconsistencias abiertas | **Cumple** |

### 13. D38 Completion Declaration

```text
D38 Completion Declaration
La fase D38 queda completada exclusivamente desde el punto de vista documental.
El proyecto entra en estado:
Architecture Freeze COMPLETE
Governance ACTIVE
Roadmap OFFICIAL
Quality Gates OFFICIAL
BUILD NOT STARTED
La implementación comenzará únicamente en D39 conforme al Roadmap OFFICIAL.
```

---

*§D38 APPEND-ONLY 2026-07-17 · CA-D38 7/7 PASS · Next: D39 — EXPORT-1 Discovery & BUILD · No implementation has started.*

---

## §D40 — Certificación Final de la pista Freeze/Planning (PROD-3)

**Fecha:** 2026-07-17  
**Microfase:** D40 — Certificación Final de la pista Freeze/Planning (documental)  
**Modo:** BUILD DOCUMENTAL — APPEND-ONLY · Resolution Note RN-D40 · cero código · cero BUILD de producto  
**Estado:** **FREEZE_PLANNING_TRACK = CERTIFIED** · **D40 CERTIFIED** · **PROD-3 = OPEN** · **NO BUILD AUTHORIZED BY D40** · **READY FOR EXPORT-1 DISCOVERY**

### 1. Resumen ejecutivo

| Entregable | Estado |
|------------|--------|
| D40.1 Discovery Final | **OFFICIAL** · CA-D40.1 10/10 PASS |
| D40.2 Validación Global | **OFFICIAL** · CA-D40.2 10/10 PASS |
| D40.3 Consolidación Documental | **OFFICIAL** · CA-D40.3 10/10 PASS |
| D40.4 Arquitectura Final | **OFFICIAL** · CA-D40.4 10/10 PASS |
| D40.5 Certificación Final (CA-D40) | **OFFICIAL** · FINAL CERTIFICATION READY |
| D40.6 Resolution Note + Acta | **OFFICIAL** · CA-D40.6 10/10 PASS |
| **RN-D40** (AMD-CAND-01) | **Emitida · RESUELTO** |
| BUILD de producto | **No iniciado · no autorizado por D40** |

### 2. Estado — declaraciones

```text
FREEZE_PLANNING_TRACK = CERTIFIED
D37–D40 CERTIFIED
D40 CERTIFIED
PROD-3 = OPEN
ROADMAP = OFFICIAL
ARCHITECTURE FREEZE = COMPLETE
EXECUTION BASELINE = READY
AMD-CAND-01 RESOLVED via RN-D40
READY FOR EXPORT-1 DISCOVERY
NO BUILD AUTHORIZED BY D40
```

### 3. Resolution Note — RN-D40 (resumen)

| Campo | Contenido |
|-------|-----------|
| **ID** | **RN-D40** |
| **Ambigüedad** | Colisión «D39»: (a) STATUS §D39 DATA-3D histórico · (b) `docs/D39.*` Execution Planning · (c) handoffs «Next: D39 EXPORT-1 BUILD» |
| **Resolución** | (a) histórico inmutable · (b) Execution Planning certificado · (c) next normativo = **EXPORT-1 Discovery**; no reutilizar numeración D39 para BUILD |
| **Límite** | Sin Amendment · sin cambio Roadmap/Freeze/Governance/APIs · sin autorizar BUILD · sin declarar PROD-3 CLOSED |
| **Documento** | [`docs/D40.6-resolution-note.md`](docs/D40.6-resolution-note.md) |

### 4. Referencias D40

| Microfase | Documento |
|-----------|-----------|
| D40.1 | [`docs/D40.1-discovery-final.md`](docs/D40.1-discovery-final.md) |
| D40.2 | [`docs/D40.2-global-validation.md`](docs/D40.2-global-validation.md) |
| D40.3 | [`docs/D40.3-document-consolidation.md`](docs/D40.3-document-consolidation.md) |
| D40.4 | [`docs/D40.4-architecture-final.md`](docs/D40.4-architecture-final.md) |
| D40.5 | [`docs/D40.5-final-certification.md`](docs/D40.5-final-certification.md) |
| D40.6 | [`docs/D40.6-resolution-note.md`](docs/D40.6-resolution-note.md) — RN-D40 + Acta |

### 5. Checklist D40

- [x] D40.1 Discovery Final — CA PASS
- [x] D40.2 Validación Global — CA PASS
- [x] D40.3 Consolidación Documental — CA PASS
- [x] D40.4 Arquitectura Final — CA PASS
- [x] D40.5 Certificación Final (CA-D40) — rollup READY → cerrado con RN
- [x] D40.6 RN-D40 + Acta — CA PASS
- [x] AMD-CAND-01 resuelto
- [x] Append-only §D40

### 6. CA-D40 — Certificación (rollup 15/15)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D40-01…11 | Series D37–D39 · Freeze · Roadmap · Gov/QG · API · docs · arch · PROD-3 OPEN · sin código | **PASS** (D40.5) |
| CA-D40-12 | AMD-CAND-01 vía RN | **PASS** (RN-D40) |
| CA-D40-13…15 | Pendientes · handoff EXPORT-1 Discovery · integridad | **PASS** (D40.5) |

**Total CA-D40: 15/15 PASS** · **CA-D40.6: 10/10 PASS**

### 7. Handoff

```text
NEXT
EXPORT-1 Discovery

Prerequisites
✓ Architecture Freeze COMPLETE (D38.2)
✓ Governance OFFICIAL (D38.3)
✓ Roadmap OFFICIAL (D38.4) — orden inalterado
✓ Quality Gates OFFICIAL (QG-PROD3 v1.0)
✓ Execution Baseline READY (D39)
✓ Freeze/Planning Track CERTIFIED (D40)
✓ AMD-CAND-01 RESOLVED (RN-D40)
✓ PROD-3 = OPEN

NO BUILD AUTHORIZED BY D40.
EXPORT-1 Discovery is the sole authorization path to start BUILD.
```

### 8. Aclaración de numeración (RN-D40)

```text
§D39 en este STATUS = histórico DATA-3D (DOC-P3-01) — inmutable.
docs/D39.* = Execution Planning certificado — no es BUILD.
«Next: D39 EXPORT-1…» en §D38 queda aclarado por RN-D40:
  next normativo post-D40 = EXPORT-1 Discovery.
No reutilizar numeración D39 para BUILD.
```

### 9. Archivos (D40)

**Creados:** `docs/D40.1-discovery-final.md` · `docs/D40.2-global-validation.md` · `docs/D40.3-document-consolidation.md` · `docs/D40.4-architecture-final.md` · `docs/D40.5-final-certification.md` · `docs/D40.6-resolution-note.md`

**No modificado en D40:** `src/**` · `scripts/**` · `package.json` · tests · D37.* · D38.* · D39.* · Freeze · Roadmap · Governance · QG · APIs · contenido histórico de este archivo (§D39 · Cronología · §D38)

**Actualizado (APPEND-ONLY):** `PROJECT_STATUS_PROD_3.md` (solo este §D40)

### 10. Append Integrity Rules

| Regla | Cumplimiento |
|-------|--------------|
| Actualización únicamente al final del documento | **Sí** |
| Sin modificar secciones previas (§D39 · Cronología · §D38) | **Sí** |
| Sin alterar contenido histórico | **Sí** |
| Sin cambiar numeración existente | **Sí** |

### 11. Append Verification Record

| Verificación | Resultado |
|--------------|-----------|
| Append realizado al EOF | **PASS** |
| Secciones previas sin cambios | **PASS** |
| §D39 histórico intacto | **PASS** |
| §D38 intacto | **PASS** |
| Numeración preservada | **PASS** |
| Diff STATUS = solo líneas añadidas (§D40) | **PASS** |

### 12. STATUS Integrity Declaration

```text
Este registro histórico mantiene íntegramente su contenido previo.
La sección §D40 constituye un agregado APPEND-ONLY conforme a la Governance D38.3.
No se ha modificado ninguna sección histórica (§D39 · Cronología · §D38).
RN-D40 aclara AMD-CAND-01 sin Amendment y sin cerrar PROD-3.
```

### 13. D40 Completion Declaration

```text
D40 Completion Declaration
La serie D40 queda OFFICIAL / CERTIFIED.
La pista Freeze/Planning queda formalmente CERTIFIED.
PROD-3 permanece OPEN.
Architecture Freeze COMPLETE · Roadmap OFFICIAL · Execution Baseline READY.
AMD-CAND-01 RESUELTO vía RN-D40.
El siguiente trabajo autorizado por el Roadmap es EXPORT-1 Discovery.
NO BUILD AUTHORIZED BY D40.
```

---

*§D40 APPEND-ONLY 2026-07-17 · RN-D40 · CA-D40 15/15 PASS · CA-D40.6 10/10 PASS · FREEZE_PLANNING_TRACK = CERTIFIED · D40 CERTIFIED · PROD-3 = OPEN · Next: EXPORT-1 Discovery · No BUILD authorized by D40.*

---

## §D41 — EXPORT-1 Discovery (PROD-3)

**Fecha:** 2026-07-17  
**Serie:** D41.0–D41.7  
**Estado:** **D41 = CERTIFIED** · **EXPORT-1 DISCOVERY = COMPLETE** · **GO BUILD AUTHORIZED** · **PROD-3 = OPEN** · **READY FOR EXPORT-1 BUILD**

### 1. Declaración

```text
FREEZE_PLANNING_TRACK = CERTIFIED (D40)
D41 = CERTIFIED
EXPORT-1 DISCOVERY = COMPLETE
DEFINITION OF SUCCESS = PASS
GO BUILD AUTHORIZED BY D41.7
PROD-3 = OPEN
ROADMAP = OFFICIAL (inalterado)
ARCHITECTURE FREEZE = COMPLETE (inalterado)
READY FOR EXPORT-1 BUILD
NEXT = D42.1 — EXPORT-1 BUILD Implementation
NO FREEZE / ROADMAP / API ALTERED BY D41
```

### 2. Microfases D41

| Microfase | Resultado |
|-----------|-----------|
| D41.0 Series Plan | OFFICIAL |
| D41.1 Scope & Export Inventory | OFFICIAL · Scope confirmado |
| D41.2 Architecture Review | OFFICIAL · PASS |
| D41.3 API Freeze Preview | OFFICIAL · PASS |
| D41.4 Performance Thresholds & Validation | OFFICIAL · PASS · PT-* |
| D41.5 Risk & Carry-in Resolution | OFFICIAL · PASS · 01/02=IN · SHIM-NL=DEFER |
| D41.6 Governance & Documentation Review | OFFICIAL · PASS |
| D41.7 BUILD Plan Freeze + Discovery Acta | OFFICIAL · **GO BUILD** · D41 CERTIFIED |

### 3. BUILD Plan Freeze (épica)

```text
Numeración BUILD = D42.1 … D42.4 (≠ D39)
D42.1 BUILD Implementation
D42.2 Testing (Performance · Regression)
D42.3 Certification
D42.4 Release / M1 Acta
```

### 4. Decisión

```text
GO BUILD
Authorized exclusively by D41.7 Discovery Acta.
BUILD not executed in D41.
First implementation microphase = D42.1.
```

### 5. Carry-ins (resumen)

| Carry-in | Disposición |
|----------|-------------|
| EXPORT-1-01 sampleStep | IN |
| EXPORT-1-02 SVG calidad | IN |
| SHIM-NL | DEFER (si aplica / reapertura documentada) |

### 6. Certificación

| Ítem | Resultado |
|------|-----------|
| CA-D41.7 | 10/10 PASS |
| CA-D41 rollup | 13/13 PASS |
| Definition of Success | PASS |
| Amendment | NOT REQUIRED |

### 7. Handoff

```text
NEXT: D42.1 — EXPORT-1 BUILD Implementation
Inputs: D38.* · D39.* · D40.* · D41.*
Do not reuse D39 numbering for BUILD.
```

### 8. Archivos (D41)

**Creados:** `docs/D41.0-export1-discovery-plan.md` · `docs/D41.1-scope-confirmation-export-inventory.md` · `docs/D41.2-architecture-review.md` · `docs/D41.3-api-freeze-preview.md` · `docs/D41.4-performance-thresholds-validation.md` · `docs/D41.5-risk-carryin-resolution.md` · `docs/D41.6-governance-documentation-review.md` · `docs/D41.7-build-plan-freeze-discovery-acta.md`

**No modificado en D41:** `src/**` · `scripts/**` · `package.json` · tests · D37.* · D38.* · D39.* · D40.* · Freeze · Roadmap · Governance · QG · APIs · contenido histórico de este archivo (§D39 · Cronología · §D38 · §D40)

**Actualizado (APPEND-ONLY):** `PROJECT_STATUS_PROD_3.md` (solo este §D41)

### 9. Append Integrity Rules

| Regla | Cumplimiento |
|-------|--------------|
| Actualización únicamente al final del documento | **Sí** |
| Sin modificar secciones previas (§D39 · Cronología · §D38 · §D40) | **Sí** |
| Sin alterar contenido histórico | **Sí** |
| Sin cambiar numeración existente | **Sí** |

### 10. STATUS Integrity Declaration

```text
Este registro histórico mantiene íntegramente su contenido previo.
La sección §D41 constituye un agregado APPEND-ONLY conforme a la Governance D38.3.
No se ha modificado ninguna sección histórica (§D39 · Cronología · §D38 · §D40).
D41 autoriza GO BUILD sin alterar Freeze, Roadmap, Governance, QG ni API Freeze.
```

---

*§D41 APPEND-ONLY 2026-07-17 · D41 CERTIFIED · CA-D41 13/13 PASS · CA-D41.7 10/10 PASS · EXPORT-1 DISCOVERY = COMPLETE · DEFINITION OF SUCCESS = PASS · GO BUILD AUTHORIZED · PROD-3 = OPEN · Next: D42.1 EXPORT-1 BUILD · BUILD not executed in D41.*
