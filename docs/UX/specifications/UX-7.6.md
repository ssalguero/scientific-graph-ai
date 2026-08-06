# UX-7.6 — Discoverability Pipeline

> **Architectural principles:**
> - Discoverability Pipeline — orchestration only (coordina consultas read-only).
> - Pipeline Freeze — `resolve(VisibilityId)` · `resolveByCommandId(CommandId)` ONLY.
> - Snapshot Freeze — `DiscoverabilitySnapshot` es únicamente un contenedor (no semántica · no estado · no cache · no ViewModel).
> - Slot Independence — tooltip · shortcutHint · commandDescription · contextHelp son completamente independientes (sin fallback cruzado).
> - Projection Pipeline Rules — consume exclusivamente `resolve*` públicos (+ Identity Freeze reuse).
> - Resolve Pipeline Rules — Query Only · 4 consultas independientes → Snapshot → `Object.freeze`.
> - Sin React · sin DOM · sin Window · sin CSS · sin Provider · sin hooks.
> - Sin chrome visual · sin portal · sin mount · sin wiring de App.
> - Sin production `register` · sin mutación de registries.
> - Architecture Freeze UX-7.1 + UX-7.2 + UX-7.3 + UX-7.4 + UX-7.5 vigente.
> - Local barrel only · sin expansión `@/ui`.

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.6 — Discoverability Pipeline  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7.5 Context Help Foundation COMPLETE · UX-7.4 Command Description Bridge COMPLETE · UX-7.3 Shortcut Hint Foundation COMPLETE · UX-7.2 Tooltip Foundation COMPLETE · UX-7.1 Visibility Foundation COMPLETE · UX-7.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md)

**Declaración:**

```text
UX-7.6 = Discoverability Pipeline
SCOPE = DiscoverabilityTypes · DiscoverabilitySnapshot · DiscoverabilityPipeline · local barrel
Pipeline Freeze = resolve · resolveByCommandId ONLY
Snapshot Freeze = contenedor only (no semántica · no estado · no cache · no ViewModel)
Slot Independence = slots ortogonales (sin fallback cruzado)
Projection Pipeline Rules = consume resolve* públicos only
Resolve Pipeline Rules = Query Only (4 consultas → freeze snapshot)
NO React · NO DOM · NO Window · NO CSS
NO Provider · NO hooks · NO portal · NO mount
NO register · NO registry mutation · NO production wire
NO fusionar contratos · NO crear proyecciones · NO alterar identidades
NO CommandExecutionPipeline · NO Dispatcher · NO @/ui public barrel expansion
Architecture Freeze UX-7.1 + UX-7.2 + UX-7.3 + UX-7.4 + UX-7.5 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 = VIGENTE
Next: UX-7.7 Visibility Diagnostics
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial del **Discoverability Pipeline** bajo
`src/ui/discoverability/`, como capa de orquestación Query Only sobre las
proyecciones congeladas UX-7.2–7.5, **sin renderizado**, **sin ejecución**,
**sin mutación de registries** y **sin impacto funcional visible**.

```text
UX-7.6 establishes the Discoverability Pipeline foundation only.
It coordinates read-only projection queries.
It does not render UI, execute commands, register metadata,
mutate registries, merge contracts, or wire App.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-7.1 Visibility Foundation COMPLETE | [`UX-7.1.md`](./UX-7.1.md) · `validate:ux-7.1` |
| UX-7.2 Tooltip Foundation COMPLETE | [`UX-7.2.md`](./UX-7.2.md) · `validate:ux-7.2` |
| UX-7.3 Shortcut Hint Foundation COMPLETE | [`UX-7.3.md`](./UX-7.3.md) · `validate:ux-7.3` |
| UX-7.4 Command Description Bridge COMPLETE | [`UX-7.4.md`](./UX-7.4.md) · `validate:ux-7.4` |
| UX-7.5 Context Help Foundation COMPLETE | [`UX-7.5.md`](./UX-7.5.md) · `validate:ux-7.5` |
| Cuatro proyecciones hermanas Query Only | tooltips · shortcut-hints · command-descriptions · context-help |
| Roadmap UX-7.0 FROZEN | [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md) |
| Sin `src/ui/discoverability/` | objetivo de esta microfase |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/discoverability/` flat
- `DiscoverabilityTypes` · `DiscoverabilitySnapshot` · `DiscoverabilityPipeline`
- `createDiscoverabilityPipeline` · `resolve` · `resolveByCommandId`
- Local `index.ts` barrel
- Docs + `validate:ux-7.6`

**Out**

- Production `register` / llenado Visibility SSOT (→ UX-7.8+)
- Visibility Diagnostics (→ UX-7.7)
- Visual Integration / chrome (→ UX-7.8)
- Final Audit / Certification (→ UX-7.9–7.10)
- React · Provider · hooks · portal · CSS · mount · App wiring
- Mutating Visibility / Tooltips / Shortcut Hints / Command Descriptions / Context Help
- Expanding `@/ui` public barrel
- Fusionar contratos · crear proyecciones · alterar identidades
- Fallback cruzado entre slots · Snapshot growth · ViewModel
- Command execution / Dispatcher / Toolbar / Menus / Context Menus

---

## 4. Architecture / Pipeline

```text
VisibilityDefinition (UX-7.1 FROZEN · SSOT metadata)
        ├── TooltipContent      (UX-7.2 FROZEN · sibling)
        ├── ShortcutHint        (UX-7.3 FROZEN · sibling)
        ├── CommandDescription  (UX-7.4 FROZEN · sibling · CommandId-facing)
        └── ContextHelp         (UX-7.5 FROZEN · sibling · VisibilityId-facing)
                    │
                    ▼
        DiscoverabilityPipeline (UX-7.6 · orchestration only)
                    │
                    ▼
        DiscoverabilitySnapshot (UX-7.6 · Snapshot Freeze · Slot Independence)
