# PROJECT_STATUS — PROD-2E

**Épica:** PROD-2E — Motor gráfico profesional  
**Estado épica:** **OPEN** (D25 CLOSED — Ready for D26)  
**SSOT Plan:** [`PROJECT_PLAN_PROD_2E.md`](PROJECT_PLAN_PROD_2E.md)  
**Discovery:** [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md)  
**Baseline:** [`PROJECT_BASELINE_PROD_2E.md`](PROJECT_BASELINE_PROD_2E.md)

---

## §D25 — Discovery + Baseline + Plan Freeze + API Freeze + Acta

**Estado:** **CLOSED** (2026-07-09)  
**Modo:** BUILD STRICT — documentación únicamente  
**Próxima microfase:** **D26 — DATA-3B Heatmap**

### D25.1 — Discovery

| Campo | Valor |
|-------|-------|
| **Entregable** | [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) |
| **Alcance IN** | DATA-3B (heatmap, bubble, pca) · GRAPH-1 · GRAPH-2 · ARCH-5 F5F-BIS + SCI-40 |
| **Alcance OUT** | EXPORT-* · PROD-1B · QA-2 · schemaVersion bump |
| **Decisión tipo #3** | **pca** (vs clustering) — menor acoplamiento VGB |
| **Amend SCI-40** | **Escenario B** activo (8.532 LOC > 1.000) |
| **Resultado** | **PASS** |

### D25.2 — Baseline

| Campo | Valor |
|-------|-------|
| **Entregable** | [`PROJECT_BASELINE_PROD_2E.md`](PROJECT_BASELINE_PROD_2E.md) |
| **LOC page.tsx** | 26.476 |
| **LOC visualGraphBuilder.ts** | 637 |
| **SCI-40 inline** | ~8.532 LOC |
| **F5F-BIS inline** | ~718 LOC |
| **Script medición** | `scripts/measure-prod2e-baseline-perf.ts` |
| **Preview scatter median** | 0.0474 ms |
| **Hydrate mono median** | 0.5591 ms |
| **Resultado** | **PASS** |

### D25.3 — Plan Freeze

| Campo | Valor |
|-------|-------|
| **Entregable** | [`PROJECT_PLAN_PROD_2E.md`](PROJECT_PLAN_PROD_2E.md) |
| **Calendario** | D25 → D36 (Escenario B SCI-40) |
| **Checklist cierre épica** | 0/9 (OPEN) |
| **Resultado** | **PASS** |

### D25.4 — API Freeze VGB

| Campo | Valor |
|-------|-------|
| **SSOT** | [`PROJECT_DISCOVERY_PROD_2E.md`](PROJECT_DISCOVERY_PROD_2E.md) §6 |
| **Tipos nuevos** | `heatmap`, `bubble`, `pca` |
| **Campos opcionales** | `sizeVariable`, `colorVariable`, `pcaVariables`, `pcaStandardize`, `publicationPresetId` |
| **schemaVersion** | **NO bump** |
| **VGB-R1** | Reafirmado |
| **Compatibilidad V2** | Proyectos existentes sin pérdida |
| **Resultado** | **PASS** |

### D25.5 — Acta + cierre D25

#### CA-D25 — Certificación (7/7)

| ID | Criterio | Evidencia | Resultado |
|----|----------|-----------|-----------|
| **CA-D25-01** | Discovery PASS | `PROJECT_DISCOVERY_PROD_2E.md` completo | **PASS** |
| **CA-D25-02** | Baseline PASS | LOC + SCI-40 + rendimiento gráfico | **PASS** |
| **CA-D25-03** | API Freeze PASS | §6 Discovery + Plan § D25.4 | **PASS** |
| **CA-D25-04** | Plan congelado PASS | `PROJECT_PLAN_PROD_2E.md` D25→D36 | **PASS** |
| **CA-D25-05** | Sanity Gate PASS | VGB gates PASS; prod2d-gate ver nota | **PASS CONDICIONADO** |
| **CA-D25-06** | Handoff D26 autorizado | Prerequisitos verificados abajo | **PASS** |
| **CA-D25-07** | 0 cambios funcionales | Sin cambios `src/` producto | **PASS** |

**Total CA-D25: 7/7 PASS** (CA-D25-05 condicionado per L-D23-2)

#### Nota CA-D25-05 — Sanity Gate

| Gate | Resultado | Detalle |
|------|-----------|---------|
| `validate:prod2c-c8-regression-gate` | **PASS** | 5/5 sub-gates |
| `validate:visual-graph-builder-unit` | **PASS** | 10/10 |
| `validate:chart-viewport` | **PASS** | 9/9 |
| `validate:arch5-f5-modularization-gate` | **PASS** | 11 casos (prod2d-gate sub) |
| `validate:visibility-unit` | **PASS** | 30 casos |
| `validate:project-history-unit` | **PASS** | 26 casos |
| `validate:prod2b-b2-gate` | **PASS** (standalone, 18 sub-gates) | Ejecutado post-D25; no regresión persistencia |
| `validate:prod2d-gate` | **FAIL infra** | Solo `validate:full` en contexto umbrella — política L-D23-2 |

D25 no modifica código; fallo umbrella atribuido a infraestructura E2E preexistente, no regresión PROD-2E.

#### Handoff D26

```text
D25 CLOSED — Ready for D26
Prerequisitos D26:
  ✓ API Freeze §6 congelado (heatmap, bubble, pca)
  ✓ Baseline LOC + rendimiento capturado
  ✓ Plan D26–D36 congelado
  ✓ 0 cambios funcionales D25
  ✓ Gates VGB C4–C8 PASS
Next BUILD: D26 — DATA-3B Heatmap
```

#### Archivos D25

| Acción | Archivo |
|--------|---------|
| **Creado** | `PROJECT_DISCOVERY_PROD_2E.md` |
| **Creado** | `PROJECT_BASELINE_PROD_2E.md` |
| **Creado** | `PROJECT_PLAN_PROD_2E.md` |
| **Creado** | `PROJECT_STATUS_PROD_2E.md` |
| **Creado** | `scripts/measure-prod2e-baseline-perf.ts` (medición read-only) |

**No modificados:** `src/**`, README, ROADMAP, MASTER (sync en D36.5).

---

## Cronología PROD-2E

```text
D25 Discovery + Baseline + Plan + API Freeze ✓ (CLOSED)
  ↓
D26 DATA-3B Heatmap (READY)
  ↓
D27 Bubble → D28 PCA → D29–D30 GRAPH-1 → D31–D32 GRAPH-2
  ↓
D33 F5F-BIS → D34–D35 SCI-40 (Escenario B) → D36 Cierre
```

---

## Deuda carry-in (sin cambio D25)

| ID | Item | Target |
|----|------|--------|
| F5F-BIS | UI SCI-50–56 ~718 LOC | D33 |
| SCI-40 | Multivariante ~8.532 LOC | D34–D35 |
| CURVES-INLINE | Motor curvas page.tsx | D31–D32 |
| L-D23-2 | E2E flakiness | QA-2 |

---

*Acta D25 certificada 2026-07-09 · D25 CLOSED · Next: D26 BUILD.*
