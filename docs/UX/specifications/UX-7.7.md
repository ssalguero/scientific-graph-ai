# UX-7.7 — Visibility Diagnostics

> **Architectural principles:**
> - Infrastructure first · Diagnostics only · Query Only · Read-only.
> - Separación clara: infraestructura → orquestación → inspección → reporte.
> - Diagnostics Freeze · Report Freeze · Coverage Freeze · Determinism Freeze.
> - React-free · DOM-free · CSS-free · sin componentes visuales · sin wiring de App.
> - Consume exclusivamente APIs públicas congeladas UX-7.1–7.6.
> - Nunca modifica · nunca registra · nunca crea proyecciones · nunca reejecuta comandos · nunca reconstruye el Pipeline.
> - Architecture Freeze UX-7.1–UX-7.6 = VIGENTE.
> - Local barrel only · sin expansión `@/ui`.

**Épica:** UX-7 — User Visibility / Discoverability  
**Microfase:** UX-7.7 — Visibility Diagnostics  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7.6 Discoverability Pipeline COMPLETE · UX-7.1–7.5 COMPLETE · UX-7.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md)

**Declaración:**

```text
UX-7.7 = Visibility Diagnostics
SCOPE = VisibilityDiagnosticsReport · createVisibilityDiagnosticsReport · local barrel
Diagnostics Freeze = createVisibilityDiagnosticsReport ONLY
Report Freeze = VisibilityDiagnosticsReport inmutable (campos fijos)
Coverage Freeze = with* / missing* = presencia|ausencia ONLY (no calidad · no completitud · no validez)
Determinism Freeze = mismo registry + mismos resolve* ⇒ mismo reporte · ids en orden getAll()
Query Rules = getAll + resolve* públicos · sin mutación · sin side-effects
NO React · NO DOM · NO Window · NO CSS
NO Provider · NO hooks · NO portal · NO mount · NO App wiring
NO register · NO registry mutation · NO production wire
NO crear proyecciones · NO alterar Pipeline · NO alterar Snapshot
NO CommandExecutionPipeline · NO Dispatcher · NO @/ui public barrel expansion
Architecture Freeze UX-7.1 + UX-7.2 + UX-7.3 + UX-7.4 + UX-7.5 + UX-7.6 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 = VIGENTE
Next: UX-7.8 Visual Integration
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial de **Visibility Diagnostics** bajo
`src/ui/visibility-diagnostics/`, como capa Query Only de inspección sobre
Visibility SSOT + proyecciones UX-7.2–7.5 (+ readiness opcional del Pipeline
UX-7.6), **sin renderizado**, **sin ejecución**, **sin mutación de registries**
y **sin impacto funcional visible**.

```text
UX-7.7 establishes Visibility Diagnostics only.
It inspects frozen Discoverability infrastructure via public queries.
It does not modify, register, project, execute, render, or wire App.
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
| UX-7.6 Discoverability Pipeline COMPLETE | [`UX-7.6.md`](./UX-7.6.md) · `validate:ux-7.6` |
| Roadmap UX-7.0 FROZEN | [`UX-7.0-roadmap.md`](./UX-7.0-roadmap.md) |
| Sin `src/ui/visibility-diagnostics/` | objetivo de esta microfase |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/visibility-diagnostics/` flat
- `VisibilityDiagnosticsReport` · `createVisibilityDiagnosticsReport`
- Local `index.ts` barrel
- Docs + `validate:ux-7.7`

**Out**

- Production `register` / llenado Visibility SSOT (→ UX-7.8+)
- Visual Integration / chrome (→ UX-7.8)
- Final Audit / Certification (→ UX-7.9–7.10)
- React · Provider · hooks · portal · CSS · mount · App wiring
- Mutating Visibility / Tooltips / Shortcut Hints / Command Descriptions / Context Help / Discoverability
- Expanding `@/ui` public barrel
- Agregar `diagnose` / `validate` al DiscoverabilityPipeline
- Snapshot growth · ViewModel · semántica agregada
- Integrar Visibility en `UXDiagnosticsInput` (UX-6.9)
- Telemetry · logging · analytics · network · performance

---

## 4. Architecture / Pipeline

Capas (separación obligatoria):

```text
infraestructura   = VisibilityDefinition + 4 proyecciones (UX-7.1–7.5)
orquestación      = DiscoverabilityPipeline → DiscoverabilitySnapshot (UX-7.6)
inspección        = VisibilityDiagnostics (UX-7.7)
reporte           = VisibilityDiagnosticsReport (UX-7.7)
```

```text
VisibilityDefinition (UX-7.1 FROZEN · SSOT)
        ├── TooltipContent      (UX-7.2 FROZEN)
        ├── ShortcutHint        (UX-7.3 FROZEN)
        ├── CommandDescription  (UX-7.4 FROZEN)
        └── ContextHelp         (UX-7.5 FROZEN)
                    │
                    ▼
        DiscoverabilityPipeline (UX-7.6 FROZEN · orchestration only)
                    │
                    ▼
        DiscoverabilitySnapshot (UX-7.6 FROZEN · container only)
                    │
                    ▼
        VisibilityDiagnostics (UX-7.7 · inspect only · Query Only)
                    │
                    ▼
        VisibilityDiagnosticsReport (immutable · Coverage Freeze · Determinism Freeze)
