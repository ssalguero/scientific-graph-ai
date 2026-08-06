# UX-3.9 — Theme Runtime Observers Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.9 — Theme Runtime Observers Foundation  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.8 Theme Runtime Snapshot & DevTools Foundation COMPLETE  

**Declaración:**

```text
UX-3.9 = Theme Runtime Observers Foundation (private infra)
SCOPE = RuntimeObserver · RuntimeObserverRegistry · RuntimeNotifier
         · ThemeProvider private wiring · validate:ux-3.9
NO public API · NO visual behavior · NO React in observer layer
API FREEZE = absolute (names + signatures)
Notify only on fingerprint change · identity-gated SnapshotBuilder
Next: UX-4.x DevTools
```

---

## 1. Purpose

Incorporar una infraestructura privada de Runtime Observers para que herramientas internas (DevTools, Inspector, métricas, profiling) puedan recibir notificaciones cuando el Runtime cambia.

Permite:

- registrar / eliminar observers privados
- notificar únicamente cuando el fingerprint cambia
- desacoplar observación de consultas manuales al Runtime

Sin:

- API pública nueva
- comportamiento visual
- React / hooks / Context en la capa observer
- EventEmitter / librerías externas
- cambios a Runtime, RuntimeSnapshot o RuntimeInspector

---

## 2. Contract Invariants (Freeze)

### 2.1 RuntimeObserver

```ts
export interface RuntimeObserver {
  onRuntimeChanged(): void;
}
```

No additional members.

### 2.2 RuntimeObserverRegistry — frozen SSOT

```ts
export const RuntimeObserverRegistry = Object.freeze({
  register,
  unregister,
  notify,
  size,
});
```

Internally: module-level `Set<RuntimeObserver>` only.

| Op | Complexity |
|----|------------|
| register | O(1) |
| unregister | O(1) |
| notify | O(N) |
| size | O(1) |

`notify()` wraps each `onRuntimeChanged()` in `try/catch` so one failing observer never blocks others.

### 2.3 RuntimeNotifier — pure

```ts
RuntimeNotifier.notifyIfChanged(
  previousFingerprint: string | null | undefined,
  nextFingerprint: string,
): void
```

- same fingerprint → no-op
- different fingerprint → `RuntimeObserverRegistry.notify()`
- no Runtime / fingerprints / snapshots / WeakMaps / caches / refs stored

### 2.4 ThemeProvider wiring

```text
stableRuntime
  → identity changed?
    NO  → skip (never SnapshotBuilder)
    YES → SnapshotBuilder.build(stableRuntime)
        → RuntimeNotifier.notifyIfChanged(prevFp, nextFp)
        → save fingerprint
```

First render: `previousFingerprint = undefined` → notify (correct).

`SnapshotBuilder` imported only from `runtime/devtools` (never `runtime/index`).

### 2.5 API Freeze

Observer symbols remain private. Not exported from:

- `@/ui` / `ui/index`
- `theme/index`
- `runtime/index`
- `hooks/index`
- `providers/index`

UX-3.8 DevTools symbols remain private and unmodified.

---

## 3. Architecture

```text
src/ui/theme/runtime/observer/          (PRIVATE)
  RuntimeObserver.ts           interface
  RuntimeObserverRegistry.ts   Set SSOT + frozen namespace
  RuntimeNotifier.ts           pure fingerprint gate
  index.ts                     private barrel

ThemeProvider (private wiring only)
  stableRuntime → identity gate → SnapshotBuilder → RuntimeNotifier
```

Star dependency rules:

```text
observer/  ↛  providers/ | context/ | devtools/ | selectors/
devtools/  ↛  observer/
context/   ↛  observer/
ThemeProvider → observer + devtools + context
```

---

## 4. Decisions

| Decision | Choice |
|----------|--------|
| Privacy | Local barrel only; not re-exported upward |
| Registry | Frozen namespace + module `Set` |
| Notify errors | Per-observer try/catch ignore |
| Notifier | Pure; ThemeProvider holds fingerprint ref |
| Snapshot | Only on runtime identity change |
| Fingerprint source | `SnapshotBuilder.build(...).fingerprint` |
| Tests | `validate:ux-3.9` only (no Jest) |

---

## 5. Invariants

- No React / hooks / Context / EventEmitter / DOM / timers in `observer/`
- No Runtime / Snapshot / Inspector mutations
- SnapshotBuilder never runs when identity is unchanged
- Notify only when fingerprints differ
- No new `@/ui` / `theme/index` / `runtime/index` / `hooks/index` / `providers/index` exports
- API Freeze UX-3.1–UX-3.8 preserved

---

## 6. Exclusions

- No visual DevTools panel
- No public hooks or subscribe API
- No metrics / profiling consumers (later phases register against this registry)
- No Runtime instrumentation beyond ThemeProvider identity-gated notify
- No Jest suite

---

## 7. Validation

```bash
npm run validate:ux-3.8
npm run validate:ux-3.9
```

Expected:

```text
validate:ux-3.9
PASS
10/10
```

---

## 8. Acceptance (CA-UX-3.9)

- [x] RuntimeObserver implemented
- [x] RuntimeObserverRegistry private operative
- [x] RuntimeNotifier implemented
- [x] Fingerprint comparison
- [x] Notify only on real changes
- [x] No visual changes
- [x] No public API changes
- [x] No React in observer layer
- [x] No hooks
- [x] UX-3.8 unbroken (`validate:ux-3.8` PASS)
- [x] validate:ux-3.9 PASS

---

## Related

- [`docs/UX/UX-3.8.md`](./UX-3.8.md)
- [`docs/UX/UX-3.7.md`](./UX-3.7.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)

**Next:** UX-4.x DevTools