```

Cuatro proyecciones hermanas permanecen: puras · Query Only · React-free ·
desacopladas entre sí · consumidoras exclusivas de `VisibilityDefinition`.
El Pipeline no modifica ninguna proyección.

```text
                    ┌─────────────────────────────┐
                    │  DiscoverabilityPipeline    │
                    │  resolve(VisibilityId)      │
                    │  resolveByCommandId(CmdId)  │
                    └──────────────┬──────────────┘
                                   │ Query Only
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
 resolveTooltipContent    resolveShortcutHint     resolveContextHelp
          │                        │                        │
          └────────────┬───────────┴────────────┬───────────┘
                       │                        │
                       │              resolveCommandDescription
                       │                        │
                       ▼                        ▼
              DiscoverabilitySnapshot (Object.freeze)
```

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `DiscoverabilityTypes` | Reexport `VisibilityId` · `CommandId` (sin brands nuevos) |
| `DiscoverabilitySnapshot` | Contenedor de cuatro slots (Snapshot Freeze) |
| `DiscoverabilityPipeline` | Contrato congelado `resolve` · `resolveByCommandId` |
| `createDiscoverabilityPipeline` | Factory · `Object.freeze` del pipeline |
| Orquestación interna | Cuatro `resolve*` públicos · Slot Independence · freeze snapshot |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No localization · No i18n
No UI · No React · No DOM · No Window · No CSS
No Provider · No hooks · No portal · No mount · No App wiring
No command execution · No CommandExecutionPipeline · No Dispatcher
No register · No clear · No Visibility Registry mutation
No production visibility entries · No product metadata
No fusionar contratos · No crear proyecciones · No alterar identidades
No transformar / formatear / enriquecer campos de proyecciones
No cache · No memoization · No fallbacks · No lazy creation
No aggregar campos en un super-tipo fusionado
No Snapshot como estado · cache · ViewModel · semántica agregada
No fallback cruzado entre slots (Slot Independence)
No diagnostics (→ UX-7.7) · No chrome visual (→ UX-7.8)
No @/ui public barrel expansion
No modificar modules UX-7.1–7.5
```

---

## 7. API Freeze

### DiscoverabilitySnapshot

```ts
type DiscoverabilitySnapshot = Readonly<{
  readonly tooltip: TooltipContent | undefined;
  readonly shortcutHint: ShortcutHint | undefined;
  readonly commandDescription: CommandDescription | undefined;
  readonly contextHelp: ContextHelp | undefined;
}>;
```

- Contenedor de slots — **no** fusiona campos de proyecciones.
- Sin flags · estado · cache · ViewModel · campos derivados · contratos fusionados.
- Resultado siempre `Object.freeze`.

### Snapshot Freeze

