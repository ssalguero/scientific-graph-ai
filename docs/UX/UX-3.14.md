# UX-3.14 — Runtime Telemetry Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.14 — Runtime Telemetry Foundation  
**Fecha:** 2026-08-01  
**Prerrequisitos:** UX-3.13 Runtime Health Aggregation Foundation COMPLETE  

**Declaración:**

```text
UX-3.14 = Runtime Telemetry Foundation (private infra)
SCOPE = RuntimeTelemetrySnapshot · RuntimeTelemetryBuilder
         · RuntimeTelemetryCollector · RuntimeTelemetryReporter
         · validate:ux-3.14
NO public API · NO visual behavior · NO React · NO Provider wiring
Composes RuntimeSnapshot + RuntimeMetricsSnapshot + RuntimeHealth
into immutable RuntimeTelemetrySnapshot
API FREEZE = create() · record() · build() · reset()
Next: UX-3.15 (placeholder)
```

---

## 1. Purpose

Add a private telemetry layer that consolidates already-frozen runtime state,
metrics, and health into a single immutable `RuntimeTelemetrySnapshot` —
without UI, public APIs, network, analytics, timers, or Theme Runtime pipeline
changes.

**`RuntimeTelemetrySnapshot` is an immutable composition snapshot.**  
**It is NOT a historical log.** There is no history, no ring buffer, and no
retention of past builds — only the current composition of three frozen
references plus a construction timestamp.

---

## 2. Architecture

```text
src/ui/theme/runtime/telemetry/   (PRIVATE)
  TelemetryTypes.ts                RuntimeTelemetrySnapshot type
  RuntimeTelemetryBuilder.ts       create() — sole constructor
  RuntimeTelemetryCollector.ts     class — record / build / reset
  RuntimeTelemetryReporter.ts      build(collector) — pure facade
  index.ts                         private barrel
```

### Flow

```text
RuntimeSnapshot
RuntimeMetricsSnapshot
RuntimeHealth
        │
        ▼
RuntimeTelemetryCollector.record(...)   // atomic overwrite of all three
        │
        ▼
Collector.build / Reporter.build(collector)
        │  Date.now() once; requires prior record
        ▼
RuntimeTelemetryBuilder.create(runtime, metrics, health, timestamp)
        │  timestamp trusted; freeze only
        ▼
RuntimeTelemetrySnapshot (frozen, shared refs)
```

### Dependency star (frozen)

```text
telemetry/  →  devtools/RuntimeSnapshot (type)
               metrics/RuntimeMetricsSnapshot (type)
               health/RuntimeHealth (type)
               siblings (Builder)
telemetry/  ↛  React | providers | hooks | context | observer
                | Notifier | Inspector | selectors | aggregation
                | runtime/index | public barrels
```

No consumer imports `telemetry/` in this phase. `runtime/index.ts` is untouched.

---

## 3. Ownership

| Owner | Owns | Does not own |
|-------|------|--------------|
| **Collector** | Mutable references to the three inputs (until `reset`) | Snapshot instances |
| **Snapshot** | Immutable references (frozen object holding shared frozen refs + timestamp) | Mutable collector fields |
| **Builder** | Nothing — pure constructor, no state | Inputs, timestamp source, collector |
| **Reporter** | Nothing — pure facade, no state | Collector internals |

---

## 4. Contracts

### 4.1 RuntimeTelemetrySnapshot

```ts
export type RuntimeTelemetrySnapshot = Readonly<{
  runtime: RuntimeSnapshot;
  metrics: RuntimeMetricsSnapshot;
  health: RuntimeHealth;
  timestamp: number;
}>;
```

- Exactly four fields — no arrays, no extra metadata, no history
- Every instance is `Object.freeze(...)` via Builder
- Nested inputs are shared frozen references (no copies)
- `timestamp` is construction-only metadata (`Date.now()` once in Collector)

### 4.2 RuntimeTelemetryBuilder

