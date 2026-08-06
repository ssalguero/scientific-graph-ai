# Scientific Graph AI — Estado PROD-2C (Worksheet + Visual Graph Persistence)

**Fecha de cierre:** 2026-06-30  
**Épica:** PROD-2C — Worksheet + Visual Graph Builder persistence en schema V2  
**Base:** PROD-2B B1 + B2 COMPLETED  
**Referencias:** [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) §B3/B4 · [`src/lib/project/README.md`](./src/lib/project/README.md)

---

## 1. Resumen ejecutivo

| Hito | Estado |
|------|--------|
| **C1 — Worksheet Domain** | **COMPLETED** |
| **C2 — Worksheet Pipeline** | **COMPLETED** |
| **C3 — Worksheet UI Persistence** | **COMPLETED** |
| **C4 — Visual Graph Mapper** | **COMPLETED** |
| **C5 — Visual Graph Collect** | **COMPLETED** |
| **C6 — Visual Graph Hydrate** | **COMPLETED** |
| **C7 — Visual Graph Runtime/UI Multi-Dataset** | **COMPLETED** |
| **C8 — Visual Graph Fixtures & Regression Gates** | **COMPLETED** |
| **C9 — Documentation & Project Closure** | **COMPLETED** |

**Gate umbrella C8 (regresión VGB):** `npm run validate:prod2c-c8-regression-gate` — **PASS (5/5)** — certificado al cierre de C8 (`405954d`).

PROD-2C implementa en ocho microetapas el alcance original **B3 + B4** del plan PROD-2B: persistencia de worksheet por dataset y persistencia del Visual Graph Builder en `visualGraphs[]`, con comportamiento multi-dataset sin pérdida ni contaminación entre datasets.

**Issues abiertos PROD-2C:** ninguno.

---

## 2. Objetivo de PROD-2C

### 2.1 Worksheet (B3 → C1–C3)

Persistir **worksheet state** por dataset en `ProjectDatasetV2.worksheet`:

- `columnRegistry` (metadatos de columnas y transforms)
- `auxiliaryColumns` (columnas auxiliares de importación)
- `modified` (flag de worksheet editado)

Round-trip Save → Open → Save por dataset; golden fixture mono-dataset.

### 2.2 Visual Graph Builder (B4 → C4–C8)

Persistir **GraphSpecification** + `sourceDatasetId` en `ScientificProjectV2.visualGraphs[]`.

- **VGB-R1:** excluir preview cache y `displaySeries` del JSON persistido; reconstruir preview al abrir.
- **C-D:** partición estricta por `sourceDatasetId` en proyectos multi-dataset; sin cross-contamination al cambiar dataset activo.
- Golden fixtures mono- y multi-dataset; regresión C-B2 sobre fixtures B2 legacy.

### 2.3 Fuera de alcance

- Formula engine / motores SCI
- Supabase graph library
- IndexedDB autosave (PROD-2B B5)
- Cloud adapter (PROD-2B B7)
- Cambios a schema V2, serializer, parser, migrate (salvo wiring ya existente en B1/B2)

---

## 3. Arquitectura final PROD-2C

### 3.1 Pipeline Save / Open

```
Save (Runtime → .sgproj V2):
  sessionDatasets (worksheet + visualGraphEntries stash en payload runtime)
    → prepareCollectContextForSave / finalizeProjectSnapshotForSave (C7)
    → collectProjectSnapshotV2 (+ collect-visual-graph-v2)
    → map-session-dataset (worksheet por dataset)
    → serializeProjectV2 → .sgproj

Open (.sgproj → Runtime):
  parse → migrateProjectJson (si V1)
       → validateScientificProjectFile
       → sanitizeScientificProjectV2
       → buildHydrateProjectV2Patch
       → applyHydrateProjectV2Patch (worksheet + rebuildVisualGraphRuntimeEntries)
       → visual-graph-session-ui (partición por sourceDatasetId → session stash)
       → page.tsx activateSessionDataset (C7: stash/load, sin wipe global)
```

### 3.2 Módulos principales

