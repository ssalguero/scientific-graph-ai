# UX-5.9 — Feature Diagnostics

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Visibility = metadata únicamente (sin filtrado en Registry).
> - Runtime State separado de FeatureDefinition.
> - FeatureState = snapshot inmutable de un estado conceptualmente mutable.
> - FeatureProvider = propietario del mapa runtime de FeatureState (refs only).
> - Feature Hooks = capa de lectura sobre FeatureContext (sin mutación).
> - FeatureBridge = pass-through desacoplado (Availability assertion only).
> - FeatureDiagnostics = acknowledgements estructurales de compilación (sin runtime).
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin wiring de producción · Sin comportamiento nuevo.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.9 — Feature Diagnostics  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.8 COMPLETE · UX-5.7 COMPLETE · UX-5.6 COMPLETE · UX-5.5 COMPLETE · UX-5.4 COMPLETE · UX-5.3 COMPLETE · UX-5.2 COMPLETE · UX-5.1 COMPLETE · UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.9 = Feature Diagnostics
SCOPE = Pure TypeScript structural diagnostics (no React · no Runtime · no UI)
API FREEZE:
  FeatureDiagnosticsReport = Readonly<{
    registryFrozen: boolean;
    providerAvailable: boolean;
    hooksAvailable: boolean;
    bridgeAvailable: boolean;
  }>
  createFeatureDiagnosticsReport(): FeatureDiagnosticsReport