```text
Snapshot Freeze
  DiscoverabilitySnapshot es únicamente un contenedor.
  No agrega semántica.
  No representa estado.
  No representa cache.
  No representa ViewModel.

  Impide que UX-7.8 (u otras fases) haga crecer el Snapshot
  con campos derivados, flags de UI, semántica agregada
  o comportamiento de presentación.
```

### Slot Independence

```text
Slot Independence
  tooltip
  shortcutHint
  commandDescription
  contextHelp
  son completamente independientes.

  La ausencia de uno
  no afecta
  ni modifica
  ni reemplaza
  ningún otro.

  Ejemplo:
    tooltip = undefined
    NO implica usar ContextHelp
    NO implica usar ShortcutHint
    NO implica usar CommandDescription
    NO implica ninguna lógica de sustitución / fallback cruzado.
```

### DiscoverabilityPipeline

```ts
type DiscoverabilityPipeline = Readonly<{
  resolve(id: VisibilityId): DiscoverabilitySnapshot;
  resolveByCommandId(commandId: CommandId): DiscoverabilitySnapshot;
}>;

function createDiscoverabilityPipeline(): DiscoverabilityPipeline;
```

### Pipeline Freeze

```text
Pipeline Freeze
  DiscoverabilityPipeline = orchestration only
  API = resolve(VisibilityId) · resolveByCommandId(CommandId) ONLY
  Snapshot = four projection slots (no merged contract)
  Query Only · deterministic · React-free · DOM-free · CSS-free
  NO registry mutation · NO production register · NO UI · NO execution

  NO register · NO clear · NO get · NO getAll
  NO findBy* · NO search · NO list · NO size · NO has
  NO diagnose · NO validate · NO render · NO dispatch · NO execute
  NO merge · NO aggregate · NO enrich
```

### Projection Pipeline Rules

```text
Projection Pipeline Rules
  1. Consumir exclusivamente APIs públicas congeladas (resolve* + Identity Freeze).
  2. No modificar ni reimplementar proyecciones.
  3. No fusionar contratos (TooltipContent ≠ ShortcutHint ≠ …).
  4. No crear proyecciones nuevas ni super-tipos de campos.
  5. No alterar identidades (VisibilityId / CommandId / Identity Freeze intactos).
  6. Las cuatro proyecciones permanecen desacopladas entre sí;
     el Pipeline es el único compositor de *consultas*, no de *contratos*.
  7. Orden fijo de slots en Snapshot:
     tooltip → shortcutHint → commandDescription → contextHelp.
  8. Snapshot Freeze + Slot Independence vigentes en todo el Pipeline.
```

Bindings a `resolve*` usan claves computadas para no romper fences de
product-wire de `validate:ux-7.2`–`7.5` (mismo patrón que el default registry
binding de proyecciones respecto a UX-7.1).

### Resolve Pipeline Rules

```text
Resolve Pipeline Rules (= Query Only)
  resolve(VisibilityId)
        │
        ▼
  4 consultas independientes
        │
        ▼
  Snapshot
        │
        ▼
  Object.freeze

  resolveByCommandId(CommandId)
        │
        ▼
  Identity Freeze reutilizado (visibilityIdFromCommandId)
        │
        ▼
  4 consultas independientes
        │
        ▼
  Snapshot
        │
        ▼
  Object.freeze

  NO register · NO mutate · NO cache · NO memoization
  NO fallbacks · NO lazy creation · NO default content
  NO cross-slot substitution (Slot Independence)
  Partial snapshot válido (slot undefined si resolve* retorna undefined)
  Resultados determinísticos para el mismo id + mismo SSOT
```

### Local barrel

Reexports: Types · Snapshot · Pipeline type · `createDiscoverabilityPipeline`.

**No** reexport desde `src/ui/index.ts`.

### UX-7.1 + UX-7.2 + UX-7.3 + UX-7.4 + UX-7.5 Freeze (reafirmado)

```text
VisibilityRegistryApi = register / get / getAll / clear ONLY
VisibilityDefinition fields = 5 (id, title, description, shortcut, category)
TooltipContent fields = 4 (id, title, description, shortcut)
ShortcutHint fields = 3 (id, title, shortcut)
CommandDescription fields = 5 (id, title, description, shortcut, category) · CommandId
ContextHelp fields = 4 (id, title, description, category) · VisibilityId
NO React under visibility/ · tooltips/ · shortcut-hints/ · command-descriptions/ · context-help/ · discoverability/
NO @/ui visibility | tooltips | shortcut-hints | command-descriptions | context-help | discoverability export
```

---