```

```text
createVisibilityDiagnosticsReport(registry, pipeline?)
        │
        ▼
registry.getAll()  →  ids · count
        │
        ▼
para cada VisibilityId (orden getAll):
  resolveTooltipContent(id)
  resolveShortcutHint(id)
  resolveCommandDescription(asCommandId(String(id)))
  resolveContextHelp(id)
        │
        ▼
clasificar with* / missing* por slot (Coverage Freeze)
        │
        ▼
pipelineReady = pipeline != null
        │
        ▼
Object.freeze(VisibilityDiagnosticsReport)
```

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `VisibilityDiagnosticsReport` | Contrato inmutable del reporte (Report Freeze) |
| `createVisibilityDiagnosticsReport` | Factory pura · Query Only · `Object.freeze` |
| Query loop | `getAll` + cuatro `resolve*` públicos · Identity Freeze reuse |
| `pipelineReady` | Señala inyección opcional del Pipeline (no lo ejecuta) |
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
No crear / transformar / enriquecer proyecciones
No alterar DiscoverabilityPipeline · No alterar DiscoverabilitySnapshot
No llamar diagnose/validate / resolve / resolveByCommandId sobre el Pipeline
No cache · No memoization · No fallbacks · No lazy creation
No cross-slot substitution (Slot Independence vigente)
No interpretar with*/missing* como error · calidad · completitud · validez (Coverage Freeze)
No reordenar ids · No scores · No timestamps no deterministas (Determinism Freeze)
No telemetry · No logging · No analytics
No chrome visual (→ UX-7.8)
No @/ui public barrel expansion
No modificar modules UX-7.1–7.6
No modificar UXDiagnosticsInput (UX-6.9)
```

---

## 7. API Freeze

### VisibilityDiagnosticsReport

```ts
type VisibilityDiagnosticsReport = Readonly<{
  count: number;
  ids: readonly VisibilityId[];
  withTooltip: readonly VisibilityId[];
  withShortcutHint: readonly VisibilityId[];
  withCommandDescription: readonly VisibilityId[];
  withContextHelp: readonly VisibilityId[];
  missingTooltip: readonly VisibilityId[];
  missingShortcutHint: readonly VisibilityId[];
  missingCommandDescription: readonly VisibilityId[];
  missingContextHelp: readonly VisibilityId[];
  pipelineReady: boolean;
}>;
```

### createVisibilityDiagnosticsReport

```ts
function createVisibilityDiagnosticsReport(
  registry: VisibilityRegistryApi,
  pipeline?: DiscoverabilityPipeline | null,
): VisibilityDiagnosticsReport;
```

Local barrel reexports: `VisibilityDiagnosticsReport` · `createVisibilityDiagnosticsReport`.

**No** reexport desde `src/ui/index.ts`.

### Diagnostics Freeze

```text
Diagnostics Freeze
  Visibility Diagnostics = inspect only
  API = createVisibilityDiagnosticsReport(registry, pipeline?) ONLY
  Pure function · no class · no mutation · no side-effects
  Consume public APIs only (VisibilityRegistryApi · resolve* · optional Pipeline)
  NO register · NO clear · NO get mutation path
  NO createTooltipContent / createShortcutHint / createCommandDescription / createContextHelp
  NO createVisibilityDefinition · NO createDiscoverabilityPipeline (salvo readiness inject externo)
  NO pipeline.resolve / pipeline.resolveByCommandId dentro del reporter
  NO alterar Snapshot · NO alterar proyecciones · NO alterar registries
  NO React · NO DOM · NO CSS · NO UI · NO execution
```

