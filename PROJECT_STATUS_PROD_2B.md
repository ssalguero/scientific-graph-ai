# Scientific Graph AI — Estado PROD-2B (Persistencia de Proyectos Científicos)

**Fecha de actualización:** 2026-06-30 (ARCH-6-DOC)  
**Épica:** PROD-2B — Persistencia de Proyectos Científicos  
**Referencias:** [`PROJECT_DISCOVERY_PROD_2B.md`](./PROJECT_DISCOVERY_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) · [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) · [`src/lib/project/README.md`](./src/lib/project/README.md)

---

## 1. Resumen ejecutivo

| Hito | Estado |
|------|--------|
| B0 — Discovery | **CERRADO** |
| Plan PROD-2B (B1–B7) | **APROBADO** |
| **B1 — Schema V2 + contratos + migrador + adapters** | **COMPLETED** |
| **B2 — Multi-Dataset Persistence** | **COMPLETED** |
| B3 — Worksheet persistence | **COMPLETED** (PROD-2C C1–C3) |
| B4 — Visual Graph Builder persistence | **COMPLETED** (PROD-2C C4–C8) |
| B5 — IndexedDB autosave | Pendiente |
| B6 — UX hardening + gate final | Pendiente |
| B7 — Cloud adapter (opcional) | Pendiente |

**Gate umbrella B2:** `npm run validate:prod2b-b2-gate` — **PASS (17/17)**

---

## 2. Fase B2 — COMPLETED

### 2.1 Objetivo

Persistir `sessionDatasets[]` nativamente en schema V2, restaurarlos al abrir sin colapso a single-dataset, vincular slots SCI-58 A/B a `sourceDatasetId`, y cerrar el pipeline Save/Open multi-dataset con sanitización determinista en apertura.

### 2.2 Arquitectura final

```
Save (Runtime → .sgproj V2):
  collectProjectSnapshotV2 → serializeProjectV2 → .sgproj

Open (.sgproj → Runtime):
  parse → migrateProjectJson (si V1)
       → validateScientificProjectFile
       → sanitizeScientificProjectV2          ← B2.9 wiring
       → buildHydrateProjectV2Patch
       → applyHydrateProjectV2Patch (UI)
```

| Capa | Módulo principal |
|------|------------------|
| Mappers SessionDataset ↔ ProjectDatasetV2 | `src/lib/project/adapters/sgproj/map-session-dataset.ts` |
| Política IDs estables | `src/lib/project/domain/dataset-id-policy.ts` |
| Collect V2 | `src/lib/project/collect-project-snapshot-v2.ts` |
| Serialize V2 | `src/lib/project/serialize-project-v2.ts` |
| Hydrate patch V2 | `src/lib/project/apply-hydrate-project-v2-patch.ts` |
| Sanitize V2 | `src/lib/project/sanitize-project-v2.ts` |
| Hydrate wiring | `src/lib/project/hydrate.ts` |
| UI Save/Open | `src/app/projectFileActions.ts`, `graphEditorProjectIntegration.ts`, `page.tsx` |

### 2.3 Microetapas B2

| Microetapa | Alcance | Gate | Estado |
|------------|---------|------|--------|
| **B2.1** | Mappers SessionDataset ↔ ProjectDatasetV2 | `validate:prod2b-b2-map` | **CERRADA** (20/20) |
| **B2.2** | Política IDs estables (persisted vs session) | `validate:prod2b-b2-ids` | **CERRADA** (18/18) |
| **B2.3** | `collectProjectSnapshotV2` | `validate:prod2b-b2-collect` | **CERRADA** (14/14) |
| **B2.4** | `serializeProjectV2` multi-dataset nativo | `validate:prod2b-b2-serialize` | **CERRADA** (18/18) |
| **B2.5** | `applyHydrateProjectV2Patch` — rebuild session registry | `validate:prod2b-b2-hydrate` | **CERRADA** (21/21) |
| **B2.6** | `hydrate.ts` sin collapse V2→V1 | `validate:prod2b-b2-hydrate-wire` | **CERRADA** (20/20) |
| **B2.7** | UI wiring Save/Open V2, `sourceDatasetId` en slots | `validate:prod2b-b2-ui-pipeline` | **CERRADA** (12/12) |
| **B2.8** | `sanitizeScientificProjectV2` (standalone) | `validate:prod2b-b2-sanitize` | **CERRADA** (22/22) |
| **B2.9** | Wiring sanitize + invariantes E2E + gate final | `validate:prod2b-b2-invariants`, `validate:prod2b-b2-gate` | **CERRADA** (21/21) |

### 2.4 Invariantes verificados (B2.9)

#### Invariante A — Save → Load → Save

Proyectos funcionalmente equivalentes tras round-trip completo. Metadatos ignorados en comparación: `exportedAt`, `updatedAt`, `revisionHistory`, `cloudRef`.

| Caso | Resultado |
|------|-----------|
| Multi-dataset sintético (2 datasets, slots A/B) | **PASS** |
| Fixture `project-v2-dataset5-minimal.sgproj` | **PASS** |
| Fixture generado `project-v2-dataset5-dataset6-comparison.sgproj` | **PASS** (escrito + re-hidratable, 2 datasets) |

#### Invariante B — V1 → Migración → Runtime → Save → V2

Preserva: `datasets`, `activeDatasetId`, `sourceDatasetId`, `workflow`, `workspace`, `graphContext`, `analysisConfig`, IDs persistidos.

| Caso | Resultado |
|------|-----------|
| Fixture `project-v1-dataset5-minimal.sgproj` → migrate → hydrate → save V2 | **PASS** (10 asserts) |
| Orphan selection via hydrate+sanitize (`H-SEL-ORPHAN`) | **PASS** |

