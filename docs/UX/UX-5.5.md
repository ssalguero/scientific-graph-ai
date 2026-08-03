# UX-5.5 — Feature State

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Visibility = metadata únicamente (sin filtrado en Registry).
> - Runtime State separado de FeatureDefinition (esta fase).
> - FeatureState = snapshot inmutable de un estado conceptualmente mutable.
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin cambios funcionales visibles hasta UX-5.8.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.5 — Feature State  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.4 COMPLETE · UX-5.3 COMPLETE · UX-5.2 COMPLETE · UX-5.1 COMPLETE · UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.5 = Feature State
SCOPE = runtime state contract only (model · no store)
FeatureStatus = enabled · disabled · loading · error
FeatureState = id · status
createFeatureState(init) = Object.freeze({ ...init }) only
SNAPSHOT = immutable snapshot of conceptually mutable status
MUTABILITY = snapshot replacement only · never in-place mutation
Runtime State separado de FeatureDefinition
Registry API Freeze UX-5.2 = VIGENTE (get / has / size / getAll / byCategory / find / enabled)
FeatureDefinition API Freeze v2 = VIGENTE
Metadata Freeze UX-5.3 = VIGENTE
validate:ux-5.5 = gate vigente de la serie
validate:ux-5.4 = histórico (contrato anterior; no forma parte del gate)
NO Store · NO Provider · NO Context · NO hooks
NO sync · NO persistence · NO observers · NO bridge · NO diagnostics
NO React · NO Runtime wiring
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO @/ui public barrel expansion
NO production functional change · Sin comportamiento nuevo
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.6 Feature Provider
```

---

## 1. Purpose / Objetivo

Introducir el contrato del estado runtime de las features
**separándolo completamente de `FeatureDefinition`**, **sin Store**,
**sin Provider**, **sin React**, y **sin cambios funcionales visibles**.

```text
UX-5.5 creates only the FeatureState model (types + freeze helper).
It does not store, provide, synchronize, or wire runtime state.
FeatureState is an immutable snapshot; future mutability replaces snapshots.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5.4 Feature Visibility COMPLETE | [`UX-5.4.md`](./UX-5.4.md) · `validate:ux-5.4` (histórico) |
| FeatureDefinition API Freeze v2 | [`FeatureDefinition.ts`](../../src/ui/features/FeatureDefinition.ts) |
| Registry query-only SSOT + discovery | [`FeatureRegistry.ts`](../../src/ui/features/FeatureRegistry.ts) |
| `enabled()` placeholder → getAll() | UX-5.2 API Freeze |
| UX-4 SERIES CERTIFIED | [`UX-4.10.md`](./UX-4.10.md) |
| Runtime UX-3 API Freeze vigente | [`UX-3.21.md`](./UX-3.21.md) |
| Roadmap UX-5.0 FROZEN | [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `FeatureStatus` (cuatro valores literales)
- `FeatureState` (`id` · `status` únicamente)
- `FeatureStateInit` + `createFeatureState(init)` (`Object.freeze` only)
- Snapshot Philosophy documentada
- Doc + `validate:ux-5.5` + roadmap status COMPLETE
- Declarar `validate:ux-5.4` como validator histórico

**Out**

- FeatureStateRegistry / Store
- FeatureProvider / Context / hooks (→ UX-5.6 / UX-5.7)
- Sincronización / persistencia / observers
- Cambios a `FeatureDefinition.ts` · `FeatureRegistry.ts` · `FeatureTypes.ts` · barrels
- Bridge Toolbar / Sidebar / Inspector / Panels / Menus (→ UX-5.8)
- Diagnostics (→ UX-5.9)
- Reexport desde `src/ui/index.ts` o `features/index.ts`
- Modificar `validate:ux-5.4.ts`
- Cualquier cambio visual o de comportamiento en la app

---

## 4. Architecture

```text
src/ui/features/
  FeatureTypes.ts          ← intact (UX-5.1)
  FeatureDefinition.ts     ← intact (API Freeze v2)
  FeatureRegistry.ts       ← intact (UX-5.2 API Freeze)
  FeatureState.ts          ← runtime state contract (this phase)
  index.ts                 ← intact (local barrel, NOT @/ui)

State surface (UX-5.5):
  FeatureStatus = enabled · disabled · loading · error
  FeatureState  = id · status

Construction:
  createFeatureState(init)
    return Object.freeze({ ...init })
  No collections · no array copies

Isolation (three models independent):
  FeatureDefinition  ↛  FeatureState
  FeatureRegistry    ↛  FeatureState
  FeatureState       ↛  FeatureDefinition / FeatureRegistry

Deferred:
  Provider   → UX-5.6
  Hooks      → UX-5.7
  Bridge     → UX-5.8
```

### State Principles

```text
enabled   = Feature habilitada
disabled  = Feature deshabilitada
loading   = Inicializando
error     = Error runtime
Meanings are documentary only in UX-5.5 · produce no behavior

SNAPSHOT PHILOSOPHY:
  FeatureState = immutable snapshot of a conceptually mutable status
  Object is frozen (Object.freeze)
  Future mutability = replace snapshots · never mutate the same object
  Architectural base for UX-5.6 Feature Provider

PROHIBITED MIXING:
  metadata · visibility · runtime state remain separate layers
```

### Policy

```text
Runtime State is separated from FeatureDefinition.
Registry API Freeze UX-5.2 remains vigente (query-only; enabled() → getAll()).
FeatureDefinition API Freeze v2 remains vigente.
Registry must not consult FeatureState in UX-5.5.
FeatureState / FeatureStateInit / createFeatureState / FeatureStatus are not
re-exported from features/index.ts in this phase.
validate:ux-5.5 = active series gate.
validate:ux-5.4 = historical validator of the prior contract · do not modify ·
not part of the series gate after UX-5.5.
Sin comportamiento nuevo.
```

### Imports

```text
src/ui/features/**  ✗  react / react-dom
src/ui/features/**  ✗  src/ui/theme/runtime/**
src/ui/features/**  ✗  Toolbar / Sidebar / Inspector / Panels / Menus
FeatureState.ts     ✓  FeatureId from FeatureTypes only
FeatureState.ts     ✗  FeatureDefinition / FeatureRegistry
FeatureDefinition   ✗  FeatureState
FeatureRegistry     ✗  FeatureState
src/ui/index.ts     ✗  features (no public @/ui expansion)
```

---

## 5. Risks

- Mutar FeatureState in-place → mitigado: Snapshot Philosophy + `Object.freeze` + fence `frozenState`.
- Mezclar state en Definition/Registry → fences `stateIsolation` · `definitionUntouched` · `noRuntimeLogic`.
- Convertir `enabled()` en filtro runtime prematuro → `registryUntouched` exige delegación a `getAll()`.
- Adelantar Provider/Store/hooks → Out of Scope; fences anti Store/Provider/Context.
- Interpretar fallo de `validate:ux-5.4` como regresión → documentado como histórico; gate vigente = `validate:ux-5.5`.
- Ampliar `@/ui` prematuramente → `publicBarrelIntact`.
- Conectar chrome de producto → `noProductWire`.

---

## 6. Rollback Strategy

1. Eliminar `src/ui/features/FeatureState.ts`.
2. Eliminar `docs/UX/UX-5.5.md` y `scripts/validate-ux-5.5.ts`.
3. Quitar `validate:ux-5.5` de `package.json`.
4. Revertir estado UX-5.5 en roadmap a PENDING; Next = UX-5.5.
5. AppShell / Runtime / chrome / `FeatureTypes` / `FeatureDefinition` /
   `FeatureRegistry` / barrels / `validate:ux-5.4` permanecen intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureState.ts` | CREATE — FeatureStatus + FeatureState + createFeatureState |
| `docs/UX/UX-5.5.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | UPDATE — UX-5.5 = COMPLETE · Next = UX-5.6 |
| `scripts/validate-ux-5.5.ts` | CREATE |
| `package.json` | `validate:ux-5.5` |

**Protegidos:** `FeatureTypes.ts`, `FeatureDefinition.ts`, `FeatureRegistry.ts`,
`src/ui/features/index.ts`, `src/ui/index.ts`, `scripts/validate-ux-5.4.ts` (histórico),
`src/ui/theme/runtime/**`, `src/ui/providers/**`, `src/components/app-shell/**`,
Toolbar / Sidebar / Inspector / Workspace, certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.5)