### Report Freeze

```text
Report Freeze
  VisibilityDiagnosticsReport es el único artefacto de salida.
  Campos fijos (lista cerrada) · Readonly · Object.freeze en objeto y arrays.
  Sin campos derivados de UI · sin timestamps · sin scores · sin mensajes i18n.
  Sin semántica de presentación · sin ViewModel · sin flags de chrome.
  Impide que UX-7.8+ convierta el reporte en contrato visual o de telemetry.
  Coverage Freeze y Determinism Freeze aplican sobre este contrato.
```

### Coverage Freeze

```text
Coverage Freeze
  with*
  missing*
  representan únicamente
  la presencia o ausencia
  de una proyección.

  No representan calidad.
  No representan completitud.
  No representan validez.

  Criterio único:
    resolve*(id) !== undefined  → with*
    resolve*(id) === undefined  → missing*

  Impide que UX-7.8 (u otras fases) use
  missingTooltip / missingShortcutHint /
  missingCommandDescription / missingContextHelp
  como indicador de error funcional,
  fallo de producto, o semántica de “incompleto/inválido”.

  Slot Independence permanece vigente:
  la ausencia de un slot no sustituye ni invalida otro.
```

### Determinism Freeze

```text
Determinism Freeze
  El mismo registry
  y los mismos resolve*
  producen exactamente
  el mismo reporte.

  El orden de ids
  debe conservar
  el orden de getAll().

  with* / missing* por slot
  preservan el orden relativo
  de aparición en ids / getAll()
  (sin sort lexicográfico ni reordenamiento).

  Sin timestamps · sin random · sin clock · sin locale.
  Sin dependencia de orden de Map interno distinto de getAll().
  Cierra completamente el contrato de salida del reporter.
```

### Query Rules

```text
Query Rules (= Diagnostics Query Only)
  1. Leer SSOT solo con registry.getAll() (count = length).
  2. ids = map(getAll(), d => d.id) en el mismo orden (Determinism Freeze).
  3. Para cada id en ese orden: consultar exactamente cuatro resolve* públicos.
  4. CommandDescription: Identity Freeze reuse via asCommandId(String(id)).
  5. Clasificar present/missing por slot (Coverage Freeze);
     Slot Independence vigente (ausencia de un slot no sustituye otro).
  6. pipeline opcional solo para pipelineReady; no orquestar vía Pipeline.
  7. NO register · NO clear · NO mutate definitions.
  8. NO cache · NO memoization · NO lazy creation · NO default content.
  9. NO side-effects (no log · no network · no DOM).
 10. Resultado siempre Object.freeze (report + arrays).
 11. Bindings a resolve* fence-safe (computed export keys).
```

### UX-7.1–UX-7.6 Freeze (reafirmado)

```text
VisibilityRegistryApi = register / get / getAll / clear ONLY
VisibilityDefinition fields = 5 (id, title, description, shortcut, category)
TooltipContent fields = 4 (id, title, description, shortcut)
ShortcutHint fields = 3 (id, title, shortcut)
CommandDescription fields = 5 (id, title, description, shortcut, category) · CommandId
ContextHelp fields = 4 (id, title, description, category) · VisibilityId
DiscoverabilityPipeline = resolve · resolveByCommandId ONLY
DiscoverabilitySnapshot = 4 slots contenedor only
NO React under visibility/ · tooltips/ · shortcut-hints/ · command-descriptions/
  · context-help/ · discoverability/ · visibility-diagnostics/
NO @/ui visibility | tooltips | shortcut-hints | command-descriptions |
  context-help | discoverability | visibility-diagnostics export
```

---

## 8. Extension Points

