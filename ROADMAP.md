# Scientific Graph AI — Roadmap

**Actualizado:** 2026-06-30 (ARCH-6-DOC — alineación post-PROD-2C)

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
| **PROD-2B B1** — Schema V2 + migrador + adapters `.sgproj` | **COMPLETED** |
| **PROD-2B B2** — Multi-dataset persistence | **COMPLETED** |
| **PROD-2C** — Worksheet + Visual Graph Builder persistence | **COMPLETED** |

Referencia de estado detallado:

- [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) — persistencia `.sgproj` B1–B5, handoff B6
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

**Estado:** **B1–B5 COMPLETED** · B6–B7 pendientes (2026-06-30)

Épica que evoluciona `.sgproj` de schema v1 a v2: dominio multi-dataset, worksheet, Visual Graph Builder, migrador, validadores y adaptadores de archivo.

| Fase | Estado | Notas |
|------|--------|-------|
| B0 Discovery | CERRADO | |
| **B1** Schema V2 + migrador + adapters | **COMPLETED** | |
| **B2** Multi-dataset persistence | **COMPLETED** | Gate `validate:prod2b-b2-gate` |
| **B3** Worksheet | **COMPLETED** | Implementado vía PROD-2C C1–C3 |
| **B4** Visual Graph Builder | **COMPLETED** | Implementado vía PROD-2C C4–C8 |
| **B5** IndexedDB autosave | **COMPLETED** | Gate `validate:prod2b-indexeddb` — [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) |
| B6 UX hardening + gate unificado | Pendiente | **Próxima fase** |
| B7 Cloud (opcional) | Pendiente | |

Documentación: [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md)

**Próxima acción:** iniciar **B6 — UX hardening + `validate:prod2b-gate`** ([`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) §B6). Cierre B5: [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md).

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
| **PROD-2B B6** | UX hardening + `validate:prod2b-gate` — siguiente en plan PROD-2B |
| **PROD-1B** | Validación avanzada de importación + reportes completos |
| **ARCH-5 Fase 4+** | Metodología SCI-50→56 en módulos, reporting, PDF |
| **ARCH-6** | Mejoras UX post-QA-1: refinamiento progressive disclosure (persistencia VGB por dataset entregada en PROD-2C) |
| **PROD-1 v1.1** | Multi-serie side-by-side (RW-04) |
| **SCI-59 v1.1** | Branching condicional avanzado, persistencia workflow |
| **SCI-58 v3** (evolución) | Comparación N>2 slots; persistencia extendida de perfiles comparativos |

---

## Histórico de hitos cerrados

SCI-55 → SCI-60 · SCI-58 v1 · **SCI-58 v2** · SCI-59 · ARCH-5 F1–F4 · PROD-1A · PROD-2A · **PROD-2B B1** · **PROD-2B B2** · **PROD-2C C1–C9** · **ARCH-6-DOC** · HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 · UX-1A.1 LITE · DATA-3A · **QA-1** · **HOTFIX PDF-1/2/3**
