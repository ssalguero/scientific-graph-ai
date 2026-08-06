# UX-5.3 — Feature Metadata

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Estado separado de definición (state deferred to UX-5.5).
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin cambios funcionales visibles hasta UX-5.8.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.3 — Feature Metadata  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.2 COMPLETE · UX-5.1 COMPLETE · UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.3 = Feature Metadata
SCOPE = immutable descriptive metadata on FeatureDefinition
FeatureDefinition = id · category · icon · title · description · tags · keywords · experimental · hidden
createFeatureDefinition(init) = copy-before-freeze tags/keywords + freeze definition
Registry API Freeze UX-5.2 = VIGENTE (get / has / size / getAll / byCategory / find / enabled)
NO metadata filters · NO tag/keyword search
NO React · NO Context · NO hooks
NO visibility rules · NO runtime state
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO @/ui public barrel expansion
NO production functional change
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.4 Feature Visibility
```

---

## 1. Purpose / Objetivo

Incorporar metadata inmutable a las definiciones de features **sin modificar el
comportamiento del Registry**, **sin estado runtime**, **sin React**, y **sin
cambios funcionales visibles**.

```text
UX-5.3 widens the FeatureDefinition contract with descriptive metadata only.
It does not render, filter, integrate, or mutate features.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5.2 Feature Discovery COMPLETE | [`UX-5.2.md`](./UX-5.2.md) · `validate:ux-5.2` |
| Registry query-only SSOT + discovery | [`FeatureRegistry.ts`](../../src/ui/features/FeatureRegistry.ts) |
| FeatureDefinition = `{ id, category }` (pre-5.3) | [`FeatureDefinition.ts`](../../src/ui/features/FeatureDefinition.ts) |
| UX-4 SERIES CERTIFIED | [`UX-4.10.md`](./UX-4.10.md) |
| Runtime UX-3 API Freeze vigente | [`UX-3.21.md`](./UX-3.21.md) |
| Roadmap UX-5.0 FROZEN | [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- Ampliar `FeatureDefinition` con metadata aprobada
- `FeatureDefinitionInit` + `createFeatureDefinition(init)` (copy-before-freeze)
- Doc + `validate:ux-5.3` + roadmap status COMPLETE

**Out**

- Filtros / búsqueda por tags o keywords
- Visibility rules (→ UX-5.4) · State (→ UX-5.5)
- Cambios a `FeatureRegistry.ts` · `FeatureTypes.ts` · barrels
- FeatureProvider / Context / hooks (→ UX-5.6 / UX-5.7)
- Bridge Toolbar / Sidebar / Inspector / Panels / Menus (→ UX-5.8)
- Diagnostics (→ UX-5.9)
- Reexport desde `src/ui/index.ts`
- Cualquier cambio visual o de comportamiento en la app

---

## 4. Architecture

```text
src/ui/features/
  FeatureTypes.ts          ← intact (UX-5.1)
  FeatureDefinition.ts     ← metadata contract + createFeatureDefinition (this phase)
  FeatureRegistry.ts       ← intact (UX-5.2 API Freeze)
  index.ts                 ← intact (local barrel, NOT @/ui)

Definition surface (API Freeze UX-5.3):
  id · category · icon · title · description · tags · keywords · experimental · hidden

Construction:
  createFeatureDefinition(init)
    tags = Object.freeze([...init.tags])
    keywords = Object.freeze([...init.keywords])
    return Object.freeze({ ...init, tags, keywords })
  Registry continues shallow Object.freeze({ ...def }) only

Deferred:
  Visibility → UX-5.4
  State      → UX-5.5
  Provider   → UX-5.6
  Bridge     → UX-5.8
```

### Metadata Principles

```text
icon          = visual identifier string (no icon library imports)
title         = visible feature name
description   = brief descriptive text
tags          = readonly list · always frozen (copy-before-freeze)
keywords      = readonly list · always frozen (copy-before-freeze)
experimental  = descriptive metadata only · no Registry behavior
hidden        = descriptive metadata only · visibility logic → UX-5.4
All metadata is readonly · immutable · purely descriptive
Registry must not filter or search by metadata in UX-5.3
```

### Policy

```text
Immutability ownership belongs to FeatureDefinition.ts (createFeatureDefinition).
Registry remains query-only and metadata-agnostic.
No secondary indexes · no tag/keyword search · no visibility rules.
FeatureDefinitionInit / createFeatureDefinition are not re-exported from features/index.ts in this phase.
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
- Meter lógica de metadata en Registry → fence `noMetadataLogic` + `registryUntouched`.
- Adelantar visibility/state → campos `experimental`/`hidden` son metadata only; lógica → UX-5.4/5.5.
- Ampliar `@/ui` prematuramente → `publicBarrelIntact`.
- Conectar chrome de producto → `noProductWire`.

---

## 6. Rollback Strategy

1. Revertir `FeatureDefinition.ts` al contrato UX-5.1 (`id` + `category` only).
2. Eliminar `docs/UX/UX-5.3.md` y `scripts/validate-ux-5.3.ts`.
3. Quitar `validate:ux-5.3` de `package.json`.
4. Revertir estado UX-5.3 en roadmap a PENDING; Next = UX-5.3.
5. AppShell / Runtime / chrome / `FeatureTypes` / `FeatureRegistry` / barrels permanecen intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureDefinition.ts` | UPDATE — metadata + `createFeatureDefinition` |
| `docs/UX/UX-5.3.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | UPDATE — UX-5.3 = COMPLETE · Next = UX-5.4 |
| `scripts/validate-ux-5.3.ts` | CREATE |
| `package.json` | `validate:ux-5.3` |

**Protegidos:** `FeatureTypes.ts`, `FeatureRegistry.ts`, `src/ui/features/index.ts`,
`src/ui/index.ts`, `src/ui/theme/runtime/**`, `src/ui/providers/**`,
`src/components/app-shell/**`, Toolbar / Sidebar / Inspector / Workspace,
certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.3)

- [x] CA-UX-5.3.1 Existe `docs/UX/UX-5.3.md`
- [x] CA-UX-5.3.2 `FeatureDefinition` incorpora únicamente los campos de metadata aprobados
- [x] CA-UX-5.3.3 `tags` y `keywords` son readonly y se congelan (copy-before-freeze) antes de congelar la definición
- [x] CA-UX-5.3.4 El Registry mantiene exactamente la API de UX-5.2
- [x] CA-UX-5.3.5 No existen filtros ni lógica basada en metadata
- [x] CA-UX-5.3.6 Sin React / Context / hooks / Runtime / product wire
- [x] CA-UX-5.3.7 `src/ui/index.ts` intacto
- [x] CA-UX-5.3.8 `npx tsc --noEmit` PASS
- [x] CA-UX-5.3.9 `npm run validate:ux-5.3` PASS
- [x] CA-UX-5.3.10 Roadmap marca UX-5.3 = COMPLETE · Next = UX-5.4

---

## 9. Gate

```text
npm run validate:ux-5.3
```

Blocks: `priorGate` · `metadataContract` · `readonlyMetadata` · `frozenCollections` ·
`registryUntouched` · `noMetadataLogic` · `noReact` · `noRuntimeDep` ·
`noProductWire` · `publicBarrelIntact` · `tscCompile`

---

## 10. Definition of Done

- [x] Metadata contract congelado sobre `FeatureDefinition`
- [x] `createFeatureDefinition` owns copy-before-freeze de `tags` / `keywords`
- [x] Registry API Freeze UX-5.2 intacto; sin lógica de metadata
- [x] Sin React / Context / hooks / bridge / visibility / state
- [x] Barrel local únicamente; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.3.md` completo
- [x] Gates PASS
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.3 = COMPLETE; Next = UX-5.4

---

## 11. Next

**Next:** UX-5.4 — Feature Visibility  
Reglas de visibilidad sin permissions (`visible` / `hidden` / `experimental` /
`beta` / `internal`). Sin auth · sin React de producto.

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-5.2.md`](./UX-5.2.md)
- [`UX-5.1.md`](./UX-5.1.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureDefinition.ts`](../../src/ui/features/FeatureDefinition.ts)
- [`scripts/validate-ux-5.3.ts`](../../scripts/validate-ux-5.3.ts)
