# UX-7.5 — Context Help Foundation

> **Architectural principles:**
> - Context Help Foundation — `ContextHelp` describes contextual help, not rendering or execution.
> - Context Help Freeze — ayuda contextual only (no execution · no shortcut discoverability · no command-system description).
> - VisibilityId Freeze — exact `VisibilityId` received (no convert · rebrand · align · new ids).
> - Projection Freeze — `contextHelpFromDefinition` copies `id` · `title` · `description` · `category` only.
> - Title Freeze — title = exact copy (no abreviar · truncar · casing · i18n).
> - Description Freeze — description belongs to VisibilityDefinition (no extender · combinar · resumir · enriquecer).
> - Category Freeze — category = exact copy (no traducir · renombrar · agrupar · mapear · jerarquizar).
> - Resolve = Query Only — `resolveContextHelp` = `get` → projection → return.
> - Sin React · sin DOM · sin Window · sin CSS · sin Provider · sin hooks · sin Bridge.
> - Sin chrome visual · sin portal · sin mount · sin wiring de App.
> - Architecture Freeze UX-7.1 + UX-7.2 + UX-7.3 + UX-7.4 vigente.
> - Local barrel only · sin expansión `@/ui`.

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.5 — Context Help Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7.4 Command Description Bridge COMPLETE · UX-7.3 Shortcut Hint Foundation COMPLETE · UX-7.2 Tooltip Foundation COMPLETE · UX-7.1 Visibility Foundation COMPLETE · UX-7.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md)

**Declaración:**

```text
UX-7.5 = Context Help Foundation
SCOPE = ContextHelpTypes · ContextHelp · Factory · Projection · Resolve · local barrel
ContextHelp = { id, title, description, category }
Context Help Freeze = ayuda contextual only
VisibilityId Freeze = exact VisibilityId (no Identity Alignment · no brand conversion)
Projection Freeze = deterministic copy (no transform · no format · no i18n)
Title Freeze = exact copy
Description Freeze = ownership in VisibilityDefinition (no extender · combinar · resumir · enriquecer)
Category Freeze = exact copy
Resolve = Query Only (get → projection → return)
NO React · NO DOM · NO Window · NO CSS
NO Provider · NO hooks · NO Bridge · NO portal · NO mount
NO shortcut · NO icon · NO priority · NO placement · NO keywords
NO markdown · NO HTML · NO rich text
NO production wire · NO @/ui public barrel expansion
NO import from tooltips/ · shortcut-hints/ · command-descriptions/ · shortcuts/ · commands/
NO Identity Freeze · NO CommandId bridge
Architecture Freeze UX-7.1 + UX-7.2 + UX-7.3 + UX-7.4 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 = VIGENTE
Next: UX-7.6 Discoverability Pipeline
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial de **ayuda contextual** bajo `src/ui/context-help/`,
como proyección pura sobre Visibility Foundation, **sin renderizado**, **sin
ejecución**, **sin Provider/hooks** y **sin impacto funcional visible**.

```text
UX-7.5 establishes the Context Help foundation only.
It does not render help UI, execute commands, discover shortcuts,
describe commands for the command system, or wire App.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-7.1 Visibility Foundation COMPLETE | [`UX-7.1.md`](./UX-7.1.md) · `validate:ux-7.1` |
| UX-7.2 Tooltip Foundation COMPLETE | [`UX-7.2.md`](./UX-7.2.md) · `validate:ux-7.2` |
| UX-7.3 Shortcut Hint Foundation COMPLETE | [`UX-7.3.md`](./UX-7.3.md) · `validate:ux-7.3` |
| UX-7.4 Command Description Bridge COMPLETE | [`UX-7.4.md`](./UX-7.4.md) · `validate:ux-7.4` |
| Visibility Registry Freeze (4 métodos) | [`src/ui/visibility/`](../../src/ui/visibility/) |
| Cuatro proyecciones hermanas previas | tooltips · shortcut-hints · command-descriptions |
| Roadmap UX-7.0 FROZEN | [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md) |
| Sin `src/ui/context-help/` | objetivo de esta microfase |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/context-help/` flat
- `ContextHelpTypes` · `ContextHelp` · `ContextHelpInit`
- `createContextHelp` · `contextHelpFromDefinition` · `resolveContextHelp`
- Local `index.ts` barrel
- Docs + `validate:ux-7.5`

**Out**

- Discoverability Pipeline (→ UX-7.6)
- Diagnostics / Integration / Audit / Certification (→ UX-7.7–7.10)
- React · Provider · hooks · Bridge · portal · CSS · mount
- Mutating Visibility / Tooltips / Shortcut Hints / Command Descriptions / Commands
- Expanding `@/ui` public barrel
- Production registration / App wiring
- Import from tooltips/ · shortcut-hints/ · command-descriptions/ · shortcuts/ · commands/
- Identity Freeze / CommandId bridge / Identity Alignment
- Content aggregation / description enrichment

---

## 4. Architecture / Pipeline

```text
VisibilityDefinition (UX-7.1 FROZEN · SSOT metadata)
        │
        ├──► TooltipContent      (UX-7.2 FROZEN · sibling)
        ├──► ShortcutHint        (UX-7.3 FROZEN · sibling)
        ├──► CommandDescription  (UX-7.4 FROZEN · sibling · CommandId-facing)
        └──► ContextHelp         (UX-7.5 FROZEN · sibling · VisibilityId-facing)
                    │
                    ▼
             (Deferred)
             Discoverability Pipeline
             Diagnostics
             Visual Integration
