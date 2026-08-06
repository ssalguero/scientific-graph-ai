# Scientific Graph AI — Cierre oficial PROD-2B (Persistencia de Proyectos Científicos)

**Épica:** PROD-2B — Persistencia de Proyectos Científicos  
**Status:** **COMPLETED**  
**Fecha de cierre:** 2026-07-01  
**Referencias:** [`PROJECT_DISCOVERY_PROD_2B.md`](./PROJECT_DISCOVERY_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) · [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) · [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) · [`src/lib/project/README.md`](./src/lib/project/README.md) · [`ROADMAP.md`](./ROADMAP.md)

---

## 1. Estado general

| Campo | Valor |
|-------|-------|
| **Épica** | PROD-2B |
| **Status** | **COMPLETED** |
| **Fecha de cierre** | 2026-07-01 |
| **Alcance cerrado** | B0 (Discovery) · B1 · B2 · B3 · B4 · B5 · B6.1–B6.5 |
| **Implementación B3/B4** | Entregada vía épica PROD-2C (C1–C8) — ver [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) |

### Tabla de fases

| Fase | Estado |
|------|--------|
| B0 — Discovery | **CERRADO** |
| Plan PROD-2B (B1–B7) | **APROBADO** |
| **B1** — Schema V2 + contratos + migrador + adapters | **COMPLETED** |
| **B2** — Multi-Dataset Persistence | **COMPLETED** |
| **B3** — Worksheet persistence | **COMPLETED** (PROD-2C C1–C3) |
| **B4** — Visual Graph Builder persistence | **COMPLETED** (PROD-2C C4–C8) |
| **B5** — IndexedDB autosave + biblioteca local | **COMPLETED** |
| **B6.1** — Dominio conflict + autosave status | **COMPLETED** |
| **B6.2** — Detección/resolución de conflictos (application) | **COMPLETED** |
| **B6.3** — Mensajes UX persistencia | **COMPLETED** |
| **B6.4** — Persistence Views + UI Wiring | **COMPLETED** |
| **B6.5** — Project Size Assessment | **COMPLETED** |
| B7 — Cloud adapter (opcional) | **Fuera de alcance PROD-2B** — backlog PROD-2C |

**Nota histórica (B3/B4):** Las fases B3 (Worksheet persistence) y B4 (Visual Graph Builder persistence) pertenecían al alcance funcional originalmente definido para PROD-2B en [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md). Su implementación se realizó durante la ejecución de la épica PROD-2C (C1–C8). A efectos del cierre histórico de PROD-2B, ambas fases se consideran completamente finalizadas.

---

## 2. Resumen ejecutivo

PROD-2B entrega persistencia completa de proyectos científicos sobre schema V2 (`.sgproj`), con soporte multi-dataset, worksheet por dataset, Visual Graph Builder, biblioteca local IndexedDB, autosave con recovery, detección de conflictos de revisión, indicadores UX y advertencias de tamaño de proyecto.

### Objetivos alcanzados

- **Contrato V2 formalizado** — `ScientificProjectV2` con migrador V1→V2, validadores y adaptadores de archivo.
- **Multi-dataset nativo** — `datasets[]`, slots SCI-58 con `sourceDatasetId`, round-trip sin colapso V2→V1.
- **Worksheet y VGB persistidos** — worksheet por dataset; `visualGraphs[]` con partición por `sourceDatasetId` (PROD-2C).
- **Persistencia local IndexedDB** — biblioteca de proyectos, borrador, autosave debounced, recovery prompt, transacciones atómicas.
- **UX de persistencia** — indicador autosave, detección de conflictos (session / local / archivo), vistas derivadas, refs de revisión, warnings de tamaño (>10 MB).
- **Pipeline invariante certificado** — `parse → migrate → validate → sanitize → hydrate` en Save/Open y en biblioteca local.
- **Gates automatizados** — suites B1–B6 con cobertura de dominio, application, adapters e integración UI.

---

## 3. Arquitectura implementada

### 3.1 Formato `.sgproj`

Envelope JSON versionado con `schemaVersion: 2`:

```json
{
  "kind": "scientific-graph-ai.project",
  "schemaVersion": 2,
  "appVersion": "0.1.0",
  "exportedAt": "ISO-8601",
  "project": { "... ScientificProjectV2 ..." }
}
```

