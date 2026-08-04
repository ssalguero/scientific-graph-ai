# UX-5.8 — Feature Integration Bridge

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Visibility = metadata únicamente (sin filtrado en Registry).
> - Runtime State separado de FeatureDefinition.
> - FeatureState = snapshot inmutable de un estado conceptualmente mutable.
> - FeatureProvider = propietario del mapa runtime de FeatureState (refs only).
> - Feature Hooks = capa de lectura sobre FeatureContext (sin mutación).
> - FeatureBridge = pass-through desacoplado (Availability assertion only).
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin wiring de producción · Sin comportamiento nuevo.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.8 — Feature Integration Bridge  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.7 COMPLETE · UX-5.6 COMPLETE · UX-5.5 COMPLETE · UX-5.4 COMPLETE · UX-5.3 COMPLETE · UX-5.2 COMPLETE · UX-5.1 COMPLETE · UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.8 = Feature Integration Bridge
SCOPE = Decoupled pass-through React Bridge (no product wire · no chrome)
API FREEZE:
  FeatureBridge({ children }: FeatureBridgeProps): ReactNode
  FeatureBridgeProps = Readonly<{ children: ReactNode }>
BRIDGE = children-only · fragment render · no state · no effects
AVAILABILITY ASSERTION ONLY:
  useFeatures() verifies tree is inside FeatureProvider
  MUST NOT: read return · .size · iterate Map · derive flags · conditional render
HOOK CONTRACT = useFeatures() only · no useFeature · no useFeatureState
BRIDGE ISOLATION = ReactNode · useFeatures · local types only
Provider Freeze UX-5.6 = VIGENTE (sole map owner)
Hooks API Freeze UX-5.7 = VIGENTE
Registry API Freeze UX-5.2 = VIGENTE
FeatureDefinition API Freeze v2 = VIGENTE
Metadata Freeze UX-5.3 = VIGENTE
Runtime State Freeze UX-5.5 = VIGENTE
validate:ux-5.8 = gate vigente de la serie
validate:ux-5.7 = histórico (contrato anterior; no forma parte del gate)
NO Providers · NO Context · NO state · NO effects · NO memo
NO Runtime wiring
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO production mount (AppShell · Layout · page.tsx)
NO @/ui public barrel expansion
NO features/index.ts expansion
NO production functional change · Sin comportamiento nuevo
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.9 Feature Diagnostics
```

---

## 1. Purpose / Objetivo

Introducir el primer **punto de contacto controlado** entre la infraestructura
de Features y la futura integración con el chrome, mediante un componente
React de **paso (pass-through)** que **no modifica comportamiento**, **no
consume el Map de Features**, y **no se monta en producción**.

```text
UX-5.8 creates FeatureBridge only (children · useFeatures availability assertion).
Bridge proves Hooks/Provider stack is reachable. It does not wire chrome.
No Map consumption. No product UI wiring. No @/ui barrel expansion.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5.7 Feature Hooks COMPLETE | [`UX-5.7.md`](./UX-5.7.md) · `validate:ux-5.7` (histórico) |
| useFeatures / useFeatureState / useFeature (alias) | [`FeatureHooks.ts`](../../src/ui/features/FeatureHooks.ts) |
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

- `FeatureBridge.tsx` (`FeatureBridge` · `FeatureBridgeProps`)
- Availability assertion via bare `useFeatures()` call
- Bridge Isolation + Bridge Principles documentados
- Doc + `validate:ux-5.8` + roadmap status COMPLETE
- Declarar `validate:ux-5.7` como validator histórico

**Out**

- Montaje en AppShell / Layout / page.tsx
- Integración Toolbar / Sidebar / Inspector / Panels / Menus
- Lectura / iteración / flags derivados del Map de Features
- Store / sync / persistence / observers / mutación
- Cambios a Provider · Context · Hooks · Definition · Registry · Types · State · barrels
- Diagnostics (→ UX-5.9)
- Integration Certification (→ UX-5.10)
- Reexport desde `src/ui/index.ts` o `features/index.ts`
- Modificar `validate:ux-5.7.ts`
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
FeatureHooks             ← read-only access (UX-5.7 · intact)
        │
        ▼
FeatureBridge            ← pass-through (this phase)
  useFeatures()          → Availability assertion only
  return <>{children}</> → unconditional fragment

src/ui/features/
  FeatureTypes.ts          ← intact (UX-5.1)
  FeatureDefinition.ts     ← intact (API Freeze v2)
  FeatureRegistry.ts       ← intact (UX-5.2 API Freeze)
  FeatureState.ts          ← intact (UX-5.5 Runtime State Freeze)
  FeatureContext.tsx       ← intact (UX-5.6 Provider Freeze)
  FeatureProvider.tsx      ← intact (UX-5.6 Provider Freeze)
  FeatureHooks.ts          ← intact (UX-5.7 Hooks API Freeze)
  FeatureBridge.tsx        ← pass-through Bridge (this phase)
  index.ts                 ← intact (local barrel, NOT @/ui)