```

Cuatro proyecciones hermanas sobre el mismo SSOT: puras · Query Only · React-free ·
desacopladas entre sí · consumidoras exclusivas de `VisibilityDefinition`.

```text
VisibilityId
        │
        ▼
VisibilityDefinition (get only)
        │
        ▼
contextHelpFromDefinition
        │
        ▼
ContextHelp | undefined  (via resolveContextHelp)
```

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `ContextHelpTypes` | Reexport identity `VisibilityId` (no `ContextHelpId` paralelo) |
| `ContextHelp` | Shape + `ContextHelpInit` |
| `createContextHelp` | Normalize (`trim`) · validate · `Object.freeze` |
| `contextHelpFromDefinition` | Projection Freeze + VisibilityId / Title / Description / Category Freezes |
| `resolveContextHelp` | Resolve = Query Only |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No localization · No i18n
No markdown · No rich text · No HTML
No interpretation · No transformation · No inference · No added information
No extender / combinar / resumir / enriquecer description
No convertir / rebrandear / generar / interpretar VisibilityId
No cache · No memoization · No fallbacks · No lazy creation
No register · No clear · No Visibility Registry mutation
No command execution · No Pipeline · No Dispatcher
No React · No DOM · No Window · No CSS
No Provider · No hooks · No portal · No mount
No chrome visual · No App wiring
No @/ui public barrel expansion
No import from tooltips/ · shortcut-hints/ · command-descriptions/ · shortcuts/ · commands/
No Identity Freeze · No CommandId bridge · No Identity Alignment
No shortcut discoverability · No command-system description
No aggregator de contenido · No composición de proyecciones hermanas
No production visibility entries
```

---

## 7. API Freeze

### ContextHelp

```ts
type ContextHelp = Readonly<{
  readonly id: VisibilityId;
  readonly title: string;
  readonly description: string;
  readonly category: string;
}>;
```

- Sin shortcut · icon · priority · placement · keywords · handlers · callbacks · ReactNode · i18n keys · markdown · HTML · rich text.
- Distinto de `TooltipContent` (tiene shortcut, sin category), `ShortcutHint` (sin description/category), `CommandDescription` (CommandId + shortcut + 5 campos).

### Context Help Freeze

```text
Context Help Freeze
  ContextHelp representa ayuda contextual.
  No representa ejecución.
  No representa discoverability de shortcuts.
  No representa descripción de comandos.
  No representa navegación de pipeline.
  Responsabilidad única = exponer el contenido contextual asociado a una acción.
```

