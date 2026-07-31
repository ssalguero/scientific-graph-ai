# UX-3.12 — Runtime Health Integration Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.12 — Runtime Health Integration Foundation  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.11 Runtime Diagnostics Foundation COMPLETE  

**Declaración:**

```text
UX-3.12 = Runtime Health Integration Foundation (private infra)
SCOPE = RuntimeHealth · RuntimeHealthStatus · RuntimeHealthBuilder
         · RuntimeHealthReporter · validate:ux-3.12
NO public API · NO visual behavior · NO React · NO Provider wiring
Composes RuntimeSnapshot + RuntimeMetricsSnapshot + RuntimeDiagnosticEngine
API FREEZE = create() · build() · status()
Next: UX-3.13 Runtime Health Service
```

---

## 1. Purpose

Add a private composition layer that unifies Snapshot, Metrics, and Diagnostics
into a single immutable `RuntimeHealth` — the sole authorized internal query
point for Theme Runtime health — without UI, public APIs, or pipeline changes.

---

## 2. Name collision (explicit)

Two unrelated modules share the basename `RuntimeHealth.ts`:

| Path | Phase | Domain |
|------|-------|--------|
| `src/ui/theme/runtime/diagnostics/RuntimeHealth.ts` | UX-3.11 | Engine aggregate `{ healthy, warningCount, errorCount, diagnostics[] }` — **untouched** |
| `src/ui/theme/runtime/health/RuntimeHealth.ts` | UX-3.12 | Composition `{ fingerprint, version, diagnostics, metrics, status, generatedAt }` |

Inside `health/`, the diagnostics aggregate is imported as `DiagnosticAggregate`.

Same coexistence pattern as UX-3.10 vs UX-3.4.4 `RuntimeMetrics`.

---

## 3. Architecture

```text
src/ui/theme/runtime/health/          (PRIVATE)
  RuntimeHealth.ts           composition type
  RuntimeHealthStatus.ts     OK | WARNING | ERROR + status()
  RuntimeHealthBuilder.ts    create() — sole constructor
  RuntimeHealthReporter.ts   build() — pure facade
  index.ts                   private barrel
```

### Flow

```text
RuntimeSnapshot
        │
RuntimeMetricsSnapshot
        │
        ▼
RuntimeHealthBuilder.create
        │
RuntimeDiagnosticEngine.evaluate
        │
RuntimeHealthStatus.status
        │
        ▼
RuntimeHealth (frozen)
```

`RuntimeHealthReporter.build` delegates only to `RuntimeHealthBuilder.create`.

### Dependency star (frozen)

```text
health/  →  RuntimeSnapshot (type) · RuntimeMetricsSnapshot (type)
            · RuntimeDiagnosticEngine · DiagnosticAggregate (alias)
            · siblings
health/  ↛  React | providers | hooks | context | observer | Collector
             | Notifier | Inspector | selectors | runtime/index | public barrels
```

No consumer imports `health/` in this phase.

---

## 4. Contracts

### 4.1 RuntimeHealth

```ts
{
  readonly fingerprint: string;   // from snapshot (scalar copy)
  readonly version: string;       // from snapshot (scalar copy)
  readonly diagnostics: ReadonlyArray<Readonly<RuntimeDiagnostic>>;
  readonly metrics: RuntimeMetricsSnapshot; // same reference
  readonly status: RuntimeHealthStatus;     // OK | WARNING | ERROR
  readonly generatedAt: number;             // Date.now()
}
```

- `diagnostics` reuses the exact array from `RuntimeDiagnosticEngine.evaluate(...).diagnostics`
- `metrics` reuses the input snapshot reference — never cloned
- Every instance is `Object.freeze(...)`
- Inputs are never mutated

### 4.2 generatedAt (BUILD METADATA ONLY)

Assigned with `Date.now()` at construction. **Must not** participate in:

- fingerprint identity
- diagnostics evaluation
- equality
- comparisons
- future health diffing (UX-3.13+)

Future comparators MUST ignore `generatedAt` when equating two `RuntimeHealth` values.

### 4.3 RuntimeHealthStatus

`Object.freeze` + no TypeScript `enum`. Style matches `DiagnosticLevel`.

Values: `OK` | `WARNING` | `ERROR`

API: `status(errorCount, warningCount)` only:

```text
errorCount > 0 → ERROR
else warningCount > 0 → WARNING
else → OK
```

INFO diagnostics never affect status. No configurable priorities.

### 4.4 RuntimeHealthBuilder / RuntimeHealthReporter

| Symbol | Method | Role |
|--------|--------|------|
| `RuntimeHealthBuilder` | `create(snapshot, metrics)` | Sole constructor |
| `RuntimeHealthReporter` | `build(snapshot, metrics)` | Delegates to `create` — no state/cache |

### 4.5 Namespace freeze

```ts
export const RuntimeHealthBuilder = Object.freeze({ create });
export const RuntimeHealthReporter = Object.freeze({ build });
export const RuntimeHealthStatus = Object.freeze({ OK, WARNING, ERROR, status });
```

Instances **and** namespaces are frozen (UX-3.8→3.11 discipline).

### 4.6 Performance

O(1) composition aside from the fixed-rule Engine evaluate. No Map/Set/WeakMap/WeakSet.
No auxiliary arrays. No cloning of metrics or diagnostics.

---

## 5. API Freeze

Not exported from:

- `@/ui` / `ui/index`
- `theme/index`
- `runtime/index`
- `hooks/index`
- `providers/index`

**Allowed methods only:** `create` · `build` · `status`

**Unchanged:** Resolver, Metrics, SnapshotBuilder, RuntimeNotifier, RuntimeInspector,
DiagnosticEngine, ThemeProvider, providers, hooks, context, DevTools pipelines.

Frozen for UX-3.13+: health contracts above. Diagnostics contracts remain frozen.

---

## 6. Validation

```bash
npm run validate:ux-3.11
npm run validate:ux-3.12
```

Expected:

```text
validate:ux-3.12
PASS
11/11
```

---

## 7. Acceptance (CA-UX-3.12)

- [x] CA-UX-3.12.1 Folder `runtime/health` + private barrel
- [x] CA-UX-3.12.2 Immutable RuntimeHealth; exact keys; inputs unchanged
- [x] CA-UX-3.12.3 Builder sole constructor; Reporter delegates; no classes
- [x] CA-UX-3.12.4 Snapshot + Metrics + Engine integration; prior UX-3.11 PASS
- [x] CA-UX-3.12.5 Status from diagnostics only (ERROR/WARNING/OK; INFO→OK)
- [x] CA-UX-3.12.6 Reporter pure (no state/cache)
- [x] CA-UX-3.12.7 No React / hooks / console / async / timers / `.tsx`
- [x] CA-UX-3.12.8 No Provider wiring
- [x] CA-UX-3.12.9 No public exports; API freeze create/build/status
- [x] CA-UX-3.12.10 Namespace + instance Object.freeze
- [x] CA-UX-3.12.11 O(1) / no dynamic collections; typecheck

---

## Related

- [`docs/UX/UX-3.11.md`](./UX-3.11.md)
- [`docs/UX/UX-3.10.md`](./UX-3.10.md)
- [`docs/UX/UX-3.8.md`](./UX-3.8.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-3.13 Runtime Health Service