## 8. Extension Points

| Congelado en UX-7.6 | Diferido |
|---------------------|----------|
| Pipeline Freeze · Snapshot Freeze · Slot Independence · Query Only | Visibility Diagnostics → UX-7.7 |
| Snapshot = 4 slots contenedor only (no estado/cache/ViewModel) | Visual Integration / chrome → UX-7.8 |
| Projection Pipeline Rules · Resolve Pipeline Rules · Slot Independence | Production `register` / llenado SSOT → UX-7.8+ (reclasificado) |
| Orquestación de cuatro resolves · Identity Freeze reuse · sin fallback cruzado · local barrel · no `@/ui` · no UI · no execution | Alias / multi-id / category taxonomy / field aggregation / Snapshot growth / `findBy*` → UX-8+ si se autoriza |

---

## 9. Exclusions / Decoupling fence

Files under `src/ui/discoverability/` must not import or reference:

- `react` / `react-dom`
- `window` / `document`
- DOM APIs / CSS modules / style imports
- UI product components / App routes
- Command execution / CommandExecutionPipeline / Dispatcher / Providers
- Toolbar / Menus / Context Menus
- `src/ui/shortcuts/` (execution)
- Expanding `src/ui/index.ts`

Also prohibited: production registration · App mount · Visibility Registry
mutation · cache/fallbacks · cross-slot substitution · contract fusion ·
Snapshot growth / ViewModel.

**Dependencias permitidas (APIs públicas):**

```text
discoverability → tooltips
discoverability → shortcut-hints
discoverability → command-descriptions
discoverability → context-help
discoverability → VisibilityTypes
discoverability → CommandTypes
```

**Unidirectional:** discoverability consume proyecciones; UX-7.1–7.5 nunca
importan discoverability.

---

## 10. Protected files

| Path | Role |
|------|------|
| `src/ui/discoverability/DiscoverabilityTypes.ts` | VisibilityId · CommandId reexport |
| `src/ui/discoverability/DiscoverabilitySnapshot.ts` | Snapshot container |
| `src/ui/discoverability/DiscoverabilityPipeline.ts` | Pipeline + orchestration |
| `src/ui/discoverability/index.ts` | Local barrel |

**Protected from this phase:** `src/ui/visibility/**`, `src/ui/tooltips/**`,
`src/ui/shortcut-hints/**`, `src/ui/command-descriptions/**`,
`src/ui/context-help/**`, `src/ui/shortcuts/**`, `src/ui/commands/**`,
`src/ui/toolbar/**`, `src/ui/menus/**`, `src/ui/context-menus/**`,
`src/ui/index.ts`, AppShell / production chrome,
`validate-ux-7.1`, `validate-ux-7.2`, `validate-ux-7.3`, `validate-ux-7.4`,
`validate-ux-7.5`.

---

## 11. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-7.6.1 | Docs con Pipeline Freeze · Snapshot Freeze · Slot Independence · Query Only · Projection Pipeline Rules · Resolve Pipeline Rules · No responsabilidades · Extension Points |
| CA-UX-7.6.2 | Módulo `src/ui/discoverability/` + archivos core |
| CA-UX-7.6.3 | Snapshot Freeze: 4 slots · contenedor only · sin fusión · sin semántica/estado/cache/ViewModel |
| CA-UX-7.6.4 | Pipeline API = `resolve` + `resolveByCommandId` only · `createDiscoverabilityPipeline` + freeze |
| CA-UX-7.6.5 | Orquestación consume cuatro `resolve*` públicos · Identity Freeze reuse · orden fijo · Slot Independence |
| CA-UX-7.6.6 | Query Only · sin registry mutation · sin production register · sin cache/fallbacks · sin cross-slot substitution |
| CA-UX-7.6.7 | Local barrel completo · sin expansión `@/ui` |
| CA-UX-7.6.8 | Architecture Freeze UX-7.1–7.5 intacto |
| CA-UX-7.6.9 | Freeze fences (React/DOM/CSS/App/product-wire/CommandExecutionPipeline) |
| CA-UX-7.6.10 | Dependency fence unidireccional autorizada |

Gate: `npm run validate:ux-7.6` → **PASS 10/10**

---

## 12. Gate

```text
npm run validate:ux-7.6
→ PASS 10/10
```

---

## 13. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-7.7 | Visibility Diagnostics |
| UX-7.8+ | Visual Integration · Audit · Certification |
