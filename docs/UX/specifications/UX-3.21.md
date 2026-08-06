# UX-3.21 — Runtime Final Certification

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.21 — Runtime Final Certification & Release Validation  
**Fecha:** 2026-08-01  
**Prerrequisitos:** UX-3.20 Runtime Diagnostics Facade Foundation COMPLETE  

**Declaración:**

```text
UX-3.21 = Runtime Final Certification & Release Validation
SCOPE = documentation + certification gate only · validate:ux-3.21
NO Runtime source changes · NO new APIs · NO new types
NO public API · NO visual behavior · NO React · NO Provider wiring
Certified chain =
  RuntimeReporter.build
    → RuntimeDiagnostics.collect
      → RuntimePipeline.run
        → Snapshot → Metrics → Health → Aggregation → Telemetry → Report
        → Readonly<RuntimeReportSnapshot>
API FREEZE = definitive (UX-3.18–3.20 contracts unchanged)
Result = Runtime Certified · UX Runtime API Frozen · Release Ready
Next: UX-4 — Runtime Host Integration + Lovable App Shell
      → docs/UX/UX-4.0-roadmap.md (SSOT · FROZEN · Version 1.0)
```

---

## 1. Purpose / Objetivo

Cerrar oficialmente la serie UX-3 certificando que el Runtime UI permanece
fiel a los contratos congelados en UX-3.0–UX-3.20.

Esta fase **no incorpora características nuevas** y **no modifica** ningún
módulo Runtime. Solo verifica y documenta el estado Release Certified.

---

## 2. Corrección del brief

UX-3.21 certifica la arquitectura **real** congelada en UX-3.18–3.20, no el
wording obsoleto del brief original.

| Brief (obsoleto) | Arquitectura certificada |
|------------------|--------------------------|
| Pipeline: Snapshot → Validation → Collector → Report | Snapshot → Metrics → Health → Aggregation → Telemetry → Report |
| Reporter → `RuntimePipeline.run` | `RuntimeReporter.build` → `RuntimeDiagnostics.collect` → `RuntimePipeline.run` |
| “Public Adapter” como único export público | **NO** public Runtime diagnostics API; fachada privada = `RuntimeDiagnostics` |
| Validation como paso del pipeline | Theme Validation es **independiente** del diagnostics pipeline |

---

## 3. Resumen UX-3.0 → UX-3.21

| Fase | Hito |
|------|------|
| UX-3.0–3.7 | Foundation theme / tokens / hooks / validation seams |
| UX-3.8–3.10 | Snapshot / metrics / health layers |
| UX-3.11 | Diagnostics folder + DiagnosticEngine |
| UX-3.12–3.14 | Aggregation / telemetry foundations |
| UX-3.15–3.16 | Report composition (`RuntimeReportSnapshot`) + Collector |
| UX-3.17–3.18 | Pipeline orchestration + Report integration |
| UX-3.19 | Pipeline encapsulation finalization |
| UX-3.20 | RuntimeDiagnostics private facade |
| **UX-3.21** | **Final certification · series CLOSED** |

---

## 4. Arquitectura final certificada

```text
ThemeProvider          (sin wiring Runtime diagnostics)
    │
RuntimeReporter.build
    │
RuntimeDiagnostics.collect     ← única fachada privada
    │
RuntimePipeline.run
    │
Snapshot
    ↓
Metrics
    ↓
Health
    ↓
Aggregation          ← built then discarded
    ↓
Telemetry            ← built then discarded
    ↓
Report
    ↓
Readonly<RuntimeReportSnapshot>   { runtime, metrics, health }
```

### Responsabilidades congeladas

| Módulo | Responsabilidad |
|--------|-----------------|
| `RuntimeReporter` | API privada de reporting; solo `build` → `collect` |
| `RuntimeDiagnostics` | Única fachada sobre el pipeline; solo `collect` → `run` |
| `RuntimePipeline` | Orquestación Snapshot…Report |
| Capas internas | Snapshot / Metrics / Health / Aggregation / Telemetry / Report |
| Theme Validation | Independiente — no conoce Reporter / Diagnostics / Pipeline |

---

## 5. API Freeze definitivo

```text
RuntimeReporter.build(runtime): Readonly<RuntimeReportSnapshot>
RuntimeDiagnostics.collect(runtime): Readonly<RuntimeReportSnapshot>
RuntimePipeline.run(runtime): Readonly<RuntimeReportSnapshot>
```

Sin transformación / clone / spread / mapping / proyección `.health` en
Reporter ni Diagnostics.

`RuntimeReportSnapshot` = exactamente:

```ts
{
  readonly runtime: RuntimeSnapshot;
  readonly metrics: RuntimeMetricsSnapshot;
  readonly health: RuntimeHealth;
}
```

Sin `timestamp`. Sin metadata adicional. Referencias congeladas.

`RuntimeReportCollector` expone únicamente: `record` · `build` · `reset`.

`RuntimePipeline` = `Object.freeze({ run })`.

---

## 6. Público vs privado

### Público (barrels)

[`src/ui/index.ts`](../../src/ui/index.ts),
[`src/ui/theme/index.ts`](../../src/ui/theme/index.ts),
[`src/ui/theme/runtime/index.ts`](../../src/ui/theme/runtime/index.ts),
hooks / providers — **nunca** exportan:

