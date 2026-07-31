# UX-3.10 — Theme Runtime Metrics Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.10 — Theme Runtime Metrics Foundation  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.9 Theme Runtime Observers Foundation COMPLETE  

**Declaración:**

```text
UX-3.10 = Theme Runtime Metrics Foundation (private infra)
SCOPE = RuntimeMetrics · RuntimeMetricsCollector · RuntimeMetricsSnapshot
         · RuntimeMetricsReporter · hot-path record* wiring · validate:ux-3.10
NO public API · NO visual behavior · NO React in metrics layer
API FREEZE = absolute (names + signatures)
O(1) allocation-free increments · immutable snapshots on demand
Next: UX-3.11 Runtime Diagnostics Foundation
```

---

## 1. Purpose

Incorporar una infraestructura privada de Runtime Metrics para recolectar contadores internos del Theme Runtime sin modificar el comportamiento del sistema.

Permite (en fases posteriores):

- performance profiling
- debug interno
- herramientas DevTools
- diagnóstico de invalidaciones
- benchmarking de temas

Sin:

- API pública nueva
- UI / DevTools visuales
- React / hooks / Context / effects / refs
- timers / console / logs / async
- cambios a contratos públicos

---

## 2. Name collision (explicit)

Two unrelated modules share the basename `RuntimeMetrics.ts`:

| Path | Phase | Domain |
|------|-------|--------|
| `src/ui/theme/tokens/runtime/RuntimeMetrics.ts` | UX-3.4.4 | Opt-in Benchmark + PerformanceCounters aggregate; **untouched by UX-3.10** |
| `src/ui/theme/runtime/metrics/RuntimeMetrics.ts` | UX-3.10 | Private scalar counter **type** for Theme Runtime hot-path metrics |

They must never be confused or merged.

---

## 3. Architecture

```text
src/ui/theme/runtime/metrics/          (PRIVATE)
  RuntimeMetrics.ts              type (six readonly scalars)
  RuntimeMetricsCollector.ts     SSOT + frozen namespace
  RuntimeMetricsSnapshot.ts      immutable freeze helper
  RuntimeMetricsReporter.ts      getSnapshot / reset
  index.ts                       private barrel
```

### Dependency diagram

```text
ThemeTokenResolver
        │
        ▼
RuntimeMetricsCollector  ◄── RuntimeNotifier
        ▲
SnapshotBuilder
        │
        ▼
RuntimeMetricsReporter
        │
        ▼
RuntimeMetricsSnapshot
```

| Role | Module |
|------|--------|
| Producers | ThemeTokenResolver, RuntimeNotifier, SnapshotBuilder |
| Collector (SSOT) | RuntimeMetricsCollector — six module-level scalars |
| Reporter | RuntimeMetricsReporter — read/reset facade |
| Immutable snapshot | RuntimeMetricsSnapshot — allocation only on request |

### Star dependency rules

```text
metrics/  ↛  providers/ | context/ | observer/ | devtools/ | selectors/ | React
Resolver | Notifier | SnapshotBuilder | Reporter  →  metrics/
TokenCache  ↛  metrics/   (hit/miss recorded in Resolver only)
```

---

## 4. Contract Invariants (Freeze)

### 4.1 RuntimeMetrics

```ts
export type RuntimeMetrics = {
  readonly resolutions: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly fingerprintChanges: number;
  readonly observerNotifications: number;
  readonly snapshots: number;
};
```

### 4.2 RuntimeMetricsCollector — frozen SSOT

```ts
export const RuntimeMetricsCollector = Object.freeze({
  recordResolution,
  recordCacheHit,
  recordCacheMiss,
  recordFingerprintChange,
  recordObserverNotifications,
  recordSnapshot,
  getCounters,
  resetCounters,
});
```

- Exactly six module-level `let` scalars
- No Map / Set / WeakMap / WeakSet / arrays / history
- `record*` are O(1) and allocation-free
- `recordObserverNotifications(count)` increments by observer count (plural naming)

### 4.3 RuntimeMetricsSnapshot

`createRuntimeMetricsSnapshot(metrics)` copies six scalars and `Object.freeze`s the result. Allocations allowed **only** here (and Reporter-facing `getCounters` plain object for the copy source — never inside `record*`).

### 4.4 RuntimeMetricsReporter — frozen

```ts
export const RuntimeMetricsReporter = Object.freeze({
  getSnapshot,
  reset,
});
```

`reset()` is for internal benchmarks only.

### 4.5 API Freeze

Metrics symbols remain private. Not exported from:

- `@/ui` / `ui/index`
- `theme/index`
- `runtime/index`
- `hooks/index`
- `providers/index`

Frozen for UX-3.11+: `RuntimeMetrics`, `RuntimeMetricsCollector`, `RuntimeMetricsReporter`, `RuntimeMetricsSnapshot`.

---

## 5. Wiring map (unique sites)

| Counter | Unique site |
|---------|-------------|
| `resolutions` / `cacheHits` / `cacheMisses` | `ThemeTokenResolver.resolve` |
| `fingerprintChanges` / `observerNotifications` | `RuntimeNotifier.notifyIfChanged` (when fingerprints differ) |
| `snapshots` | `SnapshotBuilder.build` **only** |

Explicitly **not** instrumented:

- TokenCache
- RuntimeInspector
- ThemeProvider (body / API / props)

---

## 6. Decisions

| Decision | Choice |
|----------|--------|
| Privacy | Local barrel only; not re-exported upward |
| Collector | Frozen namespace + six scalars |
| Snapshot SSOT | SnapshotBuilder (not Inspector) |
| Cache metrics | Resolver (not TokenCache) — keeps Resolver → TokenCache direction |
| Notifications naming | `recordObserverNotifications` (plural) |
| Tests | `validate:ux-3.10` only (no Jest) |
| UX-3.4 metrics | Independent; untouched |

---

## 7. Exclusions

- No public metrics API
- No visual DevTools panel
- No React in `metrics/`
- No ThemeProvider / TokenCache / RuntimeInspector edits for metrics
- No wiring of UX-3.4 `PerformanceCounters` / `Benchmark`
- No historical time-series storage
- No Jest suite

---

## 8. Validation

```bash
npm run validate:ux-3.9
npm run validate:ux-3.10
```

Expected:

```text
validate:ux-3.10
PASS
```

---

## 9. Acceptance (CA-UX-3.10)

- [x] CA-UX-3.10.1 Folder `runtime/metrics`
- [x] CA-UX-3.10.2 Collector private
- [x] CA-UX-3.10.3 Snapshot immutable
- [x] CA-UX-3.10.4 Reporter functional
- [x] CA-UX-3.10.5 No React
- [x] CA-UX-3.10.6 Public API unchanged
- [x] CA-UX-3.10.7 Increments O(1)
- [x] CA-UX-3.10.8 No allocations during `record*`
- [x] CA-UX-3.10.9 No visual impact
- [x] CA-UX-3.10.10 Build + typecheck
- [x] CA-UX-3.10.11 Collector (and Reporter) singleton frozen
- [x] CA-UX-3.10.12 No duplicate metric sites

---

## Related

- [`docs/UX/UX-3.9.md`](./UX-3.9.md)
- [`docs/UX/UX-3.8.md`](./UX-3.8.md)
- [`docs/UX/UX-3.4.md`](./UX-3.4.md) — unrelated `tokens/runtime/RuntimeMetrics`
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-3.11 Runtime Diagnostics Foundation → then UX-4.x DevTools / consumers