| Capa | Módulo | Microetapa |
|------|--------|------------|
| Worksheet dominio | `src/lib/project/domain/worksheet-domain.ts` | C1 |
| Worksheet validate/sanitize | `src/lib/project/domain/validate-v2.ts`, `src/lib/project/sanitize-project-v2.ts` | C1 |
| Worksheet pipeline | `src/lib/project/adapters/sgproj/map-session-dataset.ts`, `collect-project-snapshot-v2.ts`, `apply-hydrate-project-v2-patch.ts` | C2 |
| Worksheet UI | `src/app/page.tsx`, `src/components/data/ScientificWorksheetPanel.tsx`, `projectFileActions.ts` | C3 |
| VGB dominio / mapper | `src/lib/project/domain/visual-graph-domain.ts`, `domain/mappers/visual-graph.ts` | C4 |
| VGB collect | `src/lib/project/collect-visual-graph-v2.ts` | C5 |
| VGB hydrate | `rebuildVisualGraphRuntimeEntriesFromPatch` en `apply-hydrate-project-v2-patch.ts` | C6 |
| VGB runtime UI | `src/lib/project/visual-graph-session-ui.ts`, `page.tsx`, `graphEditorProjectIntegration.ts` | C7 |
| Fixtures / regresión | `scripts/fixtures/project-v2-*-visual-graph*.sgproj`, `visual-graph-fixtures.cases.ts` | C8 |

### 3.3 Principios arquitectónicos (vigentes)

1. **Estado Persistente del Dominio** — `.sgproj` almacena solo dominio científico; preview VGB se reconstruye al abrir.
2. **Independencia del Dominio** — `ScientificProjectV2` es modelo puro; persistencia actúa como adaptador.
3. **Pipeline invariante:** `parse → migrate → validate → sanitize → hydrate`.
4. **VGB-R1** — claves persistidas: `id`, `graphSpec`, `sourceDatasetId`, `createdAt` (`PERSISTED_VISUAL_GRAPH_ENTRY_KEYS`).
5. **C-D** — visual graphs aislados por `sourceDatasetId`; stash en `sessionDatasets[].datasetPayload.visualGraphEntries` (runtime, no schema V2).
6. **C-B2** — proyectos B2 sin worksheet/`visualGraphs` mantienen round-trip sin regresión.

---

## 4. Microetapas C1→C8

| Microetapa | Alcance | Gate | Commit | Estado |
|------------|---------|------|--------|--------|
| **C1** | Validación y sanitize dominio worksheet | `validate:prod2c-c1-worksheet-domain` | `98bc588` | **CERRADA** (14/14) |
| **C2** | Round-trip collect/hydrate/map worksheet por dataset | `validate:prod2c-c2-worksheet-pipeline` | `fa9f03a` | **CERRADA** (14/14) |
| **C3** | UI save/open worksheet + golden fixture | `validate:prod2c-c3-worksheet-ui` | `ce8bcf3` | **CERRADA** (10/10) |
| **C4** | Mappers persisted ↔ runtime VGB | `validate:prod2c-c4-visual-graph-mapper` | `d7003e1` | **CERRADA** (19/19) |
| **C5** | Collect `visualGraphs[]` en snapshot V2 | `validate:prod2c-c5-visual-graph-collect` | `9b404a5` | **CERRADA** (11/11) |
| **C6** | Hydrate rebuild preview desde `graphSpec` | `validate:prod2c-c6-visual-graph-hydrate` | `901c076` | **CERRADA** (16/16) |
| **C7** | Runtime multi-dataset stash/switch/save VGB | `validate:prod2c-c7-visual-graph-ui` | `2fc8929` | **CERRADA** (12/12) |
| **C8** | Golden fixtures VGB + certificación C-D/C-B2/VGB-R1 | `validate:prod2c-c8-visual-graph-fixtures`, `validate:prod2c-c8-regression-gate` | `405954d` | **CERRADA** (14/14 + gate 5/5) |

Resultados **PASS (N/N)** certificados al cierre de cada microetapa (commits publicados). Conteos de casos derivados de las suites `*cases.ts` vinculadas a cada gate script.

### Entregables por microetapa (resumen)

