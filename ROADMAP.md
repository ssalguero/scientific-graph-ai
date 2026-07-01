# Scientific Graph AI — Roadmap

**Actualizado:** 2026-07-01 (cierre oficial PROD-2B)

---

## Estado actual

| Bloque | Estado |
|--------|--------|
| Núcleo científico SCI-1 → SCI-60 | **Validado** (QA-1 + gates automatizados) |
| ARCH-5 Fases 1–4 | **COMPLETED** |
| PROD-1A / PROD-2A | **COMPLETED** |
| DATA-3A / HOTFIX-DATA-3A | **COMPLETED** |
| UX-1A.1 LITE | **COMPLETED** |
| Sprint QA-1 (Validación Manual) | **CERRADO** |
| **SCI-58 v2** (A1 + A2 + A3 + HOTFIX PDF-1/2/3) | **COMPLETED** |
| **PROD-2B** — Persistencia de proyectos científicos (B1–B6) | **COMPLETED** |
| **PROD-2C** — Worksheet + Visual Graph Builder persistence | **COMPLETED** |

Referencia de estado detallado:

- [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) — cierre oficial PROD-2B (B1–B6.5)
- [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) — cierre IndexedDB autosave (B5)
- [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) — cierre worksheet + VGB (documento congelado)
- [`src/lib/project/README.md`](./src/lib/project/README.md) — arquitectura técnica persistencia V2
- [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md) — cierre SCI-58 v2
- [`PROJECT_STATUS_SCI_56.md`](./PROJECT_STATUS_SCI_56.md) — snapshot histórico cierre QA-1

---

## Sprint QA-1 — CERRADO

Validación manual end-to-end completada sobre la arquitectura actual (progressive disclosure, toggles default OFF, workflow SCI-59). Gate `npm run validate:full` — **PASS**.

Protocolo: [`QA-1_MANUAL_VALIDATION_PROTOCOL.md`](./QA-1_MANUAL_VALIDATION_PROTOCOL.md)

---

## SCI-58 v2 — COMPLETADO

**Estado:** **COMPLETADO** (2026-06-27)

Comparación científica ampliada sobre la base SCI-58 v1 (ARCH-5 F4). Entregables: modelo enriquecido (A1), dashboard ampliado (A2), exportación PDF condicional (A3), hotfixes PDF-1/2/3.

Documentación completa: [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md)

---

## PROD-2B — Persistencia de Proyectos Científicos

**Estado:** **COMPLETED** (2026-07-01)

Épica que evoluciona `.sgproj` de schema v1 a v2: dominio multi-dataset, worksheet, Visual Graph Builder, biblioteca local IndexedDB, autosave, conflict detection, UX hardening, migrador, validadores y adaptadores de archivo.

| Fase | Estado | Notas |
|------|--------|-------|
| B0 Discovery | CERRADO | |
| **B1** Schema V2 + migrador + adapters | **COMPLETED** | |
| **B2** Multi-dataset persistence | **COMPLETED** | Gate `validate:prod2b-b2-gate` |
| **B3** Worksheet | **COMPLETED** | Implementado vía PROD-2C C1–C3 |
| **B4** Visual Graph Builder | **COMPLETED** | Implementado vía PROD-2C C4–C8 |
| **B5** IndexedDB autosave | **COMPLETED** | Gate `validate:prod2b-indexeddb` — [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) |
| **B6.1–B6.5** UX hardening | **COMPLETED** | Conflict, views, size, wiring — gates `validate:prod2b-b6-*` |
| B7 Cloud (opcional) | Fuera de alcance | Backlog PROD-2C |

Documentación de cierre: [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md)

**Backlog PROD-2B:** vacío. Futuras funcionalidades de persistencia avanzada (cloud, sync) → **PROD-2C**.

**Nota de cierre:** PROD-2B queda oficialmente cerrado. [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) pasa a ser referencia histórica. Toda evolución futura de persistencia continúa mediante PROD-2C y épicas posteriores.

---

## PROD-2C — Worksheet + Visual Graph Persistence

**Estado:** **COMPLETED** (2026-06-30)

Épica de implementación que cierra el alcance original PROD-2B B3 + B4 sobre schema V2.

| Microetapa | Alcance | Gate umbrella |
|------------|---------|---------------|
| C1–C3 | Worksheet por dataset | `validate:prod2c-c3-worksheet-ui` |
| C4–C8 | Visual Graph Builder + fixtures + regresión | `validate:prod2c-c8-regression-gate` |

Documentación de cierre (congelada): [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md)

---

## ARCH-6-DOC — Alineación documental

**Estado:** **COMPLETED** (2026-06-30)

Sincronización de README, ROADMAP, README técnico y referencias de estado con la arquitectura real post-PROD-2C. Sin cambios funcionales.

---

## Próxima etapa — candidatos (sin priorización)

| Candidato | Descripción |
|-----------|-------------|
| **PROD-2C** (evolución) | Cloud adapter, sync, persistencia avanzada post-PROD-2B |
| **PROD-1B** | Validación avanzada de importación + reportes completos |
| **ARCH-5 Fase 4+** | Metodología SCI-50→56 en módulos, reporting, PDF |
| **ARCH-6** | Mejoras UX post-QA-1: refinamiento progressive disclosure (persistencia VGB por dataset entregada en PROD-2C) |
| **PROD-1 v1.1** | Multi-serie side-by-side (RW-04) |
| **SCI-59 v1.1** | Branching condicional avanzado, persistencia workflow |
| **SCI-58 v3** (evolución) | Comparación N>2 slots; persistencia extendida de perfiles comparativos |

---

## Histórico de hitos cerrados

SCI-55 → SCI-60 · SCI-58 v1 · **SCI-58 v2** · SCI-59 · ARCH-5 F1–F4 · PROD-1A · PROD-2A · **PROD-2B** (B1–B6) · **PROD-2C C1–C9** · **ARCH-6-DOC** · HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 · UX-1A.1 LITE · DATA-3A · **QA-1** · **HOTFIX PDF-1/2/3**
