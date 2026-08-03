# UX-5.6 — Feature Provider

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Visibility = metadata únicamente (sin filtrado en Registry).
> - Runtime State separado de FeatureDefinition.
> - FeatureState = snapshot inmutable de un estado conceptualmente mutable.
> - FeatureProvider = propietario del mapa runtime de FeatureState (refs only).
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin cambios funcionales visibles hasta UX-5.8.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.6 — Feature Provider  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.5 COMPLETE · UX-5.4 COMPLETE · UX-5.3 COMPLETE · UX-5.2 COMPLETE · UX-5.1 COMPLETE · UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.6 = Feature Provider
SCOPE = React infrastructure only (Provider · Context · no consumers)
FeatureContextValue = { states: ReadonlyMap<FeatureId, FeatureState> }
FeatureProvider owns ReadonlyMap via useRef (sole map owner)
value = Object.freeze({ states: statesRef.current })
READONLYMAP CONTRACT = public view only · Map mutability not public
SNAPSHOT = FeatureState remains immutable snapshot
PROVIDER = administers references only · no create · no replace · no sync
Registry API Freeze UX-5.2 = VIGENTE (get / has / size / getAll / byCategory / find / enabled)
FeatureDefinition API Freeze v2 = VIGENTE
Metadata Freeze UX-5.3 = VIGENTE
Runtime State Freeze UX-5.5 = VIGENTE
validate:ux-5.6 = gate vigente de la serie
validate:ux-5.5 = histórico (contrato anterior; no forma parte del gate)
NO useState · NO useReducer · NO setters · NO dispatch · NO hooks
NO Store · NO sync · NO persistence · NO observers · NO bridge · NO diagnostics
NO Runtime wiring
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO @/ui public barrel expansion
NO features/index.ts expansion
NO production functional change · Sin comportamiento nuevo
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.7 Feature Hooks
```

---

## 1. Purpose / Objetivo

Introducir el **FeatureProvider** como propietario del estado runtime de las
features, manteniendo completamente desacoplados `FeatureDefinition`,
`FeatureRegistry` y `FeatureState`, **sin mutación**, **sin hooks**,
**sin bridge**, y **sin cambios funcionales visibles**.

```text
UX-5.6 creates React FeatureProvider + FeatureContext only.
It owns a ReadonlyMap of FeatureState via useRef.
It does not mutate, create, replace, or synchronize snapshots.
It does not wire product UI. No consumers yet.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5.5 Feature State COMPLETE | [`UX-5.5.md`](./UX-5.5.md) · `validate:ux-5.5` (histórico) |
| FeatureState = immutable snapshot | [`FeatureState.ts`](../../src/ui/features/FeatureState.ts) |
| FeatureDefinition API Freeze v2 | [`FeatureDefinition.ts`](../../src/ui/features/FeatureDefinition.ts) |
| Registry query-only SSOT + discovery | [`FeatureRegistry.ts`](../../src/ui/features/FeatureRegistry.ts) |
| `enabled()` placeholder → getAll() | UX-5.2 API Freeze |
| UX-4 SERIES CERTIFIED | [`UX-4.10.md`](./UX-4.10.md) |
| Runtime UX-3 API Freeze vigente | [`UX-3.21.md`](./UX-3.21.md) |
| Roadmap UX-5.0 FROZEN | [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `FeatureContext` (`FeatureContextValue` · `createContext(... | null)(null)`)
- `FeatureProvider` (`useRef` + `ReadonlyMap` + `Object.freeze` value)
- Provider Ownership (sole map owner under `features/`)
- Snapshot Philosophy + ReadonlyMap Contract documentados
- Doc + `validate:ux-5.6` + roadmap status COMPLETE
- Declarar `validate:ux-5.5` como validator histórico

**Out**

- `useFeature` / `useFeatures` / `useFeatureState` (→ UX-5.7)
- Store / sync / persistence / observers
- Mutación / reemplazo de snapshots / `createFeatureState` en Provider
- Cambios a `FeatureDefinition.ts` · `FeatureRegistry.ts` · `FeatureTypes.ts` · `FeatureState.ts` · barrels
- Bridge Toolbar / Sidebar / Inspector / Panels / Menus (→ UX-5.8)
- Diagnostics (→ UX-5.9)
- Reexport desde `src/ui/index.ts` o `features/index.ts`
- Modificar `validate:ux-5.5.ts`
- Cualquier cambio visual o de comportamiento en la app

---

## 4. Architecture

```text
FeatureDefinition
        │
        ▼
FeatureRegistry
        │
        ▼
FeatureProvider
        │
        ▼
FeatureContext

src/ui/features/
  FeatureTypes.ts          ← intact (UX-5.1)
  FeatureDefinition.ts     ← intact (API Freeze v2)
  FeatureRegistry.ts       ← intact (UX-5.2 API Freeze)
  FeatureState.ts          ← intact (UX-5.5 Runtime State Freeze)
  FeatureContext.tsx       ← private context (this phase)
  FeatureProvider.tsx      ← sole map owner (this phase)
  index.ts                 ← intact (local barrel, NOT @/ui)

Context surface (UX-5.6):
  FeatureContextValue = { states: ReadonlyMap<FeatureId, FeatureState> }

Provider construction:
  emptyStates = new Map<FeatureId, FeatureState>()
  statesRef = useRef<ReadonlyMap<FeatureId, FeatureState>>(emptyStates)
  value = Object.freeze({ states: statesRef.current })
  <FeatureContext.Provider value={value}>

Isolation (models independent):
  FeatureDefinition  ↛  FeatureState / Provider / Context
  FeatureRegistry    ↛  FeatureState / Provider / Context / React
  FeatureState       ↛  FeatureDefinition / FeatureRegistry / Provider
  FeatureContext     = type + context only (no map ownership)
  FeatureProvider    = sole ReadonlyMap owner via useRef

Deferred:
  Hooks      → UX-5.7
  Bridge     → UX-5.8
```

### Provider Principles

```text
OWNERSHIP:
  FeatureProvider is the sole owner of ReadonlyMap<FeatureId, FeatureState>
  FeatureContext declares type + context only · does not create maps

SNAPSHOT PHILOSOPHY:
  FeatureState = immutable snapshot of a conceptually mutable status
  Provider administers references only
  No create · no replace · no sync in UX-5.6
  Future mutability = replace snapshots · never mutate the same object (UX-5.6+)

READONLYMAP CONTRACT:
  Public contract exposes only ReadonlyMap<FeatureId, FeatureState>
  Internal Map is a private implementation detail
  Map mutability is NOT part of the public contract
  (JavaScript has no native FrozenMap)

VALUE FREEZE:
  Context value object is Object.freeze({ states })
  Same immutability philosophy as UX-5.1+

PROHIBITED:
  useState · useReducer · setters · dispatch · hooks
  Registry inside Context · Runtime deps · product chrome wiring
```

### Policy

```text
Provider owns runtime state map; does not mutate FeatureState snapshots.
Registry API Freeze UX-5.2 remains vigente (query-only; enabled() → getAll()).
FeatureDefinition API Freeze v2 remains vigente.
Runtime State Freeze UX-5.5 remains vigente.
Registry must not consult Provider / Context / FeatureState.
FeatureProvider / FeatureContext are not re-exported from features/index.ts
or src/ui/index.ts in this phase.
validate:ux-5.6 = active series gate.
validate:ux-5.5 = historical validator of the prior contract · do not modify ·
not part of the series gate after UX-5.6.
Sin consumidores · Sin comportamiento nuevo.
```

### Imports

```text
FeatureContext.tsx   ✓  react (createContext) · FeatureId · FeatureState
FeatureProvider.tsx  ✓  react (useRef) · FeatureId · FeatureState · FeatureContext
FeatureProvider.tsx  ✗  FeatureRegistry · FeatureDefinition · createFeatureState
FeatureRegistry      ✗  React / Provider / Context / FeatureState
FeatureDefinition    ✗  FeatureState / Provider / Context
FeatureState.ts      ✗  Provider / Context / React (unchanged)
src/ui/features/**   ✗  src/ui/theme/runtime/**
src/ui/features/**   ✗  Toolbar / Sidebar / Inspector / Panels / Menus
src/ui/index.ts      ✗  features (no public @/ui expansion)
features/index.ts    ✗  FeatureProvider / FeatureContext / FeatureState
```

---

## 5. Risks

- Mutar FeatureState in-place → mitigado: Snapshot Philosophy + Provider no llama `createFeatureState` / no muta.
- Crear mapas paralelos en hooks/bridge futuros → fence `providerOwnership`.
- Mezclar Registry en Context → `contextContract` exige únicamente `states`.
- Introducir `useState` / `useReducer` prematuros → `noMutableState`.
- Adelantar hooks públicos → Out of Scope; fence `noHooks`.
- Interpretar fallo de `validate:ux-5.5` como regresión → documentado como histórico; gate vigente = `validate:ux-5.6`.
- Ampliar `@/ui` prematuramente → `publicBarrelIntact`.
- Conectar chrome de producto → `noProductWire`.

---

## 6. Rollback Strategy

1. Eliminar `src/ui/features/FeatureContext.tsx` y `FeatureProvider.tsx`.
2. Eliminar `docs/UX/UX-5.6.md` y `scripts/validate-ux-5.6.ts`.
3. Quitar `validate:ux-5.6` de `package.json`.
4. Revertir estado UX-5.6 en roadmap a PENDING; Next = UX-5.6.
5. AppShell / Runtime / chrome / `FeatureTypes` / `FeatureDefinition` /
   `FeatureRegistry` / `FeatureState` / barrels / `validate:ux-5.5` permanecen intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureContext.tsx` | CREATE — FeatureContextValue + FeatureContext |
| `src/ui/features/FeatureProvider.tsx` | CREATE — sole map owner via useRef |
| `docs/UX/UX-5.6.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | UPDATE — UX-5.6 = COMPLETE · Next = UX-5.7 |
| `scripts/validate-ux-5.6.ts` | CREATE |
| `package.json` | `validate:ux-5.6` |

**Protegidos:** `FeatureTypes.ts`, `FeatureDefinition.ts`, `FeatureRegistry.ts`,
`FeatureState.ts`, `src/ui/features/index.ts`, `src/ui/index.ts`,
`scripts/validate-ux-5.5.ts` (histórico), `src/ui/theme/runtime/**`,
`src/ui/providers/**`, `src/components/app-shell/**`,
Toolbar / Sidebar / Inspector / Workspace, certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.6)

