# UX-3.17 — Runtime Diagnostics Integration Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.17 — Runtime Diagnostics Integration Foundation  
**Fecha:** 2026-08-01  
**Prerrequisitos:** UX-3.16 Runtime Report Snapshot Foundation COMPLETE  

**Declaración:**

```text
UX-3.17 = Runtime Diagnostics Integration Foundation (private wiring)
SCOPE = RuntimeReporter · validate:ux-3.17
NO public API · NO visual behavior · NO React · NO Provider wiring
Pipeline = Snapshot → Metrics → Health → Aggregation → Telemetry → Report
           → return runtimeReport.health
Aggregation + Telemetry built and discarded
RuntimeReport = last private snapshot
API FREEZE (untouched) = RuntimeSnapshot · RuntimeMetricsSnapshot
                          · RuntimeHealth · RuntimeAggregation
                          · RuntimeTelemetrySnapshot · RuntimeReportSnapshot
RELEASED = UX-3.13 → UX-3.17 Runtime Diagnostics Foundation
Next: UX-4.x Consumers
```

---

## 1. Purpose

Close the private Runtime Diagnostics architecture by wiring Aggregation,
Telemetry, and Report into a single deterministic `RuntimeReporter` pipeline —
without changing public APIs, ThemeProvider, or visible behavior.

`RuntimeReport` is the final private snapshot. The sole public output remains
`Readonly<RuntimeHealth>` sourced from `runtimeReport.health`.

---

## 2. Architecture

```text
src/ui/theme/runtime/RuntimeReporter.ts   (PRIVATE — runtime root)

Layers (frozen — not modified in this phase):
  aggregation/   UX-3.13
  telemetry/     UX-3.14
  report/        UX-3.16

NOT re-exported from runtime/index.ts or any public barrel
```

### Ownership

| Role | Responsibility |
|------|----------------|
| `RuntimeReporter` | Coordinates the pipeline only |
| `SnapshotBuilder` | Builds `RuntimeSnapshot` |
| `RuntimeMetricsReporter` | Reads `RuntimeMetricsSnapshot` |
| `RuntimeHealthReporter` | Builds intermediate `RuntimeHealth` |
| `RuntimeAggregationReporter` | Sole entry that produces `RuntimeAggregation` (discarded) |
| `RuntimeTelemetryReporter` | Sole entry that produces `RuntimeTelemetrySnapshot` (discarded) |
| `RuntimeReportReporter` | Sole entry that produces `RuntimeReportSnapshot` |
| Return | `runtimeReport.health` only |

### Encapsulation (locked)

`RuntimeReporter` **knows Reporters, never Builders**.

Allowed:

```ts
RuntimeAggregationReporter.build(aggregation)
RuntimeTelemetryReporter.build(telemetry)
RuntimeReportReporter.build(report)
```

Forbidden:

- `RuntimeAggregationBuilder` / `RuntimeTelemetryBuilder` / `RuntimeReportBuilder`
- Direct `aggregation.build()` / `telemetry.build()` / `report.build()`

---

## 3. Final pipeline

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
return runtimeReport.health
```

Collectors and accumulator are created **per `build()`** — no singleton,
cache, memo, or module mutable state.

---

## 4. API Freeze

Untouched (do not modify types, builders, collectors, or layer barrels):

- `RuntimeSnapshot`
- `RuntimeMetricsSnapshot`
- `RuntimeHealth`
- `RuntimeAggregation`
- `RuntimeTelemetrySnapshot`
- `RuntimeReportSnapshot`
- `aggregation/` · `telemetry/` · `report/` implementations

`RuntimeReporter` API Freeze:

```text
build(runtime: ThemeRuntime): Readonly<RuntimeHealth>
```

Barrel freeze: `runtime/index.ts` remains unchanged — no `RuntimeReporter`,
no aggregation/telemetry/report re-exports.

---

## 5. Restrictions

Do **not** introduce:

- persistence · IndexedDB · logs · console · public metrics
- React · hooks · context · provider · ThemeProvider wiring
- memo · callbacks · render · UI · unit tests
- `Date.now` · `performance.now` · timers · `Math.random`
- `Map` · `WeakMap` · `Set` · global mutable state

Do **not** modify `aggregation/`, `telemetry/`, or `report/` in this phase.

---

## 6. Validation

```bash
npm run validate:ux-3.17
```

Expected:

```text
validate:ux-3.17
PASS
```

Also remain green:

```bash
npm run validate:ux-3.13
npm run validate:ux-3.14
npm run validate:ux-3.15
npm run validate:ux-3.16
```

---

## 7. Acceptance (CA-UX-3.17)

- [x] CA-UX-3.17.1 `RuntimeReporter` orchestrates Snapshot → Metrics → Health → Aggregation → Telemetry → Report → `return runtimeReport.health`
- [x] CA-UX-3.17.2 Uses `RuntimeReportReporter`; Report is the last private snapshot
- [x] CA-UX-3.17.3 `RuntimeHealth` remains the sole public output (`runtimeReport.health` — never `return health`)
- [x] CA-UX-3.17.4 Imports only Reporters + Collectors/Accumulator — no Builders; no collector/accumulator `.build()`
- [x] CA-UX-3.17.5 Deterministic — no Date.now / performance.now / Math.random / timers / console / Map|Set|WeakMap / global state
- [x] CA-UX-3.17.6 No public API / ThemeProvider / visible changes; layers `aggregation/` · `telemetry/` · `report/` untouched
- [x] CA-UX-3.17.7 `validate:ux-3.17` PASS; updated `validate:ux-3.15` / `validate:ux-3.16` PASS; `validate:ux-3.13` / `3.14` PASS unchanged

---

## 8. Release notes

**UX-3.13 → UX-3.17 Runtime Diagnostics Foundation is RELEASED.**

Private infrastructure is consolidated and the pipeline is fully connected.
No consumer-visible changes. API Freeze preserved.

**Next:** UX-4.x Consumers (diagnostic overlays, optional telemetry, internal panels).

---

## Related

- [`docs/UX/UX-3.16.md`](./UX-3.16.md)
- [`docs/UX/UX-3.15.md`](./UX-3.15.md)
- [`docs/UX/UX-3.14.md`](./UX-3.14.md)
- [`docs/UX/UX-3.13.md`](./UX-3.13.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)