DIAGNOSTICS = structural acknowledgements of compilation only
REPORT ISOLATION = zero imports from src/ui/features/* · local types + factory only
IMMUTABLE REPORT = Object.freeze(...) · no parameters · no side effects
Provider Freeze UX-5.6 = VIGENTE (sole map owner)
Hooks API Freeze UX-5.7 = VIGENTE
Bridge Freeze UX-5.8 = VIGENTE
Registry API Freeze UX-5.2 = VIGENTE
FeatureDefinition API Freeze v2 = VIGENTE
Metadata Freeze UX-5.3 = VIGENTE
Visibility Freeze UX-5.4 = VIGENTE
Runtime State Freeze UX-5.5 = VIGENTE
validate:ux-5.9 = gate vigente de la serie
validate:ux-5.8 = histórico (contrato anterior; no forma parte del gate)
NO React · NO "use client" · NO Context · NO hooks · NO Provider · NO Bridge
NO Runtime wiring · NO registry scans · NO health checks · NO logging
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO production mount (AppShell · Layout · page.tsx)
NO @/ui public barrel expansion
NO features/index.ts expansion
NO production functional change · Sin comportamiento nuevo
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.10 Integration Certification
```

---

## 1. Purpose / Objetivo

Introducir una capa **privada y desacoplada** de diagnóstico para la
infraestructura de Features construida en UX-5.1–UX-5.8.

UX-5.9 **no modifica comportamiento**, **no crea UI**, **no integra el Bridge**
y **no cambia el Runtime**. Su único objetivo es producir un
`FeatureDiagnosticsReport` que permita verificar la integridad estructural
del sistema antes de la certificación UX-5.10.

```text
UX-5.9 creates FeatureDiagnostics only (frozen structural report).
Diagnóstico desacoplado. Structural acknowledgements only. Report Isolation.
No React. No Runtime. No comportamiento nuevo. No @/ui barrel expansion.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5.8 Feature Integration Bridge COMPLETE | [`UX-5.8.md`](./UX-5.8.md) · `validate:ux-5.8` (histórico) |
| FeatureBridge = children-only pass-through | [`FeatureBridge.tsx`](../../src/ui/features/FeatureBridge.tsx) |
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

- `FeatureDiagnostics.ts` (`FeatureDiagnosticsReport` · `createFeatureDiagnosticsReport`)
- Diagnostics Principles · Report Isolation documentados
- Doc + `validate:ux-5.9` + roadmap status COMPLETE
- Declarar `validate:ux-5.8` como validator histórico

**Out**

- Registry scans (enabled · hidden · duplicates · invalid ids · missing metadata)
- Runtime health checks · logging · telemetry · analytics · auto-repair
- UI diagnóstica
- Montaje en AppShell / Layout / page.tsx
- Integración Toolbar / Sidebar / Inspector / Panels / Menus
- Cambios a Provider · Context · Hooks · Bridge · Definition · Registry · Types · State · barrels
- Integration Certification (→ UX-5.10)
- Reexport desde `src/ui/index.ts` o `features/index.ts`
- Modificar `validate:ux-5.8.ts`
- Cualquier cambio visual o de comportamiento en la app

---

## 4. Architecture

```text
FeatureRegistry
        │
        ▼
FeatureProvider          ← sole map owner (UX-5.6 · intact)
        │
        ▼
FeatureHooks             ← read-only access (UX-5.7 · intact)
        │
        ▼
FeatureBridge            ← pass-through (UX-5.8 · intact)
        │
        ▼
FeatureDiagnostics       ← structural acknowledgements (this phase)
  createFeatureDiagnosticsReport()
  → Object.freeze({ registryFrozen, providerAvailable,
                    hooksAvailable, bridgeAvailable })

src/ui/features/
  FeatureTypes.ts          ← intact (UX-5.1)
  FeatureDefinition.ts     ← intact (API Freeze v2)
  FeatureRegistry.ts       ← intact (UX-5.2 API Freeze)
  FeatureState.ts          ← intact (UX-5.5 Runtime State Freeze)
  FeatureContext.tsx       ← intact (UX-5.6 Provider Freeze)
  FeatureProvider.tsx      ← intact (UX-5.6 Provider Freeze)
  FeatureHooks.ts          ← intact (UX-5.7 Hooks API Freeze)
  FeatureBridge.tsx        ← intact (UX-5.8 Bridge Freeze)
  FeatureDiagnostics.ts    ← pure diagnostics module (this phase)
  index.ts                 ← intact (local barrel, NOT @/ui)

Deferred:
  Integration Certification → UX-5.10
```

### Diagnostics Principles

```text
DIAGNOSTIC ONLY:
  FeatureDiagnostics produces a frozen FeatureDiagnosticsReport
  No side effects · no mutations · no observers

STRUCTURAL ACKNOWLEDGEMENTS ONLY:
  registryFrozen / providerAvailable / hooksAvailable / bridgeAvailable
  = acknowledgements estructurales de compilación
  ≠ disponibilidad en runtime

  NO significan:
    - Provider montado
    - Bridge activo
    - Hooks ejecutándose
    - Estado runtime / salud del sistema

  Únicamente certifican que la infraestructura correspondiente
  fue incorporada y congelada durante UX-5.1–UX-5.8.

REPORT ISOLATION:
  FeatureDiagnostics.ts knows only:
    local FeatureDiagnosticsReport · createFeatureDiagnosticsReport
  Does NOT import:
    FeatureRegistry · FeatureDefinition · FeatureState · FeatureContext
    FeatureProvider · FeatureHooks · FeatureBridge · Runtime · chrome

IMMUTABLE REPORT:
  return Object.freeze({ ... }) · no parameters · no helpers

PROHIBITED:
  React · "use client" · Context · hooks · Provider · Bridge
  console · logging · telemetry · analytics · registry scans
  setters · dispatch · Store · chrome imports · barrel expansion
```

### Policy

```text
Diagnostics = decoupled structural report; never interacts with infrastructure.
Diagnóstico desacoplado. Structural acknowledgements only. Report Isolation.
Reporte inmutable. Sin React. Sin Runtime. Sin comportamiento nuevo.
Bridge Freeze UX-5.8 remains vigente.
Hooks API Freeze UX-5.7 remains vigente.
Provider Freeze UX-5.6 remains vigente.
Registry API Freeze UX-5.2 remains vigente.
FeatureDefinition API Freeze v2 remains vigente.
Runtime State Freeze UX-5.5 remains vigente.
Metadata Freeze UX-5.3 · Visibility Freeze UX-5.4 remain vigente.
Diagnostics / Bridge / Hooks / Provider / Context / State are not re-exported
from features/index.ts or src/ui/index.ts in this phase.
validate:ux-5.9 = active series gate.
validate:ux-5.8 = historical validator of the prior contract · do not modify ·
not part of the series gate after UX-5.9.
Sin wiring de producto · Sin comportamiento nuevo.
```

### Imports

```text
FeatureDiagnostics.ts  ✓  (none — local types + factory only)
FeatureDiagnostics.ts  ✗  FeatureRegistry · FeatureDefinition · FeatureState
FeatureDiagnostics.ts  ✗  FeatureContext · FeatureProvider · FeatureHooks
FeatureDiagnostics.ts  ✗  FeatureBridge · React · Runtime · chrome
FeatureBridge.tsx      ✗  unchanged (UX-5.8)
FeatureHooks.ts        ✗  unchanged (UX-5.7)
FeatureProvider.tsx    ✗  unchanged (UX-5.6)
FeatureRegistry        ✗  unchanged (UX-5.2)
src/ui/features/**     ✗  src/ui/theme/runtime/**
src/ui/features/**     ✗  Toolbar / Sidebar / Inspector / Panels / Menus
src/ui/index.ts        ✗  features / Diagnostics / Bridge / hooks
features/index.ts      ✗  FeatureDiagnostics / FeatureBridge / FeatureProvider /
                       ✗  FeatureContext / FeatureState / Hooks
```

---

## 5. Risks

- Interpretar flags como salud runtime → mitigado: Diagnostics Principles + fence docs.
- Importar módulos de features/ → `reportIsolation`.
- Introducir React / Runtime → `noReact` / `noRuntimeDep`.
- Llamar hooks o Context → `noHooks`.
- Side effects (console / telemetry) → `noSideEffects`.
- Ampliar `@/ui` o `features/index.ts` → `publicBarrelIntact`.
- Mutar Bridge / Provider / Registry → `bridgeUntouched` / `providerUntouched` / `registryUntouched`.
- Interpretar fallo de `validate:ux-5.8` como regresión → documentado como histórico; gate vigente = `validate:ux-5.9`.

---

## 6. Rollback Strategy

1. Eliminar `src/ui/features/FeatureDiagnostics.ts`.
2. Eliminar `docs/UX/UX-5.9.md` y `scripts/validate-ux-5.9.ts`.
3. Quitar `validate:ux-5.9` de `package.json`.
4. Revertir estado UX-5.9 en roadmap a PENDING; Next = UX-5.9.
5. AppShell / Runtime / chrome / Bridge / Provider / Context / Hooks / Types /
   Definition / Registry / State / barrels / `validate:ux-5.8` permanecen intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureDiagnostics.ts` | CREATE — FeatureDiagnosticsReport · createFeatureDiagnosticsReport |
| `docs/UX/UX-5.9.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | UPDATE — UX-5.9 = COMPLETE · Next = UX-5.10 |
| `scripts/validate-ux-5.9.ts` | CREATE |
| `package.json` | `validate:ux-5.9` |

**Protegidos:** `FeatureTypes.ts`, `FeatureDefinition.ts`, `FeatureRegistry.ts`,
`FeatureState.ts`, `FeatureContext.tsx`, `FeatureProvider.tsx`, `FeatureHooks.ts`,
`FeatureBridge.tsx`, `src/ui/features/index.ts`, `src/ui/index.ts`,
`scripts/validate-ux-5.8.ts` (histórico), `src/ui/theme/runtime/**`,
`src/ui/providers/**`, `src/components/app-shell/**`,
Toolbar / Sidebar / Inspector / Workspace, certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.9)

- [x] CA-UX-5.9.1 Existe `docs/UX/UX-5.9.md`
- [x] CA-UX-5.9.2 Existe `FeatureDiagnostics.ts` (sin `"use client"`)
- [x] CA-UX-5.9.3 Exporta `FeatureDiagnosticsReport` con exactamente cuatro campos
- [x] CA-UX-5.9.4 Exporta `createFeatureDiagnosticsReport()` sin parámetros
- [x] CA-UX-5.9.5 Retorna `Object.freeze(...)` · reporte inmutable
- [x] CA-UX-5.9.6 Report Isolation (cero imports de `src/ui/features/*`)
- [x] CA-UX-5.9.7 Sin React · sin Runtime · sin hooks · sin Context
- [x] CA-UX-5.9.8 Sin side effects (console / logging / telemetry / analytics)
- [x] CA-UX-5.9.9 Bridge · Provider · Registry intactos
- [x] CA-UX-5.9.10 Sin product wire; barrels intactos; sin montaje
- [x] CA-UX-5.9.11 `npx tsc --noEmit` PASS
- [x] CA-UX-5.9.12 `npm run validate:ux-5.9` PASS
- [x] CA-UX-5.9.13 Roadmap marca UX-5.9 = COMPLETE · Next = UX-5.10
- [x] CA-UX-5.9.14 `validate:ux-5.8` documentado como histórico; gate vigente = `validate:ux-5.9`

---

## 9. Gate

```text
npm run validate:ux-5.9
```

Blocks: `priorGate` · `diagnosticsExists` · `reportContract` · `factoryContract` ·
`frozenReport` · `reportIsolation` · `noReact` · `noRuntimeDep` · `noHooks` ·
`noProductWire` · `bridgeUntouched` · `providerUntouched` · `registryUntouched` ·
`publicBarrelIntact` · `noSideEffects` · `tscCompile`

---

## 10. Definition of Done

- [x] Feature Diagnostics congelado (API Freeze UX-5.9)
- [x] Diagnostics Principles · Structural acknowledgements · Report Isolation documentados
- [x] Bridge Freeze UX-5.8 intacto
- [x] Provider = sole map owner (Provider Freeze UX-5.6 intacto)
- [x] Hooks API Freeze UX-5.7 intacto
- [x] Definition · Registry · State · Context · Provider · Hooks · Bridge intactos
- [x] Registry API Freeze UX-5.2 intacto
- [x] FeatureDefinition API Freeze v2 intacto
- [x] Sin React / Runtime / hooks / side effects / chrome wire / mutación / montaje
- [x] Barrel local sin reexport de Diagnostics/Bridge/hooks/Provider/Context; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.9.md` completo (incluye gobernanza de validators)
- [x] Gates PASS (`validate:ux-5.9`)
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.9 = COMPLETE; Next = UX-5.10

---

## 11. Next

**Next:** UX-5.10 — Integration Certification  
Certification only. Series close.

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-5.8.md`](./UX-5.8.md)
- [`UX-5.7.md`](./UX-5.7.md)
- [`UX-5.6.md`](./UX-5.6.md)
- [`UX-5.5.md`](./UX-5.5.md)
- [`UX-5.4.md`](./UX-5.4.md)
- [`UX-5.3.md`](./UX-5.3.md)
- [`UX-5.2.md`](./UX-5.2.md)
- [`UX-5.1.md`](./UX-5.1.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureDiagnostics.ts`](../../src/ui/features/FeatureDiagnostics.ts)
- [`src/ui/features/FeatureBridge.tsx`](../../src/ui/features/FeatureBridge.tsx)
- [`src/ui/features/FeatureProvider.tsx`](../../src/ui/features/FeatureProvider.tsx)
- [`scripts/validate-ux-5.9.ts`](../../scripts/validate-ux-5.9.ts)
