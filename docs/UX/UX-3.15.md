# UX-3.15 — Runtime Telemetry Integration Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.15 — Runtime Telemetry Integration Foundation  
**Fecha:** 2026-08-01  
**Prerrequisitos:** UX-3.14 Runtime Telemetry Foundation COMPLETE  

**Declaración:**

```text
UX-3.15 = Runtime Telemetry Integration Foundation (private wiring)
SCOPE = RuntimeReporter · validate:ux-3.15
NO public API · NO visual behavior · NO React · NO Provider wiring
Pipeline = Snapshot → Metrics → Health → Telemetry → return Health
Telemetry built internally and discarded
API FREEZE (untouched) = RuntimeSnapshot · RuntimeMetricsSnapshot
                          · RuntimeHealth · RuntimeAggregation
                          · RuntimeTelemetrySnapshot
Next: UX-3.16 (placeholder)
```

---

## 1. Purpose

Integrate the private Runtime Telemetry layer (UX-3.14) into an internal
reporting orchestrator without changing observable Theme Runtime behavior,
public barrels, or ThemeProvider.

`RuntimeReporter` is the sole new runtime module. It coordinates existing
private facades and returns `RuntimeHealth` only.

---

## 2. Architecture

```text
src/ui/theme/runtime/RuntimeReporter.ts   (PRIVATE — runtime root)

NOT under health/ | aggregation/ | telemetry/
NOT re-exported from runtime/index.ts or any public barrel
```

### Ownership

| Role | Responsibility |
|------|----------------|
| `RuntimeReporter` | Coordinates the pipeline only |
| `SnapshotBuilder` | Builds `RuntimeSnapshot` |
| `RuntimeMetricsReporter` | Reads `RuntimeMetricsSnapshot` |
| `RuntimeHealthReporter` | Builds `RuntimeHealth` |
| `RuntimeTelemetryCollector` | Owns temporary refs (`record` only from Reporter) |
| `RuntimeTelemetryReporter` | **Sole** entry that produces `RuntimeTelemetrySnapshot` |

Aggregation remains a sibling layer — **outside** this pipeline.

### Pipeline

```text
ThemeRuntime
    ↓
SnapshotBuilder.build(runtime)
    ↓
RuntimeMetricsReporter.getSnapshot()
    ↓
RuntimeHealthReporter.build(snapshot, metrics)
    ↓
RuntimeTelemetryCollector.record(snapshot, metrics, health)
    ↓
RuntimeTelemetryReporter.build(collector)   ← result discarded
    ↓
return RuntimeHealth
```

### Encapsulation (locked)

`RuntimeReporter` must **never**:

- call `collector.build()`
- import or invoke `RuntimeTelemetryBuilder`

Telemetry may **only** be produced through:

```ts
RuntimeTelemetryReporter.build(collector)
```

### Reference sharing

Same `RuntimeSnapshot`, `RuntimeMetricsSnapshot`, and `RuntimeHealth`
instances flow into telemetry — O(1) shared refs, no clone / copy / recreate.

Collector is created **per `build()` invocation** — no singleton, cache, or memo.

---

## 3. API Freeze

Untouched (do not modify types, builders, or validators):

- `RuntimeSnapshot`
- `RuntimeMetricsSnapshot`
- `RuntimeHealth`
- `RuntimeAggregation`
- `RuntimeTelemetrySnapshot`

`RuntimeReporter` API Freeze:

```text
build(runtime: ThemeRuntime): Readonly<RuntimeHealth>
```

Barrel freeze: [`src/ui/theme/runtime/index.ts`](../../src/ui/theme/runtime/index.ts) remains unchanged — no `RuntimeReporter`, no telemetry references.

---

## 4. Implementation notes

- One file created under runtime root; no new folders.
- Telemetry construction is an internal side effect; the snapshot is discarded.
- Public return value is exactly the `RuntimeHealth` from `RuntimeHealthReporter`.
- No ThemeProvider / hooks / providers / console / timers / persistence.

---

## 5. Gate

```text
npm run validate:ux-3.15
```

---

## 6. Acceptance (CA-UX-3.15)

- [x] CA-UX-3.15.1 `RuntimeReporter` exists only at `runtime/RuntimeReporter.ts`
- [x] CA-UX-3.15.2 API = `Object.freeze({ build })` only
- [x] CA-UX-3.15.3 Pipeline order Snapshot → Metrics → Health → record → TelemetryReporter.build → return health
- [x] CA-UX-3.15.4 Never references `collector.build` or `RuntimeTelemetryBuilder`
- [x] CA-UX-3.15.5 `runtime/index.ts` untouched (no RuntimeReporter / telemetry)
- [x] CA-UX-3.15.6 No public barrel leaks
- [x] CA-UX-3.15.7 No console / React / Provider / ThemeProvider
- [x] CA-UX-3.15.8 `build(runtime)` returns frozen `RuntimeHealth`; telemetry internal-only
- [x] CA-UX-3.15.9 Shared snapshot / metrics / health refs (source + behavioral)
- [x] CA-UX-3.15.10 Prior gates (`validate:ux-3.14`) continue PASS; `tsc` clean

---

## Related

- [`docs/UX/UX-3.14.md`](./UX-3.14.md)
- [`docs/UX/UX-3.13.md`](./UX-3.13.md)
- [`docs/UX/UX-3.12.md`](./UX-3.12.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-3.16 (placeholder)
