# UX-3.19 — Runtime Pipeline Encapsulation Finalization

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.19 — Runtime Pipeline Encapsulation Finalization  
**Fecha:** 2026-08-01  
**Prerrequisitos:** UX-3.18 Runtime Report Integration (Pipeline Finalization) COMPLETE  

**Declaración:**

```text
UX-3.19 = Runtime Pipeline Encapsulation Finalization
SCOPE = extract orchestration → RuntimePipeline · validate:ux-3.19
NO public API · NO visual behavior · NO React · NO Provider wiring
Pipeline = Snapshot → Metrics → Health → Aggregation → Telemetry → Report
           → return report (RuntimeReportSnapshot)
RuntimeReporter = facade only (RuntimePipeline.run → return report)
RuntimeReport = conceptual name for RuntimeReportSnapshot (no new type)
API FREEZE = RuntimeReporter.build · RuntimePipeline.run
             aggregation/ · telemetry/ · report/ · health/ · metrics/
             snapshot layers · builders · collectors · public barrels
Next: UX-4.x Consumers of unified private RuntimeReportSnapshot
```

---

## 1. Purpose / Objetivo

Finalizar la encapsulación privada del runtime extrayendo toda la
orquestación interna desde `RuntimeReporter` hacia `RuntimePipeline`, de modo
que el reporter sea únicamente el punto de acceso al estado runtime y no
conozca ningún paso interno.

No hay cálculos nuevos, ni lógica nueva, ni cambios funcionales. Sólo se
reorganiza la arquitectura interna preservando la API de UX-3.18.

---

## 2. Cambio realizado

Antes (UX-3.18):

```ts
function build(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  // Snapshot → Metrics → Health → Aggregation → Telemetry → Report
  const runtimeReport = RuntimeReportReporter.build(report);
  return runtimeReport;
}
```

Después (UX-3.19):

```ts
// RuntimeReporter.ts
function build(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  const report = RuntimePipeline.run(runtime);
  return report;
}

// pipeline/RuntimePipeline.ts
function run(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  // Snapshot → Metrics → Health → Aggregation → Telemetry → Report
  const runtimeReport = RuntimeReportReporter.build(report);
  return runtimeReport;
}
```

### Corrección respecto del brief preliminar

La línea `return report.health` es un remanente obsoleto de UX-3.17.
UX-3.18 cambió el artefacto raíz a `Readonly<RuntimeReportSnapshot>`; por
tanto UX-3.19 usa definitivamente:

```ts
const report = RuntimePipeline.run(runtime);
return report;
```

Decisiones arquitectónicas:

- `RuntimeReporter.build()` **no** se renombra — firma y retorno congelados.
- `RuntimePipeline.run(...)` es el único punto de orquestación del pipeline.
- **No** se crea un tipo `RuntimeReport`; el tipo real sigue siendo
  `RuntimeReportSnapshot`.
- Sin barrel `pipeline/index.ts`.

---

## 3. Arquitectura / Pipeline

```text
RuntimeReporter.build(runtime)
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
return report          // RuntimeReporter — sin transformación
```

```text
runtime/
  RuntimeReporter.ts          ← facade (build → pipeline.run)
  pipeline/
    RuntimePipeline.ts        ← orquestación privada (run)
  # builders / collectors / tipos permanecen donde están
```

---

## 4. Archivos modificados / creados

| Archivo | Acción |
|---------|--------|
| `src/ui/theme/runtime/pipeline/RuntimePipeline.ts` | Creado — orquestación |
| `src/ui/theme/runtime/RuntimeReporter.ts` | Reducido a delegación |
| `docs/UX/UX-3.19.md` | Creado |
| `scripts/validate-ux-3.19.ts` | Creado |
| `package.json` | `validate:ux-3.19` |
| `scripts/validate-ux-3.15.ts` | Pipeline checks → `RuntimePipeline.ts` |
| `scripts/validate-ux-3.16.ts` | Orquestación Report → `RuntimePipeline.ts` |
| `scripts/validate-ux-3.17.ts` | Pipeline checks → `RuntimePipeline.ts` |
| `scripts/validate-ux-3.18.ts` | Pipeline checks → `RuntimePipeline.ts`; reporter = facade |

**No modificados:** `aggregation/`, `telemetry/`, `report/`, `health/`,
`metrics/`, `devtools/`, ThemeProvider, hooks, components, barrels públicos,
builders, collectors, tipos.

---

## 5. API Freeze / Invariantes

```text
RuntimeReporter.build(runtime): Readonly<RuntimeReportSnapshot>
RuntimePipeline.run(runtime): Readonly<RuntimeReportSnapshot>
```

Debe seguir siendo cierto:

```text
Snapshot → Metrics → Health → Aggregation → Telemetry → Report
```

sin atajos, sin Builders desde el pipeline, sin
`collector/accumulator.build()`, sin leaks públicos.

Encapsulación:

- `RuntimeReporter` no importa capas internas (solo `RuntimePipeline` + types)
- `RuntimePipeline` permanece privado (no re-exportado)
- Layers congeladas
- API pública sin cambios (compatible UX-3.18)
- Cero cambios visuales / React / Provider

---

## 6. Validation

```bash
npm run validate:ux-3.19
```

Expected:

```text
validate:ux-3.19
PASS
```

Also remain green:

```bash
npm run validate:ux-3.15
npm run validate:ux-3.16
npm run validate:ux-3.17
npm run validate:ux-3.18
```

---

## 7. Acceptance (CA-UX-3.19)

- [x] CA-UX-3.19.1 `RuntimePipeline` encapsula Snapshot → … → Report
- [x] CA-UX-3.19.2 `RuntimeReporter` solo invoca `RuntimePipeline.run` y `return report`
- [x] CA-UX-3.19.3 Firma pública `Readonly<RuntimeReportSnapshot>`; sin tipo `RuntimeReport`
- [x] CA-UX-3.19.4 Sin transformación / clone / spread / mapping en el reporter
- [x] CA-UX-3.19.5 `RuntimePipeline` privado; sin barrels públicos nuevos
- [x] CA-UX-3.19.6 `aggregation/` · `telemetry/` · `report/` no modificados
- [x] CA-UX-3.19.7 Cero cambios funcionales vs UX-3.18
- [x] CA-UX-3.19.8 `validate:ux-3.19` PASS; gates heredados PASS; tsc PASS

---

## 8. Release notes

**UX-3.19 Runtime Pipeline Encapsulation Finalization is COMPLETE.**

La orquestación interna del runtime queda completamente aislada en
`RuntimePipeline`. A partir de este punto, cualquier evolución futura del
pipeline (nuevas etapas, instrumentación o diagnósticos) podrá realizarse
dentro de `RuntimePipeline` sin afectar `RuntimeReporter` ni la interfaz
pública del sistema.

**Next:** UX-4.x Consumers.

---

## Related

- [`docs/UX/UX-3.18.md`](./UX-3.18.md)
- [`docs/UX/UX-3.17.md`](./UX-3.17.md)
- [`docs/UX/UX-3.16.md`](./UX-3.16.md)
- [`src/ui/theme/runtime/RuntimeReporter.ts`](../../src/ui/theme/runtime/RuntimeReporter.ts)
- [`src/ui/theme/runtime/pipeline/RuntimePipeline.ts`](../../src/ui/theme/runtime/pipeline/RuntimePipeline.ts)