### VisibilityId Freeze

```text
VisibilityId Freeze
  ContextHelp utiliza exactamente
  el VisibilityId recibido.
  No convierte.
  No rebrandea.
  No genera nuevos ids.
  No interpreta la identidad.

  Contraste con UX-7.4:
    UX-7.4 CommandDescription = Identity Freeze (CommandId ↔ VisibilityId brand cast)
    UX-7.5 ContextHelp       = VisibilityId Freeze (sin capa de alineación de identidad)

  Prohibido:
    Identity Alignment
    brand conversion
    alias
    mapping
    lookup
    nuevos ids
    reinterpretar la identidad
```

### Title Freeze

```text
Title Freeze
  title = exact copy
  no abreviar
  no truncar
  no cambiar casing
  no internacionalizar
```

### Description Freeze

```text
Description Freeze
  description pertenece exclusivamente a VisibilityDefinition.
  ContextHelp no puede extenderla,
  combinarla,
  resumirla
  ni enriquecerla.

  description = exact copy / valor raw
  no markdown
  no HTML
  no rich text
  no reinterpretar
  no transformación

  Impide que futuras fases conviertan ContextHelp en un agregador de contenido.
```

### Category Freeze

```text
Category Freeze
  category
        │
        ▼
  exact copy

  Prohibido:
    traducir
    renombrar
    agrupar
    mapear
    jerarquizar
```

### Factory

```ts
function createContextHelp(init: ContextHelpInit): ContextHelp;
```

- Normaliza con `trim()` en strings (whitespace only).
- Valida `id` / `title` / `category` no vacíos tras trim (throw).
- `description` puede ser `""`.
- Retorna `Object.freeze({...})`.
- Brands `id` con `asVisibilityId` (Init string → brand only).

### Projection Freeze

`contextHelpFromDefinition()` es una **proyección determinística**.

```text
Projection Freeze
  copia exactamente: id · title · description · category
  ignora: shortcut
  id = definition.id (VisibilityId Freeze)
  Title Freeze · Description Freeze · Category Freeze
```

```ts
function contextHelpFromDefinition(
  definition: VisibilityDefinition,
): ContextHelp;
```

**Prohibido:** interpretar · transformar · localizar · formatear · agregar información · markdown · HTML · rich text · inferir defaults · extender/combinar/resumir/enriquecer description · reorganizar category.

### Resolve = Query Only

```text
Resolve = Query Only
  VisibilityId
        │
        ▼
  registry.get(id)
        │
        ▼
  projection
        │
        ▼
  return ContextHelp | undefined
```

```ts
function resolveContextHelp(
  id: VisibilityId,
  registry: ContextHelpResolveRegistry = /* Visibility SSOT singleton */,
): ContextHelp | undefined;
```

**Prohibido:** `register()` · `clear()` · mutaciones · cache · memoization · lazy creation · fallbacks · contenido por defecto.

### ContextHelpTypes

Identity = `VisibilityId` (no branded `ContextHelpId` paralelo en UX-7.5).

### Local barrel

Reexports: Types · Model / Init · Factory · FromDefinition · Resolve.

**No** reexport desde `src/ui/index.ts`.

### UX-7.1 + UX-7.2 + UX-7.3 + UX-7.4 Freeze (reafirmado)

```text
VisibilityRegistryApi = register / get / getAll / clear ONLY
VisibilityDefinition fields = 5 (id, title, description, shortcut, category)
TooltipContent fields = 4 (id, title, description, shortcut)
ShortcutHint fields = 3 (id, title, shortcut)
CommandDescription fields = 5 (id, title, description, shortcut, category) · CommandId
NO React under visibility/ · tooltips/ · shortcut-hints/ · command-descriptions/ · context-help/
NO @/ui visibility | tooltips | shortcut-hints | command-descriptions | context-help export
```

---

## 8. Extension Points