| Congelado en UX-7.7 | Diferido |
|---------------------|----------|
| Diagnostics Freeze · Report Freeze · Coverage Freeze · Determinism Freeze · Query Rules · local barrel | Visual Integration / chrome → UX-7.8 |
| Inspect-only · presencia|ausencia only · no Pipeline diagnose API · no Snapshot growth | Production `register` / llenado SSOT → UX-7.8+ |
| No reinterpretar missing* como error funcional · No `@/ui` · no UI · no execution · no UX-6.9 coupling | Final Audit → UX-7.9 |
| | Release Certification → UX-7.10 |
| | Agregar slot Visibility a agregador UXDiagnostics → serie posterior si se autoriza |
| | Alias / multi-id / category taxonomy / `findBy*` → UX-8+ |

---

## 9. Exclusions / Decoupling fence

Files under `src/ui/visibility-diagnostics/` must not import or reference:

- `react` / `react-dom`
- `window` / `document`
- DOM APIs / CSS modules / style imports
- UI product components / App routes
- Command execution / CommandExecutionPipeline / Dispatcher / Providers
- Toolbar / Menus / Context Menus
- `src/ui/shortcuts/` (execution)
- `src/ui/diagnostics/**` (UX-6.9)
- Expanding `src/ui/index.ts`

Also prohibited: production registration · App mount · Visibility Registry
mutation · cache/fallbacks · pipeline.resolve orchestration · contract fusion.

**Dependencias permitidas (APIs públicas):**

```text
visibility-diagnostics → visibility          (types · VisibilityRegistryApi)
visibility-diagnostics → tooltips            (resolveTooltipContent)
visibility-diagnostics → shortcut-hints      (resolveShortcutHint)
visibility-diagnostics → command-descriptions (resolveCommandDescription)
visibility-diagnostics → context-help        (resolveContextHelp)
visibility-diagnostics → commands/CommandTypes (asCommandId)
visibility-diagnostics → discoverability     (type-only DiscoverabilityPipeline)
```

**Unidirectional:** visibility-diagnostics consume proyecciones / visibility /
discoverability types; UX-7.1–7.6 nunca importan visibility-diagnostics.

---

## 10. Protected files

| Path | Role |
|------|------|
| `src/ui/visibility-diagnostics/VisibilityDiagnostics.ts` | Report + factory |
| `src/ui/visibility-diagnostics/index.ts` | Local barrel |

**Protected from this phase:** `src/ui/visibility/**`, `src/ui/tooltips/**`,
`src/ui/shortcut-hints/**`, `src/ui/command-descriptions/**`,
`src/ui/context-help/**`, `src/ui/discoverability/**`, `src/ui/diagnostics/**`,
`src/ui/shortcuts/**`, `src/ui/commands/**`, `src/ui/toolbar/**`,
`src/ui/menus/**`, `src/ui/context-menus/**`, `src/ui/index.ts`,
AppShell / production chrome,
`validate-ux-7.1`, `validate-ux-7.2`, `validate-ux-7.3`, `validate-ux-7.4`,
`validate-ux-7.5`, `validate-ux-7.6`.

---

## 11. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-7.7.1 | Docs con Diagnostics · Report · Coverage · Determinism Freeze · Query Rules · No responsabilidades · Extension Points |
| CA-UX-7.7.2 | Módulo `src/ui/visibility-diagnostics/` + archivos core |
| CA-UX-7.7.3 | Report Freeze + Coverage Freeze + Determinism Freeze (campos exactos · presencia|ausencia only · orden getAll) |
| CA-UX-7.7.4 | Diagnostics API = `createVisibilityDiagnosticsReport` only |
| CA-UX-7.7.5 | Query Rules: getAll + resolve* · ids orden = getAll · Identity Freeze · sin pipeline orchestration |
| CA-UX-7.7.6 | Diagnostics only: sin mutación · sin create* · sin side-effects · sin semántica calidad/completitud/validez |
| CA-UX-7.7.7 | Local barrel · sin expansión `@/ui` |
| CA-UX-7.7.8 | Architecture Freeze UX-7.1–7.6 intacto |
| CA-UX-7.7.9 | Freeze fences (React/DOM/CSS/App/product-wire/CEP) |
| CA-UX-7.7.10 | Dependency fence unidireccional autorizada |

Gate: `npm run validate:ux-7.7` → **PASS 10/10**

---

## 12. Gate

```text
npm run validate:ux-7.7
→ PASS 10/10
```

---

## 13. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-7.8 | Visual Integration |
| UX-7.9+ | Final Audit · Release Certification |