El dominio persiste estado científico (datasets, workflow, comparison, workspace, worksheet, visualGraphs); no outputs de motores SCI, preview VGB ni UI efímera. Proyectos V1 se auto-migran al abrir vía `migrateProjectJson`.

### 3.2 Persistencia local

Capa IndexedDB reutiliza el **mismo envelope JSON** que `.sgproj`. Metadatos indexables (`projectId`, `name`, `updatedAt`, `lastAccessedAt`, `storageState`, `integrityStatus`) separados del blob de envelope para consultas eficientes. Reserva multi-perfil (`profileId`).

### 3.3 Repository

Contrato de dominio `LocalProjectRepository` en `domain/local-project/repository.ts`; implementación IndexedDB en `adapters/indexeddb/indexed-db-local-project-repository.ts`. Casos de uso en `application/local-project/` (CRUD, borrador, rename, duplicate, checksum, integridad).

### 3.4 AutoSave

Hook `useProjectDraftAutosave` con debounce; persiste borrador vía repository. Estado derivado en `application/persistence-status/autosave-status.ts` (idle / pending / saving / saved / error).

### 3.5 Recovery

Al iniciar sesión, `useLocalProjectPersistence` detecta borrador pendiente y muestra recovery prompt. Apertura de borrador pasa por pipeline hydrate estándar; conflictos de revisión evaluados antes de aplicar patch.

### 3.6 Conflict Detection

Comparación de revisiones (`projectId`, `updatedAt`, `exportedAt`, `source`) entre session, commit local IndexedDB y archivo `.sgproj` entrante. Dominio puro en `domain/persistence-conflict/`; detección y resolución en `application/persistence-conflict/`. Severidades blocking/warning; `shouldBlockHydrate` para cambios sin guardar.

### 3.7 Persistence Views

Builders puros en `src/app/persistence/persistenceViews.ts` — `buildAutosaveIndicatorView`, `buildPersistenceConflictView`, `buildProjectSizeAssessmentView`. Traducen estado de application a vistas UI (label, className, prompt, tier).

### 3.8 Revision References

Helpers en `src/app/persistence/revisionRefs.ts` — `buildSessionRevisionRef`, `buildLocalCommittedRevisionRef`, `buildIncomingRevisionFromSgprojText`. Normalizan metadata a `DetectPersistenceConflictInput`.

### 3.9 Project Size Assessment

`application/persistence-size/assess-size-warning.ts` evalúa `byteLength` contra `PROJECT_SIZE_WARN_BYTES` (10 MB). Tiers: normal / approaching / exceeded; mensajes vía `userMessages.ts`.

### 3.10 UI Wiring

Módulo `src/app/persistence/` — hooks (`useAutosaveIndicator`, `usePersistenceConflictState`, `useProjectSizeAssessment`, `usePersistenceFileOpen`, `useProjectPersistenceUi`). Integración en `ProjectScientificFilePanel`, `useLocalProjectPersistence`, `localProjectActions`, `projectFileActions.ts`, `graphEditorProjectIntegration.ts`.

### 3.11 Pipeline Save / Open

```
Save (Runtime → .sgproj V2 / IndexedDB):
  collectProjectSnapshotV2 → serializeProjectV2 → envelope

Open (.sgproj / borrador → Runtime):
  parse → migrateProjectJson (si V1)
       → validateScientificProjectFile
       → sanitizeScientificProjectV2
       → buildHydrateProjectV2Patch
       → applyHydrateProjectV2Patch
```

---

## 4. Tabla de componentes implementados

