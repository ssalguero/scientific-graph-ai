# UX-3.20 — Runtime Diagnostics Facade Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.20 — Runtime Diagnostics Facade Foundation  
**Fecha:** 2026-08-01  
**Prerrequisitos:** UX-3.19 Runtime Pipeline Encapsulation Finalization COMPLETE  

**Declaración:**

```text
UX-3.20 = Runtime Diagnostics Facade Foundation
SCOPE = RuntimeDiagnostics.collect → RuntimePipeline.run · validate:ux-3.20
NO public API · NO visual behavior · NO React · NO Provider wiring
Facade = RuntimeDiagnostics (unique private caller of RuntimePipeline)
RuntimeReporter = delegates to RuntimeDiagnostics.collect → return report
Pipeline = Snapshot → Metrics → Health → Aggregation → Telemetry → Report
           → return report (RuntimeReportSnapshot)
API FREEZE = RuntimeReporter.build · RuntimePipeline.run
             RuntimeDiagnostics.collect
             aggregation/ · telemetry/ · report/ · health/ · metrics/
             snapshot layers · builders · collectors · public barrels
Next: UX-4.x Consumers / instrumentation extensions behind the facade
```

---

## 1. Purpose / Objetivo

Introducir una fachada privada única (`RuntimeDiagnostics`) para todo el
sistema de diagnóstico Runtime, de modo que el resto del proyecto no conozca
`RuntimePipeline` ni las capas internas (Snapshot, Metrics, Health,
Aggregation, Telemetry, Report).

No hay cálculos nuevos, ni lógica nueva, ni cambios funcionales. Sólo se
reorganiza la arquitectura interna preservando las firmas de UX-3.18/3.19.

---

## 2. Corrección del brief

UX-3.20 corrige el wording obsoleto de UX-3.17.  
`RuntimeDiagnostics.collect()` devuelve `Readonly<RuntimeReportSnapshot>`,
alineado con `RuntimePipeline.run()` y `RuntimeReporter.build()`.

**Nunca** proyectar `.health`.

---

## 3. Cambio realizado

Antes (UX-3.19):

```ts
function build(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  const report = RuntimePipeline.run(runtime);
  return report;
}
```

Después (UX-3.20):

```ts
// RuntimeReporter.ts
function build(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  const report = RuntimeDiagnostics.collect(runtime);
  return report;
}

// diagnostics/RuntimeDiagnostics.ts
function collect(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  const report = RuntimePipeline.run(runtime);
  return report;
}
```

Decisiones arquitectónicas:

- Se **reutiliza** `runtime/diagnostics/` de UX-3.11 (no se crea carpeta nueva).
- `RuntimeDiagnostics` se agrega junto al DiagnosticEngine; el barrel privado
  exporta ambos sin leaks públicos.
- `RuntimeReporter` importa `RuntimeDiagnostics` por path directo (no barrel).
- `RuntimePipeline` permanece byte-for-byte funcionalmente idéntico.

---

## 4. Arquitectura / Fachada privada

```text
ThemeProvider          (sin cambios — no importa facade/pipeline)
    │
RuntimeReporter.build
    │
RuntimeDiagnostics.collect
    │
RuntimePipeline.run
    │
Snapshot → Metrics → Health → Aggregation → Telemetry → Report
    │
RuntimeReportSnapshot
```

### Responsabilidades

| Módulo | Responsabilidad |
|--------|-----------------|
| `RuntimeReporter` | API privada de reporting; solo `build` → `collect` |
| `RuntimeDiagnostics` | Única fachada sobre el pipeline; solo `collect` → `run` |
| `RuntimePipeline` | Orquestación Snapshot…Report (intacta) |
| Capas internas | Sin modificaciones |

### Encapsulación

Después de UX-3.20, el resto del sistema no debe conocer:

- `RuntimePipeline`
- `RuntimeSnapshot` / SnapshotBuilder (vía orquestación)
- `RuntimeMetrics` (vía orquestación)
- `RuntimeHealth` (vía orquestación)
- `RuntimeAggregation`
- `RuntimeTelemetry`
- `RuntimeReport` (conceptual; tipo real = `RuntimeReportSnapshot`)

Todo queda detrás de `RuntimeDiagnostics` (y el reporter que la invoca).

---

## 5. Flujo completo

```text
RuntimeReporter.build(runtime)
    ↓
RuntimeDiagnostics.collect(runtime)
    ↓
RuntimePipeline.run(runtime)
    ↓
SnapshotBuilder.build(runtime)
    ↓
RuntimeMetricsReporter.getSnapshot()
    ↓
RuntimeHealthReporter.build(snapshot, metrics)
    ↓
RuntimeAggregationAccumulator.record(health)
RuntimeAggregationReporter.build(aggregation)     ← discarded
    ↓
RuntimeTelemetryCollector.record(snapshot, metrics, health)
RuntimeTelemetryReporter.build(telemetry)         ← discarded
    ↓
RuntimeReportCollector.record(snapshot, metrics, health)
RuntimeReportReporter.build(report)
    ↓
return runtimeReport   // Readonly<RuntimeReportSnapshot>
    ↓
return report          // Diagnostics — sin transformación
    ↓
return report          // Reporter — sin transformación
```