### 2.5 Fixtures B2

| Fixture | Descripción |
|---------|-------------|
| `scripts/fixtures/project-v2-dataset5-minimal.sgproj` | V2 mono-dataset golden |
| `scripts/fixtures/project-v2-dataset5-dataset6-comparison.sgproj` | **Nuevo** — V2 multi-dataset (D5+D6, slots comparison) |
| `scripts/fixtures/project-v1-dataset5-minimal.sgproj` | V1 compat (migración Invariante B) |

### 2.6 Gates B2 — PASS

| Gate | Resultado |
|------|-----------|
| `validate:prod2b-b2-map` | PASS (20/20) |
| `validate:prod2b-b2-ids` | PASS (18/18) |
| `validate:prod2b-b2-collect` | PASS (14/14) |
| `validate:prod2b-b2-serialize` | PASS (18/18) |
| `validate:prod2b-b2-hydrate` | PASS (21/21) |
| `validate:prod2b-b2-hydrate-wire` | PASS (20/20) |
| `validate:prod2b-b2-sanitize` | PASS (22/22) |
| `validate:prod2b-b2-ui-pipeline` | PASS (12/12) |
| `validate:prod2b-b2-invariants` | PASS (21/21) |
| **`validate:prod2b-b2-gate`** | **PASS (17/17)** |

Gate umbrella incluye regresión B1, `validate:prod2b-f0`, `validate:prod2b-migrate`, `validate:prod2a-unit` (38/38) y `tsc --noEmit`.

### 2.7 Riesgos resueltos en B2

| Riesgo | Resolución |
|--------|------------|
| Colapso V2→V1 en hydrate destruía multi-dataset | Eliminado en B2.6; hydrate nativo V2 |
| IDs de dataset inconsistentes entre runtime y persistencia | Política explícita B2.2 (`::primary`, secuenciados) |
| Selecciones huérfanas / `sourceDatasetId` inválido al abrir | `sanitizeScientificProjectV2` wired en B2.9 |
| Save UI no persistía registry completo | Wiring B2.7 en `projectFileActions` + `page.tsx` |
| V1 round-trip perdía campos V2 | Invariante B verificado; migrador idempotente |

### 2.8 Riesgos pendientes (fuera de B2)

| Riesgo | Clasificación |
|--------|---------------|
| `validate:prod2a-gate` Playwright intermitente | Deuda infraestructura; no bloquea B2 |
| IndexedDB autosave | B5 |

---

## 3. Fase B1 — COMPLETED (referencia)

### 3.1 Microetapas

| Microetapa | Gate | Estado |
|------------|------|--------|
| B1.1 Dominio V1/V2 | `validate:prod2b-b1-1-domain` | CERRADA (9/9) |
| B1.2 Migrador V1→V2 | `validate:prod2b-b1-2-migrate` | CERRADA (17/17) |
| B1.3 Validadores V2 | `validate:prod2b-b1-3-v2` | CERRADA (13/13) |
| B1.4 Adapters + wiring mínimo | `validate:prod2b-b1-4-adapters` | CERRADA (9/9) |

**Commit B1:** `c195591` — `feat(prod-2b): complete B1 schema v2 persistence foundation`

### 3.2 Comportamiento post-B1 (actualizado post-B2)

| Acción | Resultado |
|--------|-----------|
| Abrir `.sgproj` V1 | Auto-migra a V2; hydrate multi-dataset nativo |
| Abrir `.sgproj` V2 | Validate → sanitize → hydrate full registry |
| Guardar proyecto | Escribe `schemaVersion: 2` con `datasets[]` completos |

---

## 4. Principios arquitectónicos (vigentes)

1. **Estado Persistente del Dominio** — `.sgproj` almacena solo dominio científico; artefactos derivados se reconstruyen al abrir.
2. **Independencia del Dominio** — `ScientificProject` es modelo puro; persistencia actúa como adaptador.
3. **Forward Compatibility** — migraciones explícitas por salto de versión.
4. **Pipeline invariante:** `parse → migrate → validate → sanitize → hydrate`.

---

## 5. Mapeo PROD-2B ↔ PROD-2C

| Fase PROD-2B | Microetapas PROD-2C | Gate umbrella PROD-2C |
|--------------|---------------------|------------------------|
| B3 Worksheet | C1 domain · C2 pipeline · C3 UI | `validate:prod2c-c3-worksheet-ui` |
| B4 Visual Graph Builder | C4 mapper · C5 collect · C6 hydrate · C7 runtime/UI · C8 fixtures | `validate:prod2c-c8-regression-gate` |

Detalle de cierre: [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) (documento congelado).

---

## 6. Próxima fase — B5

**Objetivo:** IndexedDB autosave — borradores locales, recovery prompt, proyectos recientes.

**Dependencias:** B1 ✓ · B2 ✓ · B3 (PROD-2C) ✓ · B4 (PROD-2C) ✓

Referencia: [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) §B5 · Gate previsto: `validate:prod2b-indexeddb`

---

## 7. Histórico de cierre

| Fecha | Evento |
|-------|--------|
| 2026-06-27 | Discovery PROD-2B cerrado |
| 2026-06-27 | Plan PROD-2B aprobado |
| 2026-06-27 | B1.1–B1.4 implementadas; **Fase B1 cerrada** |
| 2026-06-25 | B2.1–B2.9 implementadas; invariantes A/B verificados; **`validate:prod2b-b2-gate` PASS** |
| 2026-06-30 | B3/B4 cerradas vía PROD-2C C1–C8 — ver [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) |
| 2026-06-30 | ARCH-6-DOC — alineación documental post-PROD-2C |
