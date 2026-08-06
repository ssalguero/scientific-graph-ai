# UX-7.2 — Tooltip Foundation

> **Architectural principles:**
> - Content Foundation — `TooltipContent` describes tooltip content, not rendering.
> - Projection Freeze — `tooltipContentFromDefinition` copies `id` · `title` · `description` · `shortcut` only.
> - Resolve = Query Only — `resolveTooltipContent` = `get` → projection → return.
> - Sin React · sin DOM · sin Window · sin CSS · sin Provider · sin hooks · sin Bridge.
> - Sin chrome visual · sin portal · sin mount · sin wiring de App.
> - Architecture Freeze UX-7.1 vigente (visibility/** intacto).
> - Local barrel only · sin expansión `@/ui`.

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.2 — Tooltip Foundation (Content Foundation)  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7.1 Visibility Foundation COMPLETE · UX-7.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md)

**Declaración:**

```text
UX-7.2 = Tooltip Foundation (Content Foundation)
SCOPE = TooltipTypes · TooltipContent · Factory · Projection · Resolve · local barrel
TooltipContent = { id, title, description, shortcut }
Projection Freeze = deterministic copy (no transform · no format · no i18n)
Resolve = Query Only (get → projection → return)
NO React · NO DOM · NO Window · NO CSS
NO Provider · NO hooks · NO Bridge · NO portal · NO mount
NO category · NO icon · NO priority · NO placement · NO markdown · NO HTML
NO production wire · NO @/ui public barrel expansion
Architecture Freeze UX-7.1 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 = VIGENTE
Next: UX-7.3 Shortcut Hint System
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial de **contenido de tooltip** bajo `src/ui/tooltips/`,
como proyección pura sobre Visibility Foundation, **sin renderizado**, **sin
Provider/hooks**, **sin chrome visual** y **sin impacto funcional visible**.

```text
UX-7.2 establishes the Tooltip content foundation only.
It does not render, position, style, or mount tooltips in the product UI.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-7.1 Visibility Foundation COMPLETE | [`UX-7.1.md`](./UX-7.1.md) · `validate:ux-7.1` |
| Visibility Registry Freeze (4 métodos) | [`src/ui/visibility/`](../../src/ui/visibility/) |
| Architecture Freeze UX-7.1 vigente | Definition · Factory · Registry intactos |
| Roadmap UX-7.0 FROZEN | [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md) |
| Sin `src/ui/tooltips/` | objetivo de esta microfase |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/tooltips/` flat
- `TooltipTypes` · `TooltipContent` · `TooltipContentInit`
- `createTooltipContent` · `tooltipContentFromDefinition` · `resolveTooltipContent`
- Local `index.ts` barrel
- Docs + `validate:ux-7.2`

**Out**

- Shortcut Hint System (→ UX-7.3)
- Command Description Bridge (→ UX-7.4)
- Context Help (→ UX-7.5)
- Discoverability Pipeline (→ UX-7.6)
- Diagnostics / Integration / Audit / Certification (→ UX-7.7–7.10)
- React · Provider · hooks · Bridge · portal · CSS · mount
- Mutating Visibility / expanding RegistryApi
- Expanding `@/ui` public barrel
- Production registration / App wiring

---

## 4. Architecture / Pipeline

```text
VisibilityDefinition (UX-7.1 FROZEN)
        │
        ▼
createTooltipContent / tooltipContentFromDefinition / resolveTooltipContent
        │
        ▼
TooltipContent  (frozen projection)
        │
        ▼
(Deferred)
Shortcut Hint
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
| `TooltipTypes` | Reexport identity `VisibilityId` (no `TooltipId` paralelo) |
| `TooltipContent` | Content shape + `TooltipContentInit` |
| `createTooltipContent` | Normalize (`trim`) · validate · `Object.freeze` |
| `tooltipContentFromDefinition` | Projection Freeze — copia determinística |
| `resolveTooltipContent` | Resolve = Query Only — `get` → projection → return |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No localization · No i18n
No markdown · No rich text · No HTML
No formatting of shortcuts
No interpretation · No transformation · No added information
No cache · No memoization · No fallbacks · No lazy creation
No rendering
No icon metadata · No priorities · No placement · No delay · No animation
No category on TooltipContent
No React / DOM / Window / CSS
No Provider · No hooks · No Bridge · No portal
No Command / Toolbar / Menu / Pipeline mutations
No production App wiring
No @/ui public barrel expansion
No Visibility Registry mutation from tooltips
```

---

## 7. API Freeze

### TooltipContent

```ts
type TooltipContent = Readonly<{
  readonly id: VisibilityId;
  readonly title: string;
  readonly description: string;
  readonly shortcut: string;
}>;
```

- Sin `category` · sin icon · sin priority · sin placement · sin callbacks · sin React.

### Factory

```ts
function createTooltipContent(init: TooltipContentInit): TooltipContent;
```

- Normaliza con `trim()` en strings.
- Valida `id` / `title` no vacíos tras trim (throw).
- `description` y `shortcut` pueden ser `""`.
- Retorna `Object.freeze({...})`.

### Projection Freeze

`tooltipContentFromDefinition()` es una **proyección determinística**.

```text
Projection Freeze
  copia exactamente: id · title · description · shortcut
  ignora: category
```

```ts
function tooltipContentFromDefinition(
  definition: VisibilityDefinition,
): TooltipContent;
```

**Prohibido:** interpretar · transformar · localizar · formatear · agregar información · markdown · HTML · rich text · inferir defaults.

### Resolve = Query Only

```text
Resolve = Query Only
  registry.get(id)
        │
        ▼
  projection
        │
        ▼
  return TooltipContent | undefined
```

```ts
function resolveTooltipContent(
  id: VisibilityId,
  registry: VisibilityRegistryApi = visibilityRegistry,
): TooltipContent | undefined;
```

**Prohibido:** `register()` · mutaciones · cache · memoization · lazy creation · fallbacks automáticos.

### TooltipTypes

Identity = `VisibilityId` (no branded `TooltipId` paralelo en UX-7.2).

### Local barrel

Reexports: Types · Content / Init · Factory · FromDefinition · Resolve.

**No** reexport desde `src/ui/index.ts`.

### UX-7.1 Freeze (reafirmado)

```text
VisibilityRegistryApi = register / get / getAll / clear ONLY
VisibilityDefinition fields = 5 (id, title, description, shortcut, category)
NO React under visibility/
NO @/ui visibility export
```

---

## 8. Extension Points

| Congelado en UX-7.2 | Diferido |
|---------------------|----------|
| TooltipContent fields (4) | Shortcut hints → UX-7.3 |
| Projection Freeze | Command bridge → UX-7.4 |
| Resolve = Query Only | Context help → UX-7.5 |
| Local barrel only | Discoverability pipeline → UX-7.6 |
| | Diagnostics → UX-7.7 |
| | Visual Integration → UX-7.8 |

Clarificación: UX-7.1 difería “Tooltip chrome” a UX-7.2. UX-7.2 congela el **content model**; el chrome visual permanece en UX-7.8.

---

## 9. Exclusions / Decoupling fence

Files under `src/ui/tooltips/` must not import or reference:

- `react` / `react-dom`
- `window` / `document`
- DOM APIs / CSS modules / style imports
- UI product components / App routes
- Command execution / Toolbar / Menus / Context Menus / Pipeline internals

Also prohibited: production registration · App mount · `src/ui/index.ts`
modification · Visibility Registry mutation from tooltips · cache/fallbacks in Resolve.

**Unidirectional dependency:** tooltips → visibility. Visibility never imports tooltips.

---

## 10. Protected files

| Path | Role |
|------|------|
| `src/ui/tooltips/TooltipTypes.ts` | VisibilityId reexport |
| `src/ui/tooltips/TooltipContent.ts` | Content + Init |
| `src/ui/tooltips/createTooltipContent.ts` | Factory |
| `src/ui/tooltips/resolveTooltipContent.ts` | Projection + Resolve |
| `src/ui/tooltips/index.ts` | Local barrel |

**Protected from this phase:** `src/ui/visibility/**`, `src/ui/index.ts`,
`src/ui/commands/**`, `src/ui/toolbar/**`, `src/ui/menus/**`,
`src/ui/context-menus/**`, AppShell / production chrome, `validate-ux-7.1`.

---

## 11. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-7.2.1 | Docs UX-7.0/7.2 + Content Foundation + Projection Freeze + Resolve = Query Only |
| CA-UX-7.2.2 | Módulo `src/ui/tooltips/` + archivos core |
| CA-UX-7.2.3 | `TooltipContent` = `{ id, title, description, shortcut }` only |
| CA-UX-7.2.4 | `createTooltipContent` + trim + freeze + validate |
| CA-UX-7.2.5 | `tooltipContentFromDefinition` + Projection Freeze |
| CA-UX-7.2.6 | `resolveTooltipContent` + Resolve = Query Only |
| CA-UX-7.2.7 | Local barrel completo |
| CA-UX-7.2.8 | UX-7.1 Architecture Freeze intacto |
| CA-UX-7.2.9 | Freeze fences tooltips + no `@/ui` expansion + no product wire |
| CA-UX-7.2.10 | Dependencia unidireccional tooltips → visibility |

Gate: `npm run validate:ux-7.2` → **PASS 10/10**

---

## 12. Gate

```text
npm run validate:ux-7.2
→ PASS 10/10
```

---

## 13. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-7.3 | Shortcut Hint System |
| UX-7.4 | Command Description Bridge |
| UX-7.5 | Context Help Foundation |
| UX-7.6+ | Discoverability · Diagnostics · Integration · Audit · Certification |
