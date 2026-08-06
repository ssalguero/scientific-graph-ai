# PROD-3 — Discovery: Exportación + DATA-3D VGB

**Estado:** **DISCOVERY ABIERTO (apertura PROD-3)**  
**Fecha de apertura:** 2026-07-09  
**Identificador:** PROD-3 (continúa PROD-2E)  
**Próxima microfase BUILD:** **D39 — DATA-3D Scatter Plot VGB**  
**Plan:** [`PROJECT_PLAN_PROD_3.md`](PROJECT_PLAN_PROD_3.md)  
**Status:** [`PROJECT_STATUS_PROD_3.md`](PROJECT_STATUS_PROD_3.md)

**Referencias:** [`MASTER_ROADMAP_V1.md`](MASTER_ROADMAP_V1.md) · [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) §6

---

## 1. Alcance PROD-3

| Épica | Microfases | Objetivo |
|-------|------------|----------|
| **DATA-3D** | D39 | Profesionalizar Scatter Plot VGB (tipo `scatter` v1) |
| **EXPORT-1+** | TBD | Exportación alta resolución (post-D39 según roadmap) |

---

## 2. API Freeze PROD-3 (Amend — Decisión J)

> Amend formal al API Freeze D25.4 ([`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) §6). **Aprobado** para BUILD D39.

### 2.1 Extensión semántica scatter v1 — `groupVariable`

| Aspecto | Decisión |
|---------|----------|
| **Qué cambia** | Activación de `groupVariable` en validación, build y preview scatter |
| **Tipo de cambio** | Extensión semántica del tipo **`scatter` v1** — **no** nuevo `graphType` |
| **schemaVersion** | **NO bump** |
| **Campos nuevos** | **Ninguno** — `groupVariable` ya persistible en `graphSpec` |

### 2.2 Tipos v1 — semántica inmutable salvo amend documentado

Los tipos `line`, `bar`, `histogram`, `boxPlot`, `violin` permanecen inalterados. Tipos PROD-2E (`heatmap`, `bubble`, `pca` cuando aplique) intactos.

### 2.3 VGB-R1

Reafirmado: `scatterPoints`, `preview`, `displaySeries` excluidos de `.sgproj`.

---

## 3. Decisiones arquitectónicas D39 (índice)

| ID | Tema |
|----|------|
| **A** | No nuevo array en `VisualGraphPreview` |
| **B** | Paleta grupos en renderer |
| **C** | markerSize clamp 2–20 |
| **E** | Contrato `VisualGraphPreviewPoint` |
| **G** | Scatter VGB ≠ Scatter Matrix SCI-40 |
| **H** | `buildVisualGraphSeries` — serie única flatten |
| **I** | Política cross-type `groupVariable` |
| **J** | Amend API Freeze PROD-3 (`groupVariable` scatter) |

---

*Discovery PROD-3 — apertura oficial. Amend API Freeze Decisión J aprobado para D39 BUILD.*