| Capa | Componente | Responsabilidad |
|------|------------|-----------------|
| **Dominio** | `domain/types-v1.ts`, `types-v2.ts`, `scientific-project.ts` | Contratos V1/V2 |
| **Dominio** | `domain/migrations/migrate-v1-to-v2.ts` | Migrador V1→V2 |
| **Dominio** | `domain/validate-v2.ts`, `sanitize-project-v2.ts` | Validación y sanitize |
| **Dominio** | `domain/dataset-id-policy.ts` | IDs estables persistidos vs session |
| **Dominio** | `domain/worksheet-domain.ts`, `visual-graph-domain.ts` | Contratos worksheet / VGB |
| **Dominio** | `domain/local-project/` | Repository contract, types, errors |
| **Dominio** | `domain/persistence-conflict/` | Tipos revisión, compare-revision |
| **Dominio** | `domain/persistence-status/` | Tipos indicador autosave |
| **Aplicación** | `application/local-project/` | Use cases CRUD, borrador, checksum |
| **Aplicación** | `application/persistence-conflict/` | detect-conflict, resolve-conflict |
| **Aplicación** | `application/persistence-status/` | deriveAutosaveIndicatorState |
| **Aplicación** | `application/persistence-size/` | assessProjectSizeWarning |
| **Infraestructura** | `collect-project-snapshot-v2.ts`, `serialize-project-v2.ts` | Pipeline collect/serialize |
| **Infraestructura** | `hydrate.ts`, `apply-hydrate-project-v2-patch.ts` | Pipeline hydrate |
| **Infraestructura** | `collect-visual-graph-v2.ts`, `visual-graph-session-ui.ts` | VGB collect/runtime |
| **Adapters** | `adapters/sgproj/` | Envelope, parse, serialize, map-session-dataset |
| **Adapters** | `adapters/indexeddb/` | IndexedDB repository, schema, transactions |
| **UI** | `projectFileActions.ts`, `projectPersistence.ts` | Save/Open boundary |
| **UI** | `useLocalProjectPersistence.ts`, `localProjectActions.ts` | Biblioteca local |
| **UI** | `useProjectDraftAutosave.ts`, `LocalProjectsPanel.tsx` | Autosave + biblioteca |
| **UI** | `ProjectScientificFilePanel.tsx` | Panel persistencia + indicadores |
| **UI** | `persistence/` | Views, hooks, revision refs |

---

## 5. Archivos principales creados (resumen)

| Área | Archivos representativos |
|------|--------------------------|
| Dominio V2 | `domain/types-v2.ts`, `domain/migrations/`, `domain/validate-v2.ts`, `domain/dataset-id-policy.ts` |
| Pipeline V2 | `collect-project-snapshot-v2.ts`, `serialize-project-v2.ts`, `apply-hydrate-project-v2-patch.ts`, `sanitize-project-v2.ts` |
| Adapters sgproj | `adapters/sgproj/envelope.ts`, `map-session-dataset.ts`, `serialize-v2.ts` |
| IndexedDB | `adapters/indexeddb/indexed-db-local-project-repository.ts`, `schema.ts`, `mapper.ts` |
| Local project | `application/local-project/use-cases.ts`, `domain/local-project/repository.ts` |
| B6 UX | `domain/persistence-conflict/`, `application/persistence-conflict/`, `application/persistence-size/` |
| UI persistencia | `src/app/persistence/*`, `useLocalProjectPersistence.ts`, `ProjectScientificFilePanel.tsx` |
| Gates | `scripts/validate-prod2b-b1-*`, `validate-prod2b-b2-*`, `validate-prod2b-indexeddb.ts`, `validate-prod2b-b6-*.ts` |
| Fixtures | `scripts/fixtures/project-v1-*.sgproj`, `project-v2-*.sgproj` |

---

## 6. Resumen de validación

### 6.1 Microfases completadas

| Microfase | Gate | Resultado |
|-----------|------|-----------|
| B1.1 Dominio V1/V2 | `validate:prod2b-b1-1-domain` | **PASS (9/9)** |
| B1.2 Migrador V1→V2 | `validate:prod2b-b1-2-migrate` | **PASS (17/17)** |
| B1.3 Validadores V2 | `validate:prod2b-b1-3-v2` | **PASS (13/13)** |
| B1.4 Adapters + wiring mínimo | `validate:prod2b-b1-4-adapters` | **PASS (9/9)** |
| B2.1–B2.9 Multi-dataset | `validate:prod2b-b2-gate` | **PASS (17/17 umbrella)** |
| B3 Worksheet | `validate:prod2c-c3-worksheet-ui` | **PASS (10/10)** |
| B4 Visual Graph Builder | `validate:prod2c-c8-regression-gate` | **PASS (5/5)** |
| B5 IndexedDB | `validate:prod2b-indexeddb` | **PASS (25/25)** |
| **B6.1** Dominio conflict + status | `validate:prod2b-b6-domain` | **PASS (24/24)** |
| **B6.2** Conflict application | `validate:prod2b-b6-conflict` | **PASS (38/38)** |
| **B6.3** UX messages | `validate:prod2b-b6-ux` | **PASS (22/22)** |
| **B6.4** React wiring | `validate:prod2b-b6-wiring` | **PASS (16/16)** |
| **B6.5** Size assessment | `validate:prod2b-b6-size` | **PASS (10/10)** |

