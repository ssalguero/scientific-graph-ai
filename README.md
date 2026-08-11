# Scientific Graph AI

Editor científico web (Next.js) para importar datos experimentales, analizarlos con motores SCI, comparar datasets y persistir el workspace en archivos `.sgproj`.

---

## Estado de release (live)

| Elemento | Valor |
|----------|--------|
| Release | **v1.0.0** — **RELEASED / VERIFIED** (PP11 Repository Release Transition) |
| Tags | `1.0.0` + `v1.0` → `f38cc6f` |
| `main` / `origin/main` | Alineados al baseline de release |
| PP0…PP11 | **COMPLETE** |
| PRS | **RELEASE-CERTIFIED · CLOSED** |
| RELEASE Series | **CLOSED** |
| Post-Release | **PRV-1 CLOSED · HANDOFF RECORDED** |
| Next Development Cycle | **TBD / SEPARATELY CHARTERED** |

Autoridad operativa: [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) · [`docs/roadmaps/ROADMAP.md`](./docs/roadmaps/ROADMAP.md) · [`docs/PRV/official-records/`](./docs/PRV/official-records/).

**Próxima acción:** checkpoint final de **PRV-1** → charter separado del Next Development Cycle. Candidatos históricos de producto (p. ej. **PROD-3**) no son la acción inmediata post-`v1.0.0` sin Decision Record / Charter propio.

---

## Quick Start

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Variables opcionales para gates E2E y baselines (valores por defecto apuntan a rutas Desktop del desarrollador):

- `DATASET5_PATH` — workbook dataset 5
- `DATASET6_PATH` — workbook dataset 6

---

## Índice documental

| Documento | Contenido |
|-----------|-----------|
| [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) | Estado operativo live (release / Post-Release) |
| [`docs/roadmaps/ROADMAP.md`](./docs/roadmaps/ROADMAP.md) | Roadmap live + histórico; Post-Release **PRV-1** |
| [`docs/PRV/official-records/`](./docs/PRV/official-records/) | Official Records Post-Release (**PRV-1**) |
| [`docs/roadmaps/archive/MASTER_ROADMAP_V1.md`](./docs/roadmaps/archive/MASTER_ROADMAP_V1.md) | SSOT estratégico histórico (fases PROD-2D → Version 1.0) |
| [`PROJECT_STATUS_PROD_2D.md`](./PROJECT_STATUS_PROD_2D.md) | Acta cierre PROD-2D (D0–D24) — **CLOSED** |
| [`PROJECT_STATUS_PROD_2E.md`](./PROJECT_STATUS_PROD_2E.md) | Acta cierre PROD-2E (D25–D36) — **CLOSED** |
| [`PROJECT_PLAN_PROD_2E.md`](./PROJECT_PLAN_PROD_2E.md) | Plan operativo PROD-2E (congelado · cierre D36) |
| [`PROJECT_BASELINE_PROD_2D.md`](./PROJECT_BASELINE_PROD_2D.md) | Baseline D0.5 (histórico inmutable) |
| [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) | Estado persistencia `.sgproj` — B1–B6 |
| [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) | Cierre PROD-2B B5 — IndexedDB biblioteca local + autosave |
| [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) | Cierre worksheet + Visual Graph Builder (documento congelado) |
| [`src/lib/project/README.md`](./src/lib/project/README.md) | Arquitectura técnica de persistencia V2 |
| [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) | Plan aprobado PROD-2B (B1–B7) |
| [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md) | Comparación científica multi-dataset SCI-58 v2 |
| [`PROJECT_STATUS_SCI_56.md`](./PROJECT_STATUS_SCI_56.md) | Snapshot histórico cierre QA-1 |
| [`QA-1_MANUAL_VALIDATION_PROTOCOL.md`](./QA-1_MANUAL_VALIDATION_PROTOCOL.md) | Protocolo validación manual end-to-end |

---

## Estado actual (histórico de épicas PROD)

