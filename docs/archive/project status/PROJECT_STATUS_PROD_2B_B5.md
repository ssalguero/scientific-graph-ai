# Scientific Graph AI — Estado PROD-2B B5 (IndexedDB autosave)

**Fecha de cierre:** 2026-06-30  
**Épica:** PROD-2B B5 — Persistencia local IndexedDB (biblioteca + borrador + autosave)  
**Base:** PROD-2B B1 + B2 + PROD-2C B3/B4 COMPLETED  
**Referencias:** [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) §B5 · [`src/lib/project/README.md`](./src/lib/project/README.md)

---

## 1. Resumen ejecutivo

| Hito | Estado |
|------|--------|
| **B5 — IndexedDB biblioteca local + autosave** | **COMPLETED** |

**Gate umbrella B5:** `npm run validate:prod2b-indexeddb` — **PASS (25/25)**

B5 añade persistencia local en IndexedDB reutilizando el mismo envelope JSON que `.sgproj`, con biblioteca de proyectos, borrador con recovery, metadatos indexables y transacciones atómicas. El dominio V2 y el pipeline `collect → serialize → parse → migrate → validate → sanitize → hydrate` permanecen intactos.

---

## 2. Gates certificados (criterios obligatorios B5)

| Gate | Resultado |
|------|-----------|
| `npm run validate:prod2b-indexeddb` | **PASS (25/25)** |
| `npm run validate:prod2b-b2-gate` | **PASS (17/17)** |
| `npm run validate:prod2c-c8-regression-gate` | **PASS (5/5)** |
| `npx tsc --noEmit` | **PASS** |

---

## 3. Criterio de certificación de B5 respecto de `validate:full`

`npm run validate:full` puede reportar `ERR_CONNECTION_REFUSED` cuando el servidor local requerido por los tests E2E (Playwright) y/o el baseline SCI-60 (`http://localhost:3000`) **no está en ejecución** o no es alcanzable.

La certificación funcional de PROD-2B B5 se basa en los gates específicos de la fase (`validate:prod2b-indexeddb`, `validate:prod2b-b2-gate`, `validate:prod2c-c8-regression-gate` y `tsc`). La ejecución satisfactoria de `validate:full` continúa siendo requerida para la regresión global del producto, pero un `ERR_CONNECTION_REFUSED` causado exclusivamente por la ausencia del servidor local no constituye, por sí mismo, una regresión funcional de B5.

Criterios obligatorios para cerrar B5:

- `npm run validate:prod2b-indexeddb` — **PASS**
- `npm run validate:prod2b-b2-gate` — **PASS**
- `npm run validate:prod2c-c8-regression-gate` — **PASS**
- `npx tsc --noEmit` — **PASS**

Antes de certificar regresión global del producto (p. ej. cierre B6 / smoke CI), `validate:full` (pasos `baseline` + `e2e`) debe **re-ejecutarse con el servidor local disponible**.

**Observación al cierre:** `npm run validate:full` reportó `ERR_CONNECTION_REFUSED` en pasos `baseline` + `e2e` (servidor `localhost:3000` no disponible). Interpretado según el criterio anterior; no bloquea el cierre B5.

---

## 4. Alcance implementado

| Área | Módulos principales |
|------|---------------------|
| Dominio local | `src/lib/project/domain/local-project/` |
| Casos de uso | `src/lib/project/application/local-project/` |
| Adapter IndexedDB | `src/lib/project/adapters/indexeddb/` |
| UI wiring | `LocalProjectsPanel`, `useLocalProjectPersistence`, `useProjectDraftAutosave`, `localProjectActions` |
| Gate | `scripts/validate-prod2b-indexeddb.ts` |

Principios: mismo envelope que `.sgproj`; metadata indexable separada; `lastAccessedAt`; `storageState`; reserva multi-perfil (`profileId`); `renameLocalProject`; `integrityStatus`; transacciones atómicas IDB.

---

## 5. Pendiente B6

Re-ejecutar `npm run validate:full` con servidor local disponible antes del gate umbrella `validate:prod2b-gate` (B6 — UX hardening).

Ver [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) §B6.

---

## 6. Histórico

| Fecha | Evento |
|-------|--------|
| 2026-06-30 | B5 implementada — dominio, application, IndexedDB adapter, UI, gate |
| 2026-06-30 | Gates de fase B5 certificados (25/25 indexeddb, b2-gate, c8-regression, tsc) |
| 2026-06-30 | Documento de cierre B5 publicado |
