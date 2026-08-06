# UX-3.18 — Runtime Report Integration (Pipeline Finalization)

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.18 — Runtime Report Integration (Pipeline Finalization)  
**Fecha:** 2026-08-01  
**Prerrequisitos:** UX-3.17 Runtime Diagnostics Integration Foundation COMPLETE  

**Declaración:**

```text
UX-3.18 = Runtime Report Integration (Pipeline Finalization)
SCOPE = RuntimeReporter return type · validate:ux-3.18
NO public API · NO visual behavior · NO React · NO Provider wiring
Pipeline = Snapshot → Metrics → Health → Aggregation → Telemetry → Report
           → return runtimeReport (RuntimeReportSnapshot)
RuntimeReport = conceptual name for RuntimeReportSnapshot (no new type)
API FREEZE (untouched) = aggregation/ · telemetry/ · report/ · health/
                          · metrics/ · snapshot layers · builders · collectors
Next: UX-4.x Consumers of unified private RuntimeReportSnapshot
```

---

## 1. Purpose / Objetivo

Completar definitivamente el pipeline interno de Runtime Diagnostics haciendo
que `RuntimeReporter` retorne el artefacto raíz completo
`Readonly<RuntimeReportSnapshot>` en lugar de proyectar solo
`runtimeReport.health`.

No hay cálculos nuevos, ni lógica nueva, ni cambios funcionales en las capas.
Sólo cambia el objeto retornado por el orquestador privado.

---

## 2. Cambio realizado

Antes (UX-3.17):

```ts
function build(runtime: ThemeRuntime): Readonly<RuntimeHealth> {
  // ... pipeline ...
  const runtimeReport = RuntimeReportReporter.build(report);
  return runtimeReport.health;
}
```

Después (UX-3.18):

```ts
function build(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
  // ... pipeline idéntico ...
  const runtimeReport = RuntimeReportReporter.build(report);
  return runtimeReport;
}
```

Decisiones arquitectónicas:

- `build()` **no** se renombra — no existe `report()`.
- **No** se crea un tipo `RuntimeReport`; el tipo real sigue siendo
  `RuntimeReportSnapshot`.
- “RuntimeReport” es únicamente un nombre conceptual en documentación.

---

## 3. Pipeline actualizado

```text
ThemeRuntime
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
```

`RuntimeReportSnapshot` pasa a ser el único artefacto raíz del pipeline
interno de diagnóstico.

---

## 4. Archivos modificados / creados

| Archivo | Acción |
|---------|--------|
| `src/ui/theme/runtime/RuntimeReporter.ts` | Firma + `return runtimeReport` |
| `docs/UX/UX-3.18.md` | Creado |
| `scripts/validate-ux-3.18.ts` | Creado |
| `package.json` | `validate:ux-3.18` |
| `scripts/validate-ux-3.15.ts` | Actualizado a esperar `RuntimeReportSnapshot` |
| `scripts/validate-ux-3.16.ts` | Assertion RuntimeReporter alineada a UX-3.18 |
| `scripts/validate-ux-3.17.ts` | Actualizado a esperar `RuntimeReportSnapshot` |

**No modificados:** `aggregation/`, `telemetry/`, `report/`, `health/`,
`metrics/`, `devtools/`, ThemeProvider, hooks, barrels públicos.

---

## 5. Validación arquitectónica

Debe seguir siendo cierto:

```text
Snapshot → Metrics → Health → Aggregation → Telemetry → Report → RuntimeReporter
```

sin atajos, sin Builders desde el orquestador, sin
`collector/accumulator.build()`, sin leaks públicos.

Encapsulación intacta:

- Layers congeladas
- API pública sin cambios
- Cero cambios visuales
- `RuntimeReporter` sigue privado (no re-exportado)

---

## 6. Validation

```bash
npm run validate:ux-3.18
```

Expected:

```text
validate:ux-3.18
PASS
```

Also remain green:

```bash
npm run validate:ux-3.13
npm run validate:ux-3.14
npm run validate:ux-3.15
npm run validate:ux-3.16
npm run validate:ux-3.17
```

---

## 7. Acceptance (CA-UX-3.18)

- [x] CA-UX-3.18.1 `RuntimeReporter.build` retorna `RuntimeReportSnapshot`
- [x] CA-UX-3.18.2 Firma `Readonly<RuntimeReportSnapshot>`; sin tipo `RuntimeReport`
- [x] CA-UX-3.18.3 Pipeline completo preservado; `return runtimeReport`
- [x] CA-UX-3.18.4 Sin imports nuevos fuera del set permitido (+ type import)
- [x] CA-UX-3.18.5 `aggregation/` · `telemetry/` · `report/` no modificados
- [x] CA-UX-3.18.6 Encapsulación (Reporters only) intacta
- [x] CA-UX-3.18.7 Cero cambios públicos / ThemeProvider / visuales
- [x] CA-UX-3.18.8 `validate:ux-3.18` PASS; gates heredados PASS

---

## 8. Release notes

**UX-3.18 Runtime Report Integration is COMPLETE.**

El sistema queda consolidado con `RuntimeReportSnapshot` como artefacto raíz
privado del pipeline, dejando preparada la infraestructura para que futuras
fases de UX consuman un reporte unificado sin exponer detalles internos.

**Next:** UX-4.x Consumers.

---

## Related

- [`docs/UX/UX-3.17.md`](./UX-3.17.md)
- [`docs/UX/UX-3.16.md`](./UX-3.16.md)
- [`docs/UX/UX-3.15.md`](./UX-3.15.md)
- [`src/ui/theme/runtime/RuntimeReporter.ts`](../../src/ui/theme/runtime/RuntimeReporter.ts)