| Bloque | Estado |
|--------|--------|
| Núcleo científico SCI-1 → SCI-60 | Validado (QA-1 + gates) |
| PROD-2A — Project File Core | **COMPLETED** |
| PROD-2B — Persistencia científica V2 | **COMPLETED** |
| PROD-2C — Worksheet + Visual Graph persistence | **COMPLETED** |
| **PROD-2D** — UX profesional + arquitectura transversal | **CLOSED** (2026-07-09) |
| **PROD-2E** — Motor gráfico profesional | **CLOSED** (2026-07-16) |
| **PROD-3** (histórico / futuro candidato) | Exportación, importación y cierre funcional — **no** es la acción inmediata post-release; ver handoff **PRV-1** |

Actas de cierre históricas: ver `docs/archive/project status/`. Live status: [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md).

---

## Gates principales

Ejecutar desde la raíz del repositorio.

| Comando | Alcance | Cuándo usarlo |
|---------|---------|---------------|
| `npm run validate:prod2d-gate` | Umbrella PROD-2D: `validate:full` + B2 + ARCH-5 F5 + visibility + project-history | Certificación / regresión post-PROD-2D |
| `npm run validate:full` | Regresión general: PROD-2A, PROD-1, build, tsc, comparison-unit, E2E save/reload | CI / smoke test amplio del núcleo científico |
| `npm run validate:prod2b-b2-gate` | Umbrella PROD-2B B1+B2: multi-dataset, migración, invariantes A/B | Certificar persistencia multi-dataset |
| `npm run validate:prod2b-indexeddb` | Umbrella PROD-2B B5: biblioteca local IndexedDB, CRUD, borrador, integridad | Certificar persistencia local B5 |
| `npm run validate:prod2c-c8-regression-gate` | Umbrella PROD-2C C4–C8: Visual Graph Builder persistido (5 sub-gates) | Certificar regresión VGB post-PROD-2C |
| `npm run validate:prod2e-gate` | Umbrella PROD-2E: governor épica + D35 + DATA-3B + VGB + tsc | Certificar cierre épica motor gráfico |
| `npm run validate:arch5-f5-modularization-gate` | ARCH-5 F5: methodology + workflow + C8 + métricas LOC | Certificar modularización metodología |
| `npm run validate:methodology-unit` | SCI-50→60 domain (F5A–F5E) | Unit methodology |
| `npm run validate:workflow-unit` | SCI-59 workflow visibility snapshot | Unit workflow |
| `npm run validate:visibility-unit` | ARCH-6 toggle registry / PDF policy | Unit visibility |

**Nota:** `validate:prod2d-gate` es el gate oficial de cierre PROD-2D y compone `validate:full` más los sub-gates de persistencia, modularización, visibility y project-history. Un `ERR_CONNECTION_REFUSED` en pasos `baseline`/`e2e` de `validate:full` puede aceptarse como PASS condicionado solo bajo la política congelada del umbrella (ver acta D23/D24).

Gates adicionales por microetapa: [`src/lib/project/README.md`](./src/lib/project/README.md#gates-técnicos).

---

## Roadmap

Ver [`docs/roadmaps/ROADMAP.md`](./docs/roadmaps/ROADMAP.md) (live) y el archivo histórico [`docs/roadmaps/archive/MASTER_ROADMAP_V1.md`](./docs/roadmaps/archive/MASTER_ROADMAP_V1.md).

**Próxima acción recomendada (live):** checkpoint final de **PRV-1** (`CLOSED · HANDOFF RECORDED`) → charter separado del **Next Development Cycle** — [`docs/PRV/official-records/`](./docs/PRV/official-records/).
**Next Development Cycle:** **TBD / SEPARATELY CHARTERED** — [`PRV-DECISION-001`](./docs/PRV/official-records/PRV-DECISION-001-Next-Cycle-Handoff.md).
**Candidato histórico de producto (no autorizado por PRV-1):** **PROD-3** — Exportación, importación y cierre funcional.