- [x] CA-UX-5.6.1 Existe `docs/UX/UX-5.6.md`
- [x] CA-UX-5.6.2 Existe `FeatureContext.tsx` inicializado en `null`
- [x] CA-UX-5.6.3 Existe `FeatureProvider.tsx` propietario del mapa
- [x] CA-UX-5.6.4 `FeatureContextValue` contiene únicamente `states: ReadonlyMap<...>`
- [x] CA-UX-5.6.5 Provider usa `useRef` + `Object.freeze({ states })` (sin `useState` / `useReducer`)
- [x] CA-UX-5.6.6 Solo FeatureProvider crea el ReadonlyMap (`providerOwnership`)
- [x] CA-UX-5.6.7 Snapshot Philosophy + ReadonlyMap Contract documentados
- [x] CA-UX-5.6.8 `FeatureDefinition` / `FeatureRegistry` / `FeatureState` no se modifican
- [x] CA-UX-5.6.9 Sin hooks públicos / Store / bridge / sync / diagnostics
- [x] CA-UX-5.6.10 Sin Runtime / product wire; barrels intactos
- [x] CA-UX-5.6.11 `npx tsc --noEmit` PASS
- [x] CA-UX-5.6.12 `npm run validate:ux-5.6` PASS
- [x] CA-UX-5.6.13 Roadmap marca UX-5.6 = COMPLETE · Next = UX-5.7
- [x] CA-UX-5.6.14 `validate:ux-5.5` documentado como histórico; gate vigente = `validate:ux-5.6`