### 6.2 Gates umbrella y regresión

| Gate | Resultado |
|------|-----------|
| `validate:prod2b-f0` | **PASS** |
| `validate:prod2b-migrate` | **PASS** |
| `validate:prod2b-b2-gate` | **PASS (17/17)** |
| `validate:prod2b-indexeddb` | **PASS (25/25)** |
| `validate:prod2c-c8-regression-gate` | **PASS (5/5)** |
| Gates B6.1–B6.5 (ver §6.1) | **PASS (110/110 casos B6)** |
| `npx tsc --noEmit` | **PASS** |

**Confirmación:** Todas las microfases PROD-2B (B1–B6.5) completadas. Todos los gates de fase superados al cierre (2026-07-01).

### 6.3 Invariantes certificados

| Invariante | Definición | Evidencia |
|------------|------------|-----------|
| **A** | Save → Load → Save — equivalencia funcional | B2 `b2-9-invariants.cases.ts`; PROD-2C C2/C8 |
| **B** | V1 → migrate → hydrate → save V2 | B2 Invariante B; migrador idempotente |
| **C-D** | VGB aislados por `sourceDatasetId` | PROD-2C C7/C8 |
| **VGB-R1** | Preview no persistido; rebuild al abrir | PROD-2C C6/C8 |

---

## 7. Backlog

**No quedan tareas pendientes correspondientes a PROD-2B.**

Las futuras funcionalidades (p. ej. adaptador cloud B7, sync, merge UI avanzado) pertenecen a **PROD-2C** y épicas posteriores, fuera del alcance cerrado de PROD-2B.

**Aclaración sobre B7 (Cloud Adapter):** La fase B7 nunca formó parte del criterio obligatorio de finalización de PROD-2B — figuraba como opcional en el plan original ([`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) §B7). Su desarrollo queda reservado para PROD-2C o épicas futuras.

| Item | Clasificación post-cierre |
|------|---------------------------|
| Cloud adapter (B7 plan original) | PROD-2C / backlog futuro |
| `validate:prod2a-gate` Playwright intermitente | Deuda infraestructura (no bloquea PROD-2B) |
| `validate:full` E2E con servidor local | Regresión global producto; ejecutar en CI/smoke |

---

## 8. Principios arquitectónicos (vigentes)

1. **Estado Persistente del Dominio** — `.sgproj` almacena solo dominio científico; artefactos derivados se reconstruyen al abrir.
2. **Independencia del Dominio** — `ScientificProject` es modelo puro; persistencia actúa como adaptador.
3. **Forward Compatibility** — migraciones explícitas por salto de versión.
4. **Pipeline invariante:** `parse → migrate → validate → sanitize → hydrate`.

---

## 9. Histórico de cierre

| Fecha | Evento |
|-------|--------|
| 2026-06-27 | Discovery PROD-2B cerrado; Plan aprobado |
| 2026-06-27 | **B1 COMPLETED** — Schema V2 + migrador + adapters (`c195591`) |
| 2026-06-25 | **B2 COMPLETED** — Multi-dataset; `validate:prod2b-b2-gate` PASS |
| 2026-06-30 | **B3/B4 COMPLETED** vía PROD-2C C1–C8 |
| 2026-06-30 | **B5 COMPLETED** — IndexedDB autosave; ver [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) |
| 2026-07-01 | **B6.1–B6.5 COMPLETED** — UX hardening persistencia |
| 2026-07-01 | **Cierre oficial PROD-2B — COMPLETED** |

---

Documento generado al **cierre oficial de PROD-2B** (2026-07-01). Referencia de estado para persistencia de proyectos científicos en schema V2. Complementa [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) (worksheet + VGB) y [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) (IndexedDB).
