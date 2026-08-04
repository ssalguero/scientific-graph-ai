# UX-7.4 — Command Description Bridge

> **Architectural principles:**
> - Command Description Bridge — `CommandDescription` describes command metadata, not execution or rendering.
> - Bridge Freeze — read-only projection; no Pipeline · Dispatcher · Provider · React · UI.
> - Identity Freeze — `visibilityIdFromCommandId` = brand cast only (no validate · query · register · interpret · transform).
> - Identity Alignment — `String(CommandId) === String(VisibilityId)`; no alias / mapping / lookup tables.
> - Projection Freeze — `commandDescriptionFromDefinition` copies `id` · `title` · `description` · `shortcut` · `category` only.
> - Title Freeze — title = exact copy (no abreviar · truncar · casing · i18n).
> - Description Freeze — description = valor raw (no markdown · HTML · rich text · interpretación · transformación).
> - Shortcut Freeze — shortcut = valor raw (no pretty-print · platform · aliases).
> - Category Freeze — category = exact copy (no traducir · renombrar · agrupar · mapear · jerarquizar).
> - Resolve = Query Only — `resolveCommandDescription` = CommandId → Identity Freeze → get → projection → return.
> - Sin React · sin DOM · sin Window · sin CSS · sin Provider · sin hooks · sin portal · sin mount.
> - Architecture Freeze UX-7.1 + UX-7.2 + UX-7.3 vigente.
> - Local barrel only · sin expansión `@/ui`.
> - No es `CommandBridge.tsx` (React pass-through UX-6).

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.4 — Command Description Bridge  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7.3 Shortcut Hint Foundation COMPLETE · UX-7.2 Tooltip Foundation COMPLETE · UX-7.1 Visibility Foundation COMPLETE · UX-7.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md)

**Declaración:**

```text
UX-7.4 = Command Description Bridge
SCOPE = CommandDescriptionTypes · CommandDescription · Factory · Identity Freeze · Projection · Resolve · local barrel
CommandDescription = { id, title, description, shortcut, category }
id = CommandId (CommandId-facing projection)
Bridge Freeze = read-only projection (no execution · no register · no UI)
Identity Freeze = visibilityIdFromCommandId brand cast only
Identity Alignment = String(CommandId) == String(VisibilityId)
Projection Freeze = deterministic copy (no transform · no format · no i18n)
Title Freeze = exact copy
Description Freeze = valor raw
Shortcut Freeze = valor raw
Category Freeze = exact copy
Resolve = Query Only (CommandId → Identity Freeze → get → projection → return)
NO React · NO DOM · NO Window · NO CSS
NO Provider · NO hooks · NO portal · NO mount
NO icon · NO priority · NO placement · NO keywords · NO handlers · NO callbacks
NO markdown · NO HTML · NO rich text · NO i18n keys
NO production wire · NO @/ui public barrel expansion
NO import from tooltips/ · shortcut-hints/ · shortcuts/
NO alias tables · NO mapping tables · NO lookup tables
NO edit CommandBridge.tsx
Architecture Freeze UX-7.1 + UX-7.2 + UX-7.3 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 = VIGENTE
Next: UX-7.5 Context Help Foundation
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial del **Command Description Bridge** bajo
`src/ui/command-descriptions/`, como proyección pura CommandId-facing sobre
Visibility Foundation, **sin ejecución de comandos**, **sin registro**,
**sin React**, **sin chrome visual** y **sin impacto funcional visible**.

```text
UX-7.4 establishes the Command Description Bridge only.
It does not execute commands, register visibility, render chrome, or wire App.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-7.1 Visibility Foundation COMPLETE | [`UX-7.1.md`](./UX-7.1.md) · `validate:ux-7.1` |
| UX-7.2 Tooltip Foundation COMPLETE | [`UX-7.2.md`](./UX-7.2.md) · `validate:ux-7.2` |
| UX-7.3 Shortcut Hint Foundation COMPLETE | [`UX-7.3.md`](./UX-7.3.md) · `validate:ux-7.3` |
| Visibility Registry Freeze (4 métodos) | [`src/ui/visibility/`](../../src/ui/visibility/) |
| Tooltip / ShortcutHint proyecciones hermanas | [`src/ui/tooltips/`](../../src/ui/tooltips/) · [`src/ui/shortcut-hints/`](../../src/ui/shortcut-hints/) |
| CommandDefinition = `{ id }` only | [`src/ui/commands/`](../../src/ui/commands/) |
| Roadmap UX-7.0 FROZEN | [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md) |
| Sin `src/ui/command-descriptions/` | objetivo de esta microfase |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/command-descriptions/` flat
- `CommandDescriptionTypes` · `CommandDescription` · `CommandDescriptionInit`
- `visibilityIdFromCommandId` · `createCommandDescription`
- `commandDescriptionFromDefinition` · `resolveCommandDescription`
- Local `index.ts` barrel
- Docs + `validate:ux-7.4`

**Out**

- Context Help (→ UX-7.5)
- Discoverability Pipeline (→ UX-7.6)
- Diagnostics / Integration / Audit / Certification (→ UX-7.7–7.10)
- React · Provider · hooks · portal · CSS · mount
- Mutating Visibility / Tooltips / Shortcut Hints / Commands
- Expanding `@/ui` public barrel
- Production registration / App wiring
- Import from tooltips/ · shortcut-hints/ · shortcuts/
- Alias / mapping / lookup tables
- Editar `CommandBridge.tsx`

---

## 4. Architecture / Pipeline

```text
CommandId (UX-6 FROZEN · identity-only)
        │
        ▼