- [x] CA-UX-5.5.1 Existe `docs/UX/UX-5.5.md`
- [x] CA-UX-5.5.2 Existe `FeatureStatus` con exactamente cuatro valores
- [x] CA-UX-5.5.3 Existe `FeatureState` con únicamente `id` + `status`
- [x] CA-UX-5.5.4 Existe `FeatureStateInit`
- [x] CA-UX-5.5.5 Existe `createFeatureState(init)` con `Object.freeze` only
- [x] CA-UX-5.5.6 FeatureState es inmutable (snapshot); sin colecciones / sin array copies
- [x] CA-UX-5.5.7 `FeatureDefinition` no se modifica; no conoce FeatureState
- [x] CA-UX-5.5.8 `FeatureRegistry` no se modifica; no consulta FeatureState; `enabled()` → `getAll()`
- [x] CA-UX-5.5.9 No existe Store / Provider / Context / Hook / sync / bridge / diagnostics
- [x] CA-UX-5.5.10 Sin React / Runtime / product wire; `src/ui/index.ts` intacto
- [x] CA-UX-5.5.11 `npx tsc --noEmit` PASS
- [x] CA-UX-5.5.12 `npm run validate:ux-5.5` PASS
- [x] CA-UX-5.5.13 Roadmap marca UX-5.5 = COMPLETE · Next = UX-5.6
- [x] CA-UX-5.5.14 Snapshot Philosophy declarada; `validate:ux-5.4` documentado como histórico