- **C1** — `worksheet-domain.ts`, ampliación `validate-v2.ts`, sanitize worksheet, gate C1.
- **C2** — mappers worksheet en `map-session-dataset.ts`, collect/hydrate patch, `worksheet-pipeline.cases.ts`.
- **C3** — wiring UI worksheet, `project-v2-dataset5-with-worksheet.sgproj`, `generate:prod2c-c3-golden-fixture`.
- **C4** — `visual-graph-domain.ts`, `domain/mappers/visual-graph.ts`, suite mapper.
- **C5** — `collect-visual-graph-v2.ts`, integración en collect snapshot.
- **C6** — rebuild runtime en hydrate patch, `visual-graph-hydrate.cases.ts`.
- **C7** — `visual-graph-session-ui.ts`, eliminación wipe global en switch dataset, `finalizeProjectSnapshotForSave`.
- **C8** — fixtures golden VGB mono/multi, `visual-graph-fixtures.cases.ts`, regression gate C4–C8.

---

## 5. Invariantes metodológicos certificados

| Invariante | Definición | Evidencia (suites / casos) |
|------------|------------|----------------------------|
| **Invariante A** | Save → Load → Save — equivalencia funcional del proyecto (`normalizeProjectForRoundTrip`; metadatos volátiles ignorados) | B2 `b2-9-invariants.cases.ts`; C2 worksheet pipeline; C8 `fixtures.vgb.golden.mono.invariantA.fullProject` |
| **C-D** | Visual graphs particionados por `sourceDatasetId`; sin contaminación al switch A↔B | C7 `ui.vgb.invariantCD.*`; C8 `fixtures.vgb.invariantCD.goldenPartitionsBySourceDataset`, `goldenNoCrossContamination`, `goldenSourceIdsStable` |
| **C-B2** | Fixtures B2 legacy (sin worksheet/VGB) no regresionan tras PROD-2C | C2 `pipeline.compat.b2.*`; C3 `ui.worksheet.compat.b2.noRegression`; C8 `fixtures.vgb.compat.b2.*` |
| **VGB-R1** | Sin leak de `preview` / `displaySeries` en JSON `.sgproj` persistido | C4/C5/C6 mapper-collect-hydrate; C8 `fixtures.vgbR1.golden.mono.noPreviewLeakInJson`, `fixtures.vgbR1.golden.multi.noPreviewLeakInJson`, `fixtures.vgbR1.golden.roundtripReCollectClean` |

### Invariante A — casos destacados (VGB)

| Caso | Resultado |
|------|-----------|
| Golden mono `project-v2-dataset5-with-visual-graph.sgproj` — round-trip proyecto completo | **PASS** |
| Golden multi — `sourceDatasetId` estables tras UI save/open round-trip | **PASS** |

### C-B2 — casos destacados

| Caso | Resultado |
|------|-----------|
| Fixture `project-v2-dataset5-minimal.sgproj` — sin `visualGraphs` tras load y round-trip | **PASS** |
| Golden VGB no altera comportamiento fixture B2 minimal | **PASS** |

---

## 6. Fixtures PROD-2C

| Fixture | Origen | Descripción |
|---------|--------|-------------|
| `scripts/fixtures/project-v2-dataset5-with-worksheet.sgproj` | C3 — `npm run generate:prod2c-c3-golden-fixture` | Golden worksheet mono-dataset (D5) |
| `scripts/fixtures/project-v2-dataset5-with-visual-graph.sgproj` | C8 — `npm run generate:prod2c-c8-golden-fixture` | Golden VGB mono-dataset |
| `scripts/fixtures/project-v2-dataset5-dataset6-with-visual-graphs.sgproj` | C8 | Golden VGB multi-dataset (C-D: 2 graphs, 2 `sourceDatasetId`) |

Fixtures B2 reutilizados para C-B2:

| Fixture | Uso |
|---------|-----|
| `scripts/fixtures/project-v2-dataset5-minimal.sgproj` | Compat mono-dataset sin worksheet/VGB |
| `scripts/fixtures/project-v2-dataset5-dataset6-comparison.sgproj` | Compat multi-dataset B2 |

---

## 7. Gates ejecutados

Certificación al cierre de cada microetapa C1–C8 (commits `98bc588` → `405954d`). C9 no re-ejecuta gates; registra resultados ya validados en implementación.

