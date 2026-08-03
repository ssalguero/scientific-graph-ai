# UX-5.4 — Feature Visibility

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Visibility = metadata únicamente (sin filtrado en Registry).
> - Estado separado de definición (state deferred to UX-5.5).
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin cambios funcionales visibles hasta UX-5.8.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.4 — Feature Visibility  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.3 COMPLETE · UX-5.2 COMPLETE · UX-5.1 COMPLETE · UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.4 = Feature Visibility
SCOPE = unified visibility metadata on FeatureDefinition (API Freeze v2)
FeatureVisibility = visible · hidden · experimental · beta · internal
FeatureDefinition = id · category · icon · title · description · tags · keywords · visibility
REPLACES UX-5.3 flags = experimental:boolean · hidden:boolean
createFeatureDefinition(init) = copy-before-freeze tags/keywords + freeze definition
Registry API Freeze UX-5.2 = VIGENTE (get / has / size / getAll / byCategory / find / enabled)
Metadata Freeze UX-5.3 = VIGENTE (descriptive fields + immutability)
FeatureDefinition API Freeze v2 = VIGENTE
validate:ux-5.4 = gate vigente de la serie
validate:ux-5.3 = histórico (contrato anterior; no forma parte del gate)
NO visibility filters · NO byVisibility · NO permissions
NO React · NO Context · NO hooks
NO runtime state
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO @/ui public barrel expansion
NO production functional change
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.5 Feature State
```

---

## 1. Purpose / Objetivo

Incorporar reglas de visibilidad como metadata estructural de las features
**sin modificar el comportamiento del FeatureRegistry**, **sin estado runtime**,
**sin React**, y **sin cambios funcionales visibles**.

```text
UX-5.4 widens only the FeatureDefinition contract with a unified Visibility Model.
It does not filter, authorize, integrate, or mutate features.
FeatureDefinition API Freeze v2 deliberately substitutes the UX-5.3 boolean flags.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5.3 Feature Metadata COMPLETE | [`UX-5.3.md`](./UX-5.3.md) · `validate:ux-5.3` (histórico) |
| Registry query-only SSOT + discovery | [`FeatureRegistry.ts`](../../src/ui/features/FeatureRegistry.ts) |
| FeatureDefinition tenía `experimental` / `hidden` boolean | [`FeatureDefinition.ts`](../../src/ui/features/FeatureDefinition.ts) |
| UX-4 SERIES CERTIFIED | [`UX-4.10.md`](./UX-4.10.md) |
| Runtime UX-3 API Freeze vigente | [`UX-3.21.md`](./UX-3.21.md) |
| Roadmap UX-5.0 FROZEN | [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `FeatureVisibility` (cinco valores literales)
- Ampliar `FeatureDefinition` con `visibility` (API Freeze v2)
- Eliminar `experimental` / `hidden` boolean del contrato
- `FeatureDefinitionInit` + `createFeatureDefinition(init)` (mismo copy-before-freeze)
- Doc + `validate:ux-5.4` + roadmap status COMPLETE
- Declarar `validate:ux-5.3` como validator histórico

**Out**

- Filtros / búsqueda por visibility
- Permissions / auth / feature flags
- State (→ UX-5.5)
- Cambios a `FeatureRegistry.ts` · `FeatureTypes.ts` · barrels
- FeatureProvider / Context / hooks (→ UX-5.6 / UX-5.7)
- Bridge Toolbar / Sidebar / Inspector / Panels / Menus (→ UX-5.8)
- Diagnostics (→ UX-5.9)
- Reexport desde `src/ui/index.ts`
- Modificar `validate:ux-5.3.ts`
- Cualquier cambio visual o de comportamiento en la app

---

## 4. Architecture

```text
src/ui/features/
  FeatureTypes.ts          ← intact (UX-5.1)
  FeatureDefinition.ts     ← visibility contract + createFeatureDefinition (this phase)
  FeatureRegistry.ts       ← intact (UX-5.2 API Freeze)
  index.ts                 ← intact (local barrel, NOT @/ui)

Definition surface (FeatureDefinition API Freeze v2):
  id · category · icon · title · description · tags · keywords · visibility

Construction:
  createFeatureDefinition(init)
    tags = Object.freeze([...init.tags])
    keywords = Object.freeze([...init.keywords])
    return Object.freeze({ ...init, tags, keywords })
  Registry continues shallow Object.freeze({ ...def }) only

Deferred:
  Visibility filters → later phase (not UX-5.4)
  State      → UX-5.5
  Provider   → UX-5.6
  Bridge     → UX-5.8
```

### Visibility Principles

```text
visible       = Feature normal
hidden        = Oculta por defecto
experimental  = Experimental
beta          = Preview / Beta
internal      = Uso interno
FeatureVisibility = metadata only · no Registry behavior in UX-5.4
Replaces independent experimental:boolean + hidden:boolean (UX-5.3)
Avoids inconsistent dual-flag states
Registry must not filter or search by visibility in UX-5.4
All metadata remains readonly · immutable · purely descriptive
```

### Policy

```text
FeatureDefinition API Freeze v2 supersedes UX-5.3 definition shape.
Registry API Freeze UX-5.2 remains vigente (query-only, metadata-agnostic).
Metadata Freeze UX-5.3 remains vigente for descriptive fields + immutability.
Immutability ownership belongs to FeatureDefinition.ts (createFeatureDefinition).
No secondary indexes · no visibility filters · no permissions.
FeatureDefinitionInit / createFeatureDefinition / FeatureVisibility are not
re-exported from features/index.ts in this phase.
validate:ux-5.4 = active series gate.
validate:ux-5.3 = historical validator of the prior contract · do not modify ·
not part of the series gate after UX-5.4.
```

### Imports

```text
src/ui/features/**  ✗  react / react-dom
src/ui/features/**  ✗  src/ui/theme/runtime/**
src/ui/features/**  ✗  Toolbar / Sidebar / Inspector / Panels / Menus
src/ui/index.ts     ✗  features (no public @/ui expansion)
```

---

## 5. Risks

- Congelar arrays del llamador in-place → mitigado con copy-before-freeze `[...init.tags]`.
- Interpretar fallo de `validate:ux-5.3` como regresión → mitigado: documentado como histórico; gate vigente = `validate:ux-5.4`.
- Meter lógica de visibility en Registry → fence `noVisibilityLogic` + `registryUntouched`.
- Conservar flags legacy → fence `legacyFlagsRemoved`.
- Adelantar state/permissions → visibility es metadata only; state → UX-5.5.
- Ampliar `@/ui` prematuramente → `publicBarrelIntact`.
- Conectar chrome de producto → `noProductWire`.

---

## 6. Rollback Strategy

1. Revertir `FeatureDefinition.ts` al contrato UX-5.3 (`experimental` / `hidden` boolean).
2. Eliminar `docs/UX/UX-5.4.md` y `scripts/validate-ux-5.4.ts`.
3. Quitar `validate:ux-5.4` de `package.json`.
4. Revertir estado UX-5.4 en roadmap a PENDING; Next = UX-5.4.
5. AppShell / Runtime / chrome / `FeatureTypes` / `FeatureRegistry` / barrels / `validate:ux-5.3` permanecen intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureDefinition.ts` | UPDATE — FeatureVisibility + API Freeze v2 |
| `docs/UX/UX-5.4.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | UPDATE — UX-5.4 = COMPLETE · Next = UX-5.5 |
| `scripts/validate-ux-5.4.ts` | CREATE |
| `package.json` | `validate:ux-5.4` |

**Protegidos:** `FeatureTypes.ts`, `FeatureRegistry.ts`, `src/ui/features/index.ts`,
`src/ui/index.ts`, `scripts/validate-ux-5.3.ts` (histórico), `src/ui/theme/runtime/**`,
`src/ui/providers/**`, `src/components/app-shell/**`, Toolbar / Sidebar / Inspector /
Workspace, certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.4)