Identity Freeze  (visibilityIdFromCommandId · brand cast only)
        │
        ▼
VisibilityDefinition (UX-7.1 FROZEN · SSOT metadata)
        │
        ├──► TooltipContent     (UX-7.2 FROZEN · sibling)
        ├──► ShortcutHint       (UX-7.3 FROZEN · sibling)
        └──► CommandDescription (UX-7.4 FROZEN · sibling · CommandId-facing)
                    │
                    ▼
             (Deferred)
             Context Help
             Discoverability
             Diagnostics
             Visual Integration
```

Tres proyecciones hermanas sobre el mismo SSOT.

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `CommandDescriptionTypes` | Reexport `CommandId` / `VisibilityId` + Identity Freeze helper |
| `CommandDescription` | Shape + `CommandDescriptionInit` |
| `createCommandDescription` | Normalize (`trim`) · validate · `Object.freeze` |
| `visibilityIdFromCommandId` | Identity Freeze — brand cast only |
| `commandDescriptionFromDefinition` | Projection Freeze + Title / Description / Shortcut / Category Freezes |
| `resolveCommandDescription` | Resolve = Query Only |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No localization · No i18n
No markdown · No rich text · No HTML
No interpretation · No transformation · No added information
No cache · No memoization · No fallbacks · No lazy creation
No register · No clear · No Visibility Registry mutation
No Command Registry mutation · No command registration
No command execution · No Pipeline · No Dispatcher
No React · No DOM · No Window · No CSS
No Provider · No hooks · No portal · No mount
No chrome visual · No App wiring
No @/ui public barrel expansion
No import from tooltips/ · shortcut-hints/ · shortcuts/
No alias map CommandId↔VisibilityId
No Identity Freeze violations (validate · query · register · interpret · transform string)
No Category Freeze violations (traducir · renombrar · agrupar · mapear · jerarquizar)
No edit CommandBridge.tsx
No production visibility entries
```

---

## 7. API Freeze

### CommandDescription

```ts
type CommandDescription = Readonly<{
  readonly id: CommandId;
  readonly title: string;
  readonly description: string;
  readonly shortcut: string;
  readonly category: string;
}>;
```

- Sin icon · priority · placement · keywords · handlers · callbacks · ReactNode · i18n keys · markdown · HTML · rich text.
- Distinto de `TooltipContent` (VisibilityId · sin category) y de `ShortcutHint` (sin description/category).

### Identity Freeze

```text
Identity Freeze
  visibilityIdFromCommandId()
    = conversión de brand únicamente

  CommandId
        │
        ▼
  VisibilityId

  Es únicamente un cast explícito.
  Nada más.

  No valida
  No consulta
  No registra
  No interpreta
  No transforma el string
```

```ts
function visibilityIdFromCommandId(commandId: CommandId): VisibilityId;
```

### Identity Alignment

```text
Identity Alignment
  String(CommandId) == String(VisibilityId)
  No alias tables
  No mapping tables
  No lookup tables
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
  description = valor raw
  no markdown
  no HTML
  no rich text
  no interpretación
  no transformación
```

### Shortcut Freeze

```text
Shortcut Freeze
  shortcut = valor raw
  no pretty-print
  no platform glyphs
  no normalización
  no reordenamiento
  no aliases
  no expansión de abreviaturas
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

Evita que UX-7.6 reorganice categorías desde el Bridge.

### Factory

```ts
function createCommandDescription(init: CommandDescriptionInit): CommandDescription;
```

- Normaliza con `trim()` en strings (whitespace only).
- Valida `id` / `title` / `category` no vacíos tras trim (throw).
- `description` y `shortcut` pueden ser `""`.
- Retorna `Object.freeze({...})`.

### Projection Freeze

`commandDescriptionFromDefinition()` es una **proyección determinística**.

```text
Projection Freeze
  copia exactamente: id · title · description · shortcut · category
  id = asCommandId(String(definition.id))
  Title Freeze · Description Freeze · Shortcut Freeze · Category Freeze
```

```ts
function commandDescriptionFromDefinition(
  definition: VisibilityDefinition,
): CommandDescription;
```

**Prohibido:** interpretar · transformar · localizar · formatear · agregar información · markdown · HTML · rich text · inferir defaults · reorganizar category.

### Resolve = Query Only

```text
Resolve = Query Only
  CommandId
        │
        ▼
  visibilityIdFromCommandId()
        │
        ▼
  registry.get(id)
        │
        ▼
  projection
        │
        ▼
  return CommandDescription | undefined