Sole constructor. Pure. Stateless.

```ts
export const RuntimeTelemetryBuilder = Object.freeze({ create });
```

`create(runtime, metrics, health, timestamp)`:

- Assign existing references — never clone
- **`timestamp` parameter is trusted** — no validate, no normalize, no negative check, no `Date.now()`
- No branching, no logic beyond assign + freeze
- Each `create()` returns a **newly frozen** instance

### 4.3 RuntimeTelemetryCollector

**Class** (instance-based — like `RuntimeAggregationAccumulator`).

Private fields: `runtime`, `metrics`, `health` — initially `null`.

| Method | Contract |
|--------|----------|
| `record(runtime, metrics, health)` | **Atomic full overwrite** — all three refs assigned together, never partial. O(1). No freeze/copy. |
| `build()` | **Precondition:** prior `record(...)`. If any stored ref is `null`, throws `Error("RuntimeTelemetryCollector has no recorded runtime.")`. Else `timestamp = Date.now()` once → `Builder.create(...)`. New frozen snapshot each call. Does **not** clear stored refs. |
| `reset()` | Sets all three refs to `null`. No allocations beyond field writes. |

Collector intentionally retains references. Mutable state is not exported.

### 4.4 RuntimeTelemetryReporter

```ts
export const RuntimeTelemetryReporter = Object.freeze({ build });
```

`build(collector)` returns `collector.build()` only. No state, cache, or logic.

### 4.5 Performance

`record` / `build` / `reset` are O(1). No Map/Set/WeakMap/WeakSet. No deep copies.
One object allocation + one freeze per `build()`.

---

## 5. API Freeze

Not exported from:

- `@/ui` / `ui/index`
- `theme/index`
- `runtime/index`
- `hooks/index`
- `providers/index`

Private barrel exports: type `RuntimeTelemetrySnapshot` · `RuntimeTelemetryBuilder` · `RuntimeTelemetryCollector` · `RuntimeTelemetryReporter`

**Allowed methods:** Builder `create` · Collector `record`/`build`/`reset` · Reporter `build`

**Unchanged:** Resolver, Metrics, Diagnostics, Health, Aggregation, Snapshots,
Observers, RuntimeNotifier, ThemeProvider, providers, hooks, context, DevTools
pipelines, `runtime/index.ts`.

---

## 6. Validation

```bash
npm run validate:ux-3.13
npm run validate:ux-3.14
```

Expected:

```text
validate:ux-3.14
PASS
18/18
```

---

## 7. Acceptance (CA-UX-3.14)

- [x] CA-UX-3.14.1 Immutable RuntimeTelemetrySnapshot (`Readonly<{...}>` + freeze)
- [x] CA-UX-3.14.2 Shared refs (`runtime` / `metrics` / `health` identity preserved)
- [x] CA-UX-3.14.3 Builder sole constructor; timestamp trusted; no `Date.now()`
- [x] CA-UX-3.14.4 Collector atomic `record`; `build` precondition throw; `reset`
- [x] CA-UX-3.14.5 Double-build: new instance, shared nested refs, monotonic timestamps
- [x] CA-UX-3.14.6 Reporter pure facade (`collector.build()` only)
- [x] CA-UX-3.14.7 Composition snapshot — NOT a historical log
- [x] CA-UX-3.14.8 No visible / functional changes
- [x] CA-UX-3.14.9 No Theme Runtime pipeline changes
- [x] CA-UX-3.14.10 100% private · API Freeze preserved
- [x] CA-UX-3.14.11 `validate:ux-3.14` PASS 18/18

---

## Related

- [`docs/UX/UX-3.13.md`](./UX-3.13.md)
- [`docs/UX/UX-3.12.md`](./UX-3.12.md)
- [`docs/UX/UX-3.10.md`](./UX-3.10.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-3.15 (placeholder — Runtime Health Service / consumer wiring TBD)