---

## 9. Gate

```text
npm run validate:ux-5.5
```

Blocks: `priorGate` · `stateContract` · `initContract` · `helperContract` ·
`frozenState` · `stateIsolation` · `definitionUntouched` · `registryUntouched` ·
`noRuntimeLogic` · `noReact` · `noRuntimeDep` · `noProductWire` ·
`publicBarrelIntact` · `tscCompile`

---

## 10. Definition of Done

- [x] FeatureStatus / FeatureState / FeatureStateInit / createFeatureState congelados
- [x] Snapshot Philosophy documentada (freeze + replacement, no in-place mutation)
- [x] Definition · Registry · State aislados (`stateIsolation`)
- [x] Registry API Freeze UX-5.2 intacto; sin lógica runtime de estado
- [x] FeatureDefinition API Freeze v2 intacto
- [x] Sin Store / Provider / Context / hooks / bridge / sync
- [x] Barrel local sin reexport de State; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.5.md` completo (incluye gobernanza de validators)
- [x] Gates PASS (`validate:ux-5.5`)
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.5 = COMPLETE; Next = UX-5.6

---

## 11. Next

**Next:** UX-5.6 — Feature Provider  
Primer React Provider que gestionará instancias de `FeatureState` por
reemplazo de snapshots, sin modificar `FeatureDefinition` ni `FeatureRegistry`.
Sin wiring de producto todavía.

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-5.4.md`](./UX-5.4.md)
- [`UX-5.3.md`](./UX-5.3.md)
- [`UX-5.2.md`](./UX-5.2.md)
- [`UX-5.1.md`](./UX-5.1.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureState.ts`](../../src/ui/features/FeatureState.ts)
- [`scripts/validate-ux-5.5.ts`](../../scripts/validate-ux-5.5.ts)
