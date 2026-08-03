# UX-5.1 — Feature Registry Foundation

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Estado separado de definición (state deferred to UX-5.5).
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin cambios funcionales visibles hasta UX-5.8.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.1 — Feature Registry Foundation  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.1 = Feature Registry Foundation
SCOPE = types + immutable query-only registry SSOT
Registry = get / has / size only
NO React · NO Context · NO hooks
NO discovery (getAll / byCategory / find / enabled → UX-5.2)
NO iterators · NO mutators
NO metadata / visibility / state
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO @/ui public barrel expansion
NO production functional change
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.2 Feature Discovery
```

---

## 1. Purpose / Objetivo

Crear el registro centralizado de features visibles para la UI como SSOT
inmutable bajo `src/ui/features/`, **sin mover lógica existente**, **sin
modificar componentes de producción** y **sin impacto funcional visible**.

```text
UX-5.1 establishes the Feature Registry foundation only.
It does not discover, render, or integrate features.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-4 SERIES CERTIFIED | [`UX-4.10.md`](./UX-4.10.md) · `validate:ux-4.10` |
| AppShell sole composition root | [`UX-4.2.md`](./UX-4.2.md) |
| Runtime UX-3 API Freeze vigente | [`UX-3.21.md`](./UX-3.21.md) |
| Sin `src/ui/features/` | objetivo de esta microfase |
| Roadmap UX-5.0 FROZEN | [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/features/` (`FeatureTypes`, `FeatureDefinition`, `FeatureRegistry`, `index`)
- `FeatureId` (branded) · `FeatureCategory` · `FeatureDefinition` · `FeatureRegistry`
- Seed vacío `EMPTY_FEATURE_DEFINITIONS` + singleton `featureRegistry`
- Factory `createFeatureRegistry` con freeze por definición
- Doc + `validate:ux-5.1`

**Out**

- Discovery: `getAll` / `byCategory` / `find` / `enabled` (→ UX-5.2)
- Iteradores: `values` / `entries` / `keys` / `forEach` / iterator (→ UX-5.2)
- Metadata (→ UX-5.3) · Visibility (→ UX-5.4) · State (→ UX-5.5)
- FeatureProvider / Context / hooks (→ UX-5.6 / UX-5.7)
- Bridge Toolbar / Sidebar / Inspector / Panels / Menus (→ UX-5.8)
- Diagnostics: duplicate / invalid ids / category validation (→ UX-5.9)
- Reexport desde `src/ui/index.ts`
- Cualquier cambio visual o de comportamiento en la app

---

## 4. Arquitectura

```text
src/ui/features/
  FeatureTypes.ts          ← FeatureId · FeatureCategory · FEATURE_CATEGORIES
  FeatureDefinition.ts     ← { id, category } Readonly
  FeatureRegistry.ts       ← FeatureRegistry type · createFeatureRegistry · singleton
  index.ts                 ← local barrel (NOT @/ui)

Query surface (API Freeze UX-5.1):
  get(id) · has(id) · size()

Deferred:
  Discovery → UX-5.2
  Provider  → UX-5.6
  Bridge    → UX-5.8
```

### Policy

```text
Registry assumes valid input in UX-5.1.
ID / category / duplicate validation belongs to UX-5.9 Diagnostics.
Each FeatureDefinition is Object.freeze'd inside the factory.
EMPTY_FEATURE_DEFINITIONS is Object.freeze([]).
```

### Imports

```text
src/ui/features/**  ✗  react / react-dom
src/ui/features/**  ✗  src/ui/theme/runtime/**
src/ui/features/**  ✗  Toolbar / Sidebar / Inspector / Panels / Menus
src/ui/index.ts     ✗  features (no public @/ui expansion)
```

---

## 5. Riesgos

- Adelantar discovery/iterators en 5.1 → mitiga sentido de UX-5.2; fence en validator `registryQueryOnly`.
- Mutar definiciones vía referencia externa → mitigado por `Object.freeze` por entry + `registryFrozen`.
- Ampliar `@/ui` prematuramente → `publicBarrelIntact`.
- Conectar chrome de producto → `noProductWire`.

---

## 6. Rollback Strategy

1. Eliminar `src/ui/features/`.
2. Eliminar `docs/UX/UX-5.1.md` y `scripts/validate-ux-5.1.ts`.
3. Quitar `validate:ux-5.1` de `package.json`.
4. Revertir estado UX-5.1 en roadmap a PENDING.
5. AppShell / Runtime / chrome permanecen exactamente como UX-4.10.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureTypes.ts` | CREATE |
| `src/ui/features/FeatureDefinition.ts` | CREATE |
| `src/ui/features/FeatureRegistry.ts` | CREATE |
| `src/ui/features/index.ts` | CREATE |
| `docs/UX/UX-5.1.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | CREATE — UX-5.1 = COMPLETE |
| `scripts/validate-ux-5.1.ts` | CREATE |
| `package.json` | `validate:ux-5.1` |

**Protegidos:** `src/ui/index.ts`, `src/ui/theme/runtime/**`, `src/ui/providers/**`,
`src/components/app-shell/**`, Toolbar / Sidebar / Inspector / Workspace,
certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.1)

- [x] CA-UX-5.1.1 Existe `src/ui/features/` con FeatureTypes / FeatureDefinition / FeatureRegistry / index
- [x] CA-UX-5.1.2 `FeatureId`, `FeatureCategory`, `FeatureDefinition` y `FeatureRegistry` definidos
- [x] CA-UX-5.1.3 Registry inmutable con consulta únicamente (`get` / `has` / `size`)
- [x] CA-UX-5.1.4 Seed y cada `FeatureDefinition` pasan por `Object.freeze`
- [x] CA-UX-5.1.5 Sin React / Context / hooks
- [x] CA-UX-5.1.6 Sin integración Toolbar / Sidebar / Inspector / Panels / Menus
- [x] CA-UX-5.1.7 Sin modificar producción visible ni `src/ui/index.ts`
- [x] CA-UX-5.1.8 Sin discovery / iterators / mutators / ID validation
- [x] CA-UX-5.1.9 `npx tsc --noEmit` PASS
- [x] CA-UX-5.1.10 `npm run validate:ux-5.1` PASS

---

## 9. Gate

```text
npm run validate:ux-5.1
```

Blocks: `featuresExists` · `typesContract` · `definitionContract` ·
`registryQueryOnly` · `registryFrozen` · `noReact` · `noRuntimeDep` ·
`noProductWire` · `publicBarrelIntact` · `priorGate` · `tscCompile`

---

## 10. Definition of Done

- [x] Feature Registry SSOT existe; query-only; immutable
- [x] Sin React / Context / hooks / bridge
- [x] Barrel local únicamente; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.1.md` completo
- [x] Gates PASS
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.1 = COMPLETE; Next = UX-5.2

---

## 11. Next

**Next:** UX-5.2 — Feature Discovery  
Agregar descubrimiento automático (`getAll` / `byCategory` / `find` / `enabled`)
sobre el registry congelado. Sin UI.

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureRegistry.ts`](../../src/ui/features/FeatureRegistry.ts)
- [`scripts/validate-ux-5.1.ts`](../../scripts/validate-ux-5.1.ts)
