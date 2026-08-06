# UX-5.7 — Feature Hooks

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Visibility = metadata únicamente (sin filtrado en Registry).
> - Runtime State separado de FeatureDefinition.
> - FeatureState = snapshot inmutable de un estado conceptualmente mutable.
> - FeatureProvider = propietario del mapa runtime de FeatureState (refs only).
> - Feature Hooks = capa de lectura sobre FeatureContext (sin mutación).
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin cambios funcionales visibles hasta UX-5.8.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.7 — Feature Hooks  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.6 COMPLETE · UX-5.5 COMPLETE · UX-5.4 COMPLETE · UX-5.3 COMPLETE · UX-5.2 COMPLETE · UX-5.1 COMPLETE · UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.7 = Feature Hooks
SCOPE = Read-only React hooks over FeatureContext (no product wire)
API FREEZE:
  useFeatures(): ReadonlyMap<FeatureId, FeatureState>
  useFeatureState(id: FeatureId): FeatureState | undefined
  useFeature(id: FeatureId): FeatureState | undefined
HOOKS = access layer only · no create · no mutate · no replace snapshots
REFERENCE STABILITY = useFeatures() returns exactly context.states
ALIAS = useFeature → useFeatureState (Registry bridge deferred to UX-5.8)
ERROR = "Feature hooks must be used inside FeatureProvider."
HOOK ISOLATION = FeatureContext · FeatureId · FeatureState · useContext only
Provider Freeze UX-5.6 = VIGENTE (sole map owner)
Registry API Freeze UX-5.2 = VIGENTE
FeatureDefinition API Freeze v2 = VIGENTE
Metadata Freeze UX-5.3 = VIGENTE
Runtime State Freeze UX-5.5 = VIGENTE
validate:ux-5.7 = gate vigente de la serie
validate:ux-5.6 = histórico (contrato anterior; no forma parte del gate)
NO setters · NO dispatch · NO Store · NO sync · NO persistence
NO observers · NO bridge · NO diagnostics · NO Registry consult
NO Runtime wiring
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO @/ui public barrel expansion
NO features/index.ts expansion
NO production functional change · Sin comportamiento nuevo
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.8 Feature Integration Bridge
```

---

## 1. Purpose / Objetivo

Introducir la primera **API pública de consumo** del sistema Feature mediante
hooks React de **solo lectura**, consumiendo únicamente `FeatureContext`,
**sin mutación**, **sin Registry**, **sin bridge**, y **sin cambios
funcionales visibles**.

```text
UX-5.7 creates FeatureHooks only (useFeature · useFeatures · useFeatureState).
Hooks read FeatureContext. They do not own, create, or mutate state.
useFeatures() returns the exact Provider-owned context.states reference.
useFeature is an alias of useFeatureState (extended in UX-5.8).
No product UI wiring. No @/ui barrel expansion.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5.6 Feature Provider COMPLETE | [`UX-5.6.md`](./UX-5.6.md) · `validate:ux-5.6` (histórico) |
| FeatureProvider = sole map owner via useRef | [`FeatureProvider.tsx`](../../src/ui/features/FeatureProvider.tsx) |
| FeatureContext = null default · states only | [`FeatureContext.tsx`](../../src/ui/features/FeatureContext.tsx) |
| FeatureState = immutable snapshot | [`FeatureState.ts`](../../src/ui/features/FeatureState.ts) |
| FeatureDefinition API Freeze v2 | [`FeatureDefinition.ts`](../../src/ui/features/FeatureDefinition.ts) |
| Registry query-only SSOT + discovery | [`FeatureRegistry.ts`](../../src/ui/features/FeatureRegistry.ts) |
| UX-4 SERIES CERTIFIED | [`UX-4.10.md`](./UX-4.10.md) |
| Runtime UX-3 API Freeze vigente | [`UX-3.21.md`](./UX-3.21.md) |
| Roadmap UX-5.0 FROZEN | [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `FeatureHooks.ts` (`useFeature` · `useFeatures` · `useFeatureState`)
- Read-only Context consumption + Error Contract
- Reference Stability + Hook Isolation + Snapshot Philosophy documentados
- Doc + `validate:ux-5.7` + roadmap status COMPLETE
- Declarar `validate:ux-5.6` como validator histórico

**Out**

- Registry consult / Definition merge en hooks (→ UX-5.8)
- Store / sync / persistence / observers
- Mutación / `createFeatureState` / setters / dispatch
- Cambios a Provider · Context · Definition · Registry · Types · State · barrels
- Bridge Toolbar / Sidebar / Inspector / Panels / Menus (→ UX-5.8)
- Diagnostics (→ UX-5.9)
- Reexport desde `src/ui/index.ts` o `features/index.ts`
- Modificar `validate:ux-5.6.ts`
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
FeatureProvider          ← sole map owner (UX-5.6 · intact)
        │
        ▼
FeatureContext           ← private surface (UX-5.6 · intact)
        │
        ▼
FeatureHooks             ← read-only access (this phase)
  useFeatures()          → context.states (exact reference)
  useFeatureState(id)    → context.states.get(id)
  useFeature(id)         → useFeatureState(id)  [alias]

src/ui/features/
  FeatureTypes.ts          ← intact (UX-5.1)
  FeatureDefinition.ts     ← intact (API Freeze v2)
  FeatureRegistry.ts       ← intact (UX-5.2 API Freeze)
  FeatureState.ts          ← intact (UX-5.5 Runtime State Freeze)
  FeatureContext.tsx       ← intact (UX-5.6 Provider Freeze)
  FeatureProvider.tsx      ← intact (UX-5.6 Provider Freeze)
  FeatureHooks.ts          ← read-only hooks (this phase)
  index.ts                 ← intact (local barrel, NOT @/ui)

Deferred:
  Bridge     → UX-5.8
  Diagnostics → UX-5.9
```

### Hook Principles

```text
READ-ONLY ACCESS:
  Hooks consume FeatureContext only
  No ownership · no mutation · no snapshot creation/replacement

REFERENCE STABILITY:
  useFeatures() returns exactly context.states
  Must NOT construct: new Map(...) · Object.freeze(...) · copies · wrappers
  Reference identity is part of the UX-5.7 API Freeze
  (UX-5.8 may rely on this stability)

ALIAS CONTRACT:
  useFeature(id) = return useFeatureState(id)
  No independent Context read · no Registry · no extra logic
  Alias freezes the public surface extended in UX-5.8

ERROR CONTRACT:
  If FeatureContext === null, throw exactly:
  "Feature hooks must be used inside FeatureProvider."
  No shared helper · each Context-consuming hook inlines the check
  useFeature inherits via delegation

SNAPSHOT PHILOSOPHY:
  Hooks only read FeatureState snapshots
  Never modify · create · or replace snapshots
  FeatureProvider remains sole runtime-state owner

HOOK ISOLATION:
  FeatureHooks.ts knows only:
    FeatureContext · FeatureId · FeatureState · useContext
  Does NOT know:
    FeatureRegistry · FeatureDefinition · FeatureProvider
    Runtime · Toolbar / Sidebar / Inspector / Panels / Menus

PROHIBITED:
  setters · dispatch · updateFeature · enableFeature · disableFeature
  useFeatureRegistry · selectors · memoization · Store · bridge
  Context helper utilities · product chrome wiring
```

### Policy

```text
Hooks = read-only access layer; Provider continues as map owner.
Registry remains independent (hooks do not consult Registry).
Registry API Freeze UX-5.2 remains vigente.
FeatureDefinition API Freeze v2 remains vigente.
Runtime State Freeze UX-5.5 remains vigente.
Provider Freeze UX-5.6 remains vigente.
Hooks / Provider / Context / State are not re-exported from
features/index.ts or src/ui/index.ts in this phase.
validate:ux-5.7 = active series gate.
validate:ux-5.6 = historical validator of the prior contract · do not modify ·
not part of the series gate after UX-5.7.
Sin wiring de producto · Sin comportamiento nuevo.
```

### Imports

```text
FeatureHooks.ts      ✓  react (useContext) · FeatureContext · FeatureId · FeatureState
FeatureHooks.ts      ✗  FeatureRegistry · FeatureDefinition · FeatureProvider
FeatureHooks.ts      ✗  createFeatureState · Runtime · chrome
FeatureProvider.tsx  ✗  unchanged (UX-5.6)
FeatureContext.tsx   ✗  unchanged (UX-5.6)
FeatureRegistry      ✗  React / Provider / Context / FeatureState / Hooks
src/ui/features/**   ✗  src/ui/theme/runtime/**
src/ui/features/**   ✗  Toolbar / Sidebar / Inspector / Panels / Menus
src/ui/index.ts      ✗  features / hooks (no public @/ui expansion)
features/index.ts    ✗  FeatureProvider / FeatureContext / FeatureState / Hooks
```

---

## 5. Risks

- Copiar o wrappear `context.states` en `useFeatures` → mitigado: Reference Stability + fence `readonlyHooks`.
- Introducir helper compartido de Context → Out of Scope; Error Contract exige inline.
- Consultar Registry prematuramente en `useFeature` → Alias Contract + `hookIsolation`.
- Mutar snapshots desde hooks → Snapshot Philosophy + `readonlyHooks` / `noMutators`.
- Interpretar fallo de `validate:ux-5.6` como regresión → documentado como histórico; gate vigente = `validate:ux-5.7`.
- Ampliar `@/ui` prematuramente → `publicBarrelIntact`.
- Conectar chrome de producto → `noProductWire`.

---

## 6. Rollback Strategy

1. Eliminar `src/ui/features/FeatureHooks.ts`.
2. Eliminar `docs/UX/UX-5.7.md` y `scripts/validate-ux-5.7.ts`.
3. Quitar `validate:ux-5.7` de `package.json`.
4. Revertir estado UX-5.7 en roadmap a PENDING; Next = UX-5.7.
5. AppShell / Runtime / chrome / Provider / Context / Types / Definition /
   Registry / State / barrels / `validate:ux-5.6` permanecen intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureHooks.ts` | CREATE — useFeature · useFeatures · useFeatureState |
| `docs/UX/UX-5.7.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | UPDATE — UX-5.7 = COMPLETE · Next = UX-5.8 |
| `scripts/validate-ux-5.7.ts` | CREATE |
| `package.json` | `validate:ux-5.7` |

**Protegidos:** `FeatureTypes.ts`, `FeatureDefinition.ts`, `FeatureRegistry.ts`,
`FeatureState.ts`, `FeatureContext.tsx`, `FeatureProvider.tsx`,
`src/ui/features/index.ts`, `src/ui/index.ts`,
`scripts/validate-ux-5.6.ts` (histórico), `src/ui/theme/runtime/**`,
`src/ui/providers/**`, `src/components/app-shell/**`,
Toolbar / Sidebar / Inspector / Workspace, certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.7)

- [x] CA-UX-5.7.1 Existe `docs/UX/UX-5.7.md`
- [x] CA-UX-5.7.2 Existe `FeatureHooks.ts` con `"use client"`
- [x] CA-UX-5.7.3 Existen `useFeature` · `useFeatures` · `useFeatureState`
- [x] CA-UX-5.7.4 Todos son de solo lectura (sin mutación / sin createFeatureState)
- [x] CA-UX-5.7.5 Consumen únicamente `FeatureContext` (`providerUsage` · `hookIsolation`)
- [x] CA-UX-5.7.6 Error Contract exacto si Context es null
- [x] CA-UX-5.7.7 `useFeature` es alias de `useFeatureState`
- [x] CA-UX-5.7.8 Reference Stability: `useFeatures()` → exact `context.states`
- [x] CA-UX-5.7.9 Provider · Context · Registry intactos
- [x] CA-UX-5.7.10 Sin Runtime / product wire; barrels intactos
- [x] CA-UX-5.7.11 `npx tsc --noEmit` PASS
- [x] CA-UX-5.7.12 `npm run validate:ux-5.7` PASS
- [x] CA-UX-5.7.13 Roadmap marca UX-5.7 = COMPLETE · Next = UX-5.8
- [x] CA-UX-5.7.14 `validate:ux-5.6` documentado como histórico; gate vigente = `validate:ux-5.7`

---

## 9. Gate

```text
npm run validate:ux-5.7
```

Blocks: `priorGate` · `hooksExist` · `readonlyHooks` · `providerUsage` ·
`hookIsolation` · `errorContract` · `aliasContract` · `providerUntouched` ·
`contextUntouched` · `registryUntouched` · `noRuntimeDep` · `noProductWire` ·
`publicBarrelIntact` · `noMutators` · `tscCompile`

---

## 10. Definition of Done

- [x] Feature Hooks congelados (API Freeze UX-5.7)
- [x] Hook Principles · Reference Stability · Hook Isolation · Snapshot Philosophy documentados
- [x] Provider = sole map owner (Provider Freeze UX-5.6 intacto)
- [x] Definition · Registry · State · Context · Provider intactos
- [x] Registry API Freeze UX-5.2 intacto
- [x] FeatureDefinition API Freeze v2 intacto
- [x] Sin setters / dispatch / Store / bridge / sync / mutación
- [x] Barrel local sin reexport de hooks/Provider/Context; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.7.md` completo (incluye gobernanza de validators)
- [x] Gates PASS (`validate:ux-5.7`)
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.7 = COMPLETE; Next = UX-5.8

---

## 11. Next

**Next:** UX-5.8 — Feature Integration Bridge  
Adaptation bridge between Features and Toolbar · Sidebar · Inspector ·
Panels · Menus. First phase where visible wiring may begin.
Progressive and reversible.

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-5.6.md`](./UX-5.6.md)
- [`UX-5.5.md`](./UX-5.5.md)
- [`UX-5.4.md`](./UX-5.4.md)
- [`UX-5.3.md`](./UX-5.3.md)
- [`UX-5.2.md`](./UX-5.2.md)
- [`UX-5.1.md`](./UX-5.1.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureHooks.ts`](../../src/ui/features/FeatureHooks.ts)
- [`src/ui/features/FeatureContext.tsx`](../../src/ui/features/FeatureContext.tsx)
- [`src/ui/features/FeatureProvider.tsx`](../../src/ui/features/FeatureProvider.tsx)
- [`scripts/validate-ux-5.7.ts`](../../scripts/validate-ux-5.7.ts)