Deferred:
  Chrome wiring → later phases
  Diagnostics   → UX-5.9
  Certification → UX-5.10
```

### Bridge Principles

```text
PASS-THROUGH:
  FeatureBridge accepts children only
  Renders exactly <>{children}</>
  No Providers · no Context · no state · no effects · no memo

AVAILABILITY ASSERTION ONLY:
  useFeatures() is called solely to verify the tree is inside FeatureProvider
  MUST NOT:
    - read / bind the returned ReadonlyMap
    - check .size
    - iterate the Map
    - derive flags / booleans from the result
    - render conditionally based on Features state
    - transform Feature data

HOOK CONTRACT:
  Bridge may use useFeatures() only
  Does NOT use useFeature() · useFeatureState()
  FeatureHooks.ts remains untouched (Hooks API Freeze UX-5.7)

BRIDGE ISOLATION:
  FeatureBridge.tsx knows only:
    ReactNode · useFeatures · local FeatureBridgeProps
  Does NOT know:
    FeatureProvider · FeatureContext · FeatureRegistry · FeatureDefinition
    Runtime · Toolbar / Sidebar / Inspector / Panels / Menus

SNAPSHOT PHILOSOPHY:
  Bridge never creates · replaces · or modifies FeatureState snapshots
  FeatureProvider remains sole runtime-state owner

WIRING:
  Bridge is NOT mounted in production in this phase
  No AppShell · Layout · page.tsx changes

PROHIBITED:
  setters · dispatch · Store · chrome imports · barrel expansion
  conditional UI · Map consumption · product wiring
