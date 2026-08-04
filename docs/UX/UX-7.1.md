# UX-7.1 — Visibility Foundation

> **Architectural principles:**
> - Registry = único SSOT de visibility metadata (`VisibilityRegistryApi` + `visibilityRegistry`).
> - Definition = metadata only (`id` · `title` · `description` · `shortcut` · `category`).
> - Factory = normalize · validate · freeze (`createVisibilityDefinition`).
> - Registry Freeze = solo `register` / `get` / `getAll` / `clear`.
> - Sin React · sin DOM · sin Window · sin CSS · sin wiring de App.
> - Sin tooltips visuales · sin chrome · sin registro de producción.
> - API Freeze de la infraestructura foundation.
> - Sin cambios funcionales visibles · sin montaje en producción.

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.1 — Visibility Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7.0 Roadmap FROZEN · UX-6.10 RELEASE CERTIFIED  
**SSOT de serie:** [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md)

**Declaración:**

```text
UX-7.1 = Visibility Foundation
SCOPE = Types → Definition → Factory → Registry → local barrel
Registry = mutable SSOT (VisibilityRegistryApi + visibilityRegistry)
EMPTY by design — no production visibility entries
NO React · NO DOM · NO Window · NO CSS
NO tooltips · NO shortcuts chrome · NO command bridge
NO localization · NO i18n · NO markdown · NO rich text · NO HTML
NO rendering · NO icon metadata · NO priorities
NO production mount · NO @/ui public barrel expansion
Registry Freeze = register / get / getAll / clear ONLY
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 = VIGENTE
Next: UX-7.2 Tooltip Foundation
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial de Discoverability bajo `src/ui/visibility/`,
**sin tooltips visuales**, **sin modificar Commands / Toolbar / Menus /
Pipeline**, **sin montar en la app** y **sin impacto funcional visible**.

```text
UX-7.1 establishes the Visibility Foundation only.
It does not render, bridge, or expose discoverability chrome in the product UI.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-6 RELEASE CERTIFIED | [`UX-6.10.md`](./UX-6.10.md) · `validate:ux-6.10` |
| Command System frozen | [`src/ui/commands/`](../../src/ui/commands/) |
| Feature Architecture frozen | [`UX-5.10.md`](./UX-5.10.md) |
| AppShell architecture frozen | [`UX-4.2.md`](./UX-4.2.md) |
| Sin `src/ui/visibility/` | objetivo de esta microfase |
| Roadmap UX-7.0 FROZEN | [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/visibility/` flat (same convention as features / commands)
- `VisibilityTypes` · `VisibilityDefinition` · `createVisibilityDefinition`
- `VisibilityRegistry` (`VisibilityRegistryApi` + `visibilityRegistry`)
- Local `index.ts` barrel
- Docs + `validate:ux-7.1`

**Out**

- Tooltips visuales (→ UX-7.2)
- Shortcut Hint System (→ UX-7.3)
- Command Description Bridge (→ UX-7.4)
- Context Help (→ UX-7.5)
- Discoverability Pipeline (→ UX-7.6)
- Diagnostics / Integration / Audit / Certification (→ UX-7.7–7.10)
- Production registration of visibility entries
- Production mount / App wiring
- Expanding `@/ui` public barrel
- Extra registry methods (`findBy*`, `size`, `has`, `remove`, `replace`, …)

---

## 4. Architecture / Pipeline

```text
VisibilityDefinition
        │
        ▼
createVisibilityDefinition
        │
        ▼
VisibilityRegistry
        │
        ▼
(Deferred)
Tooltip
Shortcut Hint
Command Bridge
Discoverability
Diagnostics
```

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `VisibilityTypes` | Branded `VisibilityId` + `asVisibilityId` |
| `VisibilityDefinition` | Metadata shape + `VisibilityDefinitionInit` |
| `createVisibilityDefinition` | Normalize (`trim`) · validate · `Object.freeze` |
| `VisibilityRegistryApi` | SSOT mutable: `register` / `get` / `getAll` / `clear` |
| `visibilityRegistry` | Empty singleton SSOT |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No localization · No i18n
No markdown · No rich text · No HTML
No rendering
No icon metadata
No priorities
No tooltips visuales
No CSS / styles
No React / DOM / Window
No Command / Toolbar / Menu / Pipeline mutations
No production App wiring
No @/ui public barrel expansion
```

---

## 7. API Freeze

### Definition

```ts
type VisibilityDefinition = Readonly<{
  readonly id: VisibilityId;
  readonly title: string;
  readonly description: string;
  readonly shortcut: string;
  readonly category: string;
}>;
```

- `category`: `string` (no enum cerrado).
- `shortcut`: `string` (ausente = `""`).
- Sin callbacks · sin React · sin runtime flags · sin icon · sin priority · sin i18n.

### Factory

```ts
function createVisibilityDefinition(
  init: VisibilityDefinitionInit,
): VisibilityDefinition;
```

- Normaliza con `trim()` en strings.
- Valida `id` / `title` / `category` no vacíos tras trim (throw).
- `description` y `shortcut` pueden ser `""`.
- Retorna `Object.freeze({...})`.

### Registry Freeze

`VisibilityRegistryApi` queda **congelado** en UX-7.1.

Métodos oficiales:

```text
register() · get() · getAll() · clear()
```

**Prohibido** agregar antes de UX-8 (sin nueva serie de arquitectura):

- Consulta / filtrado / búsqueda / ordenamiento: `findByCategory()`, `findByShortcut()`, `contains()`, `size()`, `has()`, …
- Mutación adicional: `remove()`, `replace()`, …

```ts
interface VisibilityRegistryApi {
  register(definition: VisibilityDefinition): void;
  get(id: VisibilityId): VisibilityDefinition | undefined;
  getAll(): readonly VisibilityDefinition[];
  clear(): void;
}

function createVisibilityRegistry(): VisibilityRegistryApi;
const visibilityRegistry: VisibilityRegistryApi; // empty singleton
```

- `register`: upsert por `id`.
- `getAll`: snapshot `Object.freeze([...map.values()])`.
- Naming: `VisibilityRegistryApi` + `visibilityRegistry` (en diagramas: **VisibilityRegistry**).

Contract and singleton use **distinct names**. Discovery avanzada pertenece a
una serie posterior, no a UX-7.6.

---

## 8. Extension Points

| Congelado en UX-7.1 | Diferido |
|---------------------|----------|
| Definition fields (5) | Tooltip chrome → UX-7.2 |
| Factory normalize/validate/freeze | Shortcut hints → UX-7.3 |
| Registry Freeze (4 métodos) | Command bridge → UX-7.4 |
| Local barrel only | Context help → UX-7.5 |
| Empty singleton | Discoverability pipeline → UX-7.6 |
| | Diagnostics → UX-7.7 |

---

## 9. Roadmap UX-7

| Fase | Objetivo |
|------|----------|
| UX-7.1 | Visibility Foundation |
| UX-7.2 | Tooltip Foundation |
| UX-7.3 | Shortcut Hint System |
| UX-7.4 | Command Description Bridge |
| UX-7.5 | Context Help Foundation |
| UX-7.6 | Discoverability Pipeline |
| UX-7.7 | Visibility Diagnostics |
| UX-7.8 | Integration |
| UX-7.9 | Final Audit |
| UX-7.10 | Certification |

---

## 10. Exclusions / Decoupling fence

Files under `src/ui/visibility/` must not import or reference:

- `react` / `react-dom`
- `window` / `document`
- DOM APIs / CSS modules / style imports
- UI product components / App routes
- Command execution / Toolbar / Menus / Context Menus / Pipeline internals for wiring

Also prohibited: production registration · App mount · `src/ui/index.ts`
modification · extra RegistryApi methods.

---

## 11. Protected files

| Path | Role |
|------|------|
| `src/ui/visibility/VisibilityTypes.ts` | Branded id |
| `src/ui/visibility/VisibilityDefinition.ts` | Metadata definition + Init |
| `src/ui/visibility/createVisibilityDefinition.ts` | Factory |
| `src/ui/visibility/VisibilityRegistry.ts` | Registry API + empty SSOT |
| `src/ui/visibility/index.ts` | Local barrel |

**Protected from this phase:** `src/ui/index.ts`, `src/ui/commands/**`,
`src/ui/toolbar/**`, `src/ui/menus/**`, `src/ui/context-menus/**`,
AppShell / production chrome, certificación UX-6.10.

---

## 12. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-7.1.1 | Docs UX-7.0 + UX-7.1 con Registry Freeze y No responsabilidades |
| CA-UX-7.1.2 | `VisibilityRegistry.ts` + `VisibilityRegistryApi` / `visibilityRegistry` |
| CA-UX-7.1.3 | `register(` fingerprint |
| CA-UX-7.1.4 | `get(` fingerprint |
| CA-UX-7.1.5 | `getAll(` fingerprint |
| CA-UX-7.1.6 | `clear(` fingerprint |
| CA-UX-7.1.7 | `VisibilityDefinition` fields only · sin icon/priority/i18n |
| CA-UX-7.1.8 | `createVisibilityDefinition` + `Object.freeze` |
| CA-UX-7.1.9 | Local barrel reexports Types / Definition / Factory / Registry |
| CA-UX-7.1.10 | Freeze fences (no React/DOM/Window/CSS/App/`@/ui` visibility · RegistryApi sin métodos extra) |

Gate: `npm run validate:ux-7.1` → **PASS 10/10**

---

## 13. Gate

```text
npm run validate:ux-7.1
→ PASS 10/10
```

---

## 14. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-7.2 | Tooltip Foundation |
| UX-7.3 | Shortcut Hint System |
| UX-7.4 | Command Description Bridge |
| UX-7.5+ | Context Help · Discoverability · Diagnostics · Integration · Audit · Certification |
