# Scientific Graph AI

Editor científico web (Next.js) para importar datos experimentales, analizarlos con motores SCI, comparar datasets y persistir el workspace en archivos `.sgproj`.

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
| [`ROADMAP.md`](./ROADMAP.md) | Hitos del proyecto, fases PROD-2B/2C, candidatos futuros |
| [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) | Estado persistencia `.sgproj` — B1–B4, handoff B5 |
| [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) | Cierre worksheet + Visual Graph Builder (documento congelado) |
| [`src/lib/project/README.md`](./src/lib/project/README.md) | Arquitectura técnica de persistencia V2 |
| [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) | Plan aprobado PROD-2B (B1–B7) |
| [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md) | Comparación científica multi-dataset SCI-58 v2 |
| [`PROJECT_STATUS_SCI_56.md`](./PROJECT_STATUS_SCI_56.md) | Snapshot histórico cierre QA-1 |
| [`QA-1_MANUAL_VALIDATION_PROTOCOL.md`](./QA-1_MANUAL_VALIDATION_PROTOCOL.md) | Protocolo validación manual end-to-end |

---

## Estado actual

| Bloque | Estado |
|--------|--------|
| Núcleo científico SCI-1 → SCI-60 | Validado (QA-1 + gates) |
| PROD-2A — Project File Core | **COMPLETED** |
| PROD-2B B1 — Schema V2 + migrador | **COMPLETED** |
| PROD-2B B2 — Multi-dataset persistence | **COMPLETED** |
| PROD-2C — Worksheet + Visual Graph persistence | **COMPLETED** |
| PROD-2B B5 — IndexedDB autosave | Pendiente (próxima fase) |
| PROD-2B B6/B7 — UX gate / Cloud | Pendiente |

Detalle de persistencia worksheet y Visual Graph Builder: [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md).

---

## Gates principales

Ejecutar desde la raíz del repositorio.

| Comando | Alcance | Cuándo usarlo |
|---------|---------|---------------|
| `npm run validate:full` | Regresión general: PROD-2A, PROD-1, build, tsc, comparison-unit, E2E save/reload | CI / smoke test amplio del núcleo científico |
| `npm run validate:prod2b-b2-gate` | Umbrella PROD-2B B1+B2: multi-dataset, migración, invariantes A/B (17 sub-gates) | Certificar persistencia multi-dataset |
| `npm run validate:prod2c-c8-regression-gate` | Umbrella PROD-2C C4–C8: Visual Graph Builder persistido (5 sub-gates) | Certificar regresión VGB post-PROD-2C |

**Nota:** `validate:full` no incluye los gates PROD-2B B2 ni PROD-2C. Para certificar persistencia V2 completa, ejecutar también `validate:prod2b-b2-gate` y los gates PROD-2C según el cambio (ver README técnico).

Gates adicionales por microetapa: [`src/lib/project/README.md`](./src/lib/project/README.md#gates-técnicos).

---

## Roadmap

Ver [`ROADMAP.md`](./ROADMAP.md) para el detalle de hitos cerrados, fases PROD-2B pendientes (B5→B7) y candidatos de evolución (PROD-1B, ARCH-6 UX, SCI-58 v3, etc.).

**Próxima acción recomendada:** PROD-2B **B5 — IndexedDB autosave** ([`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md) §B5).