- `RuntimePipeline`
- `RuntimeReporter`
- `RuntimeDiagnostics`
- `RuntimeReportSnapshot`

### Privado (certificado)

- Cadena Reporter → Diagnostics → Pipeline → capas
- Collectors / Builders / layer Reporters
- Theme Validation (`ThemeValidator`, `ThemeValidationAdapter`) — seam
  independiente, no adapter público de diagnostics

No existe public Runtime Diagnostics adapter.

---

## 7. Sin cambios de código Runtime

UX-3.21 **no modifica**:

- RuntimeReporter / RuntimeDiagnostics / RuntimePipeline
- Snapshot / Report / Collector / Metrics / Health / Aggregation / Telemetry
- Theme Validation / Types / Adapter
- Public barrels / Hooks / Providers
- Validadores anteriores (`validate-ux-3.15` … `validate-ux-3.20`)

Archivos de esta fase:

| Archivo | Acción |
|---------|--------|
| `scripts/validate-ux-3.21.ts` | Creado — certification gate |
| `package.json` | `validate:ux-3.21` |
| `docs/UX/UX-3.21.md` | Creado — esta certificación |

---

## 8. Validation

```bash
npm run validate:ux-3.15
npm run validate:ux-3.16
npm run validate:ux-3.17
npm run validate:ux-3.18
npm run validate:ux-3.19
npm run validate:ux-3.20
npm run validate:ux-3.21
```

Expected for UX-3.21:

```text
validate:ux-3.21
PASS
Runtime Certified
UX Runtime API Frozen
Release Ready
11/11
```

Certification blocks:

| Block | CA |
|-------|-----|
| apiFreeze | CA-UX-3.21.1 |
| pipelineFreeze | CA-UX-3.21.2 |
| snapshotFreeze | CA-UX-3.21.3 |
| collectorFreeze | CA-UX-3.21.4 |
| reportFreeze | CA-UX-3.21.5 |
| reporterFreeze | CA-UX-3.21.6 |
| validationIndependence | CA-UX-3.21.7 |
| publicLayerFreeze | CA-UX-3.21.8 |
| noReactNoUiNoApp | CA-UX-3.21.9 |
| priorGates (3.15–3.20) | CA-UX-3.21.10 |
| tscCompile | CA-UX-3.21.11 |

---

## 9. Acceptance (CA-UX-3.21)

- [x] CA-UX-3.21.1 Firmas congeladas Reporter / Diagnostics / Pipeline; barrels públicos limpios
- [x] CA-UX-3.21.2 Pipeline exacto Snapshot→Metrics→Health→Aggregation→Telemetry→Report; `Object.freeze({ run })`
- [x] CA-UX-3.21.3 RuntimeSnapshot readonly / sin timestamp / shape escalar
- [x] CA-UX-3.21.4 RuntimeReportCollector solo record/build/reset
- [x] CA-UX-3.21.5 RuntimeReportSnapshot = { runtime, metrics, health }; frozen; sin ciclos
- [x] CA-UX-3.21.6 Reporter → Diagnostics → Pipeline; cuerpos mínimos
- [x] CA-UX-3.21.7 Theme Validation independiente
- [x] CA-UX-3.21.8 Sin public diagnostics adapter; ThemeProvider sin wiring
- [x] CA-UX-3.21.9 Cadena diagnostics sin React / UI / App
- [x] CA-UX-3.21.10 priorGates 3.15–3.20 PASS
- [x] CA-UX-3.21.11 `npx tsc --noEmit` PASS

---

## 10. Release notes

**UX-3 CLOSED · Runtime Release Certified.**

La serie UX-3 queda oficialmente cerrada. El runtime de UI se considera
estable, congelado y listo como base de futuras evoluciones (UX-4.x), sin
introducir cambios funcionales ni romper los contratos establecidos en
UX-3.0–UX-3.20.

```text
Runtime Certified
UX Runtime API Frozen
Release Ready
```

**Next:** UX-4 — Runtime Host Integration + Lovable App Shell  
SSOT: [`docs/UX/UX-4.0-roadmap.md`](./UX-4.0-roadmap.md) (FROZEN · Version 1.0)

```text
Objective:
  Mount the certified Theme Runtime into the application (host-scoped).
  Introduce the Lovable App Shell defined in ux/docs/LAYOUT.md.
  Progressively migrate application chrome to consume the runtime
  instead of legacy UI_TOKENS.
```

---

## Related

- [`docs/UX/UX-4.0-roadmap.md`](./UX-4.0-roadmap.md) — **Next series SSOT**
- [`docs/UX/UX-3.20.md`](./UX-3.20.md)
- [`docs/UX/UX-3.19.md`](./UX-3.19.md)
- [`docs/UX/UX-3.18.md`](./UX-3.18.md)
- [`scripts/validate-ux-3.21.ts`](../../scripts/validate-ux-3.21.ts)
- [`src/ui/theme/runtime/RuntimeReporter.ts`](../../src/ui/theme/runtime/RuntimeReporter.ts)
- [`src/ui/theme/runtime/diagnostics/RuntimeDiagnostics.ts`](../../src/ui/theme/runtime/diagnostics/RuntimeDiagnostics.ts)
- [`src/ui/theme/runtime/pipeline/RuntimePipeline.ts`](../../src/ui/theme/runtime/pipeline/RuntimePipeline.ts)
