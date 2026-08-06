# UX-7.3 — Shortcut Hint Foundation

> **Architectural principles:**
> - Hint Foundation — `ShortcutHint` describes shortcut hint data, not rendering.
> - Projection Freeze — `shortcutHintFromDefinition` copies `id` · `title` · `shortcut` only.
> - Shortcut Freeze — `shortcut` is the raw value from VisibilityDefinition (no format / platform / aliases).
> - Title = exact copy — no abbreviate · truncate · casing · i18n.
> - Resolve = Query Only — `resolveShortcutHint` = `get` → projection → return.
> - Sin React · sin DOM · sin Window · sin CSS · sin Provider · sin hooks · sin Bridge.
> - Sin chrome visual · sin portal · sin mount · sin wiring de App.
> - Architecture Freeze UX-7.1 + UX-7.2 vigente (visibility/** · tooltips/** intactos).
> - Local barrel only · sin expansión `@/ui`.
> - Decoupled from `src/ui/shortcuts/` (execution).

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.3 — Shortcut Hint Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7.2 Tooltip Foundation COMPLETE · UX-7.1 Visibility Foundation COMPLETE · UX-7.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md)

**Declaración:**

```text
UX-7.3 = Shortcut Hint Foundation
SCOPE = ShortcutHintTypes · ShortcutHint · Factory · Projection · Resolve · local barrel
ShortcutHint = { id, title, shortcut }
Projection Freeze = deterministic copy (no transform · no format · no i18n)
Shortcut Freeze = raw shortcut only
Title = exact copy
Resolve = Query Only (get → projection → return)
NO React · NO DOM · NO Window · NO CSS
NO Provider · NO hooks · NO Bridge · NO portal · NO mount
NO description · NO category · NO icon · NO priority · NO placement
NO markdown · NO HTML · NO rich text
NO production wire · NO @/ui public barrel expansion
NO import from src/ui/shortcuts/ (execution)
Architecture Freeze UX-7.1 + UX-7.2 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 = VIGENTE
Next: UX-7.4 Command Description Bridge
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial de **hints de atajo** bajo `src/ui/shortcut-hints/`,
como proyección pura sobre Visibility Foundation, **sin renderizado**, **sin
formateo visual**, **sin Provider/hooks** y **sin impacto funcional visible**.

```text
UX-7.3 establishes the Shortcut Hint foundation only.
It does not render, format, or mount shortcut hints in the product UI.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-7.1 Visibility Foundation COMPLETE | [`UX-7.1.md`](./UX-7.1.md) · `validate:ux-7.1` |
| UX-7.2 Tooltip Foundation COMPLETE | [`UX-7.2.md`](./UX-7.2.md) · `validate:ux-7.2` |
| Visibility Registry Freeze (4 métodos) | [`src/ui/visibility/`](../../src/ui/visibility/) |
| Tooltip Content Foundation congelada | [`src/ui/tooltips/`](../../src/ui/tooltips/) |
| Roadmap UX-7.0 FROZEN | [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md) |
| Sin `src/ui/shortcut-hints/` | objetivo de esta microfase |
| `src/ui/shortcuts/` = ejecución UX-6 | desacoplado · no tocar |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/shortcut-hints/` flat
- `ShortcutHintTypes` · `ShortcutHint` · `ShortcutHintInit`
- `createShortcutHint` · `shortcutHintFromDefinition` · `resolveShortcutHint`
- Local `index.ts` barrel
- Docs + `validate:ux-7.3`

**Out**

- Command Description Bridge (→ UX-7.4)
- Context Help (→ UX-7.5)
- Discoverability Pipeline (→ UX-7.6)
- Diagnostics / Integration / Audit / Certification (→ UX-7.7–7.10)
- React · Provider · hooks · Bridge · portal · CSS · mount
- Shortcut formatting / platform glyphs / pretty-print
- Mutating Visibility / Tooltips / expanding RegistryApi
- Expanding `@/ui` public barrel
- Production registration / App wiring
- Import from / wiring to `src/ui/shortcuts/`

---

## 4. Architecture / Pipeline

```text
VisibilityDefinition (UX-7.1 FROZEN)
        │
        ├──► TooltipContent          (UX-7.2 FROZEN · sibling)
        │
        └──► createShortcutHint / shortcutHintFromDefinition / resolveShortcutHint
                    │
                    ▼
             ShortcutHint  (frozen projection)
                    │
                    ▼
             (Deferred)
             Command Bridge
             Context Help
             Discoverability
             Diagnostics
             Visual Integration
```

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `ShortcutHintTypes` | Reexport identity `VisibilityId` (no `ShortcutHintId` paralelo) |
| `ShortcutHint` | Hint shape + `ShortcutHintInit` |
| `createShortcutHint` | Normalize (`trim`) · validate · `Object.freeze` |
| `shortcutHintFromDefinition` | Projection Freeze — copia determinística |
| `resolveShortcutHint` | Resolve = Query Only — `get` → projection → return |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No localization · No i18n
No markdown · No rich text · No HTML
No Shortcut Freeze violations (normalize · reorder · modifiers · platform · aliases · expand)
No Title mutation (abbreviate · truncate · casing · i18n)
No formatting of shortcuts (no pretty-print · no platform glyphs · no key splitting)
No interpretation · No transformation · No added information
No cache · No memoization · No fallbacks · No lazy creation
No rendering · No chrome · No badge · No kbd element
No icon metadata · No priorities · No placement · No delay · No animation
No description / category on ShortcutHint
No React / DOM / Window / CSS
No Provider · No hooks · No Bridge · No portal
No Command / Toolbar / Menu / Pipeline mutations
No production App wiring
No @/ui public barrel expansion
No Visibility Registry mutation from shortcut-hints
No import from / wiring to src/ui/shortcuts/ (execution)
No dependency on tooltips/ (sibling, not child)
```

---

## 7. API Freeze

### ShortcutHint

```ts
type ShortcutHint = Readonly<{
  readonly id: VisibilityId;
  readonly title: string;
  readonly shortcut: string;
}>;
```

- Sin `description` · sin `category` · sin icon · sin priority · sin placement · sin callbacks · sin React.
- Más estrecho que `TooltipContent` (4 campos): el hint es acelerador + label, no copy de tooltip.

### ShortcutHint.title → exact copy

```text
Title = exact copy
  no abreviar
  no truncar
  no cambiar casing
  no internacionalizar
```

### Shortcut Freeze

```text
Shortcut Freeze
  shortcut representa el valor raw almacenado
  en VisibilityDefinition.

  No puede:
    normalizar
    ordenar teclas
    agregar modificadores
    convertir plataforma
    inferir aliases
    expandir abreviaturas
```

Ejemplo cerrado:

```text
Ctrl+Shift+P
  ≠  ⌘⇧P
  ≠  Command Shift P
```

Hasta la capa visual (UX-7.8).

### Factory

```ts
function createShortcutHint(init: ShortcutHintInit): ShortcutHint;
```

- Normaliza con `trim()` en strings (whitespace only).
- Valida `id` / `title` no vacíos tras trim (throw).
- `shortcut` puede ser `""`.
- Retorna `Object.freeze({...})`.

### Projection Freeze

`shortcutHintFromDefinition()` es una **proyección determinística**.

```text
Projection Freeze
  copia exactamente: id · title · shortcut
  ignora: description · category
  Title = exact copy
  Shortcut Freeze = raw copy
```

```ts
function shortcutHintFromDefinition(
  definition: VisibilityDefinition,
): ShortcutHint;
```

**Prohibido:** interpretar · transformar · localizar · formatear · abreviar/truncar title · cambiar casing · agregar información · markdown · HTML · rich text · inferir defaults.

### Resolve = Query Only

```text
Resolve = Query Only
  registry.get(id)
        │
        ▼
  projection
        │
        ▼
  return ShortcutHint | undefined
```

```ts
function resolveShortcutHint(
  id: VisibilityId,
  registry: ShortcutHintResolveRegistry = /* Visibility SSOT singleton */,
): ShortcutHint | undefined;
```

**Prohibido:** `register()` · mutaciones · cache · memoization · lazy creation · fallbacks automáticos.

### ShortcutHintTypes

Identity = `VisibilityId` (no branded `ShortcutHintId` paralelo en UX-7.3).

### Local barrel

Reexports: Types · Hint / Init · Factory · FromDefinition · Resolve.

**No** reexport desde `src/ui/index.ts`.

### UX-7.1 + UX-7.2 Freeze (reafirmado)

```text
VisibilityRegistryApi = register / get / getAll / clear ONLY
VisibilityDefinition fields = 5 (id, title, description, shortcut, category)
TooltipContent fields = 4 (id, title, description, shortcut)
NO React under visibility/ · tooltips/ · shortcut-hints/
NO @/ui visibility | tooltips | shortcut-hints export
```

---

## 8. Extension Points

| Congelado en UX-7.3 | Diferido |
|---------------------|----------|
| ShortcutHint fields (3) | Command bridge → UX-7.4 |
| Projection Freeze | Context help → UX-7.5 |
| Shortcut Freeze · Title = exact copy | Discoverability pipeline → UX-7.6 |
| Resolve = Query Only | Diagnostics → UX-7.7 |
| Local barrel only | Visual Integration → UX-7.8 |

Clarificación: el chrome visual de hints permanece en UX-7.8.

---

## 9. Exclusions / Decoupling fence

Files under `src/ui/shortcut-hints/` must not import or reference:

- `react` / `react-dom`
- `window` / `document`
- DOM APIs / CSS modules / style imports
- UI product components / App routes
- Command execution / Toolbar / Menus / Context Menus / Pipeline internals
- `src/ui/shortcuts/` (execution system)
- `src/ui/tooltips/` (sibling; no dependency)

Also prohibited: production registration · App mount · `src/ui/index.ts`
modification · Visibility Registry mutation from shortcut-hints · cache/fallbacks in Resolve.

**Unidirectional dependency:** shortcut-hints → visibility. Visibility never imports shortcut-hints. Tooltips never import shortcut-hints. Shortcut-hints never import tooltips.

---

## 10. Protected files

| Path | Role |
|------|------|
| `src/ui/shortcut-hints/ShortcutHintTypes.ts` | VisibilityId reexport |
| `src/ui/shortcut-hints/ShortcutHint.ts` | Hint + Init |
| `src/ui/shortcut-hints/createShortcutHint.ts` | Factory |
| `src/ui/shortcut-hints/resolveShortcutHint.ts` | Projection + Resolve |
| `src/ui/shortcut-hints/index.ts` | Local barrel |

**Protected from this phase:** `src/ui/visibility/**`, `src/ui/tooltips/**`,
`src/ui/shortcuts/**`, `src/ui/index.ts`, `src/ui/commands/**`,
`src/ui/toolbar/**`, `src/ui/menus/**`, `src/ui/context-menus/**`,
AppShell / production chrome, `validate-ux-7.1`, `validate-ux-7.2`.

---

## 11. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-7.3.1 | Docs UX-7.0/7.3 + Hint Foundation + Projection Freeze + Shortcut Freeze + Title = exact copy + Resolve = Query Only |
| CA-UX-7.3.2 | Módulo `src/ui/shortcut-hints/` + archivos core |
| CA-UX-7.3.3 | `ShortcutHint` = `{ id, title, shortcut }` only |
| CA-UX-7.3.4 | `createShortcutHint` + trim + freeze + validate |
| CA-UX-7.3.5 | `shortcutHintFromDefinition` + Projection Freeze + Shortcut Freeze + Title exact copy |
| CA-UX-7.3.6 | `resolveShortcutHint` + Resolve = Query Only |
| CA-UX-7.3.7 | Local barrel completo |
| CA-UX-7.3.8 | Architecture Freeze UX-7.1 + UX-7.2 intacto |
| CA-UX-7.3.9 | Freeze fences + no `@/ui` expansion + no product wire + no `shortcuts/` import |
| CA-UX-7.3.10 | Dependencia unidireccional shortcut-hints → visibility (sin tooltips) |

Gate: `npm run validate:ux-7.3` → **PASS 10/10**

---

## 12. Gate

```text
npm run validate:ux-7.3
→ PASS 10/10
```

---

## 13. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-7.4 | Command Description Bridge |
| UX-7.5 | Context Help Foundation |
| UX-7.6+ | Discoverability · Diagnostics · Integration · Audit · Certification |
