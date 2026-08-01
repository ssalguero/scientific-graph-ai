# UX-3.13 — Runtime Health Aggregation Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.13 — Runtime Health Aggregation Foundation  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.12 Runtime Health Integration Foundation COMPLETE  

**Declaración:**

```text
UX-3.13 = Runtime Health Aggregation Foundation (private infra)
SCOPE = RuntimeAggregation · RuntimeAggregationBuilder
         · RuntimeAggregationAccumulator · RuntimeAggregationReporter
         · validate:ux-3.13
NO public API · NO visual behavior · NO React · NO Provider wiring
Aggregates consecutive RuntimeHealth samples into scalar RuntimeAggregation
API FREEZE = create() · record() · build() · reset()
Next: UX-3.14 (placeholder)
```

---

## 1. Purpose

Add a private aggregation layer that summarizes consecutive composed
`RuntimeHealth` samples into an immutable scalar `RuntimeAggregation` —
without UI, public APIs, timers, persistence, or Theme Runtime pipeline changes.

---

## 2. Architecture

```text
src/ui/theme/runtime/aggregation/   (PRIVATE)
  RuntimeAggregation.ts              Readonly<{...}> scalar type
  RuntimeAggregationBuilder.ts       create() — sole constructor (folder-private)
  RuntimeAggregationAccumulator.ts   class — record / build / reset
  RuntimeAggregationReporter.ts      build(accumulator) — pure facade
  index.ts                           private barrel (Builder NOT exported)
```

### Flow

```text
RuntimeHealth
        │
        ▼
RuntimeAggregationAccumulator.record
        │  (scalar sums only — never retains Health)
        ▼
Accumulator.build / Reporter.build
        │
        ▼
RuntimeAggregationBuilder.create
        │
        ▼
RuntimeAggregation (frozen)
```

### Dependency star (frozen)

```text
aggregation/  →  health/RuntimeHealth (type)
                 health/RuntimeHealthStatus (OK|WARNING|ERROR)
                 siblings (Builder)
aggregation/  ↛  React | providers | hooks | context | observer
                  | Collector | Notifier | Inspector | selectors
                  | runtime/index | public barrels
```

No consumer imports `aggregation/` in this phase. `runtime/index.ts` is untouched.

---

## 3. Contracts

### 3.1 RuntimeAggregation

```ts
export type RuntimeAggregation = Readonly<{
  totalSamples: number;
  okCount: number;
  warningCount: number;
  errorCount: number;
  averageResolutionCount: number;
  averageFallbackCount: number;
  averageObserverCount: number;
  averageDiagnosticCount: number;
}>;
```

- Scalars only — no arrays, references, timestamps, or history
- Every instance is `Object.freeze(...)` via Builder
- Uses `Readonly<{...}>` wrapper style (not per-field `readonly`)

### 3.2 Official mapping (`record(health)`)

| Aggregation field | Source |
|---|---|
| `totalSamples` | `+= 1` |
| `okCount` | `health.status === OK` |
| `warningCount` | `health.status === WARNING` |
| `errorCount` | `health.status === ERROR` |
| `averageResolutionCount` | avg of `health.metrics.resolutions` |
| `averageFallbackCount` | avg of `health.metrics.cacheMisses` |
| `averageObserverCount` | avg of `health.metrics.observerNotifications` |
| `averageDiagnosticCount` | avg of `health.diagnostics.length` |

No new fields on RuntimeHealth / Metrics / Diagnostics.

### 3.3 Average computation

```text
average = totalSamples === 0 ? 0 : sum / totalSamples
```

Native JavaScript division only. No rounding, truncation, or formatting.

### 3.4 RuntimeAggregationBuilder

Sole constructor. Pure. No accumulation. No average math. No cache.

```ts
export const RuntimeAggregationBuilder = Object.freeze({ create });
```

Each `create()` returns a **newly frozen** `RuntimeAggregation` — never caches
or returns a previously built instance.

**Not exported** from the private barrel.

### 3.5 RuntimeAggregationAccumulator

**Class** (instance-based — unlike `RuntimeMetricsCollector` module singleton).

Internal scalars only:

`totalSamples`, `okCount`, `warningCount`, `errorCount`,
`sumResolutions`, `sumFallbacks`, `sumObservers`, `sumDiagnostics`

| Method | Contract |
|---|---|
| `record(health)` | O(1); updates scalars from mapping; never stores Health |
| `build()` | Pure w.r.t. mutation; averages via native division; `Builder.create`; **new frozen instance each call** |
| `reset()` | Zeros all scalars; no allocations |

### 3.6 RuntimeAggregationReporter

```ts
export const RuntimeAggregationReporter = Object.freeze({ build });
```

`build(accumulator)` returns `accumulator.build()` only. No state, cache, or logic.

### 3.7 Performance

`record` / `build` / `reset` are O(1). No Map/Set/WeakMap/WeakSet. No history arrays.

---

## 4. API Freeze

Not exported from:

- `@/ui` / `ui/index`
- `theme/index`
- `runtime/index`
- `hooks/index`
- `providers/index`

Private barrel exports: type `RuntimeAggregation` · `RuntimeAggregationAccumulator` · `RuntimeAggregationReporter`

**Allowed methods:** Builder `create` · Accumulator `record`/`build`/`reset` · Reporter `build`

**Unchanged:** Resolver, Metrics, Diagnostics, Health*, Snapshots, Observers,
RuntimeNotifier, ThemeProvider, providers, hooks, context, DevTools pipelines,
`runtime/index.ts`.

---

## 5. Validation

```bash
npm run validate:ux-3.12
npm run validate:ux-3.13
```

Expected:

```text
validate:ux-3.13
PASS
10/10
```

---

## 6. Acceptance (CA-UX-3.13)

- [x] CA-UX-3.13.1 Immutable RuntimeAggregation (`Readonly<{...}>` + freeze)
- [x] CA-UX-3.13.2 Accumulator never retains RuntimeHealth
- [x] CA-UX-3.13.3 `record()` O(1)
- [x] CA-UX-3.13.4 `build()` pure; new instance each call (`a !== b`)
- [x] CA-UX-3.13.5 Builder sole constructor (not barrel-exported)
- [x] CA-UX-3.13.6 No visible / functional changes
- [x] CA-UX-3.13.7 No Theme Runtime pipeline changes
- [x] CA-UX-3.13.8 100% private
- [x] CA-UX-3.13.9 API Freeze preserved
- [x] CA-UX-3.13.10 `validate:ux-3.13` PASS

---

## Related

- [`docs/UX/UX-3.12.md`](./UX-3.12.md)
- [`docs/UX/UX-3.11.md`](./UX-3.11.md)
- [`docs/UX/UX-3.10.md`](./UX-3.10.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-3.14 (placeholder — Runtime Health Service / consumer wiring TBD)