```

```ts
function resolveCommandDescription(
  commandId: CommandId,
  registry: CommandDescriptionResolveRegistry = /* Visibility SSOT singleton */,
): CommandDescription | undefined;
```

**Prohibido:** `register()` · `clear()` · mutaciones · cache · memoization · lazy creation · fallbacks · consultar CommandRegistry para inventar metadata.

### Bridge Freeze

```text
Bridge Freeze
  no ejecuta comandos
  no registra comandos
  no registra visibility
  no modifica registries
  no conoce Pipeline
  no conoce Dispatcher
  no conoce Providers
  no conoce React
  no conoce UI
  = exclusivamente proyección read-only
```

### Local barrel

Reexports: Types / Identity Freeze · Model / Init · Factory · FromDefinition · Resolve.

**No** reexport desde `src/ui/index.ts`.

### UX-7.1 + UX-7.2 + UX-7.3 Freeze (reafirmado)

```text
VisibilityRegistryApi = register / get / getAll / clear ONLY
VisibilityDefinition fields = 5 (id, title, description, shortcut, category)
TooltipContent fields = 4 (id, title, description, shortcut)
ShortcutHint fields = 3 (id, title, shortcut)
NO React under visibility/ · tooltips/ · shortcut-hints/ · command-descriptions/
NO @/ui visibility | tooltips | shortcut-hints | command-descriptions export
```

---

## 8. Extension Points

| Congelado en UX-7.4 | Diferido |
|---------------------|----------|
| CommandDescription fields (5) · Bridge Freeze · Category Freeze | Context Help Foundation → UX-7.5 |
| Identity Freeze (brand cast only) | Discoverability Pipeline · production `register` → UX-7.6 |
| Resolve = Query Only · empty SSOT | Visibility Diagnostics → UX-7.7 |
| Local barrel · no chrome | Visual Integration → UX-7.8 |
| No alias map · no category taxonomy in Bridge | Alias / multi-id / category taxonomy → UX-8+ si se autoriza |

---

## 9. Exclusions / Decoupling fence

Files under `src/ui/command-descriptions/` must not import or reference:

- `react` / `react-dom`
- `window` / `document`
- DOM APIs / CSS modules / style imports
- UI product components / App routes
- Command execution / Pipeline / Dispatcher / Providers / `CommandBridge.tsx`
- Toolbar / Menus / Context Menus
- `src/ui/shortcuts/` (execution)
- `src/ui/tooltips/` · `src/ui/shortcut-hints/` (siblings)

Also prohibited: production registration · App mount · `src/ui/index.ts`
modification · Visibility Registry mutation · cache/fallbacks in Resolve ·
alias/mapping/lookup tables.

**Unidirectional dependency:** command-descriptions → visibility (+ CommandTypes only).
Visibility never imports command-descriptions. Tooltips / shortcut-hints never
import command-descriptions. Command-descriptions never import tooltips /
shortcut-hints / shortcuts.

---

## 10. Protected files

| Path | Role |
|------|------|
| `src/ui/command-descriptions/CommandDescriptionTypes.ts` | Brands + Identity Freeze |
| `src/ui/command-descriptions/CommandDescription.ts` | Model + Init |
| `src/ui/command-descriptions/createCommandDescription.ts` | Factory |
| `src/ui/command-descriptions/resolveCommandDescription.ts` | Projection + Resolve |
| `src/ui/command-descriptions/index.ts` | Local barrel |

**Protected from this phase:** `src/ui/visibility/**`, `src/ui/tooltips/**`,
`src/ui/shortcut-hints/**`, `src/ui/shortcuts/**`, `src/ui/commands/**`,
`src/ui/toolbar/**`, `src/ui/menus/**`, `src/ui/context-menus/**`,
`src/ui/index.ts`, AppShell / production chrome,
`validate-ux-7.1`, `validate-ux-7.2`, `validate-ux-7.3`.

---

## 11. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-7.4.1 | Docs oficiales con Bridge Freeze · Query Only · Identity Freeze · Category Freeze · Projection Freeze · No responsabilidades |
| CA-UX-7.4.2 | Módulo `src/ui/command-descriptions/` + archivos core presentes |
| CA-UX-7.4.3 | `CommandDescription` fields exactos · `id: CommandId` |
| CA-UX-7.4.4 | Factory trim + validate + freeze |
| CA-UX-7.4.5 | FromDefinition + Identity Freeze + Category Freeze + Projection Freeze |
| CA-UX-7.4.6 | Resolve = Query Only por `CommandId` |
| CA-UX-7.4.7 | Local barrel completo · sin expansión `@/ui` |
| CA-UX-7.4.8 | Architecture Freeze UX-7.1 + 7.2 + 7.3 intacto |
| CA-UX-7.4.9 | Freeze fences (React/DOM/CSS/App/product-wire/siblings/shortcuts) |
| CA-UX-7.4.10 | Dependencia unidireccional autorizada |

Gate: `npm run validate:ux-7.4` → **PASS 10/10**

---

## 12. Gate

```text
npm run validate:ux-7.4
→ PASS 10/10
```

---

## 13. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-7.5 | Context Help Foundation |
| UX-7.6 | Discoverability Pipeline |
| UX-7.7+ | Diagnostics · Integration · Audit · Certification |
