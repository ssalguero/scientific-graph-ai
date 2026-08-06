# UX-3.16 — Runtime Report Snapshot Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.16 — Runtime Report Snapshot Foundation  
**Fecha:** 2026-08-01  
**Prerrequisitos:** UX-3.15 Runtime Telemetry Integration Foundation COMPLETE  

**Declaración:**

```text
UX-3.16 = Runtime Report Snapshot Foundation (private infra)
SCOPE = RuntimeReportSnapshot · RuntimeReportBuilder
         · RuntimeReportCollector · RuntimeReportReporter
         · validate:ux-3.16
NO public API · NO visual behavior · NO React · NO Provider wiring
NO RuntimeReporter integration
Composes RuntimeSnapshot + RuntimeMetricsSnapshot + RuntimeHealth
into immutable RuntimeReportSnapshot (no timestamp)
API FREEZE = create() · record() · build() · reset()
Next: UX-3.17 (placeholder)
```

---

## 1. Purpose / Objective

Introduce a private `RuntimeReportSnapshot` that represents the final
composed result of the Runtime pipeline — a single frozen object the rest
of the system can eventually depend on instead of reaching into
`RuntimeSnapshot`, `RuntimeMetricsSnapshot`, or `RuntimeHealth` directly.

**No wiring in this phase. RuntimeReporter integration is deferred.**

**`RuntimeReportSnapshot` is an immutable composition snapshot.**  
**It is NOT a historical log.** There is no history, no ring buffer, no
timestamp, and no retention of past builds — only the current composition
of three frozen references.

---

## 2. Architecture

```text
src/ui/theme/runtime/report/   (PRIVATE)
  RuntimeReportTypes.ts         RuntimeReportSnapshot interface
  RuntimeReportBuilder.ts       create() — sole constructor
  RuntimeReportCollector.ts     class — record / build / reset
  RuntimeReportReporter.ts      build(collector) — pure facade
  index.ts                      private barrel
```

Folder is intentionally `report/` — not `reporter/`, `reporting/`, or
`snapshot/` — so prior phase validators remain green.

### Flow

```text
RuntimeSnapshot
RuntimeMetricsSnapshot
RuntimeHealth
        │
        ▼
RuntimeReportCollector.record(runtime, metrics, health)
        │  atomic overwrite of all three
        ▼
Collector.build / Reporter.build(collector)
        │  requires prior record
        ▼
RuntimeReportBuilder.create(runtime, metrics, health)
        │  freeze only
        ▼
RuntimeReportSnapshot (frozen, shared refs)
```

### Dependency star (frozen)

```text
report/  →  devtools/RuntimeSnapshot (type)
            metrics/RuntimeMetricsSnapshot (type)
            health/RuntimeHealth (type)
            siblings (Builder)
report/  ↛  React | providers | hooks | context | observer
             | Notifier | Inspector | selectors | aggregation
             | telemetry | RuntimeReporter | runtime/index | public barrels
```

No consumer imports `report/` in this phase. `runtime/index.ts` and
`RuntimeReporter.ts` are untouched.

---

## 3. Ownership

| Owner | Owns | Does not own |
|-------|------|--------------|
| **Collector** | Mutable references to the three inputs (until `reset`) | Snapshot instances |
| **Snapshot** | Immutable references (frozen object holding shared frozen refs) | Mutable collector fields |
| **Builder** | Nothing — pure constructor, no state | Inputs, collector |
| **Reporter** | Nothing — pure facade, no state | Collector internals |

---

## 4. Contracts

### 4.1 RuntimeReportSnapshot

```ts
export interface RuntimeReportSnapshot {
  readonly runtime: RuntimeSnapshot;
  readonly metrics: RuntimeMetricsSnapshot;
  readonly health: RuntimeHealth;
}
```

- Exactly three fields — no timestamp, no arrays, no extra metadata, no history
- Every instance is `Object.freeze(...)` via Builder
- Nested inputs are shared frozen references (no copies)

### 4.2 RuntimeReportBuilder

Sole constructor. Pure. Stateless.

```ts
export const RuntimeReportBuilder = Object.freeze({ create });
```

`create(runtime, metrics, health)`:

- Assign existing references — never clone
- No validation, no normalization, no `Date.now()`
- No branching, no logic beyond assign + freeze
- Each `create()` returns a **newly frozen** instance