| Congelado en UX-7.5 | Diferido |
|---------------------|----------|
| ContextHelp fields (4) · Context Help Freeze · VisibilityId Freeze · Category Freeze | Discoverability Pipeline · production `register` → UX-7.6 |
| Projection Freeze · Title Freeze · Description Freeze (ownership) | Visibility Diagnostics → UX-7.7 |
| Resolve = Query Only · empty SSOT | Visual Integration / help chrome → UX-7.8 |
| Local barrel · no chrome · no `@/ui` expansion · no content aggregation | Alias / multi-id / category taxonomy / help aggregator → UX-8+ si se autoriza |

---

## 9. Exclusions / Decoupling fence

Files under `src/ui/context-help/` must not import or reference:

- `react` / `react-dom`
- `window` / `document`
- DOM APIs / CSS modules / style imports
- UI product components / App routes
- Command execution / Pipeline / Dispatcher / Providers
- Toolbar / Menus / Context Menus
- `src/ui/shortcuts/` (execution)
- `src/ui/tooltips/` · `src/ui/shortcut-hints/` · `src/ui/command-descriptions/` (siblings)
- `src/ui/commands/` (no CommandId bridge in this phase)

Also prohibited: production registration · App mount · `src/ui/index.ts`
modification · Visibility Registry mutation · cache/fallbacks in Resolve ·
Identity Alignment / alias/mapping/lookup · description aggregation.

**Unidirectional dependency:** context-help → visibility only.
Visibility never imports context-help. Tooltips / shortcut-hints /
command-descriptions never import context-help. Context-help never imports
tooltips / shortcut-hints / command-descriptions / shortcuts / commands.

---

## 10. Protected files

| Path | Role |
|------|------|
| `src/ui/context-help/ContextHelpTypes.ts` | VisibilityId reexport |
| `src/ui/context-help/ContextHelp.ts` | Model + Init |
| `src/ui/context-help/createContextHelp.ts` | Factory |
| `src/ui/context-help/resolveContextHelp.ts` | Projection + Resolve |
| `src/ui/context-help/index.ts` | Local barrel |

**Protected from this phase:** `src/ui/visibility/**`, `src/ui/tooltips/**`,
`src/ui/shortcut-hints/**`, `src/ui/command-descriptions/**`,
`src/ui/shortcuts/**`, `src/ui/commands/**`, `src/ui/toolbar/**`,
`src/ui/menus/**`, `src/ui/context-menus/**`, `src/ui/index.ts`,
AppShell / production chrome,
`validate-ux-7.1`, `validate-ux-7.2`, `validate-ux-7.3`, `validate-ux-7.4`.

---

## 11. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-7.5.1 | Docs con Context Help Freeze · VisibilityId Freeze · Description Freeze (ownership) · Category Freeze · Projection Freeze · Resolve = Query Only · No responsabilidades |
| CA-UX-7.5.2 | Módulo `src/ui/context-help/` + 5 archivos core |
| CA-UX-7.5.3 | `ContextHelp` = `{ id, title, description, category }` · `id: VisibilityId` · sin shortcut · sin Identity Freeze |
| CA-UX-7.5.4 | Factory trim + validate + freeze |
| CA-UX-7.5.5 | FromDefinition + Projection Freeze + VisibilityId Freeze + Description ownership + Category Freeze (ignora shortcut) |
| CA-UX-7.5.6 | Resolve = Query Only por `VisibilityId` |
| CA-UX-7.5.7 | Local barrel completo · sin expansión `@/ui` |
| CA-UX-7.5.8 | Architecture Freeze UX-7.1–7.4 intacto |
| CA-UX-7.5.9 | Freeze fences (React/DOM/CSS/App/product-wire/siblings/shortcuts) |
| CA-UX-7.5.10 | Dependencia unidireccional autorizada |

Gate: `npm run validate:ux-7.5` → **PASS 10/10**

---

## 12. Gate

```text
npm run validate:ux-7.5
→ PASS 10/10
```

---

## 13. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-7.6 | Discoverability Pipeline |
| UX-7.7+ | Diagnostics · Integration · Audit · Certification |
