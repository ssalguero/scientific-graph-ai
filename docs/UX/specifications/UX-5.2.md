# UX-5.2 — Feature Discovery

> **Architectural principles:**
> - Registry = único SSOT de features.
> - Metadata completely immutable (seed + each definition frozen).
> - Estado separado de definición (state deferred to UX-5.5).
> - Sin lógica de negocio en el Registry.
> - Sin dependencias desde Runtime.
> - API Freeze por fase.
> - Sin cambios funcionales visibles hasta UX-5.8.

**Épica:** UX-5 — Feature Integration  
**Microfase:** UX-5.2 — Feature Discovery  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-5.1 COMPLETE · UX-5.0 Roadmap FROZEN · UX-4.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)

**Declaración:**

```text
UX-5.2 = Feature Discovery
SCOPE = discovery queries on frozen registry SSOT
Registry = get / has / size / getAll / byCategory / find / enabled
enabled() delegates to getAll() (API placeholder for UX-5.5)
NO React · NO Context · NO hooks
NO iterators · NO mutators
NO metadata / visibility / state
NO Toolbar / Sidebar / Inspector / Panels / Menus wiring
NO @/ui public barrel expansion
NO production functional change
API FREEZE UX-3 = VIGENTE
AppShell architecture = FROZEN
Next: UX-5.3 Feature Metadata
```

---

## 1. Purpose / Objetivo

Extender el Feature Registry con capacidades de descubrimiento (discovery)
sobre el conjunto de definiciones existentes, **sin React**, **sin Provider**,
**sin modificar la UI**, **sin metadatos ni estado runtime**, y **sin impacto
funcional visible**.

```text
UX-5.2 adds query-only discovery on the frozen Feature Registry.
It does not render, integrate, or mutate features.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5.1 Feature Registry Foundation COMPLETE | [`UX-5.1.md`](./UX-5.1.md) · `validate:ux-5.1` |
| Registry query-only SSOT (`get` / `has` / `size`) | [`FeatureRegistry.ts`](../../src/ui/features/FeatureRegistry.ts) |
| UX-4 SERIES CERTIFIED | [`UX-4.10.md`](./UX-4.10.md) |
| Runtime UX-3 API Freeze vigente | [`UX-3.21.md`](./UX-3.21.md) |
| Roadmap UX-5.0 FROZEN | [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `getAll()` · `byCategory()` · `find()` · `enabled()` on `FeatureRegistry`
- Once-built frozen snapshot `allDefinitions`
- `enabled()` delegates literally to `getAll()`
- Doc + `validate:ux-5.2` + roadmap status COMPLETE

**Out**

- Metadata (→ UX-5.3) · Visibility (→ UX-5.4) · State (→ UX-5.5)
- Iteradores: `values` / `entries` / `keys` / `forEach` / iterator
- Mutators: `register` / `unregister` / `update` / `remove` / `set` / `clear`
- FeatureProvider / Context / hooks (→ UX-5.6 / UX-5.7)
- Bridge Toolbar / Sidebar / Inspector / Panels / Menus (→ UX-5.8)
- Diagnostics: duplicate / invalid ids / category validation (→ UX-5.9)
- Reexport desde `src/ui/index.ts`
- Cambios a `FeatureTypes.ts` · `FeatureDefinition.ts` · `features/index.ts`
- Cualquier cambio visual o de comportamiento en la app

---

## 4. Arquitectura

```text
src/ui/features/
  FeatureTypes.ts          ← intact (UX-5.1)
  FeatureDefinition.ts     ← intact (UX-5.1)
  FeatureRegistry.ts       ← discovery API (this phase)
  index.ts                 ← intact (local barrel, NOT @/ui)

Query surface (API Freeze UX-5.2):
  get(id) · has(id) · size()
  getAll() · byCategory(category) · find(predicate) · enabled()

Construction:
  Map interno + definiciones congeladas + seed vacío
  allDefinitions = Object.freeze(frozenDefinitions)  // once
  getAll() → allDefinitions
  enabled() → this.getAll()
  byCategory / find → filter(allDefinitions) + Object.freeze

Deferred:
  Metadata  → UX-5.3
  Provider  → UX-5.6
  Bridge    → UX-5.8
```

### Policy

```text
Registry remains query-only and immutable.
No secondary indexes · no logical caches · no lazy loading.
allDefinitions is a derived frozen snapshot of an already-immutable registry.
enabled() is an API placeholder only — no runtime enablement logic in UX-5.2.
ID / category / duplicate validation remains UX-5.9 Diagnostics.
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

