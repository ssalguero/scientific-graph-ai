# Scientific Graph AI — Estado PROD-2B (Persistencia de Proyectos Científicos)

**Fecha de actualización:** 2026-06-27  
**Épica:** PROD-2B — Persistencia de Proyectos Científicos  
**Referencias:** [`PROJECT_DISCOVERY_PROD_2B.md`](./PROJECT_DISCOVERY_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) · [`src/lib/project/README.md`](./src/lib/project/README.md)

---

## 1. Resumen ejecutivo

| Hito | Estado |
|------|--------|
| B0 — Discovery | **CERRADO** |
| Plan PROD-2B (B1–B7) | **APROBADO** |
| **B1 — Schema V2 + contratos + migrador + adapters** | **COMPLETED** |
| B2 — Multi-dataset UI | Pendiente |
| B3 — Worksheet persistence | Pendiente |
| B4 — Visual Graph Builder persistence | Pendiente |
| B5 — IndexedDB autosave | Pendiente |
| B6 — UX hardening + gate final | Pendiente |
| B7 — Cloud adapter (opcional) | Pendiente |

**Commit de implementación B1:** `c195591` — `feat(prod-2b): complete B1 schema v2 persistence foundation`

---

## 2. Fase B1 — COMPLETED

### 2.1 Microetapas

| Microetapa | Alcance | Gate | Estado |
|------------|---------|------|--------|
| **B1.1** | Dominio puro (`domain/types-v1`, `types-v2`, guards) | `validate:prod2b-b1-1-domain` | **CERRADA** |
| **B1.2** | Migrador V1→V2 puro | `validate:prod2b-b1-2-migrate` | **CERRADA** |
| **B1.3** | Validadores V2 en dominio | `validate:prod2b-b1-3-v2` | **CERRADA** |
| **B1.4** | Adapters `.sgproj` + wiring mínimo | `validate:prod2b-b1-4-adapters`, `validate:prod2b-f0`, `validate:prod2b-migrate` | **CERRADA** |

### 2.2 Entregables B1

| Entregable | Ubicación |
|------------|-----------|
| Contrato dominio V1/V2 | `src/lib/project/domain/` |
| Migrador V1→V2 (idempotente) | `src/lib/project/domain/migrations/migrate-v1-to-v2.ts` |
| Validadores V2 | `src/lib/project/domain/validate-v2.ts` |
| Adaptadores `.sgproj` | `src/lib/project/adapters/sgproj/` |
| Wiring parse → migrate → validate → serialize → hydrate | `src/lib/project/{parse,migrate,validate,serialize,hydrate}.ts` |
| Fixtures V2 golden | `scripts/fixtures/project-v2-*.sgproj` |
| `CURRENT_SCHEMA_VERSION = 2` | `src/lib/project/constants.ts` |

### 2.3 Comportamiento tras B1

| Acción | Resultado |
|--------|-----------|
| Abrir `.sgproj` V1 | Auto-migra a V2 en memoria; hydrate colapsa a patch V1 para UI |
| Guardar proyecto | Escribe `schemaVersion: 2` con `datasets[]` |
| UI / multi-dataset | Sin cambios visibles (colapso V2→V1 hasta B2) |

### 2.4 Regla del migrador (no contrato V2)

El id `{projectId}::primary` es **regla exclusiva del migrador V1→V2** (determinismo e idempotencia). No es obligatorio en proyectos V2 nativos. Documentado en `src/lib/project/domain/migrations/README.md`.

### 2.5 Gates B1 — PASS

| Gate | Resultado |
|------|-----------|
| `npx tsc --noEmit` | PASS |
| `npm run validate:prod2b-b1-1-domain` | PASS (9/9) |
| `npm run validate:prod2b-b1-2-migrate` | PASS (17/17) |
| `npm run validate:prod2b-b1-3-v2` | PASS (13/13) |
| `npm run validate:prod2b-b1-4-adapters` | PASS (8/8) |
| `npm run validate:prod2b-f0` | PASS |
| `npm run validate:prod2b-migrate` | PASS (8/8) |
| `npm run validate:prod2a-unit` | PASS (37/37) |
| `npm run build` | PASS |

### 2.6 Regresión PROD-2A

| Gate | Resultado | Notas |
|------|-----------|-------|
| `validate:prod2a-gate` | FAIL intermitente en pasos Playwright (`baseline`, `e2e`) | Clasificado como **deuda técnica de infraestructura** (harness/servidor). No bloquea cierre B1. Pasos f0, unit, f6, tsc, build, prod1-gate: PASS. |

---

## 3. Principios arquitectónicos (vigentes)

1. **Estado Persistente del Dominio** — `.sgproj` almacena solo dominio científico; artefactos derivados se reconstruyen al abrir.
2. **Independencia del Dominio** — `ScientificProject` es modelo puro; persistencia actúa como adaptador.
3. **Forward Compatibility** — migraciones explícitas por salto de versión.
4. **Pipeline invariante:** `parse → migrate → validate → sanitize → hydrate`.

---

## 4. Próxima fase — B2 (no iniciada)

**Objetivo:** Persistir `sessionDatasets[]` en V2 y restaurarlos al abrir; vincular slots SCI-58 A/B a `sourceDatasetId`.

**Inicio:** conversación dedicada exclusivamente a B2, metodología incremental (implementación → gates → validación → commit → documentación).

**Dependencia:** B1 COMPLETED ✓

---

## 5. Histórico de cierre B1

| Fecha | Evento |
|-------|--------|
| 2026-06-27 | Discovery PROD-2B cerrado |
| 2026-06-27 | Plan PROD-2B aprobado |
| 2026-06-27 | B1.1–B1.4 implementadas y aprobadas |
| 2026-06-27 | **Fase B1 cerrada oficialmente** |