---

## 9. Gate

```text
npm run validate:ux-5.6
```

Blocks: `priorGate` · `providerExists` · `contextExists` · `providerContract` ·
`contextContract` · `noMutableState` · `providerOwnership` · `stateIsolation` ·
`registryUntouched` · `noHooks` · `noRuntimeDep` · `noProductWire` ·
`publicBarrelIntact` · `tscCompile`

---

## 10. Definition of Done

- [x] FeatureContext / FeatureProvider congelados (API Freeze UX-5.6)
- [x] Provider Principles · Snapshot Philosophy · ReadonlyMap Contract documentados
- [x] Provider = sole map owner (`providerOwnership`)
- [x] Definition · Registry · State intactos y aislados
- [x] Registry API Freeze UX-5.2 intacto; sin lógica runtime de estado
- [x] FeatureDefinition API Freeze v2 intacto
- [x] Sin hooks / Store / bridge / sync / mutación
- [x] Barrel local sin reexport de Provider/Context; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.6.md` completo (incluye gobernanza de validators)
- [x] Gates PASS (`validate:ux-5.6`)
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.6 = COMPLETE; Next = UX-5.7

---

## 11. Next

**Next:** UX-5.7 — Feature Hooks  
Hooks públicos (`useFeature` · `useFeatures` · `useFeatureState`) sobre el
Context privado, con API Freeze de superficie pública.
Sin wiring de producto todavía (→ UX-5.8).

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-5.5.md`](./UX-5.5.md)
- [`UX-5.4.md`](./UX-5.4.md)
- [`UX-5.3.md`](./UX-5.3.md)
- [`UX-5.2.md`](./UX-5.2.md)
- [`UX-5.1.md`](./UX-5.1.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureContext.tsx`](../../src/ui/features/FeatureContext.tsx)
- [`src/ui/features/FeatureProvider.tsx`](../../src/ui/features/FeatureProvider.tsx)
- [`scripts/validate-ux-5.6.ts`](../../scripts/validate-ux-5.6.ts)
