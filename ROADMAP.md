# Scientific Graph AI — Roadmap

**Actualizado:** 2026-07-09 (cierre oficial PROD-2D)

---

## Estado actual

| Bloque | Estado |
|--------|--------|
| Núcleo científico SCI-1 → SCI-60 | **Validado** (QA-1 + gates automatizados) |
| ARCH-5 Fases 1–4 | **COMPLETED** |
| ARCH-5 F5 (metodología SCI-50→60) | **CLOSED** (PROD-2D D9–D17) |
| ARCH-6 (visibility / toggles) | **CLOSED** (PROD-2D D4–D8) |
| PROD-1A / PROD-2A | **COMPLETED** |
| DATA-3A / HOTFIX-DATA-3A | **COMPLETED** |
| UX-1A.1 LITE | **COMPLETED** |
| Sprint QA-1 (Validación Manual) | **CERRADO** |
| **SCI-58 v2** (A1 + A2 + A3 + HOTFIX PDF-1/2/3) | **COMPLETED** |
| **PROD-2B** — Persistencia de proyectos científicos (B1–B6) | **COMPLETED** |
| **PROD-2C** — Worksheet + Visual Graph Builder persistence | **COMPLETED** |
| **PROD-2D** — UX profesional + arquitectura transversal | **CLOSED** (2026-07-09) |
| **Siguiente épica** | **PROD-2E** — Motor gráfico profesional |

Referencia de estado detallado:

- [`PROJECT_STATUS_PROD_2D.md`](./PROJECT_STATUS_PROD_2D.md) — cierre oficial PROD-2D (D0–D24)
- [`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md) — plan operativo PROD-2D (congelado)
- [`MASTER_ROADMAP_V1.md`](./MASTER_ROADMAP_V1.md) — SSOT estratégico
- [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) — cierre oficial PROD-2B (B1–B6.5)
- [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) — cierre IndexedDB autosave (B5)
- [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) — cierre worksheet + VGB (documento congelado)
- [`src/lib/project/README.md`](./src/lib/project/README.md) — arquitectura técnica persistencia V2
- [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md) — cierre SCI-58 v2
- [`PROJECT_STATUS_SCI_56.md`](./PROJECT_STATUS_SCI_56.md) — snapshot histórico cierre QA-1

---

## PROD-2D — UX profesional + arquitectura transversal

**Estado:** **CLOSED** (2026-07-09)

Épica que profesionaliza UX (branding, Smart Start, Config, Historial, Actividad), cierra ARCH-6 (visibility/toggles) y ARCH-5 F5 (metodología SCI-50→60 modularizada), y certifica el gate umbrella `validate:prod2d-gate`.

| Bloque | Microfases | Estado |
|--------|------------|--------|
| UX-2A | D1–D3 | **CLOSED** |
| ARCH-6 | D4–D8 | **CLOSED** |
| ARCH-5 F5 | D9–D17 | **CLOSED** |
| UX-2B | D18–D21 | **CLOSED** |
| Actividad proyecto (D22) | D22 | **CLOSED** (microfase; ≠ épica UX-2C independiente) |
| Gate umbrella | D23 | **CLOSED** |
| Cierre documental | D24 | **CLOSED** |

Gate oficial: `npm run validate:prod2d-gate`  
Documentación de cierre: [`PROJECT_STATUS_PROD_2D.md`](./PROJECT_STATUS_PROD_2D.md)

**Siguiente:** **PROD-2E — Motor gráfico profesional**.

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

Documentación de cierre: [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md)

---

## PROD-2C — Worksheet + Visual Graph Persistence

**Estado:** **COMPLETED** (2026-06-30)

Épica de implementación que cierra el alcance original PROD-2B B3 + B4 sobre schema V2.

Documentación de cierre (congelada): [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md)

---

## ARCH-6-DOC — Alineación documental

**Estado:** **COMPLETED** (2026-06-30)

Sincronización de README, ROADMAP, README técnico y referencias de estado con la arquitectura real post-PROD-2C. Sin cambios funcionales.

---

## Próxima etapa

| Épica | Descripción |
|-------|-------------|
| **PROD-2E** | Motor gráfico profesional — VGB / curvas a calidad de publicación (DATA-3B, GRAPH-1, GRAPH-2; dependencia: PROD-2D CLOSED) |

Candidatos posteriores (sin priorización operativa aquí): PROD-3 · RC-1 · Version 1.0 — ver [`MASTER_ROADMAP_V1.md`](./MASTER_ROADMAP_V1.md).

---

## Histórico de hitos cerrados

SCI-55 → SCI-60 · SCI-58 v1 · **SCI-58 v2** · SCI-59 · ARCH-5 F1–F4 · PROD-1A · PROD-2A · **PROD-2B** (B1–B6) · **PROD-2C C1–C9** · **ARCH-6-DOC** · HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 · UX-1A.1 LITE · DATA-3A · **QA-1** · **HOTFIX PDF-1/2/3** · **PROD-2D** (D0–D24)