| Gate | Resultado | Suite / script |
|------|-----------|----------------|
| `validate:prod2c-c1-worksheet-domain` | **PASS (14/14)** | `worksheet-validate.cases.ts` |
| `validate:prod2c-c2-worksheet-pipeline` | **PASS (14/14)** | `worksheet-pipeline.cases.ts` |
| `validate:prod2c-c3-worksheet-ui` | **PASS (10/10)** | `worksheet-persist.cases.ts` |
| `validate:prod2c-c4-visual-graph-mapper` | **PASS (19/19)** | `visual-graph-mapper.cases.ts` |
| `validate:prod2c-c5-visual-graph-collect` | **PASS (11/11)** | `visual-graph-collect.cases.ts` |
| `validate:prod2c-c6-visual-graph-hydrate` | **PASS (16/16)** | `visual-graph-hydrate.cases.ts` |
| `validate:prod2c-c7-visual-graph-ui` | **PASS (12/12)** | `visual-graph-ui.cases.ts` |
| `validate:prod2c-c8-visual-graph-fixtures` | **PASS (14/14)** | `visual-graph-fixtures.cases.ts` |
| **`validate:prod2c-c8-regression-gate`** | **PASS (5/5)** | Encadena C4 → C5 → C6 → C7 → C8 |

**Total casos automatizados PROD-2C (C1–C8):** 110 casos en gates dedicados.

Generadores de fixtures:

- `npm run generate:prod2c-c3-golden-fixture`
- `npm run generate:prod2c-c8-golden-fixture`

---

## 8. Estado metodológico final

| Bloque | Estado |
|--------|--------|
| PROD-2B B1 — Schema V2 + migrador | **COMPLETED** (base) |
| PROD-2B B2 — Multi-dataset persistence | **COMPLETED** (base) |
| PROD-2C C1 — Worksheet domain | **COMPLETED** |
| PROD-2C C2 — Worksheet pipeline | **COMPLETED** |
| PROD-2C C3 — Worksheet UI | **COMPLETED** |
| PROD-2C C4 — Visual Graph mapper | **COMPLETED** |
| PROD-2C C5 — Visual Graph collect | **COMPLETED** |
| PROD-2C C6 — Visual Graph hydrate | **COMPLETED** |
| PROD-2C C7 — Visual Graph runtime/UI | **COMPLETED** |
| PROD-2C C8 — Fixtures & regression | **COMPLETED** |
| **PROD-2C global** | **COMPLETED** |

### Metodología aplicada

- Microetapas C1→C8 con **gate dedicado** por fase (`validate:prod2c-cN-*`).
- Gate de regresión umbrella **parcial** C8 (`validate:prod2c-c8-regression-gate`) sobre pipeline VGB C4–C8.
- Golden fixtures `.sgproj` para worksheet (C3) y visual graphs (C8), siguiendo patrón B2.
- C9 — cierre documental únicamente; **sin cambios funcionales**.

### Restricciones respetadas en PROD-2C

- Sin modificación de motores SCI-50→60.
- Sin cambio de schema V2 / serializer / parser / migrate en C4–C8 (dominio C1/C4 solo wiring validate/sanitize/mappers sobre contrato B1).
- VGB-R1: preview y displaySeries efímeros; persistencia limitada a `graphSpec` + metadatos.
- Dependencia PROD-2B B2 satisfecha (multi-dataset nativo, sanitize wired).

---

## 9. Backlog y deuda técnica residual

| Item | Clasificación |
|------|---------------|
| **PROD-2B B5** — IndexedDB autosave | Pendiente (siguiente en plan PROD-2B) |
| **PROD-2B B6** — UX hardening + `validate:prod2b-gate` unificado | Pendiente |
| **PROD-2B B7** — Cloud adapter (opcional) | Pendiente |
| `validate:prod2a-gate` Playwright intermitente | Deuda infraestructura (ver PROD-2B §2.8) |
| [`ROADMAP.md`](./ROADMAP.md) / [`src/lib/project/README.md`](./src/lib/project/README.md) desactualizados respecto a PROD-2C | Deuda documental (no bloqueante; fuera alcance C9) |

**Backlog técnico PROD-2C:** vacío.

No existe épica **PROD-3** definida en el repositorio; la continuación natural del plan es **PROD-2B B5→B6**.

---

## 10. Handoff — siguiente fase

**Próxima acción recomendada:** **PROD-2B B5 — IndexedDB autosave**

Referencia: [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) §B5.

| Dependencia | Estado |
|-------------|--------|
| B1 Schema V2 | ✓ |
| B2 Multi-dataset | ✓ |
| B3 Worksheet (PROD-2C C1–C3) | ✓ |
| B4 Visual Graphs (PROD-2C C4–C8) | ✓ |

