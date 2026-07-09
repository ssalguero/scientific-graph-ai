# Plan PROD-3 — Exportación + DATA-3D VGB

**Estado:** **PLAN OPERATIVO (apertura PROD-3)**  
**Fecha de apertura:** 2026-07-09  
**Identificador:** PROD-3  
**Discovery:** [`PROJECT_DISCOVERY_PROD_3.md`](PROJECT_DISCOVERY_PROD_3.md)  
**Status:** [`PROJECT_STATUS_PROD_3.md`](PROJECT_STATUS_PROD_3.md)  
**Master Roadmap:** [`MASTER_ROADMAP_V1.md`](MASTER_ROADMAP_V1.md) — amend DATA-3D

---

## Épicas

| Épica | Microfases | Objetivo |
|-------|------------|----------|
| **DATA-3D** | D39 | Scatter Plot VGB profesional (upgrade `scatter` v1) |
| **EXPORT-1** | TBD | Export VGB alta resolución (post-D39) |

---

## D39 — DATA-3D Scatter Plot VGB (XY)

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Paridad estructural con Bubble/Heatmap sobre tipo `scatter` v1 |
| **Prerrequisitos** | PROD-2E CLOSED · Amend API Freeze PROD-3 (Decisión J) · docs PROD-3 |
| **Dominio** | `buildScatterPointsFromWorksheet`, Decisiones H/I |
| **UI** | `ScatterPreview.tsx`, groupVariable + marker UI |
| **Golden fixture** | `project-v2-dataset5-with-scatter-pro.sgproj` |
| **Gate** | `validate:prod3-data3d-gate` |

### Subfases

| Subfase | Entregable |
|---------|------------|
| D39.1 | Discovery + gobernanza |
| D39.2 | Dominio VGB |
| D39.3 | Preview + UI |
| D39.4 | Tests + golden + gates |
| D39.5 | Documentación + acta |
| D39.6 | Cierre D39 |

---

## Secuencia

```text
[Apertura PROD-3 + Amend API Freeze J]
  ↓
D39 DATA-3D Scatter
  ↓
EXPORT-1 (TBD)
```

---

*Plan operativo PROD-3 — apertura 2026-07-09.*
