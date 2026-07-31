# UX-3.8 — Theme Runtime Snapshot & DevTools Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.8 — Theme Runtime Snapshot & DevTools Foundation  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.7 Runtime Context Optimization COMPLETE  

**Declaración:**

```text
UX-3.8 = Runtime Snapshot & DevTools Foundation (private infra)
SCOPE = RuntimeSnapshot · SnapshotBuilder · SnapshotComparator
         · RuntimeInspector · validate:ux-3.8
ZERO production cost · NO public API · NO visual DevTools · NO Provider wiring
API FREEZE = absolute (names + signatures)
NO React · NO hooks · NO caches · NO Runtime mutation
Next: UX-4.x DevTools
```

---

## 1. Purpose

Agregar infraestructura privada para inspeccionar el estado del Theme Runtime sin introducir costo en producción ni alterar la arquitectura consolidada en UX-3.1–UX-3.7.

Permite:

- inspeccionar el Runtime vía snapshots descriptivos
- comparar snapshots en O(1)
- preparar herramientas de debugging futuras (UX-4.x)

Sin:

- panel DevTools visual
- imports nuevos desde la aplicación
- cambios a APIs públicas
- impacto en el hot-path de producción

---

## 2. Contract Invariants (Freeze)

### 2.1 RuntimeSnapshot — scalars only

Exactamente 9 campos readonly, todos escalares:

```ts
{
  fingerprint, themeName, version,
  tokenCount, colorCount, typographyCount,
  spacingCount, radiusCount, elevationCount
}
```

MUST NOT contain:

- `ThemeRuntime` / `ResolvedDesignTokens`
- object references
- nested token objects
- arrays copied from Runtime

### 2.2 Metadata

| Field | Rule |
|-------|------|
| `fingerprint` | `runtimeFingerprint(runtime)` (pure; never `runtimeIdentity`) |
| `themeName` | always `""` — **reserved**; never inferred, never calculated, never read from Provider |
| `version` | `THEME_CONTRACT_VERSION` |

### 2.3 Leaf counter

| Value | Action |
|-------|--------|
| primitive (`string` \| `number` \| `boolean` \| `bigint`) | `+1` |
| `null` | `+1` |
| `undefined` | `+1` |
| object | recurse |
| array | recurse items |
| function | ignore |
| symbol | ignore |

```text
traversal order MUST NOT affect the result.
no sorting required because only leaf totals are produced.
```

`tokenCount` suma las ocho domains (`colors` … `layout`).  
Los `*Count` de domain listados en el snapshot son informativos.

### 2.4 SnapshotBuilder

```text
SnapshotBuilder.build(runtime) → frozen RuntimeSnapshot
SnapshotBuilder never freezes Runtime.
```

### 2.5 SnapshotComparator — O(1)

```text
fingerprintChanged = a.fingerprint !== b.fingerprint
tokenCountChanged  = a.tokenCount !== b.tokenCount
metadataChanged    = themeName/version only
changed            = fingerprintChanged || tokenCountChanged || metadataChanged
```

Domain count fields are informational only and MUST NOT participate in `changed`.

### 2.6 RuntimeInspector — static namespace

```text
constructor remains implicit/private by convention; class is never instantiated.
inspect / snapshot → SnapshotBuilder.build
compare → compareSnapshots
Object.freeze(RuntimeInspector)
```

### 2.7 API Freeze

Names and signatures frozen:

- `RuntimeSnapshot`
- `SnapshotCompareResult`
- `SnapshotBuilder`
- `SnapshotComparator` / `compareSnapshots`
- `RuntimeInspector`

No callbacks. No additional fields. No public exports.

---

## 3. Architecture

```text
src/ui/theme/runtime/devtools/          (PRIVATE)
  RuntimeSnapshot.ts      types (scalars only)
  SnapshotBuilder.ts      Runtime → frozen Snapshot
  SnapshotComparator.ts   O(1) compare
  RuntimeInspector.ts     static helpers
  index.ts                private barrel

ThemeRuntime
  → SnapshotBuilder.build
  → RuntimeSnapshot (immutable, scalars)
  → SnapshotComparator.compareSnapshots
```

No integration with ThemeProvider, Context, Selectors, Hooks, Resolver, TokenCache, or Runtime.

UX-3.4 `RuntimeMetrics.snapshot()` remains unrelated.

---

## 4. Decisions

| Decision | Choice |
|----------|--------|
| Privacy | Local barrel only; not re-exported upward |
| Fingerprint | Reuse UX-3.7 `runtimeFingerprint` (no WeakMap) |
| themeName | Reserved empty string until UX-4.x |
| version | `THEME_CONTRACT_VERSION` |
| Counts | Leaf totals; order-independent; no sort |
| Comparator | O(1) scalars; domainCounts ignored for `changed` |
| Inspector | Static-only class; never instantiated |
| Tests | `validate:ux-3.8` only (no Jest) |

---

## 5. Invariants

- No React / Context / hooks / DOM / window / performance / console / timers
- No WeakMap / Map / Set caches / memoization
- SnapshotBuilder never freezes or mutates Runtime
- `Object.keys(snapshot).length === 9`
- No new `@/ui` / `theme/index` / `runtime/index` / `hooks/index` / `providers/index` exports
- API Freeze UX-3.1–UX-3.7 preserved

---

## 6. Exclusions

- No visual DevTools panel
- No Provider / Context wiring
- No public hooks or exports
- No deep snapshot diffs
- No Runtime instrumentation in the production hot path
- No Jest suite

---

## 7. Validation

```bash
npm run validate:ux-3.7
npm run validate:ux-3.8
```

Expected:

```text
validate:ux-3.8
PASS
10/10
```

---

## 8. Acceptance (CA-UX-3.8)

- [x] RuntimeSnapshot implemented
- [x] SnapshotBuilder implemented
- [x] SnapshotComparator implemented
- [x] RuntimeInspector implemented
- [x] API Freeze respected
- [x] No React
- [x] No hooks
- [x] No caches
- [x] No Runtime impact
- [x] validate:ux-3.8 PASS

---

## Related

- [`docs/UX/UX-3.7.md`](./UX-3.7.md)
- [`docs/UX/UX-3.6.md`](./UX-3.6.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-4.x DevTools
