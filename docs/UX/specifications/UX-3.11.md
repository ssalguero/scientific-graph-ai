# UX-3.11 — Runtime Diagnostics Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.11 — Runtime Diagnostics Foundation  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.10 Theme Runtime Metrics Foundation COMPLETE  

**Declaración:**

```text
UX-3.11 = Runtime Diagnostics Foundation (private infra)
SCOPE = DiagnosticLevel · DiagnosticCode · RuntimeDiagnostic
         · RuntimeDiagnosticBuilder · RuntimeDiagnosticEngine
         · RuntimeHealth · validate:ux-3.11
NO public API · NO visual behavior · NO React · NO hot-path wiring
Consumes RuntimeSnapshot + RuntimeMetricsSnapshot only
Next: UX-4.x DevTools / inspection consumers
```

---

## 1. Purpose

Add a private semantic diagnostics layer that interprets existing runtime
snapshots and metrics into a unified `RuntimeHealth` — without collecting new
data, mutating the runtime, or exposing UI / public APIs.

---

## 2. Architecture

```text
src/ui/theme/runtime/diagnostics/   (PRIVATE)
  DiagnosticLevel.ts
  DiagnosticCode.ts
  RuntimeDiagnostic.ts
  RuntimeDiagnosticBuilder.ts
  RuntimeDiagnosticEngine.ts
  RuntimeHealth.ts
  index.ts
```

### Flow

```text
RuntimeSnapshot
        │
        ▼
RuntimeMetricsSnapshot
        │
        ▼
RuntimeDiagnosticEngine.evaluate
        │
        ▼
RuntimeHealth
```

### Dependency star (frozen)

```text
diagnostics/  →  RuntimeSnapshot (type) · RuntimeMetricsSnapshot (type) · siblings
diagnostics/  ↛  React | providers | hooks | context | observer | Collector
                 | Notifier | Inspector | selectors | runtime/index | public barrels
```

No consumer imports `diagnostics/` in this phase.

---

## 3. Contracts

### 3.1 DiagnosticLevel / DiagnosticCode

`Object.freeze` + `as const` + derived union types. **No TypeScript `enum`.**

Levels: `OK` | `INFO` | `WARNING` | `ERROR`  
Codes: `EMPTY_REGISTRY` | `NO_THEME_REGISTERED` | `RESOLUTION_MISS` |
`CACHE_ACTIVITY_MISSING` | `OBSERVER_INACTIVE` | `METRICS_UNAVAILABLE`

### 3.2 RuntimeDiagnosticBuilder

Sole message/level SSOT:

- Private `DiagnosticMessages`
- Private `DiagnosticLevelsByCode`
- 1:1 correspondence with `DiagnosticCode`
- API: `build(code)` only → frozen `{ code, level, message }`

### 3.3 RULE_ORDER (Engine)

```ts
const RULE_ORDER = Object.freeze([
  DiagnosticCode.EMPTY_REGISTRY,
  DiagnosticCode.NO_THEME_REGISTERED,
  DiagnosticCode.RESOLUTION_MISS,
  DiagnosticCode.CACHE_ACTIVITY_MISSING,
  DiagnosticCode.OBSERVER_INACTIVE,
  DiagnosticCode.METRICS_UNAVAILABLE,
] as const);
```

Output order is exactly the relative order of fired rules in `RULE_ORDER`.

### 3.4 Rules

| Code | Predicate | Level |
|------|-----------|-------|
| `EMPTY_REGISTRY` | `tokenCount === 0` | ERROR |
| `NO_THEME_REGISTERED` | `themeName === ""` OR `fingerprint === ""` | ERROR |
| `RESOLUTION_MISS` | `cacheMisses > 0` | WARNING |
| `CACHE_ACTIVITY_MISSING` | `resolutions > 0 && cacheHits === 0 && cacheMisses === 0` | WARNING |
| `OBSERVER_INACTIVE` | `fingerprintChanges > 0 && observerNotifications === 0` | INFO |
| `METRICS_UNAVAILABLE` | `tokenCount > 0` && all six metric counters `=== 0` | WARNING |

`CACHE_ACTIVITY_MISSING` message (frozen):

> Heuristic only. Indicates no cache hit/miss activity was recorded while resolutions occurred. Does not assert the cache is disabled.

### 3.5 RuntimeHealth

```ts
{
  readonly healthy: boolean;       // errorCount === 0
  readonly warningCount: number;
  readonly errorCount: number;
  readonly diagnostics: ReadonlyArray<Readonly<RuntimeDiagnostic>>;
}
```

Warnings / Info do not flip `healthy`. No OK diagnostic is emitted when clean.

### 3.6 Engine purity

- No state, caches, Map/Set/WeakMap, observers, logging, timers, async
- Allocations only for the immutable result
- `evaluate` is deterministic

---

## 4. API Freeze

Not exported from:

- `@/ui` / `ui/index`
- `theme/index`
- `runtime/index`
- `hooks/index`
- `providers/index`

**Unchanged:** Resolver, Metrics, SnapshotBuilder, RuntimeNotifier,
RuntimeInspector, ThemeProvider, providers, hooks, context, DevTools pipelines.

Frozen for UX-3.12+: diagnostics contracts above.

---

## 5. Validation

```bash
npm run validate:ux-3.10
npm run validate:ux-3.11
```

Expected:

```text
validate:ux-3.11
PASS
```

---

## 6. Acceptance (CA-UX-3.11)

- [x] CA-UX-3.11.1 Folder `runtime/diagnostics` + private barrel
- [x] CA-UX-3.11.2 Frozen Level/Code (no enum)
- [x] CA-UX-3.11.3 Builder SSOT messages/levels; `build(code)` only
- [x] CA-UX-3.11.4 Frozen RuntimeDiagnostic
- [x] CA-UX-3.11.5 Exact RULE_ORDER + deterministic output order
- [x] CA-UX-3.11.6 Pure Engine
- [x] CA-UX-3.11.7 Health aggregates
- [x] CA-UX-3.11.8 Rule fixtures + clean case
- [x] CA-UX-3.11.9 No React / hooks / console / async / timers / `.tsx`
- [x] CA-UX-3.11.10 No public exports
- [x] CA-UX-3.11.11 No Map/Set/WeakMap; no Collector/Notifier/Observer
- [x] CA-UX-3.11.12 Import allowlist (snapshots + siblings)
- [x] CA-UX-3.11.13 Engine + Builder frozen
- [x] CA-UX-3.11.14 Typecheck
- [x] Prior `validate:ux-3.10` PASS

---

## Related

- [`docs/UX/UX-3.10.md`](./UX-3.10.md)
- [`docs/UX/UX-3.9.md`](./UX-3.9.md)
- [`docs/UX/UX-3.8.md`](./UX-3.8.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-4.x DevTools / diagnostics consumers