- [x] CA-UX-5.4.1 Existe `docs/UX/UX-5.4.md`
- [x] CA-UX-5.4.2 Existe `FeatureVisibility` con exactamente cinco valores
- [x] CA-UX-5.4.3 `FeatureDefinition` utiliza únicamente `visibility`
- [x] CA-UX-5.4.4 `FeatureDefinitionInit` actualizado; `experimental` / `hidden` eliminados
- [x] CA-UX-5.4.5 `createFeatureDefinition(init)` mantiene copy-before-freeze
- [x] CA-UX-5.4.6 El Registry mantiene exactamente la API de UX-5.2
- [x] CA-UX-5.4.7 No existen filtros ni lógica basada en visibility
- [x] CA-UX-5.4.8 Sin React / Context / hooks / Runtime / product wire
- [x] CA-UX-5.4.9 `src/ui/index.ts` intacto
- [x] CA-UX-5.4.10 `npx tsc --noEmit` PASS
- [x] CA-UX-5.4.11 `npm run validate:ux-5.4` PASS
- [x] CA-UX-5.4.12 Roadmap marca UX-5.4 = COMPLETE · Next = UX-5.5
- [x] CA-UX-5.4.13 API Freeze v2 declarado; `validate:ux-5.3` documentado como histórico

---

## 9. Gate

```text
npm run validate:ux-5.4
```

Blocks: `priorGate` · `visibilityContract` · `definitionContract` · `initContract` ·
`helperUpdated` · `frozenCollections` · `legacyFlagsRemoved` · `registryUntouched` ·
`noVisibilityLogic` · `noReact` · `noRuntimeDep` · `noProductWire` ·
`publicBarrelIntact` · `tscCompile`

---

## 10. Definition of Done

- [x] FeatureDefinition API Freeze v2 congelado (`visibility` unificado)
- [x] Flags `experimental` / `hidden` eliminados del contrato
- [x] `createFeatureDefinition` owns copy-before-freeze de `tags` / `keywords`
- [x] Registry API Freeze UX-5.2 intacto; sin lógica de visibility
- [x] Sin React / Context / hooks / bridge / permissions / state
- [x] Barrel local únicamente; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.4.md` completo (incluye gobernanza de validators)
- [x] Gates PASS (`validate:ux-5.4`)
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.4 = COMPLETE; Next = UX-5.5

---

## 11. Next

**Next:** UX-5.5 — Feature State  
Runtime state separado de definición/metadata (`enabled` / `disabled` /
`loading` / `error`). Sin React de producto · sin Provider todavía.

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-5.3.md`](./UX-5.3.md)
- [`UX-5.2.md`](./UX-5.2.md)
- [`UX-5.1.md`](./UX-5.1.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureDefinition.ts`](../../src/ui/features/FeatureDefinition.ts)
- [`scripts/validate-ux-5.4.ts`](../../scripts/validate-ux-5.4.ts)