```

### Policy

```text
Bridge = decoupled pass-through; Provider continues as map owner.
Hooks API Freeze UX-5.7 remains vigente.
Registry API Freeze UX-5.2 remains vigente.
FeatureDefinition API Freeze v2 remains vigente.
Runtime State Freeze UX-5.5 remains vigente.
Provider Freeze UX-5.6 remains vigente.
Bridge / Hooks / Provider / Context / State are not re-exported from
features/index.ts or src/ui/index.ts in this phase.
validate:ux-5.8 = active series gate.
validate:ux-5.7 = historical validator of the prior contract · do not modify ·
not part of the series gate after UX-5.8.
Sin wiring de producto · Sin comportamiento nuevo.
```

### Imports

```text
FeatureBridge.tsx    ✓  react (ReactNode type) · useFeatures (FeatureHooks)
FeatureBridge.tsx    ✗  FeatureProvider · FeatureContext · FeatureRegistry
FeatureBridge.tsx    ✗  FeatureDefinition · Runtime · chrome
FeatureHooks.ts      ✗  unchanged (UX-5.7)
FeatureProvider.tsx  ✗  unchanged (UX-5.6)
FeatureContext.tsx   ✗  unchanged (UX-5.6)
FeatureRegistry      ✗  React / Provider / Context / FeatureState / Hooks / Bridge
src/ui/features/**   ✗  src/ui/theme/runtime/**
src/ui/features/**   ✗  Toolbar / Sidebar / Inspector / Panels / Menus
src/ui/index.ts      ✗  features / Bridge / hooks (no public @/ui expansion)
features/index.ts    ✗  FeatureBridge / FeatureProvider / FeatureContext /
                     ✗  FeatureState / Hooks
```

---

## 5. Risks

- Leer o consumir el Map en el Bridge → mitigado: Availability assertion + fence `hookUsage` / `noBehavior`.
- Importar Provider/Context/Registry prematuramente → `bridgeIsolation`.
- Conectar chrome de producto → `chromeIsolation` + `noProductWire`.
- Montar Bridge en AppShell/Layout → `noProductWire`.
- Ampliar `@/ui` o `features/index.ts` → `publicBarrelIntact`.
- Mutar Provider / Hooks / Registry → `providerUntouched` / `hooksUntouched` / `registryUntouched`.
- Interpretar fallo de `validate:ux-5.7` como regresión → documentado como histórico; gate vigente = `validate:ux-5.8`.

---

## 6. Rollback Strategy

1. Eliminar `src/ui/features/FeatureBridge.tsx`.
2. Eliminar `docs/UX/UX-5.8.md` y `scripts/validate-ux-5.8.ts`.
3. Quitar `validate:ux-5.8` de `package.json`.
4. Revertir estado UX-5.8 en roadmap a PENDING; Next = UX-5.8.
5. AppShell / Runtime / chrome / Provider / Context / Hooks / Types / Definition /
   Registry / State / barrels / `validate:ux-5.7` permanecen intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureBridge.tsx` | CREATE — FeatureBridge · FeatureBridgeProps |
| `docs/UX/UX-5.8.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | UPDATE — UX-5.8 = COMPLETE · Next = UX-5.9 |
| `scripts/validate-ux-5.8.ts` | CREATE |
| `package.json` | `validate:ux-5.8` |

**Protegidos:** `FeatureTypes.ts`, `FeatureDefinition.ts`, `FeatureRegistry.ts`,
`FeatureState.ts`, `FeatureContext.tsx`, `FeatureProvider.tsx`, `FeatureHooks.ts`,
`src/ui/features/index.ts`, `src/ui/index.ts`,
`scripts/validate-ux-5.7.ts` (histórico), `src/ui/theme/runtime/**`,
`src/ui/providers/**`, `src/components/app-shell/**`,
Toolbar / Sidebar / Inspector / Workspace, certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.8)

- [x] CA-UX-5.8.1 Existe `docs/UX/UX-5.8.md`
- [x] CA-UX-5.8.2 Existe `FeatureBridge.tsx` con `"use client"`
- [x] CA-UX-5.8.3 Exporta `FeatureBridge` · props = `children` only
- [x] CA-UX-5.8.4 Usa únicamente `useFeatures()` (Availability assertion)
- [x] CA-UX-5.8.5 No lee el Map · no `.size` · no iteración · no flags · no render condicional
- [x] CA-UX-5.8.6 Bridge Isolation (imports allowlist)
- [x] CA-UX-5.8.7 Sin estado / efectos / memo
- [x] CA-UX-5.8.8 Render = `<>{children}</>` incondicional
- [x] CA-UX-5.8.9 Provider · Hooks · Registry intactos
- [x] CA-UX-5.8.10 Sin Runtime / product wire; barrels intactos; sin montaje
- [x] CA-UX-5.8.11 `npx tsc --noEmit` PASS
- [x] CA-UX-5.8.12 `npm run validate:ux-5.8` PASS
- [x] CA-UX-5.8.13 Roadmap marca UX-5.8 = COMPLETE · Next = UX-5.9
- [x] CA-UX-5.8.14 `validate:ux-5.7` documentado como histórico; gate vigente = `validate:ux-5.8`

---

## 9. Gate

```text
npm run validate:ux-5.8
```

Blocks: `priorGate` · `bridgeExists` · `bridgeContract` · `hookUsage` ·
`bridgeIsolation` · `noState` · `chromeIsolation` · `providerUntouched` ·
`hooksUntouched` · `registryUntouched` · `noRuntimeDep` · `noProductWire` ·
`publicBarrelIntact` · `noBehavior` · `tscCompile`

---

## 10. Definition of Done

- [x] Feature Bridge congelado (API Freeze UX-5.8)
- [x] Bridge Principles · Availability assertion · Bridge Isolation documentados
- [x] Provider = sole map owner (Provider Freeze UX-5.6 intacto)
- [x] Hooks API Freeze UX-5.7 intacto
- [x] Definition · Registry · State · Context · Provider · Hooks intactos
- [x] Registry API Freeze UX-5.2 intacto
- [x] FeatureDefinition API Freeze v2 intacto
- [x] Sin setters / dispatch / Store / chrome wire / mutación / montaje
- [x] Barrel local sin reexport de Bridge/hooks/Provider/Context; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.8.md` completo (incluye gobernanza de validators)
- [x] Gates PASS (`validate:ux-5.8`)
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.8 = COMPLETE; Next = UX-5.9

---

## 11. Next

**Next:** UX-5.9 — Feature Diagnostics  
Integrity reports for the registry SSOT
(enabled · hidden · duplicates · invalid ids · missing metadata).

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-5.7.md`](./UX-5.7.md)
- [`UX-5.6.md`](./UX-5.6.md)
- [`UX-5.5.md`](./UX-5.5.md)
- [`UX-5.4.md`](./UX-5.4.md)
- [`UX-5.3.md`](./UX-5.3.md)
- [`UX-5.2.md`](./UX-5.2.md)
- [`UX-5.1.md`](./UX-5.1.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureBridge.tsx`](../../src/ui/features/FeatureBridge.tsx)
- [`src/ui/features/FeatureHooks.ts`](../../src/ui/features/FeatureHooks.ts)
- [`src/ui/features/FeatureProvider.tsx`](../../src/ui/features/FeatureProvider.tsx)
- [`scripts/validate-ux-5.8.ts`](../../scripts/validate-ux-5.8.ts)