### 4.3 RuntimeReportCollector

**Class** (instance-based — like `RuntimeTelemetryCollector`).

Private fields: `runtime`, `metrics`, `health` — initially `null`.

| Method | Contract |
|--------|----------|
| `record(runtime, metrics, health)` | **Atomic overwrite** of all three references. O(1). No freeze/copy. |
| `build()` | **Precondition:** prior `record(...)`. If any stored ref is `null`, throws `Error("RuntimeReportCollector has no recorded runtime.")`. Else `Builder.create(...)`. New frozen snapshot each call. Does **not** clear stored refs. |
| `reset()` | Sets all three refs to `null`. No allocations beyond field writes. |

Collector intentionally retains references. Mutable state is not exported.

### 4.4 RuntimeReportReporter

```ts
export const RuntimeReportReporter = Object.freeze({ build });
```

`build(collector)` returns `collector.build()` only. No state, cache, or logic.

### 4.5 Performance

`record` / `build` / `reset` are O(1). No Map/Set/WeakMap/WeakSet. No deep copies.
One object allocation + one freeze per `build()`.

---

## 5. Restrictions

Do **not** modify:

- `RuntimeReporter.ts`
- `runtime/index.ts` or any public barrel
- `RuntimeSnapshot` · `RuntimeMetrics*` · `RuntimeHealth*`
- `RuntimeTelemetry*` · Aggregation · Theme Engine · UI

Do **not** introduce:

- observers · events · memoization · caches · logging · diagnostics
- React · providers · wiring into the Runtime pipeline

---

## 6. API Freeze

Not exported from:

- `@/ui` / `ui/index`
- `theme/index`
- `runtime/index`
- `hooks/index`
- `providers/index`

Private barrel exports: type `RuntimeReportSnapshot` · `RuntimeReportBuilder` ·
`RuntimeReportCollector` · `RuntimeReportReporter`

**Allowed methods:** Builder `create` · Collector `record`/`build`/`reset` ·
Reporter `build`

**Unchanged:** Resolver, Metrics, Diagnostics, Health, Aggregation, Telemetry,
RuntimeReporter, Snapshots, Observers, RuntimeNotifier, ThemeProvider,
providers, hooks, context, DevTools pipelines, `runtime/index.ts`.

**API Freeze respected for UX-3.12 → UX-3.15** — those layers are untouched.

---

## 7. Validation

```bash
npm run validate:ux-3.16
```

Expected:

```text
validate:ux-3.16
PASS
14/14
```

Also must remain green for this phase (repo scripts):

```bash
npx eslint src/ui/theme/runtime/report scripts/validate-ux-3.16.ts
npx tsc --noEmit   # also covered by validate tscCompile
```

> Note: this repository has no `typecheck` / `test` npm scripts; typecheck is
> enforced via `npx tsc --noEmit` inside `validate:ux-3.16`.

---

## 8. Acceptance (CA-UX-3.16)

- [x] CA-UX-3.16.1 Immutable RuntimeReportSnapshot (`readonly` fields + `Object.isFrozen === true`)
- [x] CA-UX-3.16.2 Shared refs (`runtime` / `metrics` / `health` identity preserved)
- [x] CA-UX-3.16.3 Builder sole constructor; no `Date.now()`; no branching
- [x] CA-UX-3.16.4 Collector atomic `record`; `build` precondition throw; `reset`; build does not clear
- [x] CA-UX-3.16.5 Reporter pure facade (`return collector.build();` only)
- [x] CA-UX-3.16.6 No wiring · no React · no Provider · RuntimeReporter untouched
- [x] CA-UX-3.16.7 100% private · API Freeze preserved · no public barrel leaks
- [x] CA-UX-3.16.8 `validate:ux-3.16` PASS 14/14
- [x] CA-UX-3.16.9 No visible / functional changes
- [x] CA-UX-3.16.10 No impact on UX-3.12 → UX-3.15

---

## Related

- [`docs/UX/UX-3.15.md`](./UX-3.15.md)
- [`docs/UX/UX-3.14.md`](./UX-3.14.md)
- [`docs/UX/UX-3.12.md`](./UX-3.12.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-3.17 — Runtime Report integration (deferred)