- Implementar `enabled()` en paralelo a `getAll()` → mitiga con delegación literal + fence `enabledExists`.
- Exponer arrays mutables desde discovery → mitigado por snapshot `allDefinitions` + `Object.freeze` en filtros.
- Adelantar iterators/mutators → fence `registryQueryOnly`.
- Ampliar `@/ui` prematuramente → `publicBarrelIntact`.
- Conectar chrome de producto → `noProductWire`.

---

## 6. Rollback Strategy

1. Revertir discovery methods en `FeatureRegistry.ts` a superficie UX-5.1 (`get` / `has` / `size`).
2. Eliminar `docs/UX/UX-5.2.md` y `scripts/validate-ux-5.2.ts`.
3. Quitar `validate:ux-5.2` de `package.json`.
4. Revertir estado UX-5.2 en roadmap a PENDING; Next = UX-5.2.
5. AppShell / Runtime / chrome / `FeatureTypes` / `FeatureDefinition` / barrels permanecen intactos.

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/ui/features/FeatureRegistry.ts` | UPDATE — discovery API |
| `docs/UX/UX-5.2.md` | CREATE |
| `docs/UX/UX-5.0-roadmap.md` | UPDATE — UX-5.2 = COMPLETE · Next = UX-5.3 |
| `scripts/validate-ux-5.2.ts` | CREATE |
| `package.json` | `validate:ux-5.2` |

**Protegidos:** `FeatureTypes.ts`, `FeatureDefinition.ts`, `src/ui/features/index.ts`,
`src/ui/index.ts`, `src/ui/theme/runtime/**`, `src/ui/providers/**`,
`src/components/app-shell/**`, Toolbar / Sidebar / Inspector / Workspace,
certificación UX-4.10.

---

## 8. Acceptance (CA-UX-5.2)

- [x] CA-UX-5.2.1 Existe `docs/UX/UX-5.2.md`
- [x] CA-UX-5.2.2 FeatureRegistry incorpora exclusivamente `getAll` / `byCategory` / `find` / `enabled` además de `get` / `has` / `size`
- [x] CA-UX-5.2.3 Todas las colecciones retornadas son `readonly` / congeladas
- [x] CA-UX-5.2.4 `enabled()` delega literalmente a `getAll()`
- [x] CA-UX-5.2.5 `getAll()` devuelve el snapshot `allDefinitions` construido una vez
- [x] CA-UX-5.2.6 Sin mutators / iterators públicos
- [x] CA-UX-5.2.7 Sin React / Context / hooks / Runtime / product wire
- [x] CA-UX-5.2.8 `src/ui/index.ts` intacto
- [x] CA-UX-5.2.9 `npx tsc --noEmit` PASS
- [x] CA-UX-5.2.10 `npm run validate:ux-5.2` PASS
- [x] CA-UX-5.2.11 Roadmap marca UX-5.2 = COMPLETE · Next = UX-5.3

---

## 9. Gate

```text
npm run validate:ux-5.2
```

Blocks: `priorGate` · `discoveryContract` · `getAllExists` · `byCategoryExists` ·
`findExists` · `enabledExists` · `readonlyResults` · `registryQueryOnly` ·
`registryFrozen` · `noReact` · `noRuntimeDep` · `noProductWire` ·
`publicBarrelIntact` · `tscCompile`

---

## 10. Definition of Done

- [x] Discovery query surface congelada sobre Registry SSOT
- [x] `allDefinitions` snapshot único; `enabled()` → `getAll()`
- [x] Sin React / Context / hooks / bridge / metadata / visibility / state
- [x] Barrel local únicamente; `@/ui` intacto
- [x] UX-4.10 / Runtime UX-3 intactos
- [x] Sin cambios funcionales visibles
- [x] `docs/UX/UX-5.2.md` completo
- [x] Gates PASS
- [x] Roadmap: UX-5.0 = FROZEN; UX-5.2 = COMPLETE; Next = UX-5.3

---

## 11. Next

**Next:** UX-5.3 — Feature Metadata  
Agregar metadata inmutable estable por feature (`icon` / `title` / `description` /
`tags` / `keywords` / `experimental` / `hidden`). Sin React · sin render.

---

## Related

- [`UX-5.0-roadmap.md`](./UX-5.0-roadmap.md)
- [`UX-5.1.md`](./UX-5.1.md)
- [`UX-4.10.md`](./UX-4.10.md)
- [`src/ui/features/FeatureRegistry.ts`](../../src/ui/features/FeatureRegistry.ts)
- [`scripts/validate-ux-5.2.ts`](../../scripts/validate-ux-5.2.ts)
