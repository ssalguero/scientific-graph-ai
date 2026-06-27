# Scientific Graph AI — Roadmap

**Actualizado:** 2026-06-27 (cierre PROD-2B B1)

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

Referencia de estado detallado:

- [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) — cierre B1 y roadmap PROD-2B
- [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md) — cierre SCI-58 v2
- [`PROJECT_STATUS_SCI_56.md`](./PROJECT_STATUS_SCI_56.md) — estado general del proyecto

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

**Estado:** **B1 COMPLETED** · B2–B7 pendientes (2026-06-27)

Épica que evoluciona `.sgproj` de schema v1 a v2: dominio multi-dataset, migrador, validadores y adaptadores de archivo. B1 establece el contrato V2 y el wiring mínimo; la UI multi-dataset llega en B2.

| Fase | Estado |
|------|--------|
| B0 Discovery | CERRADO |
| **B1** Schema V2 + migrador + adapters | **COMPLETED** |
| B2 Multi-dataset UI | Pendiente |
| B3 Worksheet | Pendiente |
| B4 Visual Graph Builder | Pendiente |
| B5 IndexedDB | Pendiente |
| B6 UX hardening | Pendiente |
| B7 Cloud (opcional) | Pendiente |

Documentación: [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md)

**Próxima acción:** iniciar **B2** en conversación dedicada.

---

## Próxima etapa — candidatos (sin priorización)

| Candidato | Descripción |
|-----------|-------------|
| **PROD-2B B2** | Multi-dataset persistence + slot bindings (siguiente en plan PROD-2B) |
| **PROD-1B** | Validación avanzada de importación + reportes completos |
| **ARCH-5 Fase 4+** | Metodología SCI-50→56 en módulos, reporting, PDF |
| **ARCH-6** | Mejoras UX: estado persistente Constructor Visual por dataset; refinamiento progressive disclosure |
| **PROD-1 v1.1** | Multi-serie side-by-side (RW-04) |
| **SCI-59 v1.1** | Branching condicional avanzado, persistencia workflow |
| **SCI-58 v3** (evolución) | Comparación N>2 slots; persistencia extendida de perfiles comparativos |

---

## Histórico de hitos cerrados

SCI-55 → SCI-60 · SCI-58 v1 · **SCI-58 v2** · SCI-59 · ARCH-5 F1–F4 · PROD-1A · PROD-2A · **PROD-2B B1** · HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 · UX-1A.1 LITE · DATA-3A · **QA-1** · **HOTFIX PDF-1/2/3**