Entregables B5 previstos:

- `src/lib/project/adapters/indexeddb/*`
- Autosave local, recovery prompt, recent projects
- Gate `validate:prod2b-indexeddb`

Candidatos alternativos (sin priorización — [`ROADMAP.md`](./ROADMAP.md)):

- PROD-1B — Validación avanzada de importación
- ARCH-6 — Mejoras UX progressive disclosure / VGB
- SCI-58 v3 — Comparación N>2 slots

---

## 11. Métricas finales de implementación

| Métrica | Valor | Fuente |
|---------|-------|--------|
| Commits PROD-2C (C1–C8) | 8 | `git log --grep=prod-2c` |
| Líneas insertadas (C1–C8) | ~6 340 | `git log --grep=prod-2c --shortstat` |
| Scripts npm `validate:prod2c-*` | 10 | `package.json` |
| Casos automatizados gates C1–C8 | 110 | Suites `*cases.ts` por gate |
| Fixtures golden nuevos PROD-2C | 3 | `scripts/fixtures/` |
| Generadores golden | 2 | `generate:prod2c-c3-golden-fixture`, `generate:prod2c-c8-golden-fixture` |

### Commits representativos C1→C8

| SHA | Fecha | Mensaje |
|-----|-------|---------|
| `98bc588` | 2026-06-29 | `feat(prod-2c): implement C1 worksheet domain validation and sanitize` |
| `fa9f03a` | 2026-06-29 | `feat(prod-2c): complete C2 worksheet pipeline round-trip per dataset` |
| `ce8bcf3` | 2026-06-29 | `feat(prod-2c): complete C3 worksheet UI persistence wiring` |
| `d7003e1` | 2026-06-29 | `fix(prod-2c): finalize C4 domain exports` |
| `9b404a5` | 2026-06-29 | `feat(prod-2c): integrate visual graph collect pipeline` |
| `901c076` | 2026-06-30 | `feat(prod-2c): restore visual graph runtime during hydrate` |
| `2fc8929` | 2026-06-30 | `feat(prod-2c): complete C7 visual graph runtime multi-dataset UI` |
| `405954d` | 2026-06-30 | `feat(prod-2c): add visual graph golden fixtures and regression gates` |

---

## 12. Riesgos residuales

| Riesgo | Estado |
|--------|--------|
| Preview VGB no persistido — fallo silencioso en rebuild hydrate | **Mitigado** — C6/C8 `hydrateRebuildsPreview`, golden round-trip |
| Cross-dataset VGB contamination al switch | **Mitigado** — C7 invariante C-D; C8 golden multi |
| Regresión B2 mono/multi sin worksheet/VGB | **Mitigado** — C-B2 en C2/C3/C8 |
| C5 collect unitario asigna `sourceDatasetId` del dataset activo | **Mitigado** — C7 `finalizeProjectSnapshotForSave` + merge post-collect vía mapper C4 |
| Documentación ROADMAP/README desactualizada | **Residual** — deuda documental; no bloquea PROD-2C |

---

## 13. Histórico de cierre

| Fecha | Evento |
|-------|--------|
| 2026-06-29 | C1 worksheet domain — gate C1 PASS (`98bc588`) |
| 2026-06-29 | C2 worksheet pipeline — gate C2 PASS (`fa9f03a`) |
| 2026-06-29 | C3 worksheet UI + golden fixture — gate C3 PASS (`ce8bcf3`) |
| 2026-06-29 | C4 visual graph mapper — gate C4 PASS (`d7003e1`) |
| 2026-06-29 | C5 visual graph collect — gate C5 PASS (`9b404a5`) |
| 2026-06-30 | C6 visual graph hydrate — gate C6 PASS (`901c076`) |
| 2026-06-30 | C7 visual graph runtime/UI multi-dataset — gate C7 PASS (`2fc8929`) |
| 2026-06-30 | C8 golden fixtures + regression gate — PASS (`405954d`) |
| 2026-06-30 | **C9 — cierre documental PROD-2C** |

---

Documento generado al **cierre oficial de PROD-2C** (2026-06-30). Referencia de estado para worksheet + Visual Graph Builder persistence en schema V2. Complementa [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) (B1/B2); alcance B3/B4 del [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) queda implementado vía PROD-2C C1–C8.