---

## 6. Archivos modificados / creados

| Archivo | Acción |
|---------|--------|
| `src/ui/theme/runtime/diagnostics/RuntimeDiagnostics.ts` | Creado — fachada `collect` |
| `src/ui/theme/runtime/diagnostics/index.ts` | Exporta `RuntimeDiagnostics` |
| `src/ui/theme/runtime/RuntimeReporter.ts` | Delega a `RuntimeDiagnostics.collect` |
| `docs/UX/UX-3.20.md` | Creado |
| `scripts/validate-ux-3.20.ts` | Creado |
| `package.json` | `validate:ux-3.20` |
| `scripts/validate-ux-3.11.ts` | Incluye facade + imports permitidos |
| `scripts/validate-ux-3.16.ts` | Reporter → Diagnostics |
| `scripts/validate-ux-3.18.ts` | Delegación en Diagnostics |
| `scripts/validate-ux-3.19.ts` | Pipeline imports en Diagnostics |

**No modificados:** `pipeline/`, `aggregation/`, `telemetry/`, `report/`,
`health/`, `metrics/`, `devtools/` (snapshot), ThemeProvider, hooks,
components, barrels públicos, DiagnosticEngine.

---

## 7. Invariantes

```text
Nunca:  ThemeProvider → RuntimePipeline
Nunca:  RuntimeReporter → RuntimePipeline
Siempre: RuntimeReporter → RuntimeDiagnostics → RuntimePipeline
```

Imports de `RuntimePipeline` solo dentro de:

- `runtime/pipeline/`
- `runtime/diagnostics/`

---

## 8. API Freeze

```text
RuntimeReporter.build(runtime): Readonly<RuntimeReportSnapshot>
RuntimeDiagnostics.collect(runtime): Readonly<RuntimeReportSnapshot>
RuntimePipeline.run(runtime): Readonly<RuntimeReportSnapshot>
```

Sin transformación / clone / spread / mapping / `.health` projection en
Reporter ni Diagnostics.

Barrels públicos intactos. ThemeProvider intacto.

---

## 9. Validation

```bash
npm run validate:ux-3.20
```

Expected:

```text
validate:ux-3.20
PASS
```

Also remain green:

```bash
npm run validate:ux-3.19
npm run validate:ux-3.18
npm run validate:ux-3.16
npm run validate:ux-3.11
npx tsc --noEmit
```

---

## 10. Acceptance (CA-UX-3.20)

- [x] CA-UX-3.20.1 `RuntimeDiagnostics` existe; `collect`; `Object.freeze`; retorno `Readonly<RuntimeReportSnapshot>`
- [x] CA-UX-3.20.2 `RuntimeReporter` importa Diagnostics (no Pipeline); solo delega
- [x] CA-UX-3.20.3 Diagnostics importa Pipeline + types; sin Builder/Collector/Accumulator/layer Reporters
- [x] CA-UX-3.20.4 Pipeline orquestación intacta Snapshot→…→Report
- [x] CA-UX-3.20.5 Capas runtime intactas
- [x] CA-UX-3.20.6 Firmas / barrels públicos / ThemeProvider congelados
- [x] CA-UX-3.20.7 Invariantes de encapsulación
- [x] CA-UX-3.20.8 `validate:ux-3.20` PASS; gates heredados PASS; tsc PASS

---

## 11. Release notes

**UX-3.20 Runtime Diagnostics Facade Foundation is COMPLETE.**

La infraestructura interna del runtime queda oculta detrás de una única
fachada privada. Futuras extensiones (instrumentación, tracing o múltiples
estrategias de diagnóstico) pueden evolucionar detrás de
`RuntimeDiagnostics` sin exponer cambios al resto del sistema.

**Next:** UX-4.x Consumers / extensions behind the facade.

---

## Related

- [`docs/UX/UX-3.19.md`](./UX-3.19.md)
- [`docs/UX/UX-3.18.md`](./UX-3.18.md)
- [`docs/UX/UX-3.11.md`](./UX-3.11.md)
- [`src/ui/theme/runtime/diagnostics/RuntimeDiagnostics.ts`](../../src/ui/theme/runtime/diagnostics/RuntimeDiagnostics.ts)
- [`src/ui/theme/runtime/RuntimeReporter.ts`](../../src/ui/theme/runtime/RuntimeReporter.ts)
- [`src/ui/theme/runtime/pipeline/RuntimePipeline.ts`](../../src/ui/theme/runtime/pipeline/RuntimePipeline.ts)
